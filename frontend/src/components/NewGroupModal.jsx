import { useState, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const NewGroupModal = ({ isOpen, onClose, onCreated }) => {
  const { users, getUsers, createGroup } = useChatStore();
  const { authUser } = useAuthStore();
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) getUsers();
  }, [isOpen]);

  const toggleSelect = (id) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const handleCreate = async () => {
    if (!name.trim()) return toast.error('Enter group name');
    setLoading(true);
    try {
      // include current user automatically
      const payload = { name, members: selectedIds };
      const g = await createGroup(payload);
      toast.success('Group created');
      onCreated && onCreated(g);
      onClose && onClose();
    } catch (e) {
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-2">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">New Group</h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        <div className="mb-3">
          <label className="block mb-1">Group Name</label>
          <input className="input input-bordered w-full" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="mb-3 max-h-48 overflow-auto">
          <label className="block mb-1">Select members</label>
          <div className="grid grid-cols-1 gap-2">
            {users.filter(u => u._id !== authUser._id).map((u) => (
              <label key={u._id} className="flex items-center gap-2">
                <input type="checkbox" checked={selectedIds.includes(u._id)} onChange={() => toggleSelect(u._id)} />
                <span>{u.fullName || u.email}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary flex-1" onClick={handleCreate} disabled={loading}>Create</button>
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;
