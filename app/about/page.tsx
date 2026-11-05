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
                    <h1>A little light, grown from one small idea.</h1>
                    <p>
                        I wanted to give someone a glowing plant. When I couldn’t find a way to get one here,
                        I decided to try making it myself. That idea became LuxPlant, made and shipped from
                        the Philippines.
                    </p>
                </div>

                <div className="about-story">
                    <div className="about-section-heading">
                        <h2>The gift I couldn’t send</h2>
                    </div>
                    <div className="about-section-copy">
                        <p>
                            The idea began when I wanted to give someone a Fluora LED Plant, but it couldn’t
                            be shipped to the Philippines. Rather than give up on the gift, I started figuring
                            out how to build a glowing plant of my own.
                        </p>
                        <p>
                            I 3D-printed the stems and worked on getting the light to spread softly through
                            each leaf. Light-diffusing filament and addressable RGB LEDs brought the first
                            version to life, with color glowing across the leaves from within.
                        </p>
                    </div>
                </div>

                <div className="about-process">
                    <div>
                        <h2>Learning how to make it glow</h2>
                    </div>
                    <p>
                        The first version was only the beginning. Getting the leaves to glow evenly took
                        trial and error: I tested materials, lighting, stems, and wiring, then redesigned
                        parts whenever something did not work. The LuxPlant Mini grew out of those
                        experiments, and I’m still refining it.
                    </p>
                </div>

                <div className="about-independent">
                    <div className="about-section-heading">
                        <h2>A small project, built with care</h2>
                    </div>
                    <div className="about-section-copy">
                        <p>
                            I make LuxPlant independently in the Philippines, where filament and printing
                            time are expensive. Each purchase helps cover the work behind every plant and
                            supports the development of what comes next.
                        </p>
                    </div>
                </div>

                <div className="about-next">
                    <h2>What I’m working toward</h2>
                    <p>
                        The Mini is not the end of the idea. I’m developing the LuxPlant Standard, a larger
                        plant planned with 21 leaves and thicker stems. It is still in development, and its
                        release date and price have not been announced.
                    </p>
                </div>

                <div className="about-warranty">
                    <h2>And I’ll be here after it arrives</h2>
                    <p>
                        Making each plant is personal, and looking after it should be too. Every LuxPlant Mini
                        comes with an 18-month warranty. If something breaks, I replace it, no questions
                        asked. Repairs remain free even after the warranty expires.
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
