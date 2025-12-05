import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Edit2, Check, X, Camera } from "lucide-react";
import toast from "react-hot-toast";

const UserProfileSection = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(authUser?.about || "");
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(authUser?.fullName || "");

  const handleAboutSave = async () => {
    if (aboutText.length > 200) {
      toast.error("About must be 200 characters or less");
      return;
    }

    try {
      await updateProfile({ about: aboutText });
      setIsEditingAbout(false);
      toast.success("About updated");
    } catch (err) {
      toast.error("Failed to update about");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      try {
        await updateProfile({ profilePic: base64Image });
        toast.success("Profile picture updated");
      } catch (err) {
        toast.error("Failed to update profile picture");
        setSelectedImg(null);
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file");
      setSelectedImg(null);
    };
  };

  const handleNameSave = async () => {
    const trimmed = editedName.trim();
    if (!trimmed) {
      toast.error("Full name cannot be empty");
      return;
    }
    if (trimmed.length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }
    if (trimmed === authUser?.fullName) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateProfile({ fullName: trimmed });
      toast.success("Full name updated");
      setIsEditingName(false);
    } catch (err) {
      toast.error("Failed to update full name");
      setEditedName(authUser?.fullName || "");
    }
  };

  return (
    <div className="bg-base-200 rounded-xl p-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={selectedImg || authUser?.profilePic || "/avatar.png"}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-2"
          />
          <label className={`absolute bottom-0 right-0 bg-base-300 p-2 rounded-full cursor-pointer`}>
            <Camera className="w-5 h-5 text-base-content" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUpdatingProfile} />
          </label>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  className="px-3 py-2 bg-base-100 rounded-lg border flex-1"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  disabled={isUpdatingProfile}
                />
                <button className="btn btn-sm btn-primary" onClick={handleNameSave} disabled={isUpdatingProfile}>
                  <Check className="w-4 h-4" />
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setIsEditingName(false);
                    setEditedName(authUser?.fullName || "");
                  }}
                  disabled={isUpdatingProfile}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold">{authUser?.fullName}</h2>
                <button className="btn btn-ghost btn-sm ml-2" onClick={() => setIsEditingName(true)}>
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            )}
            <span className="text-sm text-zinc-400">{/* online */}</span>
          </div>
          <p className="text-sm text-zinc-400 mt-1">{authUser?.email}</p>
          <p className="text-sm text-zinc-400 mt-2">{authUser?.phone || ""}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm text-zinc-400">About</h3>
            {!isEditingAbout ? (
              <p className="mt-2 text-base">{authUser?.about || "Hey there! I am using BDC Messenger"}</p>
            ) : (
              <textarea
                className="w-full mt-2 p-3 bg-base-100 rounded-lg border"
                rows={3}
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                disabled={isUpdatingProfile}
              />
            )}
          </div>

          <div className="ml-4">
            {isEditingAbout ? (
              <div className="flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={handleAboutSave} disabled={isUpdatingProfile}>
                  <Check className="w-4 h-4" />
                </button>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => {
                    setIsEditingAbout(false);
                    setAboutText(authUser?.about || "");
                  }}
                  disabled={isUpdatingProfile}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button className="btn btn-sm btn-ghost" onClick={() => setIsEditingAbout(true)}>
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-4 text-sm">
        <div className="py-2 flex justify-between items-center">
          <span>Last seen</span>
          <span className="text-zinc-400">{authUser?.lastSeen ? new Date(authUser.lastSeen).toLocaleString() : "Recently"}</span>
        </div>
        <div className="py-2 flex justify-between items-center">
          <span>Media, Links and Docs</span>
          <span className="text-primary">0</span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSection;
