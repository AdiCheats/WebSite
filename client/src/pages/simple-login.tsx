import { useState, useEffect } from "react";
import { authService } from "@/lib/auth";
import { getFirebaseApp } from "@/lib/firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Shield, Sparkles } from "lucide-react";

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saveCredentials, setSaveCredentials] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setSaveCredentials(true);
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs before making API call
    if (!email || !password) {
      toast({ 
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter both your email and password to continue.",
        duration: 5000
      });
      return;
    }

    // Basic email format validation
    if (!email.includes('@')) {
      toast({ 
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        duration: 5000
      });
      return;
    }

    setIsLoading(true);

    try {
      const app = getFirebaseApp();
      if (app) {
        const auth = getAuth(app);
        const cred = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await cred.user.getIdToken();
        // Create server session so API calls are authenticated
        const r = await fetch('/api/auth/firebase-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ idToken }),
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.message || 'Failed to create session');
        }
      } else {
        await authService.login(email, password);
      }

      // Save credentials if checkbox is checked
      if (saveCredentials) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }

      localStorage.setItem('user_logged_in', 'true');
      localStorage.setItem('user_email', email);
      localStorage.removeItem('user_logged_out');
      sessionStorage.removeItem('user_logged_out');

      // Show success message before redirect
      toast({ 
        variant: "success",
        title: "Login Successful!",
        description: "Welcome back! Redirecting to your dashboard...",
        duration: 2000
      });

      // Small delay to show success message
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    } catch (err: any) {
      // Extract and format error message
      let title = "Login Failed";
      let description = "Unable to sign you in. Please try again.";

      if (err?.code) {
        // Firebase specific errors
        switch (err.code) {
          case 'auth/invalid-email':
            title = "Invalid Email";
            description = "Please enter a valid email address.";
            break;
          case 'auth/user-disabled':
            title = "Account Disabled";
            description = "Your account has been disabled. Please contact support for assistance.";
            break;
          case 'auth/user-not-found':
            title = "Account Not Found";
            description = "No account found with this email address. Please check your email or sign up.";
            break;
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            title = "Incorrect Password";
            description = "The password you entered is incorrect. Please try again.";
            break;
          case 'auth/too-many-requests':
            title = "Too Many Attempts";
            description = "Access temporarily disabled due to many failed login attempts. Please try again later.";
            break;
          case 'auth/network-request-failed':
            title = "Connection Error";
            description = "Unable to connect to the server. Please check your internet connection.";
            break;
          default:
            description = err.message || "An authentication error occurred.";
        }
      } else if (err?.message) {
        // Custom error messages
        const msg = err.message.toLowerCase();
        if (msg.includes('password') || msg.includes('incorrect') || msg.includes('invalid credentials')) {
          title = "Incorrect Credentials";
          description = "The email or password you entered is incorrect. Please try again.";
        } else if (msg.includes('not found') || msg.includes('no user')) {
          title = "Account Not Found";
          description = "No account found with this email address.";
        } else if (msg.includes('network') || msg.includes('connection')) {
          title = "Connection Error";
          description = "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (msg.includes('disabled')) {
          title = "Account Disabled";
          description = "Your account has been disabled. Please contact support.";
        } else {
          description = err.message;
        }
      }

      toast({ 
        variant: "destructive",
        title: title,
        description: description,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950">
      {/* Animated Background Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 animate-pulse bg-red-600/30 blur-[120px] rounded-full" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 animate-pulse bg-orange-600/20 blur-[120px] rounded-full animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 animate-pulse bg-red-500/10 blur-[120px] rounded-full animation-delay-4000" />
      </div>

      {/* Decorative Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-center gap-12 max-w-6xl mx-auto">
          {/* Left Side - Decorative Content */}
          <div className="hidden lg:flex flex-col items-start justify-center w-1/2 space-y-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-orange-600/20 blur-3xl rounded-full" />
              <h1 className="relative text-5xl font-bold text-white leading-tight">
                Simplify <br />
                Management with <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    ADI CHEATS
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                </span>
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-md leading-relaxed">
              Advanced authentication system with powerful license management, real-time monitoring, and seamless integration.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-gray-300 text-sm font-medium">More Features Than KeyAuth</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse animation-delay-1000" />
                <span className="text-gray-300 text-sm font-medium">Overall Better Than KeyAuth</span>
              </div>
            </div>
            <div className="flex items-center gap-6 text-gray-400 pt-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span className="text-sm">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <span className="text-sm">Modern</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 max-w-md">
            <div 
              className="relative group"
              onMouseMove={handleMouseMove}
            >
              {/* Mouse Tracking Glow Effect */}
              <div 
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(239, 68, 68, 0.2), transparent 40%)`
                }}
              />
              
              {/* Ambient Glow Behind Card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 via-orange-600/10 to-red-600/10 rounded-3xl blur-2xl opacity-60" />
              
              {/* Main Card */}
              <div className="relative bg-black/95 backdrop-blur-2xl rounded-3xl border border-red-500/30 shadow-2xl overflow-hidden"
                style={{
                  boxShadow: '0 0 80px rgba(239, 68, 68, 0.15), 0 0 120px rgba(251, 146, 60, 0.08), inset 0 0 60px rgba(0, 0, 0, 0.5)'
                }}
              >
                {/* Top Glow Effect */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-75" />
                
                {/* Inner Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-red-500/5 to-transparent blur-2xl" />
                
                {/* Card Content */}
                <div className="p-8 sm:p-10 relative">
                  {/* Header */}
                  <div className="text-center space-y-4 mb-8">
                    <div className="relative mx-auto w-20 h-20 rounded-full overflow-hidden ring-4 ring-red-500/40 ring-offset-4 ring-offset-black shadow-lg shadow-red-500/60">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 animate-pulse" />
                      <img
                        src="https://cdn.discordapp.com/attachments/1421112166429229116/1422228063739052122/adicheats.png?ex=690812da&is=6906c15a&hm=78923786399efed663e4841cffbd22c707405bfc30c80f29fd4aab1e82916332&"
                        alt="ADI Cheats Logo"
                        className="h-full w-full object-cover relative z-10"
                      />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent mb-2">Welcome Back</h2>
                      <p className="text-gray-500 text-sm">Please login to your account</p>
                    </div>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleLogin} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-red-500" />
                        Email Address
                      </label>
                      <div className="relative group">
                        <input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          autoComplete="email"
                          className="w-full h-12 px-4 bg-black/40 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-black/60 transition-all duration-300 hover:border-red-500/30 hover:bg-black/50"
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-red-500" />
                        Password
                      </label>
                      <div className="relative group">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          autoComplete="current-password"
                          className="w-full h-12 px-4 pr-12 bg-black/40 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 focus:bg-black/60 transition-all duration-300 hover:border-red-500/30 hover:bg-black/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors duration-200"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Save Credentials & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={saveCredentials}
                            onChange={(e) => setSaveCredentials(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 border-2 border-gray-700 rounded bg-black/40 peer-checked:bg-red-600 peer-checked:border-red-600 transition-all duration-300 flex items-center justify-center">
                            {saveCredentials && (
                              <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                          Save Credentials
                        </span>
                      </label>
                      <a 
                        href="#" 
                        className="text-sm text-red-500 hover:text-red-400 transition-colors duration-200 hover:underline"
                      >
                        Forgot Password?
                      </a>
                    </div>

                    {/* Login Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full h-12 bg-gradient-to-r from-red-600 via-red-500 to-orange-600 text-white font-semibold rounded-xl overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_40px_rgba(239,68,68,0.7),0_0_60px_rgba(251,146,60,0.4)] focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {/* Button Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-white/25 to-orange-400/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                      
                      {/* Button Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      <span className="relative flex items-center justify-center gap-2 font-bold tracking-wide">
                        {isLoading ? (
                          <>
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>
                            Login
                          </>
                        )}
                      </span>
                    </button>

                    {/* Terms */}
                    <p className="text-xs text-center text-gray-600 mt-6">
                      By continuing, you agree to our{" "}
                      <a href="#" className="text-red-500 hover:text-red-400 transition-colors underline-offset-2">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-red-500 hover:text-red-400 transition-colors underline-offset-2">
                        Privacy Policy
                      </a>
                    </p>
                  </form>
                </div>

                {/* Bottom Glow Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-75" />
                
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-red-500/10 to-transparent rounded-tl-3xl" />
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-500/10 to-transparent rounded-tr-3xl" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-red-500/10 to-transparent rounded-bl-3xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-orange-500/10 to-transparent rounded-br-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}