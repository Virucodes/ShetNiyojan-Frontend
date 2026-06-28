import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import LanguageSelector from "@/components/common/LanguageSelector";
import OtpModal from "@/components/OtpModal";
import { otp, auth as authApi } from "@/lib/api";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Step 1: Validate credentials, then send OTP
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setIsLoading(true);
      // First, verify credentials against the backend
      await authApi.login({ mobileno: mobile, password });
      // If credentials are valid, send OTP for 2FA
      await otp.send(mobile);
      toast.success("OTP sent! Please check your SMS.");
      setShowOtpModal(true);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Invalid credentials. Please check your mobile number and password.");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Login failed. Please try again later.");
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: After OTP verified, finish the login
  const handleOtpVerified = async () => {
    setShowOtpModal(false);
    try {
      setIsLoading(true);
      // Login was already done in step 1 (token stored), just get the user profile
      const { getCurrentUser } = authApi;
      const userData = await getCurrentUser();
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }
      toast.success("Login successful! Welcome back 👋");
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Something went wrong. Please log in again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <svg
              width="36"
              height="36"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-agrigreen mr-2"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2ZM10 14C11.105 14 12 13.105 12 12C12 10.895 11.105 10 10 10C8.895 10 8 10.895 8 12C8 13.105 8.895 14 10 14ZM22 14C23.105 14 24 13.105 24 12C24 10.895 23.105 10 22 10C20.895 10 20 10.895 20 12C20 13.105 20.895 14 22 14ZM22 20C22 23.314 19.314 26 16 26C12.686 26 10 23.314 10 20H22Z"
                fill="currentColor"
              />
            </svg>
            <h1 className="text-2xl font-bold text-agrigreen">ShetNiyojan</h1>
          </div>
          <p className="text-sm text-muted-foreground">Smart farming platform for Indian farmers</p>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials — we'll verify via OTP
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="mobile">
                  Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <span className="flex items-center px-3 py-2 bg-gray-100 border border-input rounded-md text-sm text-muted-foreground font-medium whitespace-nowrap">
                    🇮🇳 +91
                  </span>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    pattern="[0-9]{10}"
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-agrigreen hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              {/* 2FA notice */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <ShieldCheck size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  After entering your credentials, you'll receive an SMS OTP for secure two-factor authentication.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full bg-agrigreen hover:bg-agrigreen-dark text-white" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Verifying…" : "Sign in with OTP"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-agrigreen hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Floating language selector */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white p-2 rounded-lg shadow-lg">
          <LanguageSelector />
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        mobile={mobile}
        purpose="login"
        onVerified={handleOtpVerified}
        onClose={() => setShowOtpModal(false)}
      />
    </div>
  );
};

export default Login;
