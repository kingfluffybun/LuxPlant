import "../../public/css/login.css";
import "../../app/globals.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

export default function LoginPage() {
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
                        <form className="login-form">
                            <button className="login-social-button">
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
                                <input type="email" id="email" name="email" autoComplete="email" required placeholder="alex@example.com"/>
                            </div>
                            <div className="login-form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" autoComplete="current-password" required placeholder="Your password" />
                            </div>
                            <div className="login-remember-forgot">
                                <div className="login-remember-me">
                                    <input type="checkbox" id="remember-me" name="remember-me" />
                                    <label htmlFor="remember-me">Remember me</label>
                                </div>
                                <Link href="/forgot-password" className="forgot-password-link">Forgot password?</Link>
                            </div>
                            <button type="submit" className="link-button-primary">Login</button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
