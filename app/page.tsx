"use client";

import "../public/css/landing-page.css";
import "../public/css/navigation.css";
import "../public/css/footer.css";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, MoveUpRight } from "lucide-react";
import { useState } from "react";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import FaqSection from "./components/FaqSection";

export default function Home() {
    const [isHeroTextVisible, setIsHeroTextVisible] = useState(true);

    function toggleHeroText() {
        setIsHeroTextVisible((visible) => !visible);
    }

    return (
        <div className="landing-page">
            <main className="landing-page-main">
                <Navigation transparentAtTop />
                <div className={`hero${!isHeroTextVisible ? " hero-text-hidden" : ""}`}>
                    <video src="/assets/landing-page.mp4" autoPlay loop muted playsInline />
                    <div className="hero-text">
                        <div className="hero-text-entrance">
                            <h1>A plant that grows in color, powered by light</h1>
                            <p>LuxPlant is a fully 3D-printed LED plant — modular stems, diffused glowing leaves, and full control over every color and animation.</p>
                            <div>
                                <Link href={"/product/luxplant-mini"} className="link-button-primary">Shop Now</Link>
                                <Link href="#story" className="link-button-secondary">Learn More</Link>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="toggle-hero-text"
                        aria-label={isHeroTextVisible ? "Hide hero text" : "Show hero text"}
                        aria-pressed={!isHeroTextVisible}
                        onClick={toggleHeroText}
                    >
                        {isHeroTextVisible ? <EyeOff size={24} aria-hidden="true" /> : <Eye size={24} aria-hidden="true" />}
                    </button>
                </div>
                <section id="story" className="text-image-section landing-page-section landing-page-section-secondary">
                    <div className="section-text">
                        <h1>Built out of a shipping problem</h1>
                        <p>This started as a gift — a Fluora LED Plant that couldn't ship to my country. 
                            So I built one myself instead. Every stem is 3D-printed, every leaf is tuned for even light diffusion
                        </p>
                        <Link href={"/about"} className="link-button-primary">Read the full story</Link>
                    </div>
                    <div className="section-img">
                        <div className="image-placeholder">
                            <Image src={"/assets/plants/plant-3.png"} width={400} height={400} alt="LuxPlant Image"></Image>
                        </div>
                    </div>
                </section>
                <section className="center-section landing-page-section">
                    <div className="section-text">
                        <h1>Gallery</h1>
                        <p>Every LuxPlant glows a little differently. Here’s how it looks in real spaces.</p>
                    </div>
                    <div className="gallery-preview">
                        <div>
                            <div className="gallery-image">
                                <Image src="/assets/plants/plant-1.png" width={400} height={400} alt="LuxPlant Gallery Image 1" />
                            </div>
                            <div className="gallery-image">
                                <Image src="/assets/plants/plant-5.png" width={400} height={400} alt="LuxPlant Gallery Image 5" />
                            </div>
                        </div>
                        <div>
                            <div className="gallery-image">
                                <Image src="/assets/plants/plant-2.png" width={400} height={400} alt="LuxPlant Gallery Image 2" />
                            </div>
                            <div className="gallery-image">
                                <Image src="/assets/plants/plant-4.png" width={400} height={400} alt="LuxPlant Gallery Image 4" />
                            </div>
                        </div>
                        <div>
                            <div className="gallery-image">
                                <Image src="/assets/plants/plant-3.png" width={400} height={400} alt="LuxPlant Gallery Image 3" />
                            </div>
                            <div className="gallery-image">
                                <Image src="/assets/plants/plant-6.png" width={400} height={400} alt="LuxPlant Gallery Image 6" />
                            </div>
                        </div>
                    </div>
                    <Link href="/gallery" className="link-button-primary">View Full Gallery</Link>
                </section>
                <section className="center-section landing-page-section landing-page-section-secondary">
                    <div className="section-text">
                        <h1>Two plants, one system - pick the one that fits your space</h1>
                    </div>
                    <div className="product-preview">
                        <Link href={"/product/luxplant-mini"} className="image-placeholder" id="luxplant-mini">
                            <Image src="/assets/plants/luxplant-mini-primary-1.jpeg" width={400} height={400} alt="LuxPlant Mini" />
                            <div className="product-name">
                                <h2>LuxPlant Mini</h2>
                                <div className="icon circle"><MoveUpRight size={24} /></div>
                            </div>
                        </Link>
                        <Link href="/product/luxplant-standard" className="image-placeholder" id="luxplant-standard">
                            <Image src="/assets/plants/luxplant-standard-main.jpeg" width={400} height={400} alt="LuxPlant Standard" />
                            <div className="product-name">
                                <h2>LuxPlant Standard</h2>
                                <div className="icon circle"><MoveUpRight size={24} /></div>
                        </div>
                        </Link>
                    </div>
                </section>
                <section className="center-section landing-page-section">
                    <div className="section-text">
                        <h1>Built by one person, shaped by everyone who's tried it</h1>
                    </div>
                    <div className="testimonial-preview">
                        <div className="testimonial-card">
                            <div className="customer">
                                <Image src={"/assets/customer-testimonial/darwin.webp"} alt="darwin" width={1000} height={1000}></Image>
                            </div>
                            <p>“Very helpful seller. Product is as advertised, easy to program, good for an alternative kind of ambient lighting that you might not see anywhere.”</p>
                            <div>
                                <b>Darwin Nathaniel Chua</b>
                                <p>LuxPlant Customer</p>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="customer">
                                <Image src={"/assets/customer-testimonial/nerrie.jpg"} alt="jpg" width={1000} height={1000}></Image>
                            </div>
                            <p>“Honestly, so beautiful. The pink glow melts right into my pink room, and the leaves look even softer in person. It feels like part of the room, not just a lamp. Thank you so much!”</p>
                            <div>
                                <b>Nerrie Lour Monsale </b>
                                <p>LuxPlant Customer</p>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="customer">
                                <Image src={"/assets/customer-testimonial/discord-guy.jpg"} alt="jpg" width={1000} height={1000}></Image>
                            </div>
                            <p>“Big hit with the kids. We had a family party and the kids spent an hour running back and forth between the flower pot. The adults were also impressed, but didn't do as much running.”</p>
                            <div>
                                <b>Thom</b>
                                <p>LuxPlant Customer</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="text-image-section landing-page-section landing-page-section-secondary app-promo-section">
                    <div className="section-img">
                        <Image src={"/assets/AppMockup-2.webp"} width={3200} height={2400} alt="Preview of the LuxPlant app" unoptimized></Image>
                    </div>
                    <div className="section-text">
                        <h1>Your plant, controlled from your pocket</h1>
                        <p>The LuxPlant app wraps WLED's API into a simpler interface built just for the plant — colors, brightness, effects, and schedules in one place.</p>
                        <Link href="/app" className="link-button-primary">Explore the App</Link>
                    </div>
                </section>
                <FaqSection />
                <section className="center-section landing-page-section landing-page-section-secondary" style={{ justifyContent: "center"}}>
                    <div className="section-text">
                        <h1>Ready to bring your own LuxPlant to life?</h1>
                        <p>Bring home a ready-to-enjoy LuxPlant with glowing leaves, customizable colors, and app-based control. Choose the plant that fits your space and make it your own.</p>
                    </div>
                    <Link href={"/product/luxplant-mini"} className="link-button-primary" style={{ width: "600px" }}>Buy Now</Link>
                </section>
                <Footer />
            </main>
        </div>
    );
}
