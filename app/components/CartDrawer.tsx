"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type CartDrawerProps = {
    onClose: () => void;
    isLoggedIn: boolean;
    triggerRef: RefObject<HTMLButtonElement | null>;
    quantity: number | null;
    onQuantityChange: (quantity: number) => void;
};

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

export default function CartDrawer({
    onClose,
    isLoggedIn,
    triggerRef,
    quantity,
    onQuantityChange,
}: CartDrawerProps) {
    const [isClosing, setIsClosing] = useState(false);
    const isClosingRef = useRef(false);
    const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    const previousOverflow = useRef<string | null>(null);
    const subtotal = UNIT_PRICE * (quantity ?? 0);
    const discount = quantity !== null && quantity >= 2
        ? Math.round(subtotal * MULTI_UNIT_DISCOUNT)
        : 0;
    const hasQuantityDiscount = quantity !== null && quantity >= 2;
    const shippingFee = hasQuantityDiscount ? 0 : SHIPPING_FEE;
    const totalPrice = subtotal + shippingFee - discount;
    const amountSaved = discount + (hasQuantityDiscount ? SHIPPING_FEE : 0);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    const closeDrawer = useCallback(() => {
        if (isClosingRef.current) {
            return;
        }
        isClosingRef.current = true;
        if (previousOverflow.current !== null) {
            document.body.style.overflow = previousOverflow.current;
        }
        setIsClosing(true);
        closeTimeout.current = setTimeout(() => onCloseRef.current(), 250);
    }, []);

    useEffect(() => {
        previousOverflow.current = document.body.style.overflow;
        const trigger = triggerRef.current;
        document.body.style.overflow = "hidden";
        dialogRef.current?.querySelector<HTMLButtonElement>(".cart-drawer-close")?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.preventDefault();
                closeDrawer();
                return;
            }

            if (event.key !== "Tab" || !dialogRef.current) {
                return;
            }

            const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
            );
            const first = focusableElements.item(0);
            const last = focusableElements.item(focusableElements.length - 1);

            if (!first || !last) {
                event.preventDefault();
                return;
            }

            if (!dialogRef.current.contains(document.activeElement)) {
                event.preventDefault();
                first.focus();
            } else if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            if (previousOverflow.current !== null) {
                document.body.style.overflow = previousOverflow.current;
                previousOverflow.current = null;
            }
            document.removeEventListener("keydown", handleKeyDown);
            if (closeTimeout.current) {
                clearTimeout(closeTimeout.current);
            }
            trigger?.focus();
        };
    }, [closeDrawer, triggerRef]);

    return createPortal(
        <div className={`cart-drawer-container${isClosing ? " is-closing" : ""}`}>
            <button type="button" className="cart-drawer-overlay" aria-label="Close cart" onClick={closeDrawer} />
            <div ref={dialogRef} className={`cart-drawer${quantity === null ? "" : " has-items"}`} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" >
                <div className="cart-drawer-header">
                    <h2 id="cart-drawer-title"><ShoppingCart size={32}/>Cart</h2>
                    <button type="button" className="cart-drawer-close" aria-label="Close cart" onClick={closeDrawer} > <X size={32} aria-hidden="true" /> </button>
                </div>
                <div className={`cart-drawer-content${quantity === null ? " is-empty" : " has-items"}`}>
                    {quantity === null ? (
                        <>
                            <h3>Your cart is empty.</h3>
                            <Link href="/product/luxplant-mini" className="link-button-primary" onClick={onClose}>Continue shopping</Link>
                            {!isLoggedIn && (
                                <div className="cart-drawer-login">
                                    <b>Have an account?</b>
                                    <p><Link href="/login" onClick={onClose}>Log in</Link> to checkout faster.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="checkout-discount-note">
                                <p className="cart-drawer-discount-note">10% off and free shipping when you buy 2 or more plants.</p>
                            </div>
                            <div className="order-summary-item cart-drawer-item">
                                <div className="order-item-details">
                                    <div className="order-item">
                                        <span>{quantity}</span>
                                        <Image src="/assets/plants/luxplant-mini-01.jpeg" alt="LuxPlant Mini" width={64} height={64} />
                                    </div>
                                    <div className="order-item-info">
                                        <p className="cart-drawer-product-name">LuxPlant Mini</p>
                                        <div className="checkout-quantity-input">
                                            <input
                                                type="number"
                                                min="1"
                                                max={MAX_QUANTITY}
                                                value={quantity}
                                                onChange={(event) => {
                                                    const nextQuantity = Number(event.currentTarget.value);
                                                    if (Number.isFinite(nextQuantity)) {
                                                        onQuantityChange(Math.min(MAX_QUANTITY, Math.max(1, Math.floor(nextQuantity))));
                                                    }
                                                }}
                                                aria-label="Number of plants"
                                            />
                                            <div className="checkout-quantity-controls">
                                                <button type="button" aria-label="Decrease quantity" onClick={() => onQuantityChange(Math.max(1, quantity - 1))} >
                                                    <Minus aria-hidden="true" size={12} />
                                                </button>
                                                <button type="button" aria-label="Increase quantity" onClick={() => onQuantityChange(Math.min(MAX_QUANTITY, quantity + 1))} >
                                                    <Plus aria-hidden="true" size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-item-prices">
                                    <div className="cart-drawer-price-row">
                                        {quantity >= 2 && (
                                            <p className="order-item-original-price">{formatPrice(subtotal)}</p>
                                        )}
                                        <p className="order-item-price">{formatPrice(subtotal - discount)}</p>
                                    </div>
                                    {hasQuantityDiscount && (
                                        <span className="pill">10% OFF</span>
                                    )}
                                </div>
                            </div>
                            {!isLoggedIn && (
                                <div className="cart-drawer-login">
                                    <b>Have an account?</b>
                                    <p><Link href="/login" onClick={onClose}>Log in</Link> to checkout faster.</p>
                                </div>
                            )}
                            <div className="cart-drawer-summary">
                                <div className="cart-drawer-estimated-total">
                                    <span>Estimated total</span>
                                    <div className="cart-drawer-total-prices">
                                        {hasQuantityDiscount && (
                                            <span className="cart-drawer-original-total">
                                                {formatPrice(subtotal + SHIPPING_FEE)}
                                            </span>
                                        )}
                                        <span className="cart-drawer-current-total">{formatPrice(totalPrice)}</span>
                                    </div>
                                </div>
                                {hasQuantityDiscount && (
                                    <p className="cart-drawer-savings">
                                        You are saving {formatPrice(amountSaved)}!
                                    </p>
                                )}
                                <Link href="/checkout" className="link-button-primary" onClick={onClose}>
                                    Checkout
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body,
    );
}
