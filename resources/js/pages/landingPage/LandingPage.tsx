import About from './About';
import FAQ from './FAQ';
import Features from './Features';
import Footer from './Footer';
import Hero from './Hero';
import Navbar from './Navbar';
import Stats from './Stats';

export default function LandingPage() {
    return (
        <div className="bg-background text-foreground min-h-screen antialiased">
            <Navbar />
            <main className="flex flex-col">
                <Hero />
                <About />
                <Features />
                <Stats />
                <FAQ />
            </main>
            <Footer />
        </div>
    );
}
