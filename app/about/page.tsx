import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import "../../public/css/about.css";
import Link from "next/link";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

export default function AboutPage() {
    return (
        <div className="about-page-layout">
            <Navigation />
            <main className="about-page-main">
                <div className="about-intro">
                    <h1>A little light, grown from an idea.</h1>
                    <p>
                        LuxPlant makes 3D-printed plants that glow from the inside in any color you choose.
                        Each unit is made and shipped from the Philippines.
                    </p>
                </div>

                <div className="about-story">
                    <div className="about-section-heading">
                        <h2>Built out of a shipping problem</h2>
                    </div>
                    <div className="about-section-copy">
                        <p>
                            LuxPlant started as a gift. I wanted to give someone a Fluora LED Plant, but it
                            could not ship to the Philippines. So I built one myself instead.
                        </p>
                        <p>
                            Every stem is 3D-printed, and every leaf is tuned for even light diffusion. Each
                            leaf uses light-diffusing filament and addressable RGB LEDs, creating a smooth glow
                            across the whole leaf.
                        </p>
                    </div>
                </div>

                <div className="about-process">
                    <div>
                        <h2>Getting the light right</h2>
                    </div>
                    <p>
                        Getting a plant to glow evenly took a lot of trial and error. I tested materials,
                        lighting, stems, and wiring, and redesigned parts when something did not work. The
                        plant you see today is the result of that process, and I keep refining it.
                    </p>
                </div>

                <div className="about-independent">
                    <div className="about-section-heading">
                        <h2>Made with care, right here</h2>
                    </div>
                    <div className="about-section-copy">
                        <p>
                            LuxPlant is an independent project. Filament and printing time are expensive here
                            in the Philippines, and every purchase helps cover that. Your support goes directly
                            into developing the next model.
                        </p>
                    </div>
                </div>

                <div className="about-next">
                    <h2>Growing beyond the Mini</h2>
                    <p>
                        I am developing the LuxPlant Standard, a larger plant planned with 21 leaves and
                        sturdier stems. There is no release date or price yet. I also plan to bring LuxPlant
                        to more countries, starting with Indonesia and Malaysia.
                    </p>
                </div>

                <div className="about-warranty">
                    <h2>Support that stays with you</h2>
                    <p>
                        Every LuxPlant Mini has an 18-month warranty. If something breaks, I replace it, no
                        questions asked. Repairs stay free even after the warranty has expired.
                    </p>
                </div>

                <div className="about-cta">
                    <div>
                        <h2>Make room for a little more color.</h2>
                    </div>
                    <Link href="/product/luxplant-mini" className="link-button-primary">
                        Shop the LuxPlant Mini
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
