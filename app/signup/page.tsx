"use client";

import "../../public/css/login.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";

import { Eye, EyeClosed, TriangleAlert } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { createClient } from "../../lib/supabase/client";

type SignupField = "email" | "password";
type SignupFieldErrors = Partial<Record<SignupField, string>>;

function formatSignupError(message: string) {
  const characterClasses: [string, string][] = [
    ["abcdefghijklmnopqrstuvwxyz", "lowercase letters"],
    ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", "uppercase letters"],
    ["0123456789", "numbers"],
    ["!@#$%^&*()_+-=[]{};'" + "\\:" + "\"|<>?,./`~", "symbols"],
  ];

  return characterClasses.reduce(
    (formatted, [characters, label]) => formatted.replaceAll(characters, label),
    message
  );
}

export default function SignupPage() {
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showAuthError = (error: unknown) => {
    const message = formatSignupError(error instanceof Error ? error.message : "Signup failed");
    const code = typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";
    const normalized = `${code} ${message}`.toLowerCase();

    setSuccessMsg(null);
    if (
      normalized.includes("email") ||
      normalized.includes("already registered") ||
      normalized.includes("already exists")
    ) {
      setFieldErrors({ email: message });
      setErrorMsg(null);
    } else if (normalized.includes("password") || normalized.includes("weak_password")) {
      setFieldErrors({ password: message });
      setErrorMsg(null);
    } else {
      setFieldErrors({});
      setErrorMsg(message);
    }
  };

  const handleOAuthSignup = async (provider: "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "OAuth signup failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            first_name: firstName, 
            last_name: lastName, 
            role: "member",
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) throw error;

      setSuccessMsg("Signup successful! Please check your email to confirm your account.");

    } catch (err: unknown) {
      showAuthError(err);
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

                        <form className="login-form" onSubmit={handleSubmit}>
                            {errorMsg && (
                                <p className="login-error" role="alert">
                                    <TriangleAlert size={16} aria-hidden="true" />
                                    <span>{errorMsg}</span>
                                </p>
                            )}
                            {successMsg && <p className="login-success" role="status">{successMsg}</p>}
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
                                        placeholder="First Name"
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
                                        placeholder="Last Name"
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
                                    placeholder="Email"
                                    aria-invalid={Boolean(fieldErrors.email)}
                                    aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
                                    value={email}
                                    onChange={(e) => {
                                      setEmail(e.target.value);
                                      setFieldErrors((current) => ({ ...current, email: undefined }));
                                      setErrorMsg(null);
                                    }}
                                />
                                {fieldErrors.email && (
                                    <p className="login-field-error" id="signup-email-error" role="alert">
                                        <TriangleAlert size={16} aria-hidden="true" />
                                        <span>{fieldErrors.email}</span>
                                    </p>
                                )}
                            </div>
                            <div className="login-form-group">
                                <label htmlFor="password">Password</label>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    id="password" 
                                    name="password" 
                                    autoComplete="new-password" 
                                    required 
                                    placeholder="Password"
                                    aria-invalid={Boolean(fieldErrors.password)}
                                    aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
                                    value={password}
                                    onChange={(e) => {
                                      setPassword(e.target.value);
                                      setFieldErrors((current) => ({ ...current, password: undefined }));
                                      setErrorMsg(null);
                                    }}
                                />
                                {fieldErrors.password && (
                                    <p className="login-field-error" id="signup-password-error" role="alert">
                                        <TriangleAlert size={16} aria-hidden="true" />
                                        <span>{fieldErrors.password}</span>
                                    </p>
                                )}
                                <button className="show-password-button"
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
