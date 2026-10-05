import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

/*
Contract:
- If the user comes from Supabase's reset email, the URL will include access_token/type=recovery.
- We should call supabase.auth.updateUser({ password }) once the session is established.
- If no recovery session exists, allow user to request a new reset or navigate to login.
*/

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const hashParams = useMemo(() => {
    // Parse tokens from URL hash like: #access_token=...&refresh_token=...&type=recovery
    const out: Record<string, string> = {};
    if (typeof window !== "undefined" && window.location.hash) {
      const s = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
      new URLSearchParams(s).forEach((v, k) => (out[k] = v));
    }
    return out;
  }, []);

  useEffect(() => {
    // Establish a session if coming from Supabase password recovery link
    const init = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setReady(true);
          return;
        }

        const code = searchParams.get("code");
        if (code) {
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) console.warn("exchangeCodeForSession error", error);
          } catch (e) {
            console.warn("Failed to exchange code for session", e);
          }
        } else if (hashParams["access_token"] && hashParams["refresh_token"] && hashParams["type"] === "recovery") {
          try {
            await supabase.auth.setSession({
              access_token: hashParams["access_token"],
              refresh_token: hashParams["refresh_token"],
            });
          } catch (e) {
            console.warn("Failed to set session from hash tokens", e);
          }
        }
      } finally {
        setReady(true);
      }
    };
    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords do not match", description: "Please re-enter the same password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Link expired or invalid",
          description: "Request a new reset link and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: "Unable to update password", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/login");
    } catch (e: any) {
      toast({ title: "Unexpected error", description: e?.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-success/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/login">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
        </Button>

        <Card className="agricultural-card">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
            <CardDescription>
              {ready ? "Enter a new password for your account" : "Preparing reset..."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <p className="text-xs text-muted-foreground">Use at least 8 characters for a strong password.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={!ready || loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                If this link is expired, request a new one from the login page.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
