"use client";

import "../../public/css/login.css";
import "../../app/globals.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";

import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = async (provider: string) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: provider as any });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message ?? "OAuth login failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Login failed");
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
                                Don't have an account yet? <Link href="/signup">Sign up now</Link>
                            </p>
                        </div>

                        {/* Error message */}
                        {errorMsg && <p className="login-error" style={{ color: "red" }}>{errorMsg}</p>}

                        <form className="login-form" onSubmit={handleSubmit}>
                            <button className="login-social-button" onClick={(e) => { e.preventDefault(); handleOAuthLogin("google"); }}>
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
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    onChange={(e) => setPassword(e.target.value)}
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
