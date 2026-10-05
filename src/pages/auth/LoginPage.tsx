import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Phone, Mail, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
// import { auth, db } from "@/services/firebase";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { doc, getDoc, setDoc } from "firebase/firestore";
import { supabase } from "@/services/supabase";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle forgot password - prompt user for email and request Supabase to send reset
  const handleForgotPassword = async () => {
    const email = formData.emailOrPhone || window.prompt("Enter the email address for your account:");
    if (!email) {
      toast({ title: "Email required", description: "Please provide an email address.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password"
      });
      if (error) {
        console.error('Reset password error', error);
        toast({ title: "Error", description: error.message || "Unable to send reset email.", variant: "destructive" });
      } else {
        toast({ title: "Reset Email Sent", description: `Check ${email} for password reset instructions.` });
      }
    } catch (err: any) {
      console.error('Unexpected error sending reset', err);
      toast({ title: "Error", description: err?.message || "Unexpected error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if input is email or phone
      const isEmail = formData.emailOrPhone.includes("@");
      
      if (!isEmail) {
        // If phone number is provided, show error for now
        // In future, you can implement phone authentication
        toast({
          title: "Email Required",
          description: "Please login with your email address for now. Phone login coming soon!",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Supabase sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.emailOrPhone,
        password: formData.password
      });
      // Debug: log the raw response from Supabase
      console.log("supabase signIn result:", signInData, signInError);
      if (signInError) {
        console.error("Supabase sign-in error:", signInError);
        toast({
          title: "Login Failed",
          description: signInError.message || "Unable to login. Please check your credentials.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      const user = signInData.user;
      if (user) {
        // Fetch user profile from 'users' table (use maybeSingle to avoid 406 when missing)
        let { data: userProfile, error: fetchErr } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
        if (fetchErr) console.error('Error fetching profile on login', fetchErr);

        // If no profile row exists yet, try to create one using metadata saved at signup.
        if (!userProfile) {
          const metadata: any = (user.user_metadata || {});
          try {
            const { error: insertErr } = await supabase.from('users').insert([
              {
                id: user.id,
                fullName: metadata.fullName || metadata.name || (user.email ? user.email.split('@')[0] : null),
                phone: metadata.phone || null,
                email: user.email || null,
                city: metadata.city || null,
                state: metadata.state || null,
                profilePhoto: metadata.profilePhoto || null,
                createdAt: new Date().toISOString()
              }
            ]);
            if (insertErr) {
              console.error('Error inserting missing profile row', insertErr);
            } else {
              const { data: created } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
              userProfile = created;
            }
          } catch (e) {
            console.error('Unexpected error inserting profile', e);
          }
        }

        if (userProfile) {
          localStorage.setItem("digital-krishi-user", JSON.stringify(userProfile));
        } else {
          // If we couldn't fetch/create a profile row, store minimal user info so ProtectedRoute
          // can detect an authenticated user. This keeps the app usable even when profile table
          // entry isn't present yet.
          const fallbackProfile = {
            id: user.id,
            email: user.email || null,
            fullName: (user.user_metadata as any)?.fullName || (user.email ? user.email.split('@')[0] : null)
          };
          localStorage.setItem("digital-krishi-user", JSON.stringify(fallbackProfile));
        }
        // Store session token so ProtectedRoute recognizes authenticated state
        try {
          const token = (signInData.session as any)?.access_token || signInData.session?.access_token;
          if (token) localStorage.setItem("digital-krishi-token", token);
        } catch (e) {
          // ignore token storage failures
          console.warn('Unable to store token in localStorage', e);
        }
        // Optionally, set a token if you want to use it for protected routes
        // localStorage.setItem("digital-krishi-token", signInData.session?.access_token || "");
      }
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error?.message || "Unable to login. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-success/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Login Card */}
        <Card className="agricultural-card">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto h-12 w-12 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
              <img src="/Krishi_Sahayak_logo_main.png" alt="Krishi Sahayak Logo" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your Krishi Sahayak account
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Email/Phone Input */}
              <div className="space-y-2">
                <Label htmlFor="emailOrPhone">Email Address</Label>
                <div className="relative">
                  <Input
                    id="emailOrPhone"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.emailOrPhone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emailOrPhone: e.target.value
                    }))}
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Please use your email address to login
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData(prev => ({
                      ...prev,
                      rememberMe: checked as boolean
                    }))}
                  />
                  <Label htmlFor="rememberMe" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full gradient-primary text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Create account
                </Link>
              </div>

              {/* Demo Credentials removed */}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;