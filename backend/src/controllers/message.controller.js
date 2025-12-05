// Delete message if sender matches
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (String(message.senderId) !== String(userId)) {
      return res.status(403).json({ error: "You can only delete your own messages" });
    }
    await message.deleteOne();
    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import fs from "fs";
import fsPromises from "fs/promises";
import os from "os";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    // When the logged-in user fetches the chat, mark any messages addressed to them as 'read'
    const unreadFromPeer = messages.filter(
      (m) => String(m.receiverId) === String(myId) && String(m.senderId) === String(userToChatId) && m.status !== 'read'
    );

    if (unreadFromPeer.length > 0) {
      const idsToUpdate = unreadFromPeer.map((m) => m._id);
      await Message.updateMany({ _id: { $in: idsToUpdate } }, { $set: { status: 'read' } });

      // emit status update to the original sender(s)
      const senderSocketId = getReceiverSocketId(userToChatId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageStatusUpdated', { messageIds: idsToUpdate.map(String), status: 'read' });
      }

      // also reflect read in the messages array we return
      messages.forEach((m) => {
        if (idsToUpdate.some((id) => String(id) === String(m._id))) m.status = 'read';
      });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let audioUrl;
    if (audio) {
      // First attempt: ask Cloudinary to transcode to MP3 directly
      try {
        const uploadResponse = await cloudinary.uploader.upload(audio, {
          resource_type: 'auto',
          format: 'mp3',
        });
        audioUrl = uploadResponse.secure_url;
      } catch (err) {
        console.warn('Cloudinary forced transcode failed, will fallback to server-side transcode:', err.message || err);
        // Fallback: attempt a direct upload first
        try {
          const uploadResponse = await cloudinary.uploader.upload(audio, { resource_type: 'auto' });
          // If Cloudinary accepted it and returned a URL, still use it
          audioUrl = uploadResponse.secure_url;
        } catch (err2) {
          console.warn('Cloudinary direct upload also failed, attempting server-side transcode using ffmpeg:', err2.message || err2);
          // Server-side transcode path using ffmpeg
          // Steps:
          // 1. Decode base64 and write to a temp input file
          // 2. Run ffmpeg to transcode to mp3 into temp output file
          // 3. Upload output file to Cloudinary
          // 4. Clean up temp files
          try {
            // strip data:...base64, prefix if present
            const matches = audio.match(/^data:(.+);base64,(.+)$/);
            let buffer;
            let ext = 'webm';
            if (matches) {
              const mime = matches[1];
              const b64 = matches[2];
              buffer = Buffer.from(b64, 'base64');
              // pick extension from mime if possible
              if (mime.includes('wav')) ext = 'wav';
              else if (mime.includes('mpeg') || mime.includes('mp3')) ext = 'mp3';
              else if (mime.includes('ogg')) ext = 'ogg';
              else if (mime.includes('webm')) ext = 'webm';
            } else {
              // raw base64 without prefix
              buffer = Buffer.from(audio, 'base64');
            }

            const tmpDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'bdc-audio-'));
            const inputPath = path.join(tmpDir, `input.${ext}`);
            const outputPath = path.join(tmpDir, `out.mp3`);
            await fsPromises.writeFile(inputPath, buffer);

            // ensure ffmpeg binary is available on PATH. If not, users must install ffmpeg.
            await new Promise((resolve, reject) => {
              ffmpeg(inputPath)
                .output(outputPath)
                .audioCodec('libmp3lame')
                .on('end', resolve)
                .on('error', reject)
                .run();
            });

            // upload outputPath to Cloudinary
            const uploadResponse = await cloudinary.uploader.upload(outputPath, { resource_type: 'auto' });
            audioUrl = uploadResponse.secure_url;

            // cleanup
            try {
              await fsPromises.unlink(inputPath);
            } catch (e) {}
            try {
              await fsPromises.unlink(outputPath);
            } catch (e) {}
            try {
              await fsPromises.rmdir(tmpDir);
            } catch (e) {}
          } catch (err3) {
            console.error('Server-side ffmpeg transcode/upload failed:', err3.message || err3);
            // at this point give up and leave audioUrl undefined
          }
        }
      }
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
      status: 'sent',
    });

    await newMessage.save();

    // prepare plain object payload with string ids for socket transport
    const payload = newMessage.toObject ? newMessage.toObject() : JSON.parse(JSON.stringify(newMessage));
    payload.senderId = String(payload.senderId);
    payload.receiverId = String(payload.receiverId);

    // Emit to receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", payload);
    }
    // Emit to sender (if connected and different socket)
    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("newMessage", payload);
    }

    // also emit a status update for sender that message was saved (single tick)
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageStatusUpdated", { messageIds: [String(newMessage._id)], status: 'sent' });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
