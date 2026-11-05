# LuxPlant System Context for Privacy Policy and Terms Drafting

This document is a factual brief for preparing LuxPlant's Privacy Policy and Terms and Conditions. It is not itself a legal policy. Distinguish the verified website behavior from the operational details supplied by the owner, and do not claim that a feature is implemented when it is only planned or handled manually.

## 1. Website and business

- LuxPlant is an independent creator's business based in the Philippines.
- The website presents LuxPlant products, product information, a gallery, FAQs, and account and checkout interfaces.
- The physical product currently offered is LuxPlant Mini. The LuxPlant Standard is in development and is described as coming soon.
- The website is built with Next.js and uses Supabase Auth for account authentication.

## 2. What the website currently does

### Public pages

Visitors can view public product information, the gallery, FAQs, and information about LuxPlant. The website has links labeled Privacy Policy and Terms of Service in its footer, but those links currently point to the home page rather than policy documents.

### Accounts and authentication

The site provides account creation and sign-in using email and password, and offers Google OAuth. Account creation asks for first name, last name, email, and password. Supabase Auth handles authentication. The site also provides password-reset email and password-update flows.

The site stores first name, last name, and a member role in Supabase Auth user metadata during email signup. A server-side profile helper can upsert a user ID, first name, last name, and role into a Supabase `users` table. Navigation reads the signed-in user's email and user metadata (first name, last name, and avatar URL) to display account information.

There is an account link in the navigation, but no account/profile page is present in the current application source.

### Checkout interface

The checkout page currently displays a form that asks for:

- Contact email
- First and last name
- Delivery address
- Apartment, suite, or unit (optional)
- Barangay
- Postal code
- City
- Region/province

The region list is fetched from the public `psgc.cloud` provinces API. Metro Manila is included as a region option.

The checkout interface presents the following payment choices:

- Bank transfer via MariBank
- Cash on delivery
- PayPal
- GCash

The page displays an order summary for LuxPlant Mini. The current displayed price is ₱3,500 per plant, delivery is shown as ₱100 for one plant, and orders of two or more plants receive 10% off and free shipping. Quantity is limited in the interface to 1–10 plants.

**Implementation limitation:** In the current application source, the checkout form does not submit an order or persist its entered contact, delivery, or payment information. There is no order database integration, payment processing integration, QR generation, proof-upload implementation, or order-status/profile tracking page in the current source.

## 3. Owner-provided order and payment process

The owner describes the intended/current operational flow as follows. These details were provided by the owner but are not implemented in the current website source:

1. A customer places an order and selects a payment option.
2. For payment through MariBank, PayPal, or GCash, the customer is given a QR code to scan and pay using the selected app.
3. The customer sends/uploads a photo or screenshot as proof of payment.
4. An administrator can access the payment proof and the information the customer supplied.
5. The administrator uses the delivery details to arrange delivery through a third-party delivery service. Do not name a specific service unless the owner confirms it.
6. The customer can view and track order status in their profile.

The owner also says cash on delivery is available. The exact handling of cash-on-delivery orders, and whether a payment proof is required for any other method, should not be inferred beyond the details above.

## 4. Information involved in the described workflow

The following categories are requested by the current account/checkout interfaces or are part of the owner-described order process:

- Account identifiers and credentials: email address and password, handled through Supabase Auth.
- Account profile details: first name, last name, and potentially an avatar URL from user metadata.
- Contact and recipient details: email, first name, last name, and delivery address fields listed above.
- Order details: product, quantity, selected payment method, displayed subtotal, discount, shipping fee, and total.
- Payment evidence: customer-submitted photo or screenshot showing proof of payment, according to the owner-described process.
- Fulfilment information: order status and delivery progress, according to the owner-described profile tracking process.

The current checkout page's fields are not connected to an order-submission backend in the source. Do not state that checkout data, payment evidence, or tracking information is currently stored by the website unless the owner confirms a deployed implementation outside this codebase.

## 5. Third-party services and access described or visible

- **Supabase:** Used in the code for authentication and a server-side user-profile upsert helper. The actual configured data location, retention settings, and production database schema are not established by this brief.
- **Google:** Offered as an OAuth sign-in/sign-up provider.
- **PSGC Cloud:** The checkout interface fetches province names and codes from `https://psgc.cloud/api/provinces`.
- **Payment apps/services:** MariBank, PayPal, and GCash are displayed as payment choices. The owner describes QR-based payment and submission of proof; the current website source does not integrate with these payment services.
- **Administrator:** The owner says an administrator can access the payment proof and customer/order information as part of order fulfilment. The current source does not implement an admin interface.
- **Delivery provider:** The owner says a third-party delivery service is used to deliver orders. The particular provider is not specified here.

Do not claim that payment providers, Supabase, or delivery providers receive particular customer data unless the owner confirms the actual integrations and data-sharing steps.

## 6. Product and sales terms supplied for drafting

These are product/business facts supplied by the owner, not evidence that every related transaction is currently handled by the website:

- **Built LuxPlant Mini:** ₱3,500. The product is described as in stock. Order processing takes about 1–2 days. A ₱100 delivery fee is stated, but whether it is flat and whether delivery covers all of the Philippines is unconfirmed.
- **Quantity offer:** The checkout currently displays 10% off and free shipping when buying two or more LuxPlant Mini plants.
- **Warranty/repairs:** The built LuxPlant Mini has an 18-month warranty. If something breaks during the warranty period, it is replaced, no questions asked. Repairs are free after the warranty period.
- **STL files and commercial memberships:** LuxPlant no longer sells STL files or commercial licenses/memberships. The current focus is on selling built LuxPlant products.
- **LuxPlant Standard:** In development; planned to have 21 leaves. Its release date and price have not been announced.

## 7. Items that are not established and must be confirmed

Do not invent answers to these questions when drafting:

- Which legal entity or individual is the contracting seller, and what business/contact address and contact email should appear?
- Which privacy/data-protection laws and dispute-resolution jurisdiction apply?
- Whether the site uses analytics, advertising pixels, non-essential cookies, or other tracking technologies.
- Where account, profile, order, and payment-proof data are hosted; which service providers process them; and whether data is transferred internationally.
- How long account, order, address, payment-proof, and support data is retained, and how customers can request access, correction, export, or deletion.
- Whether customers can check out as guests, and whether an account is required to place an order.
- Whether the checkout, QR payment, payment proof, administrator access, and profile-based order tracking flow is live in production or is still planned/manual.
- The precise payment verification process, payment deadlines, what happens when proof is missing or rejected, and whether an order can be canceled after submission/payment.
- The refund, return, exchange, cancellation, lost/damaged shipment, and failed-delivery rules.
- The exact delivery coverage, delivery fee rules, delivery timelines, and carrier data-sharing practices.
- The customer age requirement and whether the service is intended for minors.
- Whether promotional emails or marketing messages are sent, and how customers opt out.
- Whether warranty replacement includes shipping costs, what exclusions apply, and how a warranty claim is submitted.
- Whether the website permits or supports any user-generated content beyond account/profile information and payment-proof images.

## 8. Drafting caution

The final policies should accurately describe the production system and the seller's confirmed practices, not just the current interface or intended workflow. In particular, do not state that the website stores or secures orders, payment proofs, or tracking data until the owner confirms where and how those processes are implemented. The final documents should be reviewed for compliance with applicable Philippine law and any other relevant jurisdictions.
