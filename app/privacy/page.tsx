import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import "../../public/css/policy.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function PrivacyPolicyPage() {
    return (
        <div className="policy-page-layout">
            <Navigation />
            <main className="policy-page-main">
                <article className="policy-document">
                    <header className="policy-header">
                        <h1>Privacy Policy</h1>
                        <p className="policy-dates">
                            Effective date: November 4, 2026 · Last updated: November 4, 2026
                        </p>
                        <p>
                            This Privacy Policy explains how LuxPlant (“we,” “us,” or “our”) collects,
                            uses, shares, and protects personal information when you visit our website,
                            create an account, or place an order. We handle personal information in
                            accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) and
                            its implementing rules.
                        </p>
                    </header>

                    <section>
                        <h2>1. Who we are</h2>
                        <p>
                            LuxPlant is an independent business based in the Philippines. We are the
                            personal information controller for the information described in this policy.
                        </p>
                        <ul>
                            <li><strong>Business name:</strong> LuxPlant</li>
                            <li><strong>Address:</strong> 25C Dandan St., Tondo, Manila, Philippines</li>
                            <li><strong>Contact email:</strong> luxplant3d@gmail.com</li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. Information we collect</h2>
                        <h3>Account information</h3>
                        <p>
                            When you create an account, we collect your first name, last name, email
                            address, and password. If you choose Google sign-in, we receive basic profile
                            details made available by Google, such as your name, email address, and profile
                            picture. Supabase handles authentication and passwords; we do not see or store
                            your password in readable form.
                        </p>

                        <h3>Order and delivery information</h3>
                        <p>
                            When you place an order, including as a guest, we collect your email address,
                            first and last name, delivery address (including street address, optional
                            apartment or unit, barangay, city, postal code, and region or province), and
                            order details such as the product, quantity, payment method, and order total,
                            including any discount and delivery fee.
                        </p>

                        <h3>Proof of payment</h3>
                        <p>
                            If you pay through MariBank, GCash, or PayPal, we ask you to submit a photo
                            or screenshot as proof of payment. This image may show information such as
                            your account name, a partial account or mobile number, a reference number,
                            amount, and date and time. Please crop or cover information that is unrelated
                            to verifying the payment before submitting it.
                        </p>

                        <h3>Order status information</h3>
                        <p>
                            We record order status and delivery progress, such as awaiting payment,
                            payment submitted, processing, shipped, or delivered. Customers with an
                            account can view and track their orders in their profile.
                        </p>

                        <h3>Information collected automatically</h3>
                        <p>
                            We use cookies and similar storage that are necessary to keep you signed in
                            and make the website work. We do not currently use analytics, advertising, or
                            tracking cookies.
                        </p>
                        <p>
                            When you load checkout, your browser requests a list of Philippine provinces
                            from the public PSGC Cloud service. We do not send your personal details to
                            that service, but your device’s IP address is visible to it as part of the web
                            request.
                        </p>
                    </section>

                    <section>
                        <h2>3. How we use your information</h2>
                        <p>We use your information to:</p>
                        <ul>
                            <li>Create and manage your account and keep it secure.</li>
                            <li>Process orders, verify payments, and prepare items.</li>
                            <li>Arrange delivery and show order status in your profile.</li>
                            <li>Send account and order-related messages, including password resets and order updates.</li>
                            <li>Provide customer support and handle warranty claims.</li>
                            <li>Prevent fraud and protect our website and business.</li>
                            <li>Comply with legal, tax, and accounting obligations.</li>
                        </ul>
                        <p>
                            We do not send marketing messages unless you have agreed to receive them.
                            Our current communications are limited to account and order-related messages.
                        </p>
                    </section>

                    <section>
                        <h2>4. Our basis for using your information</h2>
                        <p>
                            We process information when necessary to provide your account or carry out
                            your order, when you have given consent, for our legitimate interests in
                            operating and securing our business, or when the law requires us to do so.
                        </p>
                    </section>

                    <section>
                        <h2>5. Who we share your information with</h2>
                        <p>We do not sell your personal information. We share it as needed to operate:</p>
                        <ul>
                            <li>
                                <strong>Supabase:</strong> We use Supabase for authentication, database
                                services, and file storage, including order information and payment-proof
                                images.
                            </li>
                            <li>
                                <strong>Google:</strong> If you choose Google sign-in, Google provides
                                the profile details described above under its own privacy policy.
                            </li>
                            <li>
                                <strong>Delivery service:</strong> We share the details needed to deliver
                                your order, such as your name and delivery address, with our third-party
                                delivery provider.
                            </li>
                            <li>
                                <strong>Payment services:</strong> Payments are made using the selected
                                payment service and its terms and privacy policy apply. We do not receive
                                your payment-app login details or card information; we receive the proof of
                                payment you submit.
                            </li>
                            <li>
                                <strong>Administrators:</strong> Authorized LuxPlant administrators can
                                access order information and submitted payment proof to verify payment and
                                fulfil orders.
                            </li>
                            <li>
                                <strong>Authorities and professional advisers:</strong> We may disclose
                                information when required by law, in response to a lawful request, to
                                protect our rights, or to professional advisers such as accountants or
                                lawyers who are subject to confidentiality obligations.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Where your information is stored</h2>
                        <p>
                            We use Supabase services to process and store account, order, and payment-proof
                            information. The specific hosting region for our Supabase database and file
                            storage has not been confirmed in this policy. Information may be processed
                            outside the Philippines depending on the service configuration. Please also
                            review Supabase’s current privacy and service information.
                        </p>
                    </section>

                    <section>
                        <h2>7. How long we keep your information</h2>
                        <p>
                            We generally retain account information, order and delivery records, and
                            payment-proof images for up to one year after account closure or completion of
                            the relevant order. We may retain information for longer where necessary to
                            comply with legal, tax, or accounting obligations, resolve disputes, or
                            establish or defend legal claims. When information is no longer needed, we
                            delete or anonymize it.
                        </p>
                    </section>

                    <section>
                        <h2>8. How we protect your information</h2>
                        <p>
                            We use reasonable organizational and technical measures to protect your
                            information, including limiting access to authorized administrators and using
                            an authentication provider. No method of storage or transmission is completely
                            secure, so we cannot guarantee absolute security. Use a strong, unique
                            password and keep it private.
                        </p>
                    </section>

                    <section>
                        <h2>9. Your rights</h2>
                        <p>Subject to applicable law, you may have the right to:</p>
                        <ul>
                            <li>Be informed about how your personal data is processed.</li>
                            <li>Access your personal data and correct inaccurate or outdated information.</li>
                            <li>Object to certain processing or withdraw consent.</li>
                            <li>Request that processing be suspended or that data be removed or deleted in certain cases.</li>
                            <li>Request a copy of your data in a commonly used format.</li>
                            <li>Seek indemnification for damages caused by inaccurate, incomplete, or unlawfully obtained data.</li>
                            <li>File a complaint with the National Privacy Commission at <a href="https://privacy.gov.ph/">privacy.gov.ph</a>.</li>
                        </ul>
                        <p>
                            To exercise these rights, email luxplant3d@gmail.com. We may need to verify
                            your identity first. Some information may need to be retained for legal or
                            accounting reasons even after a deletion request.
                        </p>
                    </section>

                    <section>
                        <h2>10. Children</h2>
                        <p>
                            Our website and products are intended for people aged 18 and above. We do not
                            knowingly collect personal information from children. If you believe a child
                            has provided us with personal information, contact us so we can review and
                            delete it where appropriate.
                        </p>
                    </section>

                    <section>
                        <h2>11. Changes to this policy</h2>
                        <p>
                            We may update this policy from time to time. We will update the “Last
                            updated” date above, and for significant changes we will notify you on the
                            website or by email.
                        </p>
                    </section>

                    <section>
                        <h2>12. Contact us</h2>
                        <p>
                            If you have questions about this policy or how we handle your information,
                            email <a href="mailto:luxplant3d@gmail.com">luxplant3d@gmail.com</a>.
                        </p>
                    </section>
                </article>
            </main>
            <Footer />
        </div>
    );
}
