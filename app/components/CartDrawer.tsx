"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { X, ShoppingCart } from "lucide-react";
import Link from "next/link";

type CartDrawerProps = {
    onClose: () => void;
    triggerRef: RefObject<HTMLButtonElement | null>;
};

export default function CartDrawer({ onClose, triggerRef }: CartDrawerProps) {
    const [isClosing, setIsClosing] = useState(false);
    const isClosingRef = useRef(false);
    const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);
    const previousOverflow = useRef<string | null>(null);

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
            <div ref={dialogRef} className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" >
                <div className="cart-drawer-header">
                    <h2 id="cart-drawer-title"><ShoppingCart size={36}/>Your cart</h2>
                    <button type="button" className="cart-drawer-close" aria-label="Close cart" onClick={closeDrawer} > <X aria-hidden="true" /> </button>
                </div>
                <div className="cart-drawer-content">
                    <h3>Your cart is empty.</h3>
                    <Link href="/product/luxplant-mini" className="link-button-primary">Continue shopping</Link>
                    <div className="cart-drawer-login">
                        <b>Have an account?</b>
                        <p><Link href="/login">Log in</Link> to checkout faster.</p>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
