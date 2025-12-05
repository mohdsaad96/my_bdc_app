import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Phone, Video, X, Volume2, VideoOff, MicOff } from "lucide-react";
import AnimatedPanel from "./AnimatedPanel";

// Minimal WebRTC call modal using existing socket signaling
const CallModal = ({ isOpen, onClose, targetUser, isIncoming, incomingOffer, startWithVideo = true }) => {
  const { authUser, socket } = useAuthStore();
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(startWithVideo);
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // setup listeners
    const handleIncomingICE = ({ candidate }) => {
      if (pcRef.current && candidate) pcRef.current.addIceCandidate(candidate).catch(console.error);
    };

    const handleCallAnswered = async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(answer);
    };

    socket?.on("ice-candidate", handleIncomingICE);
      socket?.on("call-answered", handleCallAnswered);
      socket?.on("call-ended", () => {
        toast("Call ended");
        cleanup();
        onClose();
      });

    return () => {
      socket?.off("ice-candidate", handleIncomingICE);
      socket?.off("call-answered", handleCallAnswered);
      socket?.off("call-ended");
    };
  }, [isOpen, socket, onClose]);

    const cleanup = () => {
    try {
      pcRef.current?.close();
    } catch (e) {}
    pcRef.current = null;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }
    setCallStarted(false);
  };

    const startCallAsCaller = async () => {
    if (callStarted) return;
    setCallStarted(true);
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoEnabled });
      localStreamRef.current = localStream;

      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcRef.current = pc;

      // add local tracks
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      // remote stream
      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;
      // attach local stream to video element
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", { to: targetUser._id, candidate: e.candidate });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log("emitting call-user to", targetUser._id);
      socket.emit("call-user", { to: targetUser._id, from: authUser, offer: pc.localDescription });
    } catch (err) {
      console.error(err);
      toast.error("Failed to start call");
      cleanup();
      onClose();
    }
  };

    const acceptCall = async () => {
    if (callStarted) return;
    setCallStarted(true);
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideoEnabled });
      localStreamRef.current = localStream;

      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pcRef.current = pc;

      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;
      // attach local stream to video element
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", { to: incomingOffer.from._id, candidate: e.candidate });
        }
      };

      await pc.setRemoteDescription(incomingOffer.offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log("emitting answer-call to", incomingOffer.from._id);
      socket.emit("answer-call", { to: incomingOffer.from._id, answer: pc.localDescription });
    } catch (err) {
      console.error(err);
      toast.error("Failed to accept call");
      cleanup();
      onClose();
    }
  };

    const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    try {
      socket.emit("end-call", { to: targetUser?._id || incomingOffer?.from?._id });
    } catch (e) {}
    cleanup();
    onClose();
  };

      if (!isOpen) return null;

  return (
    <AnimatedPanel
      isOpen={isOpen}
      onClose={() => {
        cleanup();
        onClose?.();
      }}
      title={targetUser?.fullName || incomingOffer?.from?.fullName || "Call"}
    >
      <div className="space-y-4">
        {/* Video display */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover" 
          />
          {/* Picture-in-picture local video */}
          <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border-2 border-white">
            <video 
              ref={localVideoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <img 
            src={targetUser?.profilePic || incomingOffer?.from?.profilePic || "/avatar.png"} 
            alt="user" 
            className="w-12 h-12 rounded-full object-cover" 
          />
          <div>
            <div className="font-medium">{targetUser?.fullName || incomingOffer?.from?.fullName || "User"}</div>
            <div className="text-sm text-base-content/60">
              {callStarted ? "Connected" : isIncoming ? "Incoming call..." : "Calling..."}
            </div>
          </div>
        </div>

        {/* Call controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Mute button */}
          <button 
            className={`btn btn-circle ${isMuted ? 'btn-error' : 'btn-ghost'}`}
            onClick={toggleMute}
            disabled={!callStarted}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff /> : <Volume2 />}
          </button>

          {/* Answer/Start call button */}
          {!callStarted && (
            <button 
              className="btn btn-circle btn-success btn-lg" 
              onClick={() => (isIncoming ? acceptCall() : startCallAsCaller())}
              title={isIncoming ? "Answer Call" : "Start Call"}
            >
              <Phone />
            </button>
          )}

          {/* End call button */}
          <button 
            className="btn btn-circle btn-error" 
            onClick={endCall}
            title="End Call"
          >
            <X />
          </button>

          {/* Video toggle button */}
          <button 
            className={`btn btn-circle ${!isVideoEnabled ? 'btn-error' : 'btn-ghost'}`}
            onClick={toggleVideo}
            disabled={!callStarted}
            title={isVideoEnabled ? "Turn off video" : "Turn on video"}
          >
            {isVideoEnabled ? <Video /> : <VideoOff />}
          </button>
        </div>

        <div className="text-sm text-base-content/60 text-center">
          {!callStarted && (isIncoming ? "Click the green button to answer" : "Click the green button to start the call")}
          {callStarted && "Call in progress"}
        </div>
      </div>
    </AnimatedPanel>
  );
};

export default CallModal;
