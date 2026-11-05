import Link from "next/link";
import { Check } from "lucide-react";
import "../../../public/css/navigation.css";
import "../../../public/css/footer.css";
import "../../../public/css/payment.css";
import Footer from "../../components/Footer";
import Navigation from "../../components/Navigation";

export default function PaymentCompletePage() {
    return (
        <div className="payment-page-layout">
            <Navigation />
            <main className="payment-complete-main">
                <section className="payment-complete-content" aria-labelledby="payment-complete-title">
                    <div className="payment-complete-icon" aria-hidden="true">
                        <Check size={56} strokeWidth={3} />
                    </div>
                    <span className="payment-status-badge">Awaiting verification</span>
                    <h1 id="payment-complete-title">Payment proof submitted</h1>
                    <p className="payment-complete-message">
                        We received your payment proof. We’ll review it and update your order once the payment
                        is verified.
                    </p>

                    <section className="payment-complete-summary" aria-labelledby="payment-complete-summary-title">
                        <h2 id="payment-complete-summary-title">Order summary</h2>
                        <div className="payment-complete-product">
                            <span>LuxPlant Mini</span>
                            <span>×1</span>
                        </div>
                        <dl className="payment-complete-details">
                            <div>
                                <dt>Order number</dt>
                                <dd>LP-000123</dd>
                            </div>
                            <div>
                                <dt>Payment reference</dt>
                                <dd>Awaiting verification</dd>
                            </div>
                            <div>
                                <dt>Total amount</dt>
                                <dd>₱3,600</dd>
                            </div>
                            <div>
                                <dt>Payment method</dt>
                                <dd>Bank Transfer (MariBank)</dd>
                            </div>
                        </dl>
                    </section>

                    <Link href="/" className="link-button-primary payment-complete-home">
                        Back to Home
                    </Link>
                </section>
            </main>
            <Footer />
        </div>
    );
}
