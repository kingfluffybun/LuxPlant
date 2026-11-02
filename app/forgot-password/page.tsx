import "../../public/css/login.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import Link from "next/link";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

export default function ForgotPasswordPage() {
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
                        <form className="login-form">
                            <div className="login-form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" autoComplete="email" required placeholder="alex@example.com" />
                            </div>
                            <button type="submit" className="link-button-primary">
                                Send reset link
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
