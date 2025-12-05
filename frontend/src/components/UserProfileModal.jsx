import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import AnimatedPanel from "./AnimatedPanel";

const UserProfileModal = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/users/${userId}`);
        setUser(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (!userId) return null;

  return (
    <AnimatedPanel isOpen={!!userId} onClose={onClose} title={user?.fullName || "Profile"}>
      {loading ? (
        <div className="flex items-center justify-center h-40">Loading...</div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <img
            src={user?.profilePic || "/avatar.png"}
            alt={user?.fullName}
            className="w-32 h-32 rounded-full object-cover border"
          />
          <h3 className="text-xl font-semibold">{user?.fullName}</h3>
          <p className="text-sm text-zinc-500">{user?.email}</p>
          <a href={user?.profilePic} target="_blank" rel="noreferrer" className="text-sm text-primary">
            Open full image
          </a>
        </div>
      )}
    </AnimatedPanel>
  );
};

export default UserProfileModal;
