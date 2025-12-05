import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Lock, Loader2 } from "lucide-react";

const ResetPasswordPage = () => {
  const [token, setToken] = useState("");
  const [lastToken, setLastToken] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get last token from localStorage (set by ForgotPasswordPage)
    const storedToken = localStorage.getItem("lastResetToken");
    if (storedToken) setLastToken(storedToken);
    // Redirect after success
    if (success) {
      setTimeout(() => {
        navigate("/");
      }, 2000); // 2s delay for user to see success
    }
  }, [success, navigate]);

  const handlePasteLastToken = () => {
    if (lastToken) setToken(lastToken);
    else toast.error("No token found. Please request a reset first.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim() || !password) return toast.error("Token and password are required");
    setLoading(true);
    setSuccess(false);
    try {
      await axiosInstance.post("/auth/reset-password", { token, password });
      setSuccess(true);
      toast.success("Password reset successful. You are now logged in.");
    } catch (error) {
      setSuccess(false);
      toast.error(error?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Reset Password</h1>
              <p className="text-base-content/60">Enter your reset token and new password</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Reset Token</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste token from Forgot Password"
                />
                <button
                  type="button"
                  className="btn btn-outline btn-xs"
                  onClick={handlePasteLastToken}
                  disabled={!lastToken}
                >
                  Paste Last Token
                </button>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">New Password</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
              />
            </div>

            <button className="btn btn-primary w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
            </button>
          </form>

          {success && (
            <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200 text-center">
              <div className="font-semibold text-green-700 mb-2">Your password has been reset!</div>
              <div className="text-green-600">You are now logged in. You can close this tab or go to the main app.</div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-gradient-to-b from-blue-200 to-white">
        <div className="text-center p-12">
          <h2 className="text-3xl font-semibold mb-2">BDC Messenger</h2>
          <p className="text-zinc-600">Use the token generated from Forgot Password to reset your password.</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
