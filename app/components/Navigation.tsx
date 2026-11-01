import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";

export default function Navigation() {
  return (
    <nav className="site-nav">
      <Link href={"/"} className="site-nav-logo">
        <Image src="/assets/logo/logo-white.png" width={160} height={160} alt="LuxPlant Logo" />
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
        <Link href="/" aria-label="Shopping cart"> <ShoppingCart /> </Link>
      </div>
    </nav>
  );
}
