import React, { useEffect, useRef, useState } from 'react';

const StatusViewer = ({ statuses = [], startIndex = 0, onClose }) => {
  const [index, setIndex] = useState(startIndex || 0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    startTimerForIndex(index);
    return () => clearTimer();
  }, [index]);

  useEffect(() => {
    // reset when statuses change
    setIndex(startIndex || 0);
  }, [statuses]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimerForIndex = (i) => {
    clearTimer();
    const s = statuses[i];
    if (!s) return;
    if (s.mediaType === 'video') {
      // wait for video metadata to load to get duration
      const videoEl = videoRef.current;
      if (videoEl && videoEl.readyState >= 1) {
        const dur = s.duration || videoEl.duration || 5;
        runProgress(dur);
        videoEl.play().catch(() => {});
      } else {
        // fallback: try to play then set timer when metadata loaded
        if (videoEl) {
          const onLoaded = () => {
            const dur = s.duration || videoEl.duration || 5;
            runProgress(dur);
            videoEl.play().catch(() => {});
            videoEl.removeEventListener('loadedmetadata', onLoaded);
          };
          videoEl.addEventListener('loadedmetadata', onLoaded);
        } else {
          runProgress(5);
        }
      }
    } else {
      const dur = s.duration || 5;
      runProgress(dur);
    }
  };

  const runProgress = (durationSec) => {
    setProgress(0);
    const step = 100 / (durationSec * 10); // tick every 100ms
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const np = p + step;
        if (np >= 100) {
          clearTimer();
          next();
        }
        return Math.min(np, 100);
      });
    }, 100);
  };

  const prev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const next = () => {
    if (index < statuses.length - 1) setIndex(index + 1);
    else onClose && onClose();
  };

  if (!statuses || statuses.length === 0) return null;

  const current = statuses[index];

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
      <div className="absolute top-6 left-6 right-6 flex gap-2">
        {statuses.map((s, i) => (
          <div key={s._id} className="h-1 bg-zinc-500" style={{ flex: 1 }}>
            <div style={{ height: '100%', background: i < index ? '#fff' : 'linear-gradient(to right,#fff,#bbb)', width: i < index ? '100%' : i === index ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>

      <div className="relative max-w-3xl w-full h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {current.mediaType === 'video' ? (
          <video ref={videoRef} src={current.mediaUrl} className="max-h-full max-w-full" controls onPlay={() => {}} />
        ) : (
          <img src={current.mediaUrl || current.image || '/avatar.png'} alt="status" className="max-h-full max-w-full object-contain" />
        )}

        <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white">‹</button>
        <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white">›</button>
      </div>
    </div>
  );
};

export default StatusViewer;
