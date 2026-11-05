"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export const ADD_TO_CART_EVENT = "add-to-cart";

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
    const supabase = createClient();

    const [isClosing, setIsClosing] = useState(false);
    const isClosingRef = useRef(false);
    const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    const previousOverflow = useRef<string | null>(null);

    type CartItem = {
        id: string;
        product_id: string;
        quantity: number;
    };

    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    const firstItem = items[0] ?? null;
    const currentQty = firstItem?.quantity ?? null;

    const subtotal = UNIT_PRICE * (currentQty ?? 0);
    const discount = currentQty !== null && currentQty >= 2
        ? Math.round(subtotal * MULTI_UNIT_DISCOUNT)
        : 0;
    const hasQuantityDiscount = currentQty !== null && currentQty >= 2;
    const shippingFee = hasQuantityDiscount ? 0 : SHIPPING_FEE;
    const totalPrice = subtotal + shippingFee - discount;
    const amountSaved = discount + (hasQuantityDiscount ? SHIPPING_FEE : 0);

    const loadCart = async (uid: string) => {
        const { data: cartId, error: cartErr } = await supabase
            .rpc("get_or_create_cart", { p_user_id: uid })
            .single();
        if (cartErr) {
            console.error("Failed to get/create cart:", cartErr);
            setItems([]);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("cart_items")
            .select("id, product_id, quantity")
            .eq("cart_id", cartId);
        if (error) {
            console.error("Failed to load cart items:", error);
            setItems([]);
        } else {
            setItems(data as CartItem[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        const fetchUserAndCart = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error || !user) {
                setUserId(null);
                setItems([]);
                setLoading(false);
                return;
            }

            setUserId(user.id);
            await loadCart(user.id);
        };

        fetchUserAndCart();
    }, []);

    useEffect(() => {
        const handler = () => {
            if (userId) loadCart(userId);
        };
        window.addEventListener(ADD_TO_CART_EVENT, handler);
        return () => window.removeEventListener(ADD_TO_CART_EVENT, handler);
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        const initRealtime = async () => {
            const { data: cartId } = await supabase
                .rpc("get_or_create_cart", { p_user_id: userId })
                .single();

            const channel = supabase
                .channel(`public:cart_items_user_${userId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "cart_items",
                        filter: `cart_id=eq.${cartId}`,
                    },
                    () => {
                        loadCart(userId);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        const cleanupPromise = initRealtime();
        return () => {
            cleanupPromise.then((cleanup) => cleanup?.());
        };
    }, [userId]);

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

    const updateQuantity = async (itemId: string, newQty: number) => {
        if (newQty <= 0) {
            const {error} = await supabase
                .from("cart_items")
                .delete()
                .eq("id", itemId);
            if (error) console.error("Delete failed:", error);
        } else {
            const {error} = await supabase
                .from("cart_items")
                .update({quantity: newQty})
                .eq("id", itemId);
            if (error) console.error("Update failed:", error);
        }
        if (userId) loadCart(userId);
    }

    return createPortal(
        <div className={`cart-drawer-container${isClosing ? " is-closing" : ""}`}>
            <button type="button" className="cart-drawer-overlay" aria-label="Close cart" onClick={closeDrawer} />
            <div ref={dialogRef} className={`cart-drawer${firstItem ? " has-items" : ""}`} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" >
                <div className="cart-drawer-header">
                    <h2 id="cart-drawer-title"><ShoppingCart size={32}/>Cart</h2>
                    <button type="button" className="cart-drawer-close" aria-label="Close cart" onClick={closeDrawer} > <X size={32} aria-hidden="true" /> </button>
                </div>
                <div className={`cart-drawer-content${firstItem ? " has-items" : " is-empty"}`}>
                    {firstItem === null ? (
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
                                        <span>{firstItem.quantity}</span>
                                        <Image src="/assets/plants/luxplant-mini-01.jpeg" alt="LuxPlant Mini" width={64} height={64} />
                                    </div>
                                    <div className="order-item-info">
                                        <p className="cart-drawer-product-name">LuxPlant Mini</p>
                                        <div className="checkout-quantity-input">
                                            <input
                                                type="number"
                                                min="0"
                                                max={MAX_QUANTITY}
                                                value={firstItem.quantity}
                                                onChange={(event) => {
                                                    const newQty = Number(event.currentTarget.value);
                                                    if (Number.isFinite(newQty)) {
                                                        updateQuantity(firstItem.id, Math.min(MAX_QUANTITY, Math.max(0, Math.floor(newQty))));
                                                    }
                                                }}
                                                aria-label="Number of plants"
                                            />
                                            <div className="checkout-quantity-controls">
                                                <button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(firstItem.id, Math.max(0, firstItem.quantity - 1))} >
                                                    <Minus aria-hidden="true" size={12} />
                                                </button>
                                                <button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(firstItem.id, Math.min(MAX_QUANTITY, firstItem.quantity + 1))} >
                                                    <Plus aria-hidden="true" size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-item-prices">
                                    <div className="cart-drawer-price-row">
                                        {firstItem.quantity >= 2 && (
                                            <p className="order-item-original-price">{formatPrice(subtotal)}</p>
                                        )}
                                        <p className="order-item-price">{formatPrice(subtotal - discount)}</p>
                                    </div>
                                    {hasQuantityDiscount && (
                                        <span className="pill">10% OFF</span>
                                    )}
                                </div>
                            </div>
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
