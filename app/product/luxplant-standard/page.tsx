"use client";

import "../../../public/css/navigation.css";
import "../../../public/css/footer.css";
import "../../../public/css/product.css";
import Footer from "../../components/Footer";
import Navigation from "../../components/Navigation";
import ProductDropdown from "../luxplant-mini/ProductDropdown";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LuxPlantStandardPage() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    function toggleDropdown(id: string) {
        setOpenDropdown((current) => current === id ? null : id);
    }

    return (
        <div className="product-layout">
            <Navigation />
            <main className="product-page product-page-standard">
                <div className="product-page-preview">
                    <div className="product-preview-main">
                        <Image
                            src="/assets/plants/luxplant-standard-main.jpeg"
                            alt="LuxPlant Standard prototype"
                            width={1200}
                            height={1200}
                            priority
                        />
                    </div>
                </div>
                <div className="product-details">
                    <div className="standard-product-intro">
                        <span className="standard-product-status">Coming Soon</span>
                        <h1>LuxPlant Standard</h1>
                        <p>
                            The larger LuxPlant is in development, with 21 leaves and thicker
                            stems planned for its branches.
                        </p>
                        <p className="standard-product-release">
                            No release date or price has been announced.
                        </p>
                    </div>

                    <div className="product-dropdown-details">
                        <ProductDropdown
                            id="standard-planned-details"
                            title="What’s planned"
                            isOpen={openDropdown === "standard-planned-details"}
                            onToggle={() => toggleDropdown("standard-planned-details")}
                        >
                            <ul>
                                <li>21 leaves</li>
                                <li>Thicker stems with different diameters for the branches</li>
                            </ul>
                        </ProductDropdown>
                        <ProductDropdown
                            id="standard-commercial-license"
                            title="Commercial license"
                            isOpen={openDropdown === "standard-commercial-license"}
                            onToggle={() => toggleDropdown("standard-commercial-license")}
                        >
                            <p>
                                Commercial license members will get a discount when LuxPlant
                                Standard is completed.
                            </p>
                        </ProductDropdown>
                    </div>

                    <Link href="/product/luxplant-mini" className="link-button-secondary standard-product-link">
                        Explore LuxPlant Mini
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}