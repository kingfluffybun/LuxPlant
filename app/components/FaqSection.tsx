"use client";

import { useState } from "react";
import ProductDropdown from "../product/luxplant-mini/ProductDropdown";

const faqItems = [
    {
        id: "mini",
        title: "What is the LuxPlant Mini?",
        content: (
            <p>
                The LuxPlant Mini is a 3D-printed artificial plant lit from the inside by addressable RGB LEDs.
                Each leaf is printed in light-diffusing filament, so it can glow in any color and run animated
                light effects. Every unit is made and shipped from the Philippines.
            </p>
        ),
    },
    {
        id: "size",
        title: "How big is it, and can I adjust it?",
        content: (
            <p>
                The LuxPlant Mini stands 20 inches tall and sits in a 14 cm pot. It has 9 leaves, and the leaves
                and stem sections can be rotated to any angle, so you can shape the plant to suit your space.
            </p>
        ),
    },
    {
        id: "lighting",
        title: "How do I control the lighting?",
        content: (
            <>
                <p>
                    Control colors through the LuxPlant mobile app. The plant supports 16 million colors and
                    comes with 30 light presets, plus an &quot;All effects&quot; playlist.
                </p>
                <p>
                    It also runs on an automatic schedule. By default, it turns off at midnight and back on at
                    8 AM. You can change these times in the settings.
                </p>
            </>
        ),
    },
    {
        id: "price",
        title: "How much does it cost, and are there discounts?",
        content: (
            <p>
                The LuxPlant Mini is ₱3,500, with one fixed configuration. Delivery is ₱100. Orders of 2 or
                more plants receive 10% off and free shipping.
            </p>
        ),
    },
    {
        id: "payment",
        title: "What payment methods do you accept, and how does payment work?",
        content: (
            <>
                <p>We accept bank transfer via MariBank, GCash, PayPal, and cash on delivery.</p>
                <p>
                    For bank transfer, GCash, and PayPal, place your order first. You will then receive the
                    payment details or a QR code, your exact total, and your order number. After paying, upload
                    a screenshot as proof. Your order proceeds once payment is verified.
                </p>
                <p>For cash on delivery, pay the courier when your order arrives.</p>
            </>
        ),
    },
    {
        id: "delivery",
        title: "Where do you deliver, and how long does it take?",
        content: (
            <p>
                We currently deliver within the Philippines. Orders are processed in about 1 to 2 days before
                they ship. We plan to expand to Indonesia and Malaysia, but no dates have been announced.
            </p>
        ),
    },
    {
        id: "warranty",
        title: "What does the warranty cover?",
        content: (
            <p>
                Every LuxPlant Mini comes with an 18-month warranty. If something breaks during that period,
                it is replaced, no questions asked. Repairs remain free after the warranty expires.
            </p>
        ),
    },
    {
        id: "standard",
        title: "Will there be a larger LuxPlant?",
        content: (
            <p>
                Yes. LuxPlant Standard is in development, with 21 leaves and thicker stems planned for its
                branches. No release date or price has been announced.
            </p>
        ),
    },
];

export default function FaqSection() {
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    return (
        <div className="faq-section">
            <div className="section-text">
                <h1>Frequently Asked Questions</h1>
                <p>Helpful details about LuxPlant, ordering, delivery, and support.</p>
            </div>
            <div className="product-dropdown-details faq-accordion">
                {faqItems.map((item) => (
                    <ProductDropdown
                        key={item.id}
                        id={`faq-${item.id}`}
                        title={item.title}
                        isOpen={openFaq === item.id}
                        onToggle={() => setOpenFaq((current) => current === item.id ? null : item.id)}
                    >
                        {item.content}
                    </ProductDropdown>
                ))}
            </div>
        </div>
    );
}
