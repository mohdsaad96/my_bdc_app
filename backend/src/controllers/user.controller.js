import User from "../models/user.model.js";

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { getUserById };
