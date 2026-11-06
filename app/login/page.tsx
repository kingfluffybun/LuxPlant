"use client";

import "../../public/css/login.css";
import "../../app/globals.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";

import { Eye, EyeClosed, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { createClient } from "../../lib/supabase/client";

function getAccountRedirect() {
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  return redirect === "/profile" || redirect === "/order" ? redirect : "/";
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!isCurrent) return;
      if (error) {
        if (error.name !== "AuthSessionMissingError" && error.message !== "Auth session missing!") {
          console.error("Could not check the signed-in user after login.", error);
        }
        return;
      }
      if (data.user) router.replace(getAccountRedirect());
    });
    return () => {
      isCurrent = false;
    };
  }, [router, supabase]);

  const handleOAuthLogin = async (provider: "google") => {
    try {
      const redirect = getAccountRedirect();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/login?redirect=${encodeURIComponent(redirect)}`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "OAuth login failed");
    }
  };

  const getLoginErrorMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : "Login failed";
    const code = typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

    if (code === "invalid_credentials" || message.toLowerCase() === "invalid login credentials") {
      return "Invalid login credentials";
    }

    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Clear input fields after successful login
      setEmail("");
      setPassword("");
      
      router.push(getAccountRedirect());
    } catch (err: unknown) {
      setErrorMsg(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
    return (
        <div className="auth-page-layout">
            <Navigation />
            <main className="login-main">
                <div className="login-container">
                    <div className="login">
                        <div className="login-header">
                            <h1>Welcome Back</h1>
                            <p className="login-signup-link">
                                Don&apos;t have an account yet? <Link href="/signup">Sign up now</Link>
                            </p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            {errorMsg && (
                                <p className="login-error" role="alert">
                                    <TriangleAlert size={16} aria-hidden="true" />
                                    <span>{errorMsg}</span>
                                </p>
                            )}
                            <button type="button" className="login-social-button" onClick={() => handleOAuthLogin("google")}>
                                <Image src="/assets/google-logo.svg" alt="Google" width={32} height={32} />
                                <p>Continue with Google</p>
                            </button>
                            <div className="login-or">
                                <div className="divider"></div>
                                <p>Or</p>
                                <div className="divider"></div>
                            </div>
                            <div className="login-form-group">
                                <label htmlFor="email">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    autoComplete="email" 
                                    required 
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => {
                                      setEmail(e.target.value);
                                      setErrorMsg(null);
                                    }}
                                />
                            </div>
                            <div className="login-form-group">
                                <label htmlFor="password">Password</label>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    id="password" 
                                    name="password" 
                                    autoComplete="current-password" 
                                    required 
                                    placeholder="Password" 
                                    value={password}
                                    onChange={(e) => {
                                      setPassword(e.target.value);
                                      setErrorMsg(null);
                                    }}
                                />
                                <button className="show-password-button"
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye /> : <EyeClosed />}
                                </button>
                            </div>
                            <div className="login-remember-forgot">
                                {/* <div className="login-remember-me">
                                    <input type="checkbox" id="remember-me" name="remember-me" />
                                    <label htmlFor="remember-me">Remember me</label>
                                </div> */}
                                <Link href="/forgot-password" className="forgot-password-link">Forgot password?</Link>
                            </div>
                            <button type="submit" disabled={loading} className="link-button-primary" >
                                {loading ? "Logging In..." : "Login"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
