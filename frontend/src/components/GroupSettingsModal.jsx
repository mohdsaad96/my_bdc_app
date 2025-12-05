import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const GroupSettingsModal = ({ group, isOpen, onClose, onGroupUpdated }) => {
  const { authUser } = useAuthStore();
  const [name, setName] = useState(group?.name || "");
  const [profilePic, setProfilePic] = useState(group?.profilePic || "");
  const [members, setMembers] = useState(group?.members || []);
  const [loading, setLoading] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const isAdmin = group?.createdBy === authUser?._id;

  const handleUpdateGroup = async () => {
    setLoading(true);
    try {
      await useChatStore.getState().updateGroup(group._id, { name, profilePic });
      toast.success("Group updated");
      onGroupUpdated && onGroupUpdated();
    } catch (err) {
      toast.error("Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return toast.error("Enter email or user identifier");
    setLoading(true);
    try {
      // if input looks like an email, try to resolve to a user id from users list
      let memberIdentifier = newMemberEmail;
      if (newMemberEmail.includes('@')) {
        const users = useChatStore.getState().users || [];
        const user = users.find((u) => (u.email || '').toLowerCase() === newMemberEmail.toLowerCase());
        if (!user) return toast.error('User not found by email');
        memberIdentifier = user._id;
      }
      await useChatStore.getState().addGroupMember(group._id, memberIdentifier);
      toast.success("Member added");
      setNewMemberEmail("");
      onGroupUpdated && onGroupUpdated();
    } catch (err) {
      toast.error("Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setLoading(true);
    try {
      await useChatStore.getState().removeGroupMember(group._id, memberId);
      toast.success("Member removed");
      onGroupUpdated && onGroupUpdated();
    } catch (err) {
      toast.error("Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-lg sm:max-w-lg max-w-xs sm:max-w-lg relative mx-2 sm:mx-0" style={{width: '100%', maxWidth: '400px'}}>
        <button className="absolute top-2 right-2 btn btn-sm btn-circle" onClick={onClose}>
          ✕
        </button>
        <h2 className="text-lg sm:text-xl font-bold mb-4">Group Settings</h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Group Name</label>
          <input
            className="input input-bordered w-full text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Group Photo URL</label>
          <input
            className="input input-bordered w-full text-sm"
            value={profilePic}
            onChange={(e) => setProfilePic(e.target.value)}
            disabled={!isAdmin}
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Members</label>
          <ul className="mb-2">
            {members.map((m) => (
              <li key={m._id} className="flex flex-wrap items-center gap-2 mb-1 text-sm">
                <span>{m.fullName || m.email}</span>
                {isAdmin && m._id !== authUser._id && (
                  <button
                    className="btn btn-xs btn-outline btn-error"
                    onClick={() => handleRemoveMember(m._id)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                className="input input-bordered flex-1 text-sm"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Add member by email"
                disabled={loading}
              />
              <button
                className="btn btn-primary"
                onClick={handleAddMember}
                disabled={loading}
              >
                Add
              </button>
            </div>
          )}
        </div>
        {isAdmin && (
          <button
            className="btn btn-success w-full mt-4"
            onClick={handleUpdateGroup}
            disabled={loading}
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default GroupSettingsModal;
