import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? (process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : [])
      : true,
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}


function broadcastOnlineUsers() {
  try {
    const list = Object.keys(userSocketMap);
    io.emit("getOnlineUsers", list);
  } catch (e) {
    console.error("Error broadcasting online users:", e);
  }
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  let userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // allow client to explicitly register (fallback if handshake query not used)
  socket.on("user-connected", (id) => {
    if (!id) return;
    userId = id;
    userSocketMap[id] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Broadcast current online users
  broadcastOnlineUsers();

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
    } else {
      // try to remove mapping by socket id if userId wasn't available
      for (const [uid, sid] of Object.entries(userSocketMap)) {
        if (sid === socket.id) {
          delete userSocketMap[uid];
          break;
        }
      }
    }
    // broadcast updated list
    broadcastOnlineUsers();
  });

  // WebRTC signaling: forward offers/answers/ICE and call control events
  socket.on("call-user", ({ to, from, offer }) => {
    console.log("call-user received from", socket.id, "to", to);
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      console.log("forwarding incoming-call to socket", targetSocketId);
      io.to(targetSocketId).emit("incoming-call", { from, offer });
    } else {
      console.log("target not online for call-user:", to);
    }
  });

  socket.on("answer-call", ({ to, answer }) => {
    console.log("answer-call received from", socket.id, "to", to);
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      console.log("forwarding call-answered to socket", targetSocketId);
      io.to(targetSocketId).emit("call-answered", { answer });
    } else {
      console.log("target not online for answer-call:", to);
    }
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    console.log("ice-candidate received from", socket.id, "to", to);
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { candidate });
    } else {
      console.log("target not online for ice-candidate:", to);
    }
  });

  // Typing indicators: forward typing events to the target user
  socket.on("typing", ({ to, from }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("typing", { from });
    }
  });

  socket.on("stop-typing", ({ to, from }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("stop-typing", { from });
    }
  });

  socket.on("end-call", ({ to }) => {
    console.log("end-call received from", socket.id, "to", to);
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("call-ended");
    } else {
      console.log("target not online for end-call:", to);
    }
  });
});

export { io, app, server };
