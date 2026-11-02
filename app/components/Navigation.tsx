"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CartDrawer from "./CartDrawer";
import "../../public/css/cart-drawer.css";

type NavigationProps = {
  transparentAtTop?: boolean;
};

export default function Navigation({ transparentAtTop = false }: NavigationProps) {
  const [isOverHero, setIsOverHero] = useState(transparentAtTop);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!transparentAtTop) {
      return;
    }

    const updateBackground = () => {
      const hero = document.querySelector(".hero");
      setIsOverHero(hero instanceof HTMLElement && hero.getBoundingClientRect().bottom > 80);
    };

    updateBackground();
    window.addEventListener("scroll", updateBackground, { passive: true });
    window.addEventListener("resize", updateBackground);

    return () => {
      window.removeEventListener("scroll", updateBackground);
      window.removeEventListener("resize", updateBackground);
    };
  }, [transparentAtTop]);

  return (
    <nav className={`site-nav ${isOverHero ? "site-nav-transparent" : "site-nav-solid"}${transparentAtTop ? " site-nav-hero-animation" : ""}`}>
      <Link href={"/"} className="site-nav-logo">
        <Image src="/assets/logo/logo-white.png" width={160} height={40} alt="LuxPlant Logo" />
      </Link>
      <div className="site-nav-links">
        <Link href="/#Product">Product</Link>
        <Link href="/#Gallery">Gallery</Link>
        <Link href="/#Docs">Docs</Link>
        <Link href="/#App">App</Link>
        <Link href="/#About">About</Link>
      </div>
      <div className="site-nav-icons">
        <Link href="/login" aria-label="Account"> <User /> </Link>
        <button ref={cartTriggerRef} type="button" className="site-nav-cart" aria-label="Open shopping cart" onClick={() => setIsCartOpen(true)} > <ShoppingCart /> </button>
      </div>
      {isCartOpen && ( <CartDrawer triggerRef={cartTriggerRef} onClose={() => setIsCartOpen(false)} />
      )}
    </nav>
  );
}
