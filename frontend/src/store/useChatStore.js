import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
// ...existing code...
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  statuses: [],
  isTyping: false,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  getGroups: async () => {
    try {
      const res = await axiosInstance.get('/groups');
      set({ groups: res.data });
    } catch (err) {
      toast.error('Failed to load groups');
    }
  },
  getStatuses: async () => {
    try {
      const res = await axiosInstance.get('/status');
      set({ statuses: res.data });
    } catch (err) {
      toast.error('Failed to load statuses');
    }
  },

  createStatus: async (payload) => {
    try {
      const res = await axiosInstance.post('/status', payload);
      // server emits statusCreated, but update optimistically
      set((state) => ({ statuses: [res.data, ...state.statuses] }));
      return res.data;
    } catch (err) {
      toast.error('Failed to create status');
      throw err;
    }
  },

  markStatusViewed: async (statusId) => {
    try {
      const res = await axiosInstance.post(`/status/${statusId}/view`);
      set((state) => ({ statuses: state.statuses.map((s) => (String(s._id) === String(statusId) ? res.data : s)) }));
      return res.data;
    } catch (err) {
      // ignore
    }
  },

  createGroup: async (payload) => {
    try {
      const res = await axiosInstance.post('/groups', payload);
      // server will emit groupCreated; still update optimistically
      set((state) => ({ groups: [res.data, ...state.groups] }));
      return res.data;
    } catch (err) {
      toast.error('Failed to create group');
      throw err;
    }
  },

  updateGroup: async (groupId, updates) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, updates);
      set((state) => ({ groups: state.groups.map((g) => (String(g._id) === String(groupId) ? res.data : g)) }));
      return res.data;
    } catch (err) {
      toast.error('Failed to update group');
      throw err;
    }
  },

  addGroupMember: async (groupId, memberIdentifier) => {
    try {
      // API expects memberId; backend supports passing id or email? We will call a simple endpoint that expects memberId or email.
      const res = await axiosInstance.post(`/groups/${groupId}/add-member`, { memberId: memberIdentifier });
      set((state) => ({ groups: state.groups.map((g) => (String(g._id) === String(groupId) ? res.data : g)) }));
      return res.data;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add member');
      throw err;
    }
  },

  removeGroupMember: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/remove-member`, { memberId });
      set((state) => ({ groups: state.groups.map((g) => (String(g._id) === String(groupId) ? res.data : g)) }));
      return res.data;
    } catch (err) {
      toast.error('Failed to remove member');
      throw err;
    }
  },

  addOrUpdateGroup: (group) => {
    set((state) => {
      const exists = state.groups.some((g) => String(g._id) === String(group._id));
      if (exists) {
        return { groups: state.groups.map((g) => (String(g._id) === String(group._id) ? group : g)) };
      }
      return { groups: [group, ...state.groups] };
    });
  },
  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    try {
      await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      // Message will be added via socket event
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  
    deleteMessage: async (messageId) => {
      try {
        await axiosInstance.delete(`/messages/${messageId}`);
        set((state) => ({
          messages: state.messages.filter((msg) => msg._id !== messageId)
        }));
        toast.success("Message deleted");
      } catch (error) {
        toast.error(error?.response?.data?.error || "Failed to delete message");
      }
    },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stop-typing");
    socket.off("messageStatusUpdated");
    socket.on("newMessage", (newMessage) => {
      // Normalize ids to strings and check relevance
      const senderId = newMessage.senderId ? String(newMessage.senderId) : null;
      const receiverId = newMessage.receiverId ? String(newMessage.receiverId) : null;
      const selectedId = selectedUser._id ? String(selectedUser._id) : null;

      const isRelevant = senderId === selectedId || receiverId === selectedId;
      if (!isRelevant) return;

      // Avoid duplicate messages (if already present)
      set((state) => {
        if (state.messages.some((msg) => String(msg._id) === String(newMessage._id))) return {};
        // ensure status exists
        if (!newMessage.status) newMessage.status = 'sent';
        return { messages: [...state.messages, newMessage] };
      });
    });
    // listen for typing indicators
    socket.on("typing", ({ from }) => {
      if (String(from) === String(selectedUser._id)) {
        set({ isTyping: true });
      }
    });
    socket.on("stop-typing", ({ from }) => {
      if (String(from) === String(selectedUser._id)) {
        set({ isTyping: false });
      }
    });

    socket.on('messageStatusUpdated', ({ messageIds, status }) => {
      if (!messageIds || !messageIds.length) return;
      set((state) => ({
        messages: state.messages.map((m) => (messageIds.includes(String(m._id)) ? { ...m, status } : m)),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stop-typing");
  },

  startTyping: () => {
    const socket = useAuthStore.getState().socket;
    const selectedUser = get().selectedUser;
    if (!socket || !selectedUser) return;
    try {
      socket.emit("typing", { to: selectedUser._id, from: useAuthStore.getState().authUser._id });
    } catch (e) {}
  },

  stopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const selectedUser = get().selectedUser;
    if (!socket || !selectedUser) return;
    try {
      socket.emit("stop-typing", { to: selectedUser._id, from: useAuthStore.getState().authUser._id });
    } catch (e) {}
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, isTyping: false }),
}));
