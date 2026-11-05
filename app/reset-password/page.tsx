"use client";

import "../../public/css/login.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";
import { createClient } from "@/lib/supabase/client";
import { TriangleAlert } from "lucide-react";
import { useState, useEffect } from "react";

type ResetPasswordField = "newPassword" | "confirmPassword";
type ResetPasswordFieldErrors = Partial<Record<ResetPasswordField, string>>;

export default function ResetPasswordPage() {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<ResetPasswordFieldErrors>({});
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
        setFieldErrors({});
        setSuccess("");

        if (!newPassword) {
            setFieldErrors({ newPassword: "Enter a new password." });
            return;
        }

        if (!confirmPassword) {
            setFieldErrors({ confirmPassword: "Confirm your new password." });
            return;
        }

        if (newPassword.length < 8) {
            setFieldErrors({ newPassword: "Password must be at least 8 characters long." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setFieldErrors({ confirmPassword: "Passwords do not match." });
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
            setFieldErrors({
                newPassword: `Password must meet these requirements: ${missingRequirements.join(", ")}.`,
            });
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
                                {error && (
                                    <p className="login-error" role="alert">
                                        <TriangleAlert size={16} aria-hidden="true" />
                                        <span>{error}</span>
                                    </p>
                                )}
                                <div className="login-form-group">
                                    <label htmlFor="new-password">New password</label>
                                    <input
                                        type="password"
                                        id="new-password"
                                        name="newPassword"
                                        autoComplete="new-password"
                                        required
                                        aria-invalid={Boolean(fieldErrors.newPassword)}
                                        aria-describedby={fieldErrors.newPassword ? "reset-new-password-error" : undefined}
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (error) setError("");
                                            setFieldErrors((current) => ({ ...current, newPassword: undefined }));
                                        }}
                                        placeholder="New password"
                                    />
                                    {fieldErrors.newPassword && (
                                        <p className="login-field-error" id="reset-new-password-error" role="alert">
                                            <TriangleAlert size={16} aria-hidden="true" />
                                            <span>{fieldErrors.newPassword}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="login-form-group">
                                    <label htmlFor="confirm-password">Confirm new password</label>
                                    <input
                                        type="password"
                                        id="confirm-password"
                                        name="confirmPassword"
                                        autoComplete="new-password"
                                        required
                                        aria-invalid={Boolean(fieldErrors.confirmPassword)}
                                        aria-describedby={fieldErrors.confirmPassword ? "reset-confirm-password-error" : undefined}
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            if (error) setError("");
                                            setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
                                        }}
                                        placeholder="Confirm new password"
                                    />
                                    {fieldErrors.confirmPassword && (
                                        <p className="login-field-error" id="reset-confirm-password-error" role="alert">
                                            <TriangleAlert size={16} aria-hidden="true" />
                                            <span>{fieldErrors.confirmPassword}</span>
                                        </p>
                                    )}
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

                                {!success && fieldErrors.newPassword && missingRequirements.length > 0 ? (
                                    <ul className="strength-hints">
                                        {missingRequirements.map((requirement) => (
                                            <li key={requirement}>{requirement}</li>
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
