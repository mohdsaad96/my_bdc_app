import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  incomingCall: null, // { from, offer }

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  requestOtp: async (email) => {
    try {
      const res = await axiosInstance.post('/auth/request-otp', { email });
      // For development the OTP is returned in response. In production, it should be sent via email.
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to request OTP');
      throw error;
    }
  },

  verifyOtp: async (payload) => {
    // payload: { email, otp }
    try {
      const res = await axiosInstance.post('/auth/verify-otp', payload);
      set({ authUser: res.data });
      toast.success('Logged in successfully');
      get().connectSocket();
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to verify OTP');
      throw error;
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();
    socket.on("connect", () => {
      // ensure server registers this user (fallback/explicit register)
      try {
        socket.emit("user-connected", authUser._id);
      } catch (e) {
        console.error("Failed to emit user-connected", e);
      }
    });
    socket.on("connect_error", (err) => {
      console.error("Socket connect_error", err);
    });

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
    // incoming call signaling
    socket.on("incoming-call", (payload) => {
      // payload: { from, offer }
      set({ incomingCall: payload });
    });

    socket.on("call-ended", () => {
      set({ incomingCall: null });
    });

    // group events
    socket.on('groupCreated', (group) => {
      import('../store/useChatStore').then((m) => m.useChatStore.getState().addOrUpdateGroup(group)).catch(() => {});
    });

    socket.on('groupUpdated', (group) => {
      import('../store/useChatStore').then((m) => m.useChatStore.getState().addOrUpdateGroup(group)).catch(() => {});
    });

    socket.on('removedFromGroup', ({ groupId }) => {
      import('../store/useChatStore').then((m) => m.useChatStore.getState().getGroups()).catch(() => {});
    });

    // status events
    socket.on('statusCreated', (status) => {
      import('../store/useChatStore').then((m) => m.useChatStore.getState().getStatuses()).catch(() => {});
    });

    socket.on('statusViewed', ({ statusId, viewerId }) => {
      import('../store/useChatStore').then((m) => {
        const store = m.useChatStore.getState();
        store.getStatuses();
      }).catch(() => {});
    });

    socket.on('statusDeleted', ({ statusId }) => {
      import('../store/useChatStore').then((m) => m.useChatStore.setState((s) => ({ statuses: s.statuses.filter(st => String(st._id) !== String(statusId)) }))).catch(() => {});
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  clearIncomingCall: () => set({ incomingCall: null }),
}));
