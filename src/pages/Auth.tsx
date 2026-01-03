import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Chrome, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72, { message: "Password must be less than 72 characters" }),
  username: z.string().trim().min(3, { message: "Username must be at least 3 characters" }).max(50, { message: "Username must be less than 50 characters" }).regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, underscores, and hyphens" }).optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showVerificationSent, setShowVerificationSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      const validation = authSchema.safeParse({
        email: email.trim(),
        password,
        username: !isLogin ? username.trim() : undefined,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
        throw new Error(firstError.message);
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: validation.data.email,
          password: validation.data.password,
        });

        if (error) {
          // Sanitize error messages
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Invalid email or password. Please check your credentials or reset your password.");
          }
          if (error.message.includes("Email not confirmed")) {
            throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
          }
          throw new Error(error.message || "Sign in failed. Please try again.");
        }

        toast({
          title: "Success!",
          description: "You've been logged in successfully.",
        });
        navigate('/');
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email: validation.data.email,
          password: validation.data.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: validation.data.username || validation.data.email.split('@')[0],
            },
          },
        });

        if (error) {
          // Sanitize error messages
          if (error.message.includes("already registered")) {
            throw new Error("This email is already registered");
          }
          throw new Error("Sign up failed. Please try again.");
        }

        setShowVerificationSent(true);
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        if (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider')) {
          toast({
            title: "Google Sign-In Not Configured",
            description: "Google authentication is not enabled. Please configure it in your backend settings.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        setGoogleLoading(false);
      }
      // Note: If successful, the page will redirect, so we don't reset loading state
    } catch (error: any) {
      setGoogleLoading(false);
      toast({
        title: "Authentication Failed",
        description: error.message || "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = z.string().email({ message: "Invalid email address" }).safeParse(email.trim());
      
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { error } = await supabase.auth.resetPasswordForEmail(validation.data, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) throw error;

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
      setShowResetPassword(false);
      setEmail('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const validation = z.string().email({ message: "Invalid email address" }).safeParse(email.trim());
      
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: validation.data,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Verification email sent!",
        description: "Please check your inbox.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl shadow-card p-8">
          {showVerificationSent ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Check your email
                </h1>
                <p className="text-muted-foreground">
                  We've sent a verification link to <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>
              <div className="bg-accent/20 border border-accent/30 rounded-lg p-4 text-sm text-muted-foreground">
                <p>Click the link in the email to verify your account. The link will expire in 24 hours.</p>
              </div>
              <div className="space-y-3">
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleResendVerification}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Resend verification email'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowVerificationSent(false);
                    setEmail('');
                    setPassword('');
                    setUsername('');
                  }}
                >
                  Back to sign up
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {showResetPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-muted-foreground">
                  {showResetPassword 
                    ? 'Enter your email to receive a reset link' 
                    : isLogin ? 'Sign in to your account' : 'Get started with your free account'}
                </p>
              </div>

          {showResetPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full"
                variant="hero"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowResetPassword(false);
                  setEmail('');
                }}
              >
                Back to Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
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
            </div>

              <Button
                type="submit"
                className="w-full"
                variant="hero"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>

              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </form>
          )}

          {!showResetPassword && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Chrome className="mr-2 h-5 w-5" />
                    Continue with Google
                  </>
                )}
              </Button>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
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
