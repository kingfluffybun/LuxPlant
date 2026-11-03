"use client";

import "../../../public/css/navigation.css";
import "../../../public/css/footer.css";
import "../../../public/css/product.css";
import Footer from "../../components/Footer";
import FaqSection from "../../components/FaqSection";
import Navigation from "../../components/Navigation";
import ProductDropdown from "../luxplant-mini/ProductDropdown";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type StandardSlide =
    | { type: "image"; src: string; alt: string }
    | { type: "video"; src: string; alt: string };

const standardSlides: StandardSlide[] = [
    {
        type: "image",
        src: "/assets/plants/luxplant-standard-main.jpeg",
        alt: "LuxPlant Standard prototype",
    },
    {
        type: "image",
        src: "/assets/plants/luxplant-standard-1.png",
        alt: "LuxPlant Standard design",
    },
    {
        type: "video",
        src: "/assets/plants/videos/luxplant-standard-video-1.mp4",
        alt: "LuxPlant Standard video",
    },
];

export default function LuxPlantStandardPage() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [selectedSlide, setSelectedSlide] = useState(0);
    const [trackIndex, setTrackIndex] = useState(1);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const thumbnailStripRef = useRef<HTMLDivElement | null>(null);
    const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const trackSlides = [
        standardSlides[standardSlides.length - 1],
        ...standardSlides,
        standardSlides[0],
    ];

    function toggleDropdown(id: string) {
        setOpenDropdown((current) => current === id ? null : id);
    }

    function selectSlide(index: number) {
        setSelectedSlide(index);
        setTrackIndex(index + 1);
    }

    function showPreviousSlide() {
        setSelectedSlide((current) => (current - 1 + standardSlides.length) % standardSlides.length);
        setTrackIndex((current) => current - 1);
    }

    function showNextSlide() {
        setSelectedSlide((current) => (current + 1) % standardSlides.length);
        setTrackIndex((current) => current + 1);
    }

    function handleTrackTransitionEnd() {
        if (trackIndex === 0 || trackIndex === standardSlides.length + 1) {
            setTransitionEnabled(false);
            setTrackIndex(trackIndex === 0 ? standardSlides.length : 1);
            requestAnimationFrame(() => setTransitionEnabled(true));
        }
    }

    useEffect(() => {
        const activeTrackIndex = selectedSlide + 1;
        const activeSlide = standardSlides[selectedSlide];

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
                    console.error("Unable to autoplay the selected Standard product video.", error);
                });
            }
        }
    }, [selectedSlide]);

    useEffect(() => {
        const strip = thumbnailStripRef.current;
        const thumbnail = thumbnailRefs.current[selectedSlide];
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
    }, [selectedSlide]);

    return (
        <div className="product-layout">
            <Navigation />
            <main className="product-page product-page-standard">
                <div className="product-page-preview">
                    <div className="product-preview-main">
                        <div
                            className={`product-preview-track${transitionEnabled ? "" : " no-transition"}`}
                            style={{ transform: `translateX(-${trackIndex * 100}%)` }}
                            onTransitionEnd={handleTrackTransitionEnd}
                        >
                            {trackSlides.map((slide, index) => {
                                const isClone = index === 0 || index === trackSlides.length - 1;

                                return (
                                    <div className="product-preview-slide" key={`${slide.src}-${index}`}>
                                        {slide.type === "image" ? (
                                            <Image
                                                src={slide.src}
                                                alt={isClone ? "" : slide.alt}
                                                aria-hidden={isClone}
                                                width={1200}
                                                height={1200}
                                                priority={index === 1}
                                            />
                                        ) : (
                                            <video
                                                ref={(element) => {
                                                    videoRefs.current[index] = element;
                                                }}
                                                src={slide.src}
                                                aria-label={isClone ? undefined : slide.alt}
                                                aria-hidden={isClone}
                                                muted
                                                playsInline
                                                loop
                                                preload="metadata"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="product-preview-main-controls">
                            <button type="button" aria-label="Previous slide" onClick={showPreviousSlide}>
                                <ChevronLeft aria-hidden="true" />
                            </button>
                            <button type="button" aria-label="Next slide" onClick={showNextSlide}>
                                <ChevronRight aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                    <div className="product-preview-small" ref={thumbnailStripRef}>
                        {standardSlides.map((slide, index) => (
                            <button
                                ref={(element) => {
                                    thumbnailRefs.current[index] = element;
                                }}
                                type="button"
                                className={`product-preview-thumbnail${selectedSlide === index ? " is-selected" : ""}`}
                                key={slide.src}
                                aria-label={`Show Standard ${slide.type === "video" ? "video" : "image"} ${index + 1}`}
                                aria-pressed={selectedSlide === index}
                                onClick={() => selectSlide(index)}
                            >
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
                    <div className="standard-product-intro">
                        <h1>LuxPlant Standard</h1>
                        <span className="standard-product-status">Coming Soon</span>
                        <p>
                            The larger LuxPlant is in development, with 21 leaves and thicker
                            stems planned for its branches.
                        </p>
                    </div>

                    <div className="product-dropdown-details">
                        <ProductDropdown
                            id="standard-planned-details"
                            title="Planned design"
                            isOpen={openDropdown === "standard-planned-details"}
                            onToggle={() => toggleDropdown("standard-planned-details")}
                        >
                            <ul>
                                <li>21 leaves</li>
                                <li>Thicker stems with different diameters for the branches</li>
                            </ul>
                        </ProductDropdown>
                        <ProductDropdown
                            id="standard-availability"
                            title="Availability"
                            isOpen={openDropdown === "standard-availability"}
                            onToggle={() => toggleDropdown("standard-availability")}
                        >
                            <p className="standard-availability-copy">
                                LuxPlant Standard is still in development. A release date and
                                price have not been announced.
                            </p>
                        </ProductDropdown>
                    </div>
                    <Link href="/product/luxplant-mini" className="link-button-secondary standard-product-link">
                        Explore LuxPlant Mini
                    </Link>
                </div>
            </main>
            <FaqSection />
            <Footer />
        </div>
    );
}