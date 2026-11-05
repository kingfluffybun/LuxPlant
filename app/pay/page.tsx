import Image from "next/image";
import Link from "next/link";
import { Clipboard, Download, Phone, Upload } from "lucide-react";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import "../../public/css/payment.css";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

export const instant = false;

type PaymentPageProps = {
    searchParams: Promise<{ method?: string }>;
};

const paymentMethods = {
    "cash-on-delivery": {
        name: "Cash on delivery",
        accountName: "",
        accountDetails: "",
        qr: null,
    },
    "bank-transfer": {
        name: "Bank Transfer",
        accountName: "Mark Jerson Luna",
        accountDetails: <>MariBank account number: **** 9079<br />Transfer from Philippine banks via InstaPay.</>,
        qr: "/assets/QR/MariBankQR.jpg",
    },
    paypal: {
        name: "PayPal",
        accountName: "Mark Jerson Luna",
        accountDetails: "Scan the QR code to pay via PayPal.",
        qr: "/assets/QR/PayPalQR.jpg",
    },
    gcash: {
        name: "GCash",
        accountName: "Mark Jerson Luna",
        accountDetails: <>GCash number: 0976 051 ****<br />User ID: **********7T8TT4</>,
        qr: "/assets/QR/GCashQR.jpg",
    },
} as const;

