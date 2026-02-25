import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, Mail, Sparkles, ArrowLeft } from 'lucide-react';
import { lovable } from '@/integrations/lovable/index';
import { z } from 'zod';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72, { message: "Password must be less than 72 characters" }),
  username: z.string().trim().min(3, { message: "Username must be at least 3 characters" }).max(50, { message: "Username must be less than 50 characters" }).regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, underscores, and hyphens" }).optional(),
});

type AuthView = 'login' | 'signup' | 'magic-link' | 'forgot-password' | 'reset-password' | 'magic-link-sent';

const Auth = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();

  // Clear stale session on auth page load & handle recovery
  useEffect(() => {
    const init = async () => {
      // Check current session - if refresh fails, clear it so it doesn't block new sign-ins
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        // Clear any stale tokens from localStorage to stop retry loops
        const storageKey = `sb-dkwhjdhnbwjszvciugzn-auth-token`;
        localStorage.removeItem(storageKey);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('reset-password');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && view !== 'reset-password') {
      navigate('/');
    }
  }, [user, navigate, view]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isLogin = view === 'login';
      const validation = authSchema.safeParse({
        email: email.trim(),
        password,
        username: !isLogin ? username.trim() : undefined,
      });

      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: validation.data.email,
          password: validation.data.password,
        });

        if (!error && rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        if (error) {
          if (error.message.includes("Failed to fetch") || error.name === 'AuthRetryableFetchError') {
            throw new Error("Network error. Please check your connection and try again.");
          }
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password. Please check your credentials.");
          }
          if (error.message.includes("Email not confirmed")) {
            throw new Error("Please verify your email before logging in.");
          }
          throw new Error(error.message || "Sign in failed. Please try again.");
        }

        toast({ title: "Welcome back!", description: "You've been logged in successfully." });
        navigate('/');
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email: validation.data.email,
          password: validation.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username: validation.data.username || validation.data.email.split('@')[0],
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error("This email is already registered. Try signing in instead.");
          }
          throw new Error("Sign up failed. Please try again.");
        }

        // Auto-confirm is enabled, so user is logged in immediately
        if (data?.user?.identities?.length === 0) {
          throw new Error("This email is already registered. Try signing in instead.");
        }

        toast({ title: "Account created!", description: "Welcome aboard! You're now signed in." });
        navigate('/');
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        throw result.error;
      }
    } catch (error: any) {
      setGoogleLoading(false);
      toast({ title: "Error", description: error.message || "Failed to sign in with Google.", variant: "destructive" });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = z.string().email({ message: "Invalid email address" }).safeParse(email.trim());
      if (!validation.success) throw new Error(validation.error.errors[0].message);

      const { error } = await supabase.auth.resetPasswordForEmail(validation.data, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({ title: "Check your email", description: "We've sent you a password reset link." });
      setView('login');
      setEmail('');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send reset email.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = z.string().min(8, "Password must be at least 8 characters").max(72, "Password must be less than 72 characters").safeParse(newPassword);
      if (!validation.success) throw new Error(validation.error.errors[0].message);

      const { error } = await supabase.auth.updateUser({ password: validation.data });
      if (error) throw error;

      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      setView('login');
      setNewPassword('');
      navigate('/');
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update password.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = z.string().email({ message: "Invalid email address" }).safeParse(email.trim());
      if (!validation.success) throw new Error(validation.error.errors[0].message);

      const { error } = await supabase.auth.signInWithOtp({
        email: validation.data,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });

      if (error) throw error;

      setView('magic-link-sent');
      toast({ title: "Magic link sent!", description: "Check your email for a sign-in link." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to send magic link.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'magic-link': return 'Magic Link Sign In';
      case 'forgot-password': return 'Reset Password';
      case 'reset-password': return 'Set New Password';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case 'login': return 'Sign in to your account';
      case 'signup': return 'Get started with your free account';
      case 'magic-link': return 'We\'ll email you a passwordless sign-in link';
      case 'forgot-password': return 'Enter your email to receive a reset link';
      case 'reset-password': return 'Choose a strong new password';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl shadow-card p-8">

          {/* Magic Link Sent Confirmation */}
          {view === 'magic-link-sent' ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
                <p className="text-muted-foreground">
                  We've sent a magic sign-in link to <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>
              <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 text-sm text-muted-foreground">
                <p>Click the link in the email to sign in instantly. No password needed!</p>
              </div>
              <div className="space-y-3">
                <Button variant="hero" className="w-full" onClick={handleMagicLink} disabled={loading}>
                  {loading ? 'Sending...' : 'Resend magic link'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => { setView('login'); setEmail(''); }}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {getTitle()}
                </h1>
                <p className="text-muted-foreground">{getSubtitle()}</p>
              </div>

              {/* Reset Password Form (after clicking email link) */}
              {view === 'reset-password' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="bg-background/50 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <PasswordStrengthIndicator password={newPassword} />
                  </div>
                  <Button type="submit" className="w-full" variant="hero" size="lg" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              )}

              {/* Forgot Password Form */}
              {view === 'forgot-password' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="hero" size="lg" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => { setView('login'); setEmail(''); }}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                  </Button>
                </form>
              )}

              {/* Magic Link Form */}
              {view === 'magic-link' && (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <Button type="submit" className="w-full" variant="glow" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Send Magic Link
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => { setView('login'); setEmail(''); }}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                  </Button>
                </form>
              )}

              {/* Login / Signup Form */}
              {(view === 'login' || view === 'signup') && (
                <>
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {view === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="Choose a username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="bg-background/50 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {view === 'signup' && <PasswordStrengthIndicator password={password} />}
                    </div>

                    {view === 'login' && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="rememberMe"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          />
                          <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                            Remember me
                          </label>
                        </div>
                        <button type="button" onClick={() => setView('forgot-password')} className="text-sm text-primary hover:underline">
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <Button type="submit" className="w-full" variant="hero" size="lg" disabled={loading}>
                      {loading ? 'Please wait...' : view === 'login' ? 'Sign In' : 'Sign Up'}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  {/* Social / Alternative Login */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={googleLoading}>
                      {googleLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <>
                          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                          Google
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setView('magic-link')}>
                      <Mail className="mr-2 h-5 w-5" />
                      Magic Link
                    </Button>
                  </div>

                  {/* Toggle Login/Signup */}
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setView(view === 'login' ? 'signup' : 'login');
                        setPassword('');
                        setUsername('');
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      {view === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
