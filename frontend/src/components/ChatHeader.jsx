import { X, Phone, Settings, Video } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";
import CallModal from "./CallModal";
import GroupSettingsModal from "./GroupSettingsModal";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { isTyping } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isGroupSettingsOpen, setIsGroupSettingsOpen] = useState(false);

  // TODO: Replace with actual selected group logic
  const mockGroup = {
    _id: "group1",
    name: "Demo Group",
    profilePic: "",
    members: [
      { _id: "u1", fullName: "Alice" },
      { _id: "u2", fullName: "Bob" },
    ],
    createdBy: "u1",
  };

  return (
    <div className="p-2 sm:p-2.5 border-b border-base-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-8 sm:size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium text-base sm:text-lg">{selectedUser.fullName}</h3>
            <p className="text-xs sm:text-sm text-base-content/70">
              {isTyping ? "Typing..." : (onlineUsers.includes(selectedUser._id) ? "Online" : "Offline")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-0">
          <button className="btn btn-ghost btn-xs sm:btn-sm" onClick={() => setIsCallOpen(true)} title="Call">
            <Phone />
          </button>
          {/* Video call button (replaces previous voice icon) */}
          <button
            className="btn btn-ghost btn-xs sm:btn-sm"
            onClick={() => setIsCallOpen({ type: 'video' })}
            title="Video Call"
          >
            <Video />
          </button>
          {/* Group Settings button for demo */}
          <button className="btn btn-ghost btn-xs sm:btn-sm" onClick={() => setIsGroupSettingsOpen(true)} title="Group Settings">
            <Settings />
          </button>
          {/* Close button */}
          <button className="btn btn-ghost btn-xs sm:btn-sm" onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
      {isCallOpen && typeof isCallOpen === 'boolean' && (
        <CallModal isOpen={isCallOpen} onClose={() => setIsCallOpen(false)} targetUser={selectedUser} isIncoming={false} />
      )}

      {/* handle object-form calls: { type: 'voice' } or { type: 'video' } */}
      {isCallOpen && typeof isCallOpen === 'object' && (
        <CallModal
          isOpen={true}
          onClose={() => setIsCallOpen(false)}
          targetUser={selectedUser}
          isIncoming={false}
          startWithVideo={isCallOpen.type === 'video'}
        />
      )}
      {/* GroupSettingsModal for demo, replace mockGroup with actual group */}
      <GroupSettingsModal
        group={mockGroup}
        isOpen={isGroupSettingsOpen}
        onClose={() => setIsGroupSettingsOpen(false)}
        onGroupUpdated={() => setIsGroupSettingsOpen(false)}
      />
    </div>
  );
};
export default ChatHeader;
