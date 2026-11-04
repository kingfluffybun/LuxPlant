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
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    window.location.href = "/";
                }
            } catch (err) {
                console.error("Auth check error:", err);
            }
        };
        checkAuth();
    }, []);

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

        // Basic validation
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

        // Check password strength requirements
        const missingRequirements: string[] = [];
        
        if (!/[a-z]/.test(newPassword)) {
            missingRequirements.push("Add a lowercase letter");
        }
        if (!/[A-Z]/.test(newPassword)) {
            missingRequirements.push("Add an uppercase letter");
        }
        if (!/[\d]/.test(newPassword)) {
            missingRequirements.push("Add a number");
        }
        if (!/[^a-zA-Z0-9]/.test(newPassword)) {
            missingRequirements.push("Add a special character (!@#$)");
        }

        if (missingRequirements.length > 0) {
            setError(`Password must meet these requirements:\n${missingRequirements.join("\n")}`);
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

    // Password strength indicator
    const getStrengthConditions = () => {
        const conditions: Record<string, boolean> = {
            minLength: newPassword.length >= 8,
            hasUppercase: /[A-Z]/.test(newPassword),
            hasLowercase: /[a-z]/.test(newPassword),  
            hasNumber: /[\d]/.test(newPassword),
            hasSpecial: /[^a-zA-Z0-9]/.test(newPassword),
        };
        return conditions;
    };

    const conditions = getStrengthConditions();
    const totalActiveBars = Object.values(conditions).filter(Boolean).length as number;
    const missingRequirements = [
        !conditions.hasLowercase && "Add a lowercase letter",
        !conditions.hasUppercase && "Add an uppercase letter",
        !conditions.hasNumber && "Add a number",
        !conditions.hasSpecial && "Add a special character (!@#$)",
    ].filter((requirement): requirement is string => Boolean(requirement));

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

                                {/* Password Strength */}
                                <div className="password-strength-container">
                                    <label>Password strength:</label>
                                    <div className="password-strength-meter" data-level={totalActiveBars}>
                                        <div 
                                            className="password-strength-bar"
                                            style={{
                                                width: `${(totalActiveBars / 5) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Strength Recommendations */}
                                {!success && error && missingRequirements.length > 0 ? (
                                    <ul className="strength-hints">
                                        {missingRequirements.map((req, index) => (
                                            <li key={index} style={{ color: '#ef4444' }}>{req}</li>
                                        ))}
                                    </ul>
                                ) : null}

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
