import "../public/css/landing-page.css";
import "../public/css/navigation.css";
import "../public/css/footer.css";
import Link from "next/link";
import Image from "next/image";
import {MoveUpRight} from "lucide-react"
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import FaqSection from "./components/FaqSection";

export default function Home() {
    return (
        <div>
            <main>
                <Navigation transparentAtTop />
                <div className="hero">
                    <video src="/assets/landing-page.mp4" autoPlay loop muted playsInline />
                    <div className="hero-text">
                        <h1>A plant that grows in color, powered by light</h1>
                        <p>LuxPlant is a fully 3D-printed LED plant — modular stems, diffused glowing leaves, and full control over every color and animation.</p>
                        <div>
                            <Link href={"/"} className="link-button-primary">Get Started</Link>
                            <Link href={"/"} className="link-button-secondary">Learn More</Link>
                        </div>
                    </div>
                </div>
                <section className="text-image-section">
                    <div className="section-text">
                        <h1>Built out of a shipping problem</h1>
                        <p>This started as a gift — a Fluora LED Plant that couldn't ship to my country. 
                            So I built one myself instead. Every stem is 3D-printed, every leaf is tuned for even light diffusion
                        </p>
                        <Link href={"/"} className="link-button-primary">Read the full story</Link>
                    </div>
                    <div className="section-img">
                        <div className="image-placeholder"></div>
                    </div>
                </section>
                <section className="center-section">
                    <div className="section-text">
                        <h1>Gallery</h1>
                        <p>Every LuxPlant glows a little differently. Here’s how it looks in real spaces.</p>
                    </div>
                    <div className="gallery-preview">
                        <div>
                            <Image src="/assets/plants/plant-1.png" width={400} height={400} alt="LuxPlant Gallery Image 1" />
                            <Image src="/assets/plants/plant-5.png" width={400} height={400} alt="LuxPlant Gallery Image 5" />
                        </div>
                        <div>
                            <Image src="/assets/plants/plant-2.png" width={400} height={400} alt="LuxPlant Gallery Image 2" />
                            <Image src="/assets/plants/plant-4.png" width={400} height={400} alt="LuxPlant Gallery Image 4" />
                        </div>
                        <div>
                            <Image src="/assets/plants/plant-3.png" width={400} height={400} alt="LuxPlant Gallery Image 3" />
                            <Image src="/assets/plants/plant-6.png" width={400} height={400} alt="LuxPlant Gallery Image 6" />
                        </div>
                    </div>
                    <Link href="/gallery" className="link-button-primary">View Full Gallery</Link>
                </section>
                <section className="center-section">
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
                <section className="center-section">
                    <div className="section-text">
                        <h1>Built by one person, shaped by everyone who's tried it</h1>
                    </div>
                    <div className="testimonial-preview">
                        <div className="testimonial-card">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna</p>
                            <div>
                                <b>Clarence Jerald G. Luna</b>
                                <p>LuxPlant Maker</p>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna</p>
                            <div>
                                <b>Kevenly H. Luistro</b>
                                <p>LuxPlant Maker</p>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna</p>
                            <div>
                                <b>Christian Patrick T. Panti</b>
                                <p>LuxPlant Maker</p>
                            </div>
                        </div>
                    </div>
                </section>
                <section className="text-image-section">
                    <div className="section-img">
                        <div className="image-placeholder"></div>
                    </div>
                    <div className="section-text">
                        <h1>Your plant, controlled from your pocket</h1>
                        <p>The LuxPlant app wraps WLED's API into a simpler interface built just for the plant — colors, brightness, effects, and schedules in one place.</p>
                        <Link href={"/"} className="link-button-primary">Download the App</Link>
                    </div>
                </section>
                <FaqSection />
                <section className="center-section" style={{ justifyContent: "center"}}>
                    <div className="section-text">
                        <h1>Ready to bring your own LuxPlant to life?</h1>
                        <p>Bring home a ready-to-enjoy LuxPlant with glowing leaves, customizable colors, and app-based control. Choose the plant that fits your space and make it your own.</p>
                    </div>
                    <Link href={"/"} className="link-button-primary" style={{ width: "600px" }}>Get Started</Link>
                </section>
                <Footer />
            </main>
        </div>
    );
}
