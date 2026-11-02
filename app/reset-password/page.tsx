import "../../public/css/login.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import Link from "next/link";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

export default function ResetPasswordPage() {
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
                        <form className="login-form">
                            <div className="login-form-group">
                                <label htmlFor="new-password">New password</label>
                                <input type="password" id="new-password" name="newPassword" autoComplete="new-password" required placeholder="Choose a new password" />
                            </div>
                            <div className="login-form-group">
                                <label htmlFor="confirm-password">Confirm new password</label>
                                <input type="password" id="confirm-password" name="confirmPassword" autoComplete="new-password" required placeholder="Enter your new password again" />
                            </div>
                            <button type="submit" className="link-button-primary">
                                Reset password
                            </button>
                        </form>
                        <Link href="/login">Back to login</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