function CopyButton() {
    return (
        <button type="button" className="payment-copy-button">
            <Clipboard size={16} aria-hidden="true" />
            Copy
        </button>
    );
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
    const query = await searchParams;
    const orderNumber = "LP-000123";
    const methodKey = query.method === "cash-on-delivery"
        ? "cash-on-delivery"
        : query.method === "bank-transfer" || query.method === "maribank"
            ? "bank-transfer"
            : query.method === "paypal"
                ? "paypal"
                : "gcash";
    const method = paymentMethods[methodKey];
    const methodLogo = methodKey === "gcash"
        ? "/assets/GCash.svg"
        : methodKey === "bank-transfer"
            ? "/assets/MariBank.svg"
            : methodKey === "paypal"
                ? "/assets/PayPal.svg"
                : null;

    return (
        <div className="payment-page-layout">
            <Navigation />
            <main className="payment-page-main">
                <header className="payment-page-header">
                    <div className="payment-order-meta">
                        <span className="payment-status-badge">{methodKey === "cash-on-delivery" ? "Phone verification" : "Awaiting payment"}</span>
                        <span>Order {orderNumber}</span>
                    </div>
                    <h1>{methodKey === "cash-on-delivery" ? "Confirm your delivery phone" : "Complete your payment"}</h1>
                    <p>
                        {methodKey === "cash-on-delivery"
                            ? "Enter your phone number and the one-time code to confirm your cash-on-delivery order."
                            : "Pay the exact amount, then upload a screenshot of your payment. We confirm your order once the payment is verified."}
                    </p>
                    {methodKey !== "cash-on-delivery" && <p className="payment-deadline">
                        Please pay within 24 hours, or this order is cancelled automatically.
                        {" "}Time left: <span className="payment-countdown">23:58:41</span>
                    </p>}
                </header>

                <div className="payment-columns">
                    <div className="payment-left-column">
                        {methodKey === "cash-on-delivery" ? (
                            <section className="payment-card payment-cod-card">
                                <div className="payment-card-heading">
                                    <div>
                                        <h2>Verify your phone number</h2>
                                    </div>
                                    <Phone size={32} aria-hidden="true" />
                                </div>
                                <div className="payment-cod-form">
                                    <div className="payment-reference-field">
                                        <label htmlFor="cod-phone">Mobile phone number</label>
                                        <input
                                            id="cod-phone"
                                            name="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            placeholder="+63 9XX XXX XXXX"
                                            required
                                        />
                                    </div>
                                    <button type="button" className="payment-secondary-button">
                                        Send OTP
                                    </button>
                                    <div className="payment-reference-field">
                                        <label htmlFor="cod-otp">One-time password</label>
                                        <input
                                            id="cod-otp"
                                            name="otp"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            placeholder="Enter the 6-digit code"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <button type="button" className="link-button-primary payment-submit-button">
                                        Verify and confirm order
                                    </button>
                                </div>
                            </section>
                        ) : (
                            <>
                        <section className="payment-card payment-method-card">
                            <div className="payment-card-heading">
                                <div>
                                    <h2>Pay with {method.name}</h2>
                                </div>
                                {methodLogo && <Image src={methodLogo} alt={method.name} width={40} height={40} className="payment-method-logo" />}
                            </div>
                            <div className={`payment-method-body${method.qr ? "" : " is-paypal"}`}>
                                {method.qr && (
                                    <div className="payment-qr-column">
                                        <div className="payment-qr-frame">
                                            <Image src={method.qr} alt={`${method.name} payment QR code`} width={240} height={240} />
                                        </div>
                                        <a className="payment-secondary-button" href={method.qr} download>
                                            <Download size={16} aria-hidden="true" /> Download QR
                                        </a>
                                    </div>
                                )}
                                <div className="payment-detail-list">
                                    <div className="payment-detail-block">
                                        <div className="payment-detail-label">Amount to pay</div>
                                        <div className="payment-copy-row">
                                            <span className="payment-amount">₱3,600</span>
                                            <CopyButton />
                                        </div>
                                        <p className="payment-helper">Pay this exact amount, no more and no less.</p>
                                    </div>
                                    <div className="payment-detail-block">
                                        <div className="payment-detail-label">
                                            {methodKey === "paypal" ? "PayPal payment" : `${method.name} account`}
                                        </div>
                                        <div className="payment-copy-row">
                                            <div className="payment-account-values">
                                                <span className="payment-account-name">{method.accountName}</span>
                                                <span>{method.accountDetails}</span>
                                            </div>
                                            <CopyButton />
                                        </div>
                                    </div>
                                    <div className="payment-detail-block">
                                        <div className="payment-detail-label">Order number</div>
                                        <div className="payment-copy-row">
                                            <span className="payment-copy-value">{orderNumber}</span>
                                            <CopyButton />
                                        </div>
                                        <p className="payment-helper">Add this to the payment notes so we can match your order.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="payment-card payment-upload-card">
                            <div className="payment-card-heading">
                                <div>
                                    <h2>Upload proof of payment</h2>
                                </div>
                            </div>
                            <p className="payment-upload-description">Attach a screenshot or photo that shows the amount, date, and reference number. Crop out anything unrelated to the payment.</p>
                            <label className="payment-dropzone" htmlFor="payment-proof-file" tabIndex={0}>
                                <Upload size={28} aria-hidden="true" />
                                <span>Drag your screenshot here, or <u>choose a file</u></span>
                                <small>PNG or JPG</small>
                            </label>
                            <input id="payment-proof-file" className="payment-file-input" type="file" accept="image/png,image/jpeg" />
                            <div className="payment-reference-field">
                                <label htmlFor="payment-reference">Reference number (optional)</label>
                                <input id="payment-reference" type="text" placeholder="From your payment confirmation" />
                            </div>
                            <button type="button" className="link-button-primary payment-submit-button" disabled>
                                Submit proof of payment
                            </button>
                            <p className="payment-submit-hint">Attach a screenshot to continue.</p>
                        </section>

                        <section className="payment-steps" aria-label="Payment steps">
                            <div className="payment-step-card">
                                <span className="payment-step-number">1</span>
                                <h3>Pay the exact amount</h3>
                                <p>
                                    {methodKey === "bank-transfer"
                                        ? "Transfer to this MariBank account from your bank using the QR code or account details."
                                        : "Scan the QR code or send payment to the account details shown."}
                                </p>
                            </div>
                            <div className="payment-step-card">
                                <span className="payment-step-number">2</span>
                                <h3>Add your order number</h3>
                                <p>Put {orderNumber} in the payment notes.</p>
                            </div>
                            <div className="payment-step-card">
                                <span className="payment-step-number">3</span>
                                <h3>Upload your screenshot</h3>
                                <p>Attach it above and submit.</p>
                            </div>
                        </section>
                            </>
                        )}
                    </div>

                    <aside className="payment-right-column">
                        <section className="payment-card payment-order-summary">
                            <h2>Order summary</h2>
                            <div className="payment-summary-row">
                                <span>LuxPlant Mini, quantity 1</span>
                                <span>₱3,500</span>
                            </div>
                            <div className="payment-summary-row">
                                <span>Delivery fee</span>
                                <span>₱100</span>
                            </div>
                            <div className="payment-summary-total">
                                <span>Total</span>
                                <span className="payment-summary-total-value">₱3,600</span>
                            </div>
                            <div className="payment-summary-detail">
                                <span className="payment-summary-label">Payment method</span>
                                <span className="payment-summary-value">{method.name}</span>
                            </div>
                            <div className="payment-summary-detail">
                                <span className="payment-summary-label">Deliver to</span>
                                <span className="payment-summary-value">Recipient name to be confirmed</span>
                                <p>Delivery address to be confirmed</p>
                            </div>
                        </section>

                        <section className="payment-card payment-after-submit">
                            <h2>{methodKey === "cash-on-delivery" ? "After phone verification" : "After you submit"}</h2>
                            <p>
                                {methodKey === "cash-on-delivery"
                                    ? "Your confirmed order will be prepared for delivery. Pay the courier when your LuxPlant arrives."
                                    : "We check your proof against our records. Your order moves to Processing once the payment is verified. You can follow every update in your profile."}
                            </p>
                            <Link href="/account" className="payment-text-link">View order status</Link>
                        </section>

                        <p className="payment-help">Having trouble paying? Email <a href="mailto:luxplant3d@gmail.com">luxplant3d@gmail.com</a> with your order number.</p>
                    </aside>
                </div>

            </main>
            <Footer />
        </div>
    );
}
