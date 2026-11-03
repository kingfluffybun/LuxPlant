"use client";

import "../../../public/css/navigation.css";
import "../../../public/css/footer.css";
import "../../../public/css/product.css";
import Footer from "../../components/Footer";
import FaqSection from "../../components/FaqSection";
import Navigation from "../../components/Navigation";
import ProductDropdown from "./ProductDropdown";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Check, Siren, Clock, Phone, ChevronLeft, ChevronRight, Minus, Plus, Dot } from "lucide-react"

const productSlides = [
    { type: "image", src: "/assets/plants/luxplant-mini-primary-1.jpeg" },
    { type: "image", src: "/assets/plants/luxplant-mini-02.jpeg" },
    { type: "image", src: "/assets/plants/luxplant-mini-03.jpeg" },
    { type: "image", src: "/assets/plants/luxplant-mini-04.jpeg" },
    { type: "video", src: "/assets/plants/videos/luxplant-mini-video-1.mp4" },
    { type: "video", src: "/assets/plants/videos/luxplant-mini-video-2.mp4" },
];

const UNIT_PRICE = 3500;
const MULTI_UNIT_DISCOUNT = 0.1;
const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0,
    }).format(amount);

export default function LuxPlantMiniPage() {
    const [selectedImage, setSelectedImage] = useState(0);
    const [trackIndex, setTrackIndex] = useState(1);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const [quantity, setQuantity] = useState("1");
    const [quantityOption, setQuantityOption] = useState<"single" | "multiple">("single");
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const thumbnailStripRef = useRef<HTMLDivElement | null>(null);
    const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const numericQuantity = Math.min(10, Math.max(1, Number(quantity) || 1));
    const hasQuantityDiscount = numericQuantity >= 2;
    const subtotal = UNIT_PRICE * numericQuantity;
    const totalPrice = hasQuantityDiscount
        ? Math.round(subtotal * (1 - MULTI_UNIT_DISCOUNT))
        : subtotal;
    const cartPrice = formatPrice(totalPrice);

    const trackSlides = [
        productSlides[productSlides.length - 1],
        ...productSlides,
        productSlides[0],
    ];

    useEffect(() => {
        const activeTrackIndex = selectedImage + 1;
        const activeSlide = productSlides[selectedImage];

        videoRefs.current.forEach((video, index) => {
            if (video && index !== activeTrackIndex) {
                video.pause();
            }
        });

        if (activeSlide.type === "video") {
            const activeVideo = videoRefs.current[activeTrackIndex];
            if (activeVideo) {
                activeVideo.muted = true;
                activeVideo.play().catch((error: unknown) => {
                    console.error("Unable to autoplay the selected product video.", error);
                });
            }
        }
    }, [selectedImage]);

    useEffect(() => {
        const strip = thumbnailStripRef.current;
        const thumbnail = thumbnailRefs.current[selectedImage];
        if (!strip || !thumbnail) {
            return;
        }

        const stripRect = strip.getBoundingClientRect();
        const thumbnailRect = thumbnail.getBoundingClientRect();
        const targetScrollLeft = strip.scrollLeft
            + thumbnailRect.left
            - stripRect.left
            - (strip.clientWidth - thumbnailRect.width) / 2;

        strip.scrollTo({
            left: Math.max(0, Math.min(targetScrollLeft, strip.scrollWidth - strip.clientWidth)),
            behavior: "smooth",
        });
    }, [selectedImage]);

    function selectImage(index: number) {
        setSelectedImage(index);
        setTrackIndex(index + 1);
    }

    function showPreviousImage() {
        setSelectedImage((current) => (current - 1 + productSlides.length) % productSlides.length);
        setTrackIndex((current) => current - 1);
    }

    function showNextImage() {
        setSelectedImage((current) => (current + 1) % productSlides.length);
        setTrackIndex((current) => current + 1);
    }

    function handleTrackTransitionEnd() {
        if (trackIndex === 0 || trackIndex === productSlides.length + 1) {
            setTransitionEnabled(false);
            setTrackIndex(trackIndex === 0 ? productSlides.length : 1);
            requestAnimationFrame(() => setTransitionEnabled(true));
        }
    }

    function selectQuantityOption(option: "single" | "multiple") {
        setQuantityOption(option);
        setQuantity(option === "single" ? "1" : String(Math.max(2, Number(quantity) || 2)));
    }

    function updateQuantity(value: string) {
        setQuantity(value);
        if (value === "1") {
            setQuantityOption("single");
        } else if (Number(value) > 1) {
            setQuantityOption("multiple");
        }
    }

    function adjustQuantity(amount: number) {
        const nextQuantity = Math.min(10, Math.max(1, (Number(quantity) || 1) + amount));
        updateQuantity(String(nextQuantity));
    }

    return (
        <div className="product-layout">
            <Navigation />
            <main className="product-page">
                <div className="product-page-preview">
                    <div className="product-preview-main">
                        <div className={`product-preview-track${transitionEnabled ? "" : " no-transition"}`} style={{ transform: `translateX(-${trackIndex * 100}%)` }} onTransitionEnd={handleTrackTransitionEnd} >
                            {trackSlides.map((slide, index) => {
                                const isClone = index === 0 || index === trackSlides.length - 1;
                                const slideIndex = (index - 1 + productSlides.length) % productSlides.length;
                                const label = slide.type === "video"
                                    ? `LuxPlant Mini video ${slideIndex + 1 - 4}`
                                    : `LuxPlant Mini view ${slideIndex + 1}`;

                                return (
                                    <div className="product-preview-slide" key={`${slide.src}-${index}`}>
                                        {slide.type === "image" ? (
                                            <Image src={slide.src} alt={isClone ? "" : label} aria-hidden={isClone} width={400} height={400} loading="eager" />
                                        ) : (
                                            <video ref={(element) => { videoRefs.current[index] = element; }} src={slide.src} aria-label={isClone ? undefined : label} aria-hidden={isClone} muted playsInline loop preload="metadata" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="product-preview-main-controls">
                            <button type="button" aria-label="Previous image" onClick={showPreviousImage}>
                                <ChevronLeft aria-hidden="true" />
                            </button>
                            <button type="button" aria-label="Next image" onClick={showNextImage}>
                                <ChevronRight aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <div className="product-preview-small" ref={thumbnailStripRef}>
                        {productSlides.map((slide, index) => (
                            <button ref={(element) => { thumbnailRefs.current[index] = element; }} type="button" className={`product-preview-thumbnail${selectedImage === index ? " is-selected" : ""}`} key={slide.src} aria-label={`Show ${slide.type === "video" ? "product video" : "product image"} ${slide.type === "video" ? index - 3 : index + 1}`} aria-pressed={selectedImage === index} onClick={() => selectImage(index)} >
                                {slide.type === "image" ? (
                                    <Image src={slide.src} alt="" width={400} height={400} />
                                ) : (
                                    <video src={slide.src} muted playsInline preload="metadata" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="product-details">
                    <h1>LuxPlant Mini</h1>
                    <form>
                        <fieldset className="product-options">
                            <div className="product-quantity">
                                <div className="product-quantity-label">
                                    <p>Quantity</p>
                                    <div className="product-quantity-prices" aria-live="polite">
                                        {hasQuantityDiscount && (
                                            <p id="price-label-original">{formatPrice(subtotal)}</p>
                                        )}
                                        <p id="price-label">{formatPrice(totalPrice)}</p>
                                    </div>
                                </div>
                                <div className="product-quantity-options">
                                    <label className="product-option">
                                        <input type="radio" name="quantityOption" value="single" checked={quantityOption === "single"} onChange={() => selectQuantityOption("single")} />
                                        <span className="radio">
                                            <span>1 Plant</span>
                                            <span className="circle" aria-hidden="true"><Check size={12}/></span>
                                        </span>
                                    </label>
                                    <label className="product-option">
                                        <input type="radio" name="quantityOption" value="multiple" checked={quantityOption === "multiple"} onChange={() => selectQuantityOption("multiple")} />
                                        <span className="radio">
                                            <span>2+ Plant</span>
                                            <div className="offer"><span className="pill">10% OFF</span> + Free Shipping</div>
                                            <span className="circle" aria-hidden="true"><Check size={12}/></span>
                                        </span>
                                    </label>
                                </div>
                                {quantityOption === "multiple" && <div className="product-quantity-input">
                                    <input type="number" name="quantity" min="1" max="10" value={quantity} onChange={(event) => updateQuantity(event.currentTarget.value)} onBlur={() => { if (!quantity) { updateQuantity("1"); } else if (Number(quantity) > 10) { updateQuantity("10"); } }} aria-label="Number of plants" />
                                    <div className="product-quantity-input-controls">
                                        <button type="button" aria-label="Decrease quantity" onClick={() => adjustQuantity(-1)}>
                                            <Minus aria-hidden="true" />
                                        </button>
                                        <button type="button" aria-label="Increase quantity" onClick={() => adjustQuantity(1)}>
                                            <Plus aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>}
                            </div>
                        </fieldset>
                        <div className="product-actions">
                            <button type="submit" className="link-button-primary">
                                Add to Cart <ShoppingCart />
                                <Dot /> {cartPrice}
                            </button>
                            <button type="button" className="link-button-secondary">Buy Now</button>
                        </div>
                    </form>
                    <div className="feature-cards">
                        <div className="card">
                            <Siren size={32} stroke="var(--primary)"/>
                            <b>16 Million Colors</b>
                            <p>30 presets and animations come pre-installed.</p>
                        </div>
                        <div className="card">
                            <Clock size={32} stroke="var(--primary)"/>
                            <b>Auto schedule</b>
                            <p>Set your own on and off times.</p>
                        </div>
                        <div className="card">
                            <Phone size={32} stroke="var(--primary)"/>
                            <b>App Control</b>
                            <p>Pick colors from the mobile app.</p>
                        </div>
                    </div>
                    <div className="product-dropdown-details">
                        <ProductDropdown
                            id="specs"
                            title="Specs"
                            isOpen={openDropdown === "specs"}
                            onToggle={() => setOpenDropdown((current) => current === "specs" ? null : "specs")}
                        >
                            <div className="specs">
                                <table>
                                    <tbody>
                                        <tr>
                                            <th scope="row">Height</th>
                                            <td>20 in</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Pot diameter</th>
                                            <td>14 cm</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Leaves</th>
                                            <td>9 leaves, 14 LEDs each, 126 in total</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">LEDs</th>
                                            <td>WS2812 addressable RGB</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Controller</th>
                                            <td>ESP32 WROOM-32, USB Type-C</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Power</th>
                                            <td>5V adapter, at least 6A (30W)</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">Stem</th>
                                            <td>Fully modular, leaves and stems rotate to any angle</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </ProductDropdown>
                        <ProductDropdown
                            id="delivery"
                            title="Delivery and Payment"
                            isOpen={openDropdown === "delivery"}
                            onToggle={() => setOpenDropdown((current) => current === "delivery" ? null : "delivery")}
                        >
                            <ul>
                                <li>Made and Shipped from the Philippines</li>
                                <li>Orders are processed in about 1 to 2 days</li>
                                <li>Pay by bank transfer, cash on delivery, PayPal or Gcash</li>
                            </ul>
                        </ProductDropdown>
                        <ProductDropdown
                            id="warranty"
                            title="Warranty"
                            isOpen={openDropdown === "warranty"}
                            onToggle={() => setOpenDropdown((current) => current === "warranty" ? null : "warranty")}
                        >
                            <ul>
                                <li>18-month warranty</li>
                                <li>If something breaks, it is replaced, no questions asked.</li>
                                <li>Free repairs even after the warranty has expired</li>
                            </ul>
                        </ProductDropdown>
                    </div>
                </div>
            </main>
            <FaqSection />
            <Footer />
        </div>
    );
}
