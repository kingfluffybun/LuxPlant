"use client";

import "../../public/css/checkout.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { HandCoins, Minus, Plus, Tag, BadgePercent, Landmark } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CheckoutRegionSelect from "../components/CheckoutRegionSelect";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const UNIT_PRICE = 3500;
const MAX_QUANTITY = 10;
const SHIPPING_FEE = 100;
const MULTI_UNIT_DISCOUNT = 0.1;

const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(amount);

export default function CheckoutPage() {
    const [quantity, setQuantity] = useState("1");
    const [contact, setContact] = useState({ email: "", firstName: "", lastName: "" });
    const [isSignedIn, setIsSignedIn] = useState(false);
    const numericQuantity = Math.min(MAX_QUANTITY, Math.max(1, Number(quantity) || 1));
    const subtotal = UNIT_PRICE * numericQuantity;
    const hasQuantityDiscount = numericQuantity >= 2;
    const discount = hasQuantityDiscount ? Math.round(subtotal * MULTI_UNIT_DISCOUNT) : 0;
    const shippingFee = hasQuantityDiscount ? 0 : SHIPPING_FEE;
    const totalPrice = subtotal + shippingFee - discount;
    const amountSaved = discount + (hasQuantityDiscount ? SHIPPING_FEE : 0);

    useEffect(() => {
        let isCurrent = true;
        const supabase = createClient();

        async function prefillContactDetails() {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error("Could not load the signed-in customer for checkout.", error);
                return;
            }
            if (!isCurrent || !user) {
                return;
            }

            const metadata = user.user_metadata;
            setIsSignedIn(true);
            setContact({
                email: user.email ?? "",
                firstName: typeof metadata?.first_name === "string" ? metadata.first_name : "",
                lastName: typeof metadata?.last_name === "string" ? metadata.last_name : "",
            });
        }

        void prefillContactDetails();
        return () => {
            isCurrent = false;
        };
    }, []);

    function updateQuantity(value: string) {
        setQuantity(value);
    }

    function adjustQuantity(amount: number) {
        updateQuantity(String(Math.min(MAX_QUANTITY, Math.max(1, (Number(quantity) || 1) + amount))));
    }

    return (
        <div className="checkout-page-layout">
            <Navigation />
            <main className="checkout-page-main">
                <form className="checkout-form">
                    <div className="checkout-contact-form">
                        <div className="checkout-contact-heading">
                            <b>Contact</b>
                            {!isSignedIn && <Link href="/login">Sign in</Link>}
                        </div>
                        <div className="checkout-form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                required
                                placeholder="Email"
                                autoComplete="email"
                                readOnly={isSignedIn}
                                value={contact.email}
                                onChange={(event) => setContact((current) => ({ ...current, email: event.currentTarget.value }))}
                            />
                        </div>
                        <div className="checkout-form-two-col">
                            <div className="checkout-form-group">
                                <label htmlFor="first-name">First Name</label>
                                <input
                                    type="text"
                                    id="first-name"
                                    name="first-name"
                                    required
                                    placeholder="First Name"
                                    autoComplete="given-name"
                                    readOnly={isSignedIn}
                                    value={contact.firstName}
                                    onChange={(event) => setContact((current) => ({ ...current, firstName: event.currentTarget.value }))}
                                />
                            </div>
                            <div className="checkout-form-group">
                                <label htmlFor="last-name">Last Name</label>
                                <input
                                    type="text"
                                    id="last-name"
                                    name="last-name"
                                    required
                                    placeholder="Last Name"
                                    autoComplete="family-name"
                                    readOnly={isSignedIn}
                                    value={contact.lastName}
                                    onChange={(event) => setContact((current) => ({ ...current, lastName: event.currentTarget.value }))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="checkout-delivery-form">
                        <b>Delivery</b>
                        <div className="checkout-form-group">
                            <div className="checkout-form-group">
                                <label htmlFor="last-name">Address</label>
                                <input type="text" id="last-name" name="last-name" required placeholder="Address"></input>
                            </div>
                        </div>
                        <div className="checkout-form-two-col">
                            <div className="checkout-form-group">
                                <label htmlFor="address-line-2">Apartment, suite, unit (Optional)</label>
                                <input type="text" id="address-line-2" name="address-line-2" placeholder="Apartment, suite, unit (Optional)"></input>
                            </div>
                            <div className="checkout-form-group">
                                <label htmlFor="barangay">Barangay</label>
                                <input type="text" id="barangay" name="barangay" required placeholder="Barangay"></input>
                            </div>
                        </div>
                        <div className="checkout-form-two-col">
                            <div className="checkout-form-group">
                                <label htmlFor="postal-code">Postal Code</label>
                                <input type="text" id="postal-code" name="postal-code" placeholder="Postal Code"></input>
                            </div>
                            <div className="checkout-form-group">
                                <label htmlFor="city">City</label>
                                <input type="text" id="city" name="city" required placeholder="City"></input>
                            </div>
                        </div>
                        <CheckoutRegionSelect />
                    </div>
                    <div className="checkout-payment-form">
                        <b>Payment</b>
                        <div className="checkout-payment-options">
                            <label className="checkout-payment-option">
                                <input type="radio" name="paymentMethod" value="cash-on-delivery" required />
                                <span className="checkout-payment-radio">
                                    <div className="checkout-payment-content">
                                        <span>Cash on delivery</span>
                                        <HandCoins size={32} color="#fff"/>
                                    </div>
                                    <span className="checkout-payment-indicator" aria-hidden="true" />
                                </span>
                            </label>
                            <label className="checkout-payment-option">
                                <input type="radio" name="paymentMethod" value="bank-transfer" />
                                <span className="checkout-payment-radio">
                                    <div className="checkout-payment-content">
                                        <span>Bank Transfer</span>
                                        <Landmark size={32} color="#fff"/>
                                    </div>
                                    <span className="checkout-payment-indicator" aria-hidden="true" />
                                </span>
                            </label>
                            <label className="checkout-payment-option">
                                <input type="radio" name="paymentMethod" value="paypal" />
                                <span className="checkout-payment-radio">
                                    <div className="checkout-payment-content">
                                        <span>Pay with PayPal</span>
                                        <Image src="/assets/PayPal.svg" alt="PayPal" width={32} height={32} />
                                    </div>
                                    <span className="checkout-payment-indicator" aria-hidden="true" />
                                </span>
                            </label>
                            <label className="checkout-payment-option">
                                <input type="radio" name="paymentMethod" value="gcash" />
                                <span className="checkout-payment-radio">
                                    <div className="checkout-payment-content">
                                        <span>Pay with GCash</span>
                                        <Image src="/assets/GCash.svg" alt="GCash" width={32} height={32} />
                                    </div>
                                    <span className="checkout-payment-indicator" aria-hidden="true" />
                                </span>
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="link-button-primary">Place Order</button>
                </form>
                <div className="order-summary">
                    <b>Order Summary</b>
                    <div className="order-summary-item">
                        <div className="order-item-details">
                            <div className="order-item">
                                <span id="quantity">{numericQuantity}</span>
                                <Image src="/assets/plants/luxplant-mini-01.jpeg" alt="LuxPlant Mini" width={64} height={64} />
                            </div>
                            <div className="order-item-info">
                                <p id="product-name">LuxPlant Mini</p>
                                {numericQuantity >= 2 && (
                                    <p id="discount"><Tag size={12}/> Bundle discount (-{formatPrice(discount)})</p>
                                )}
                                <div className="checkout-quantity-input">
                                    <input type="number" id="quantity-input" name="quantity" min="1" max={MAX_QUANTITY} value={quantity} onChange={(event) => updateQuantity(event.currentTarget.value)} onBlur={() => { updateQuantity(String(numericQuantity)); }} aria-label="Number of plants" />
                                    <div className="checkout-quantity-controls">
                                        <button type="button" aria-label="Decrease quantity" onClick={() => adjustQuantity(-1)}>
                                            <Minus aria-hidden="true" size={12} />
                                        </button>
                                        <button type="button" aria-label="Increase quantity" onClick={() => adjustQuantity(1)}>
                                            <Plus aria-hidden="true" size={12} />
                                        </button>
                                    </div>
                                </div>
                                <div className="checkout-discount-note">
                                    <BadgePercent size={24}/>
                                    <p id="discount-note">Get 10% off and free shipping when you order 2 or more plants.</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-item-prices">
                            {hasQuantityDiscount && (
                                <p className="order-item-original-price">{formatPrice(subtotal)}</p>
                            )}
                            <p className="order-item-price">{formatPrice(subtotal - discount)}</p>
                        </div>
                    </div>
                    <hr></hr>
                    <div className="order-summary-breakdown" aria-live="polite">
                        <div className="order-summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="order-summary-row">
                            <span>Shipping fee</span>
                            <span className="order-summary-shipping">
                                {shippingFee === 0 ? <><s className="order-item-original-price">{formatPrice(SHIPPING_FEE)}</s> Free</> : formatPrice(shippingFee)}
                            </span>
                        </div>
                        {hasQuantityDiscount && (
                            <div className="order-summary-row">
                                <span>Discount</span>
                                <span>-{formatPrice(discount)}</span>
                            </div>
                        )}
                        <div className="order-summary-total">
                            <div className="order-summary-total-label">
                                <span>Total</span>
                                {hasQuantityDiscount && (
                                    <span className="order-summary-savings"><Tag size={12} aria-hidden="true" />You save {formatPrice(amountSaved)}</span>
                                )}
                            </div>
                            <span className="order-summary-total-amount">{formatPrice(totalPrice)}</span>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}