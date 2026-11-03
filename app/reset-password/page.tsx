"use client";

import "../../public/css/login.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import Link from "next/link";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export default function ResetPasswordPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Check if user is logged in - redirect if they are
    // useEffect(() => {
    //     const checkAuth = async () => {
    //         try {
    //             const { data: { session } } = await supabase.auth.getSession();
    //             if (session) {
    //                 window.location.href = "/";
    //             }
    //         } catch (err) {
    //             console.error("Auth check error:", err);
    //         }
    //     };
    //     checkAuth();
    // }, []);

    // password input
    useEffect(() => {
        const passwordInput = document.getElementById("new-password") as HTMLInputElement;
        if (passwordInput) {
            passwordInput.focus();
        }
    }, []);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!newPassword || !confirmPassword) {
            setError("Please enter both passwords.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            setSuccess("Your password has been reset successfully!");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            console.error("Error resetting password:", err.message);

            if (err.message?.includes("Invalid credentials") || err.message?.includes("Incorrect password")) {
                setError("There was an issue with your account. Please try again.");
            } else {
                setError("An error occurred while resetting your password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // password strength
    const getStrength = () => {
        let score = 0;
        const pwd = newPassword;
        if (pwd.length >= 8) score += 1;
        if (pwd.length >= 12) score += 1;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
        if (/[\d]/.test(pwd)) score += 1;
        if (/[^a-zA-Z\d]/.test(pwd)) score += 1;
        return Math.min(score, 4);
    };

    const strength = getStrength();

    return (
        <div className="auth-page-layout">
            <Navigation />
            <main className="recovery-main">
                <div className="recovery-container">
                    <div className="recovery">
                        <header className="recovery-header">
                            <h1>Reset your password</h1>
                            <p>Choose a new password for your account.</p>
                        </header>

                        {/* Error Message */}
                        {error && (
                            <div className="login-error">
                                ✗ {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="login-success">
                                ✓ {success}
                                <br />
                                <a href="/login" style={{ color: "#5A9A0A", textDecoration: "underline" }}>
                                    Sign in with your new password
                                </a>
                            </div>
                        )}

                        {/* Password Reset Form */}
                        {!success && (
                            <form className="login-form" onSubmit={handleSubmit}>
                                <div className="login-form-group">
                                    <label htmlFor="new-password">New password</label>
                                    <input
                                        type="password"
                                        id="new-password"
                                        name="newPassword"
                                        autoComplete="new-password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (error) setError("");
                                        }}
                                        placeholder="New password"
                                    />
                                </div>

                                <div className="login-form-group">
                                    <label htmlFor="confirm-password">Confirm new password</label>
                                    <input
                                        type="password"
                                        id="confirm-password"
                                        name="confirmPassword"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (error) setError("");
                                        }}
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                {/* Password Strength Meter - Gradient Bar */}
                                <div className="password-strength-container">
                                    <label>Password strength:</label>
                                    <div className="password-strength-meter">
                                        {strength > 0 ? (
                                            <div 
                                                className="password-strength-bar"
                                                style={{
                                                    width: `${(strength / 4) * 100}%`,
                                                    background: `linear-gradient(to right, #ef4444 0%, ${
                                                        strength === 4 ? '#10b981' : strength === 3 ? '#eab308' : '#f59e0b'
                                                    } 100%)`
                                                }}
                                            />
                                        ) : (
                                            <div className="password-strength-bar-empty" />
                                        )}
                                    </div>
                                    {strength > 0 && (
                                        <span className="strength-text">
                                            {strength === 4 ? "Strong" : strength === 3 ? "Good" : strength === 2 ? "Fair" : "Weak"}
                                        </span>
                                    )}
                                </div>

                                {/* Strength Recommendations */}
                                <ul className="strength-hints">
                                    {!/[a-z]/.test(newPassword) && <li>Add lowercase letter</li>}
                                    {!/[A-Z]/.test(newPassword) && <li>Add uppercase letter</li>}
                                    {!/[\d]/.test(newPassword) && <li>Add number</li>}
                                    {!/[^a-zA-Z\d]/.test(newPassword) && <li>Add special character (!@#$)</li>}
                                    {newPassword.length < 12 && newPassword.length < 8 && <li>Make it longer (8+ chars recommended)</li>}
                                </ul>

                                <button
                                    type="submit"
                                    className="link-button-primary"
                                    disabled={loading}
                                >
                                    {loading ? "Resetting..." : "Reset password"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
