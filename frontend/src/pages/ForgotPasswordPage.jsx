import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Mail, Loader2 } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email");
    setLoading(true);
    setResetToken("");
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      // For development we get a resetToken in response
      toast.success("Reset token generated below.");
      setResetToken(res.data.resetToken || "");
      // Store token in localStorage for ResetPasswordPage
      if (res.data.resetToken) {
        localStorage.setItem("lastResetToken", res.data.resetToken);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to request reset");
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
                <Mail className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Forgot Password</h1>
              <p className="text-base-content/60">Enter your email to get a reset token</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <button className="btn btn-primary w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Request Reset"}
            </button>
          </form>

          {resetToken && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-center">
              <div className="font-semibold text-blue-700 mb-2">Your Reset Token (dev only):</div>
              <div className="font-mono text-sm break-all select-all mb-2">{resetToken}</div>
              <div className="flex flex-col gap-2 items-center">
                <button
                  className="btn btn-xs btn-outline btn-primary"
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(resetToken);
                    toast.success("Token copied to clipboard");
                  }}
                >
                  Copy Token
                </button>
                <button
                  className="btn btn-xs btn-success"
                  type="button"
                  onClick={() => navigate("/reset")}
                >
                  Go to Reset Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-gradient-to-b from-blue-200 to-white">
        <div className="text-center p-12">
          <h2 className="text-3xl font-semibold mb-2">BDC Messenger</h2>
          <p className="text-zinc-600">We will generate a one-time token you can use to reset your password (dev only).</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
