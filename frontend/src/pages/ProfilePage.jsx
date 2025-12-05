import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Edit2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import UserProfileSection from "../components/UserProfileSection";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(authUser?.fullName || "");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
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
        toast.success("Profile picture updated successfully!");
      } catch (error) {
        toast.error("Failed to update profile picture");
        setSelectedImg(null);
      }
    };

    reader.onerror = () => {
      toast.error("Error reading file");
      setSelectedImg(null);
    };
  };

  const handleNameChange = async () => {
    // Validate name
    if (!editedName.trim()) {
      toast.error("Full name cannot be empty");
      return;
    }

    if (editedName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }

    if (editedName.trim() === authUser?.fullName) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateProfile({ fullName: editedName.trim() });
      toast.success("Full name updated successfully!");
      setIsEditingName(false);
    } catch (error) {
      toast.error("Failed to update full name");
      setEditedName(authUser?.fullName || "");
    }
  };

  const handleCancel = () => {
    setEditedName(authUser?.fullName || "");
    setIsEditingName(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleNameChange();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold ">Profile</h1>
          <p className="mt-2">Your profile information</p>
        </div>

        <div className="mt-6 space-y-6">
          <UserProfileSection />

          <div className="mt-2 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser?.createdAt?.split("T")[0] || "-"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
