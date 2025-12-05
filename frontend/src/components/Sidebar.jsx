import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import NewGroupModal from './NewGroupModal';
import { Eye } from "lucide-react";
import UserProfileModal from "./UserProfileModal";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
    // also load groups
    useChatStore.getState().getGroups();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id) && user._id !== authUser?._id)
    : users;

  const [modalUserId, setModalUserId] = useState(null);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside className="hidden sm:flex h-full w-20 lg:w-72 border-r border-base-300 flex-col transition-all duration-200 bg-base-100">
        <div className="border-b border-base-300 w-full p-5">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">Contacts</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>
              {/* Show count of other online users only */}
            <span className="text-xs text-zinc-500">({users.filter(u => onlineUsers.includes(u._id) && u._id !== authUser?._id).length} online)</span>
              <button className="btn btn-ghost btn-xs ml-auto" onClick={() => setIsNewGroupOpen(true)}>New Group</button>
          </div>
        </div>
        <div className="overflow-y-auto w-full py-3">
          {filteredUsers.map((user) => (
            <div key={user._id} className={`w-full p-3 hover:bg-base-300 transition-colors ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedUser(user)} className="flex items-center gap-3 w-full text-left">
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.name}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && user._id !== authUser?._id && (
                      <span
                        className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900"
                      />
                    )}
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id) && user._id !== authUser?._id ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
                <button onClick={() => setModalUserId(user._id)} className="btn btn-ghost btn-sm">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">No online users</div>
          )}
        </div>
        {modalUserId && <UserProfileModal userId={modalUserId} onClose={() => setModalUserId(null)} />}
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 z-50 flex items-center justify-between px-2 py-1">
        <button className="flex flex-col items-center justify-center" disabled>
          <Users className="size-6" />
        </button>
        <div className="flex-1 overflow-x-auto flex gap-2 px-2">
          {filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`relative flex flex-col items-center justify-center ${selectedUser?._id === user._id ? "ring-2 ring-primary" : ""}`}
              style={{ minWidth: 48 }}
            >
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-8 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-2 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </button>
          ))}
        </div>
        <button className="flex flex-col items-center justify-center" disabled>
          <Eye className="size-6" />
        </button>
      </nav>
      {/* User profile modal for mobile (optional, can be triggered differently) */}
      {modalUserId && <UserProfileModal userId={modalUserId} onClose={() => setModalUserId(null)} />}
      {isNewGroupOpen && <NewGroupModal isOpen={isNewGroupOpen} onClose={() => setIsNewGroupOpen(false)} onCreated={() => { /* refresh groups if needed */ useChatStore.getState().getGroups(); }} />}
    </>
  );
};
export default Sidebar;
