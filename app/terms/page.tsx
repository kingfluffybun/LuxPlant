import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import "../../public/css/policy.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function TermsPage() {
    return (
        <div className="policy-page-layout">
            <Navigation />
            <main className="policy-page-main">
                <article className="policy-document">
                    <header className="policy-header">
                        <h1>Terms and Conditions</h1>
                        <p className="policy-dates">
                            Effective date: November 4, 2026 · Last updated: November 4, 2026
                        </p>
                        <p>
                            These Terms and Conditions (“Terms”) govern your use of the LuxPlant website
                            and your purchase of our products. By using the website, creating an account,
                            or placing an order, you agree to these Terms. If you do not agree, please do
                            not use the website or place an order.
                        </p>
                    </header>

                    <section>
                        <h2>1. About us</h2>
                        <p>LuxPlant is an independent business based in the Philippines.</p>
                        <ul>
                            <li><strong>Business name:</strong> LuxPlant</li>
                            <li><strong>Address:</strong> 25C Dandan St., Tondo, Manila, Philippines</li>
                            <li><strong>Contact email:</strong> luxplant3d@gmail.com</li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. Eligibility</h2>
                        <p>You must be at least 18 years old to create an account or place an order.</p>
                    </section>

                    <section>
                        <h2>3. Your account</h2>
                        <p>
                            You can create an account with your email and password or sign in with Google.
                            An account is not required to place an order; guest checkout is available.
                            Account holders can view and track their orders in their profile.
                        </p>
                        <p>You agree to provide accurate and current information, keep your login details confidential, and tell us promptly if you believe your account has been used without permission. You are responsible for activity under your account.</p>
                    </section>

                    <section>
                        <h2>4. Products</h2>
                        <p>
                            We currently sell the LuxPlant Mini, a built, ready-to-use 3D-printed LED
                            plant. Product photos, colors, and descriptions are illustrative; minor
                            differences may occur, including differences in how colors appear on screens.
                        </p>
                        <p>
                            The LuxPlant Standard is in development and is not available for purchase.
                            Showing it on the website is not an offer to sell, and we make no commitment
                            about its final features, price, or release date.
                        </p>
                    </section>

                    <section>
                        <h2>5. Prices</h2>
                        <ul>
                            <li>Prices are in Philippine pesos (₱). No additional taxes are added at checkout.</li>
                            <li>The LuxPlant Mini costs ₱3,500 per plant.</li>
                            <li>A ₱100 delivery fee applies to an order of one plant.</li>
                            <li>Orders of two or more plants receive 10% off and free shipping.</li>
                            <li>Each order is limited to 1–10 plants.</li>
                        </ul>
                        <p>
                            We may change prices and offers at any time. The price shown when you place
                            your order applies to that order. If we find a pricing error, we may cancel
                            the order and refund any payment you have made.
                        </p>
                    </section>

                    <section>
                        <h2>6. Placing an order and payment</h2>
                        <h3>How an order works</h3>
                        <ol>
                            <li>Choose your quantity, enter your contact and delivery details, select a payment method, and place your order.</li>
                            <li>For MariBank, GCash, or PayPal, we provide a QR code. Scan it and pay the exact order total using the app you selected.</li>
                            <li>Submit a photo or screenshot of your payment as proof.</li>
                            <li>We check your proof against our records. Your order is confirmed once we verify that payment was received.</li>
                            <li>You can follow your order status in your account profile.</li>
                        </ol>
                        <p>
                            For cash on delivery, no advance payment is required. Pay the delivery rider
                            the order total when your item arrives.
                        </p>
                        <p>
                            Placing an order is an offer to buy. We accept it when we confirm your
                            payment or, for cash on delivery, when we confirm the order with you. We may
                            decline or cancel an order, for example because of a stock problem, pricing
                            error, or suspected fraud.
                        </p>

                        <h3>Payment rules</h3>
                        <ul>
                            <li>Pay the exact total shown. If you pay a different amount, we may delay your order or ask you to settle the difference.</li>
                            <li>Pay within 24 hours of placing your order. Orders not paid in time may be cancelled.</li>
                            <li>If proof is missing, unclear, or does not match our records, we may contact you, ask for new proof, or cancel the order.</li>
                            <li>Submit genuine proof of your own payment. We may cancel an order, suspend an account, or report suspected fraud involving altered, fake, or reused proof.</li>
                            <li>Fees charged by your bank or payment app are your responsibility.</li>
                            <li>MariBank, GCash, and PayPal are independent services; their own terms apply, and we are not responsible for their services.</li>
                        </ul>

                        <h3>Cash on delivery</h3>
                        <p>
                            You must be available to receive and pay for the order. If you refuse delivery
                            or cannot be reached after reasonable attempts, we may cancel the order. We
                            may require advance payment for future orders from you.
                        </p>
                    </section>

                    <section>
                        <h2>7. Delivery</h2>
                        <ul>
                            <li>We deliver within the Philippines only.</li>
                            <li>We usually process orders in about 2–3 days after confirming payment before handing them to our delivery partner.</li>
                            <li>Delivery is arranged through a third-party delivery service. Delivery times are estimates, not guarantees, and delays may occur because of weather, courier issues, or other events outside our control.</li>
                            <li>Provide a complete and correct delivery address. We are not responsible for failed or delayed deliveries caused by incorrect or incomplete details you provided.</li>
                            <li>If a delivery attempt fails, we will contact you to arrange another attempt or cancel the order.</li>
                            <li>Check your order when it arrives. If it is damaged or incomplete, contact us within 7 days of delivery and include clear photos.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. Cancellations, returns, and refunds</h2>
                        <ul>
                            <li>You may ask to cancel an order before it ships by emailing luxplant3d@gmail.com. If you have already paid, we will refund your payment.</li>
                            <li>We refund payments for orders cancelled by us or that we are unable to deliver, using the same payment method where possible.</li>
                            <li>We do not accept returns for change of mind. Product issues that qualify for repair or replacement are handled under the warranty below and applicable consumer protection laws.</li>
                        </ul>
                        <p>Nothing in these Terms limits any rights you have under Philippine consumer protection laws.</p>
                    </section>

                    <section>
                        <h2>9. Warranty</h2>
                        <p>
                            The built LuxPlant Mini comes with an 18-month warranty starting from the
                            date of delivery.
                        </p>
                        <ul>
                            <li>If the product breaks during the warranty period, we will replace it, no questions asked.</li>
                            <li>After the warranty period ends, we repair the product free of charge.</li>
                            <li>Damage caused by misuse, unauthorized modification, or use with an unsuitable power source is not covered.</li>
                            <li>To make a claim, email luxplant3d@gmail.com with your order number and a description or photos of the problem.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>10. Safe use</h2>
                        <p>
                            The LuxPlant Mini is an electrical product. Use it as intended, follow the
                            setup and safety instructions provided with it, and do not modify its
                            electronics. We are not responsible for damage or injury caused by misuse,
                            modification, or use with unsuitable power sources, except where applicable
                            law does not allow us to limit responsibility.
                        </p>
                    </section>

                    <section>
                        <h2>11. Acceptable use of the website</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Use the website for unlawful or fraudulent purposes.</li>
                            <li>Submit false, altered, or stolen payment proof or personal details.</li>
                            <li>Try to gain unauthorized access to the website, other accounts, or our systems.</li>
                            <li>Disrupt the website or copy or scrape it with automated tools.</li>
                        </ul>
                        <p>We may suspend or close accounts that violate these rules.</p>
                    </section>

                    <section>
                        <h2>12. Intellectual property</h2>
                        <p>
                            Website content, text, photos, logos, and product designs belong to LuxPlant
                            or are used with permission. You may not copy, reproduce, distribute, or sell
                            them without written permission. Buying a physical product gives you ownership
                            of that physical item only.
                        </p>
                    </section>

                    <section>
                        <h2>13. Disclaimers and limits on liability</h2>
                        <p>
                            The website is provided “as is,” and we do not promise it will always be
                            available or error-free. To the fullest extent allowed by law, we are not
                            liable for indirect or consequential losses, and our total liability for a
                            claim relating to an order is limited to the amount paid for that order.
                            These limits do not apply where the law does not allow them and do not affect
                            your warranty or Philippine consumer protection rights.
                        </p>
                    </section>

                    <section>
                        <h2>14. Privacy</h2>
                        <p>
                            Our <a href="/privacy">Privacy Policy</a> explains how we collect and use
                            personal information, including order details and payment proof.
                        </p>
                    </section>

                    <section>
                        <h2>15. Changes to these Terms</h2>
                        <p>
                            We may update these Terms from time to time. The version on the website when
                            you place an order applies to that order. Continued use of the website after
                            a change means you accept the updated Terms.
                        </p>
                    </section>

                    <section>
                        <h2>16. Governing law</h2>
                        <p>
                            These Terms are governed by the laws of the Republic of the Philippines. Any
                            dispute will be handled by the proper courts of Manila, Philippines, unless
                            the law gives you the right to bring a claim elsewhere.
                        </p>
                    </section>

                    <section>
                        <h2>17. Contact us</h2>
                        <p>
                            For questions about these Terms or your order, email{" "}
                            <a href="mailto:luxplant3d@gmail.com">luxplant3d@gmail.com</a>.
                        </p>
                    </section>
                </article>
            </main>
            <Footer />
        </div>
    );
}
