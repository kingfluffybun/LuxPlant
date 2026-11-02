import "../../public/css/login.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

export default function SignupPage() {
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
                        <form className="login-form">
                            <button type="button" className="login-social-button">
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
                                    <input type="text" id="first-name" name="firstName" autoComplete="given-name" required placeholder="e.g. Alex" />
                                </div>
                                <div className="login-form-group">
                                    <label htmlFor="last-name">Last name</label>
                                    <input type="text" id="last-name" name="lastName" autoComplete="family-name" required placeholder="e.g. Morgan" />
                                </div>
                            </div>
                            <div className="login-form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" autoComplete="email" required placeholder="alex@example.com" />
                            </div>
                            <div className="login-form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" id="password" name="password" autoComplete="new-password" required placeholder="Choose a password" />
                            </div>
                            <button type="submit" className="link-button-primary">
                                Create account
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
