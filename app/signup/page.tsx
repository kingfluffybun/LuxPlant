"use client";

import "../../public/css/login.css";
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

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOAuthSignup = async (provider: string) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: provider as any });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message ?? "OAuth signup failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, role: "member" },
        },
      });
      if (error) throw error;

    //   Ibahin to, temp lng dis
      setErrorMsg("Signup successful! Please check your email to confirm your account.");

    } catch (err: any) {
      setErrorMsg(err.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

    return (
        <div className="auth-page-layout">
            <Navigation />
            <main className="register-main">
                <div className="register-container">
                    <div className="register">
                        <div className="register-header">
                            <h1>Create your account</h1>
                            <p>
                                Already have an account? <Link href="/login">Log in</Link>
                            </p>
                        </div>

                        {/* Error message */}
                        {errorMsg && <p className="login-error" style={{ color: "red" }}>{errorMsg}</p>}

                        <form className="login-form" onSubmit={handleSubmit}>
                            <button 
                                type="button" 
                                className="login-social-button"
                                onClick={(e) => { e.preventDefault(); handleOAuthSignup("google"); }}
                            >
                                <Image src="/assets/google-logo.svg" alt="" width={32} height={32} />
                                <p>Continue with Google</p>
                            </button>
                            <div className="login-or">
                                <div className="divider"></div>
                                <p>Or</p>
                                <div className="divider"></div>
                            </div>
                            <div className="register-name-fields">
                                <div className="login-form-group">
                                    <label htmlFor="first-name">First name</label>
                                    <input 
                                        type="text" 
                                        id="first-name" 
                                        name="firstName" 
                                        autoComplete="given-name" 
                                        required 
                                        placeholder="e.g. Alex"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="login-form-group">
                                    <label htmlFor="last-name">Last name</label>
                                    <input 
                                        type="text" 
                                        id="last-name" 
                                        name="lastName" 
                                        autoComplete="family-name" 
                                        required 
                                        placeholder="e.g. Morgan"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="login-form-group">
                                <label htmlFor="email">Email</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    autoComplete="email" 
                                    required 
                                    placeholder="alex@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="login-form-group">
                                <label htmlFor="password">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    autoComplete="new-password" 
                                    required 
                                    placeholder="Choose a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <Eye /> : <EyeClosed />}
                                </button>
                            </div>
                            <button type="submit" disabled={loading} className="link-button-primary">
                                {loading ? "Creating…" : "Create account"}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
