import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import { randomInt } from "crypto";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // Ensure we create a unique username to satisfy any username unique index
    // Derive a base from fullName or email and append a short timestamp
    const baseName = (fullName && fullName.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "")) || (email && email.split("@")[0]);
    const usernameCandidate = `${baseName}${Date.now().toString().slice(-6)}`;
    newUser.username = usernameCandidate;

    console.log('Signup payload:', req.body);
    if (newUser) {
      // save user first, then generate jwt token
      await newUser.save();
      // generate jwt token here
      generateToken(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error in signup controller", error);
    // In development return the error message to help debugging
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    // Clear cookie with same attributes used when setting it
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      secure: process.env.NODE_ENV !== 'development',
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, about, phone } = req.body;
    const userId = req.user._id;

    // Build update object
    const updateData = {};

    // Handle profile picture update
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      updateData.profilePic = uploadResponse.secure_url;
    }

    // Handle full name update
    if (fullName) {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: "Full name cannot be empty" });
      }
      if (trimmedName.length < 2) {
        return res.status(400).json({ message: "Full name must be at least 2 characters" });
      }
      updateData.fullName = trimmedName;
    }

    // Handle about/status update
    if (typeof about !== "undefined") {
      const trimmedAbout = String(about).trim();
      if (trimmedAbout.length > 200) {
        return res.status(400).json({ message: "About must be 200 characters or less" });
      }
      updateData.about = trimmedAbout;
    }

    // Handle phone update
    if (typeof phone !== "undefined") {
      const trimmedPhone = String(phone).trim();
      // Basic validation: allow empty or digits, +, -, spaces
      if (trimmedPhone && !/^\+?[0-9\-\s()]{4,20}$/.test(trimmedPhone)) {
        return res.status(400).json({ message: "Invalid phone number format" });
      }
      updateData.phone = trimmedPhone;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // In production you'd email this token. For development return it in response.
    res.status(200).json({ message: "Reset token generated", resetToken });
  } catch (error) {
    console.log("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Request OTP for email-based login (development: returns OTP in response)
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = String(email).trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    // If user doesn't exist, create a lightweight account (random password)
    if (!user) {
      const randomPassword = crypto.randomBytes(8).toString("hex");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const usernameCandidate = `user${Date.now().toString().slice(-6)}`;
      const placeholderFullName = normalizedEmail.split("@")[0];

      user = new User({
        fullName: placeholderFullName,
        email: normalizedEmail,
        password: hashedPassword,
        username: usernameCandidate,
      });

      await user.save();
    }

    // generate 6-digit OTP
    const otp = String(randomInt(100000, 999999));
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    // reuse mobileOtp fields for email OTP to avoid schema changes
    user.mobileOtp = otpHash;
    user.mobileOtpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // In production send email here. For development return OTP in response.
    res.status(200).json({ message: "OTP generated", otp });
  } catch (error) {
    console.error("requestOtp error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.mobileOtp || !user.mobileOtpExpires) return res.status(400).json({ message: "OTP not requested" });

    if (Date.now() > new Date(user.mobileOtpExpires).getTime()) return res.status(400).json({ message: "OTP expired" });

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (otpHash !== user.mobileOtp) return res.status(400).json({ message: "Invalid OTP" });

    // clear OTP
    user.mobileOtp = "";
    user.mobileOtpExpires = undefined;
    await user.save();

    // Generate JWT cookie
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("verifyOtp error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and password are required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = undefined;
    await user.save();

    // generate jwt token and set cookie
    generateToken(user._id, res);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
