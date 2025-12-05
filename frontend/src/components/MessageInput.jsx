import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile, Mic, StopCircle } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const { sendMessage } = useChatStore();
  const { startTyping, stopTyping } = useChatStore();
  const typingTimeoutRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [audioPreview, setAudioPreview] = useState(null);

  useEffect(() => {
    return () => {
      // cleanup object URL
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, [audioPreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // stop typing when message sent
      stopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const convertBlobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioPreview(url);
        // auto-send audio
        try {
          const base64 = await convertBlobToBase64(blob);
          await sendMessage({ audio: base64 });
        } catch (err) {
          console.error('Failed to send audio message', err);
          toast.error('Failed to send voice message');
        }
        // cleanup
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        recordedChunksRef.current = [];
        // revoke preview after short timeout
        setTimeout(() => {
          if (url) URL.revokeObjectURL(url);
          setAudioPreview(null);
        }, 5000);
      };
      mr.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleTyping = (value) => {
    setText(value);
    // emit typing
    startTyping();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
      typingTimeoutRef.current = null;
    }, 1500);
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => handleTyping(e.target.value)}
            />

            {showEmoji && (
              <div className="absolute -bottom-56 left-0 z-50">
                <EmojiPicker
                  onSelect={(emoji) => {
                    // Insert emoji at caret position
                    const el = inputRef.current;
                    if (!el) return setText((t) => t + emoji);
                    const start = el.selectionStart || 0;
                    const end = el.selectionEnd || 0;
                    const newText = text.slice(0, start) + emoji + text.slice(end);
                    setText(newText);
                    // restore caret after emoji
                    requestAnimationFrame(() => {
                      const pos = start + emoji.length;
                      el.focus();
                      el.setSelectionRange(pos, pos);
                    });
                    setShowEmoji(false);
                  }}
                />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
          <button
            type="button"
            className="btn btn-ghost sm:flex btn-circle"
            onClick={() => setShowEmoji((s) => !s)}
          >
            <Smile />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`btn btn-sm btn-circle ${isRecording ? 'btn-error' : 'btn-ghost'}`}
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            title={isRecording ? 'Stop recording' : 'Record voice message'}
          >
            {isRecording ? <StopCircle size={18} /> : <Mic size={18} />}
          </button>

          <button
            type="submit"
            className="btn btn-sm btn-circle"
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={22} />
          </button>
        </div>
      </form>
    </div>
  );
};
export default MessageInput;
