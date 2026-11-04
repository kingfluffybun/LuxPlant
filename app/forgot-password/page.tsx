"use client";

import "../../public/css/login.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import Link from "next/link";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useRef, useEffect } from "react";

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const emailInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                emailInputRef.current?.focus();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSuccess(
                "Reset link sent! Check your email for the password reset link."
            );
            setEmail("");
        } catch (err: any) {
            console.error("Error sending reset link:", err.message);

            if (err.message?.includes("User not found")) {
                setSuccess(
                    "If an account with that email exists, we've sent a reset link. Check your spam folder!"
                );
            } else if (err.message?.includes("Rate limit") || err.message?.includes("Too many")) {
                setError("Please wait a moment before trying again.");
            } else {
                setError(
                    "An error occurred while sending the reset link. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-layout">
            <Navigation />
            <main className="recovery-main">
                <div className="recovery-container">
                    <div className="recovery">
                        <header className="recovery-header">
                            <h1>Forgot your password?</h1>
                            <p>Enter your email and we’ll help you reset your password.</p>
                        </header>
                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="login-form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    autoComplete="email"
                                    ref={emailInputRef}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Email"
                                />
                            </div>
                            <button type="submit" className="link-button-primary" disabled={loading}>
                                {loading ? "Sending..." : "Send reset link"}
                            </button>
                        </form>

                        {/* Success Message */}
                        {success && (
                            <div className="login-success">
                                ✓ {success}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="login-error">
                                ✗ {error}
                            </div>
                        )}

                        <Link href="/login">Back to login</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
