"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, ShoppingCart, User, ShoppingBag, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CartDrawer from "./CartDrawer";
import "../../public/css/cart-drawer.css";

type NavigationProps = {
  transparentAtTop?: boolean;
};

export const ADD_TO_CART_EVENT = "luxplant:add-to-cart";

export default function Navigation({ transparentAtTop = false }: NavigationProps) {
  const [isOverHero, setIsOverHero] = useState(transparentAtTop);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartOpenRef = useRef(false);
  const [cartQuantity, setCartQuantity] = useState<number | null>(null);
  const [isProductMenuOpen, setIsProductMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const cartTriggerRef = useRef<HTMLButtonElement>(null);
  const productMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();
  const router = useRouter();

//   Get user data from supabase
  useEffect(() => {
    const getUser = async () => {
        const { data: {user}, error } = await supabase.auth.getUser();
        setUser(user);

        const metadata = user?.user_metadata;

        const avatarUrl = metadata?.avatar_url || null;

        setUserData({
            firstName: metadata?.first_name || "",
            lastName: metadata?.last_name || "",
            email: user?.email || "",
            avatarUrl: avatarUrl,
        });
    }

    getUser();
  }, []);

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

  useEffect(() => {
    if (!isProductMenuOpen) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !productMenuRef.current?.contains(event.target)) {
        setIsProductMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProductMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isProductMenuOpen]);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    const handleAddToCart = (event: Event) => {
      if (!(event instanceof CustomEvent)) {
        return;
      }

      const quantity = event.detail?.quantity;
      if (typeof quantity !== "number" || !Number.isFinite(quantity)) {
        return;
      }

      setCartQuantity(Math.min(10, Math.max(1, Math.floor(quantity))));
      cartOpenRef.current = true;
      setIsCartOpen(cartOpenRef.current);
    };

    window.addEventListener(ADD_TO_CART_EVENT, handleAddToCart);
    return () => window.removeEventListener(ADD_TO_CART_EVENT, handleAddToCart);
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
      setIsProfileMenuOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isNavTransparent = isOverHero && !isProductMenuOpen;
  const isOverHeroWithTransparentBehavior = transparentAtTop && isOverHero;

  return (
    <nav className={`site-nav ${isNavTransparent ? "site-nav-transparent" : "site-nav-solid"}${transparentAtTop ? " site-nav-hero-animation" : ""}${isOverHeroWithTransparentBehavior ? " site-nav-no-background-transition" : ""}`}>
      <Link href={"/"} className="site-nav-logo">
        <Image src="/assets/logo/logo-white.png" width={160} height={40} alt="LuxPlant Logo" />
      </Link>
      <div className="site-nav-links">
        <div className="site-nav-product" ref={productMenuRef}>
          <button
            type="button"
            className="site-nav-product-trigger"
            aria-expanded={isProductMenuOpen}
            aria-controls="site-nav-product-menu"
            onClick={() => setIsProductMenuOpen((isOpen) => !isOpen)}
          >
            Product <ChevronDown size={16} aria-hidden="true" />
          </button>
          {isProductMenuOpen && (
            <div className="site-nav-product-menu" id="site-nav-product-menu">
              <Link
                href="/product/luxplant-mini"
                className="site-nav-product-card"
                onClick={() => setIsProductMenuOpen(false)}
              >
                <span className="site-nav-product-image">
                  <Image src="/assets/plants/luxplant-mini-primary-1.jpeg" alt="" fill sizes="(max-width: 700px) 100vw, 30vw" />
                  <span className="site-nav-product-arrow"><ArrowUpRight size={20} aria-hidden="true" /></span>
                </span>
                <span className="site-nav-product-info">
                  <span className="site-nav-product-title">LuxPlant Mini</span>
                  <span className="site-nav-product-description">A fully built, color-changing plant.</span>
                  <span className="site-nav-product-price">₱3,500</span>
                </span>
              </Link>
              <Link
                href="/product/luxplant-standard"
                className="site-nav-product-card"
                onClick={() => setIsProductMenuOpen(false)}
              >
                <span className="site-nav-product-image">
                  <Image src="/assets/plants/luxplant-standard-main.jpeg" alt="" fill sizes="(max-width: 700px) 100vw, 30vw" />
                  <span className="site-nav-product-arrow"><ArrowUpRight size={20} aria-hidden="true" /></span>
                </span>
                <span className="site-nav-product-info">
                  <span className="site-nav-product-title">LuxPlant Standard</span>
                  <span className="site-nav-product-description">A larger design with 21 leaves, in development.</span>
                  <span className="site-nav-product-price">Coming soon</span>
                </span>
              </Link>
              <div className="site-nav-product-feature">
                <Image src="/assets/plants/plant-10.jpg" alt="" fill sizes="(max-width: 700px) 100vw, 40vw" />
                <div className="site-nav-product-feature-copy">
                  <h2>Make your space glow with LuxPlant.</h2>
                  <Link href="/gallery" className="link-button-primary" onClick={() => setIsProductMenuOpen(false)}>
                    Explore the gallery <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        <Link href="/gallery">Gallery</Link>
        <Link href="/#Docs">Docs</Link>
        <Link href="/#App">App</Link>
        <Link href="/about">About</Link>
      </div>
      <div className="site-nav-icons">
        {user ? (
          <div className="profile-dropdown" ref={profileMenuRef}>
            <button
              type="button"
              aria-label={isProfileMenuOpen ? "Close profile menu" : "Open profile menu"}
              aria-expanded={isProfileMenuOpen}
              aria-controls="profile-menu"
              className="avatar"
              onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
            >
              {userData?.avatarUrl ? (
                <Image src={userData.avatarUrl} alt="User Avatar" width={32} height={32} className="user-avatar" />
              ) : userData?.firstName && userData?.lastName ? (
                <span className="user-avatar initials-avatar">
                  {userData.firstName.charAt(0)}{userData.lastName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User aria-hidden="true" />
              )}
            </button>
            {isProfileMenuOpen && (
              <div className="profile-menu" id="profile-menu">
                <div className="profile-header">
                  {userData?.avatarUrl && (
                    <Image src={userData.avatarUrl} alt="User Avatar" width={32} height={32} className="user-avatar" />
                  )}
                  <div className="profile-info">
                    <p className="profile-name">{userData?.firstName} {userData?.lastName}</p>
                    <p className="profile-email">{userData?.email}</p>
                  </div>
                  
                </div>
                <hr></hr>
                <Link href="/order" className="profile-menu-item">
                  <ShoppingBag />
                  <p>My Orders</p>
                </Link>
                <Link href="/order" className="profile-menu-item">
                  <User />
                  <p>Profile</p>
                </Link>
                <hr></hr>
                <button onClick={handleLogout} className="profile-menu-item">
                  <LogOut />
                  <p>Sign Out</p>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" aria-label="Account">
            <User />
          </Link>
        )}
        <button ref={cartTriggerRef} type="button" className="site-nav-cart" aria-label="Open shopping cart" onClick={() => setIsCartOpen(true)} > <ShoppingCart /> </button>
      </div>
      {isCartOpen && ( <CartDrawer quantity={cartQuantity} onQuantityChange={setCartQuantity} triggerRef={cartTriggerRef} isLoggedIn={Boolean(user)} onClose={() => setIsCartOpen(false)} />
      )}
    </nav>
  );
}