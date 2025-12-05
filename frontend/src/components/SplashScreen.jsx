import { useEffect, useState } from "react";

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Wait for fade animation to complete
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-b from-blue-300 to-blue-100 flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo Image */}
        <img
          src="/bdc-logo.svg"
          alt="BDC Messenger"
          className="w-48 h-48 animate-bounce"
        />

        {/* App Name and Tagline */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">BDC Messenger</h1>
          <p className="text-lg text-blue-700">Connect with College Friends</p>
        </div>

        {/* Loading Spinner */}
        <div className="mt-8">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
