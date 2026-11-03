import "../../public/css/landing-page.css";
import "../../public/css/navigation.css";
import "../../public/css/footer.css";
import "../../public/css/gallery.css";
import Image from "next/image";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import FaqSection from "../components/FaqSection";

const galleryColumns = [
    [1, 4, 7, 10],
    [2, 5, 8, 11],
    [3, 6, 9],
];

export default function GalleryPage() {
    return (
        <div className="gallery-page-layout">
            <Navigation />
            <main className="gallery-page-main">
                <div className="center-section gallery-page-section">
                    <div className="section-text">
                        <h1>Gallery</h1>
                        <p>Every LuxPlant glows a little differently. Here’s how it looks in real spaces.</p>
                    </div>
                    <div className="gallery-preview">
                        {galleryColumns.map((column, columnIndex) => (
                            <div key={columnIndex}>
                                {column.map((photoNumber) => {
                                    const extension = photoNumber <= 8 ? "png" : "jpg";
                                    return (
                                        <Image
                                            key={photoNumber}
                                            src={`/assets/plants/plant-${photoNumber}.${extension}`}
                                            width={400}
                                            height={400}
                                            alt={`LuxPlant gallery photo ${photoNumber}`}
                                            priority={photoNumber <= 3}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <FaqSection />
            <Footer />
        </div>
    );
}
