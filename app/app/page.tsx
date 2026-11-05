import Image from "next/image";
import Link from "next/link";
import { CalendarClock, Palette, Play, Power, Sparkles } from "lucide-react";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import "../../public/css/app-info.css";
import Footer from "../components/Footer";
import Navigation from "../components/Navigation";

const appFeatures = [
    {
        className: "app-info-direct",
        icon: Power,
        title: "Direct control",
        description: "Turn your plant on or off, adjust brightness, and choose a color.",
    },
    {
        className: "app-info-effects",
        icon: Sparkles,
        title: "Effects library",
        description: "Choose from built-in animated effects to change the feel of your space.",
    },
    {
        className: "app-info-schedules",
        icon: CalendarClock,
        title: "Schedules",
        description: "Set your plant to turn on and off automatically at the times you choose.",
    },
    {
        className: "app-info-palettes",
        icon: Palette,
        title: "Presets and palettes",
        description: "Explore the pre-installed light presets and palettes to find a look you like.",
    },
    {
        className: "app-info-playlist",
        icon: Play,
        title: "All effects playlist",
        description: "Let the playlist cycle through the plant's built-in light effects.",
    },
];

export default function AppPage() {
    return (
        <div className="app-info-layout">
            <Navigation />
            <main className="app-info-main">
                <section className="app-info-hero">
                    <h1>LuxPlant App</h1>
                    <p>
                        One app, full control: every color, effect, and schedule for your plant.
                        No separate lighting interface required.
                    </p>
                    <div className="app-info-actions">
                        <Link href="/controller" className="link-button-primary">
                            Open the Controller
                        </Link>
                        <Link href="#features" className="link-button-secondary">
                            Learn More
                        </Link>
                    </div>
                    <div className="app-info-hero-image">
                        <Image
                            src="/assets/AppMockup-2.webp"
                            alt="LuxPlant app screens for controlling leaves, colors, palettes, presets, and effects"
                            width={3200}
                            height={2400}
                            unoptimized
                            priority
                        />
                    </div>
                </section>

                <section className="app-info-features" id="features">
                    <div className="app-info-section-heading">
                        <h2>Everything your plant needs, in one place</h2>
                        <p>
                            From everyday color and brightness control to schedules and light effects,
                            here&apos;s what you can do with the LuxPlant app.
                        </p>
                    </div>
                    <div className="app-info-feature-grid">
                        <div className="app-info-feature-stack">
                            {appFeatures.slice(0, 1).map(({ icon: Icon, title, description }) => (
                                <article className="app-info-feature-card" key={title}>
                                    <Icon size={28} aria-hidden="true" />
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </article>
                            ))}
                            {appFeatures.slice(2, 3).map(({ icon: Icon, title, description }) => (
                                <article className="app-info-feature-card" key={title}>
                                    <Icon size={28} aria-hidden="true" />
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </article>
                            ))}
                        </div>
                        <div className="app-info-feature-center">
                            <div className="app-info-feature-phone">
                                <Image
                                    src="/assets/AppMockup-3.webp"
                                    alt="LuxPlant app color controls with a color wheel and brightness adjustment"
                                    width={2400}
                                    height={2400}
                                    unoptimized
                                />
                            </div>
                            {appFeatures.slice(4).map(({ icon: Icon, title, description }) => (
                                <article className="app-info-feature-card" key={title}>
                                    <Icon size={28} aria-hidden="true" />
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </article>
                            ))}
                        </div>
                        <div className="app-info-feature-stack">
                            {appFeatures.slice(1, 2).map(({ icon: Icon, title, description }) => (
                                <article className="app-info-feature-card" key={title}>
                                    <Icon size={28} aria-hidden="true" />
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </article>
                            ))}
                            {appFeatures.slice(3, 4).map(({ icon: Icon, title, description }) => (
                                <article className="app-info-feature-card" key={title}>
                                    <Icon size={28} aria-hidden="true" />
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
