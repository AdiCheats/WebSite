import { useState, useEffect } from "react";
import { authService } from "@/lib/auth";
import { getFirebaseApp } from "@/lib/firebase";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const rememberedUsername = localStorage.getItem('rememberedUsername');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    if (rememberedUsername && rememberedPassword) {
      setEmail(rememberedUsername);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast({ title: "Please enter both email and password", variant: "destructive" });
        return;
      }

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

      if (rememberMe) {
        localStorage.setItem('rememberedUsername', email);
        localStorage.setItem('rememberedPassword', password);
      }

      localStorage.setItem('user_logged_in', 'true');
      localStorage.setItem('user_email', email);
      localStorage.removeItem('user_logged_out');
      sessionStorage.removeItem('user_logged_out');

      window.location.href = "/";
    } catch (err) {
      toast({ title: "Login failed", description: err instanceof Error ? err.message : "Authentication error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-background via-background to-background">
      {/* Decorative blurred gradients (no header/nav) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-28 h-80 w-80 bg-primary/25 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 -left-28 h-80 w-80 bg-purple-600/25 blur-3xl rounded-full" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center min-h-screen py-10">
          <Card className="w-full max-w-md border border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl rounded-2xl">
            <CardHeader className="text-center space-y-3 pt-10">
              <div className="mx-auto h-20 w-20 rounded-full overflow-hidden shadow-lg">
                <img
                  src="https://cdn.discordapp.com/attachments/1421112166429229116/1422228063739052122/adicheats.png?ex=68fd86da&is=68fc355a&hm=2c2810478695b99ad74d7ef1a4b3e8a6b9f166d0edc564be73e1fac7dd4542fd&"
                  alt="ADI Cheats Logo"
                  className="h-full w-full object-cover"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">Sign in</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Access your ADI CHEATS AUTH dashboard</p>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} id="remember" />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</Label>
                  </div>
                  <a className="text-sm text-primary hover:underline" href="#">Forgot password?</a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 shadow-lg transition-all duration-300 hover:shadow-[0_0_22px_4px_rgba(239,68,68,0.55)] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in…" : (<><LogIn className="h-4 w-4 mr-2" /> Sign In</>)}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By continuing you agree to our Terms and Privacy Policy
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}