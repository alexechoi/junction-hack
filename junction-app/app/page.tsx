import { Demo } from "@/components/landing/Demo";
import { Hero } from "@/components/landing/Hero";
import { LandingFooter } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="bg-zinc-950 text-white">
      <Hero />
      <Demo />
      <LandingFooter />
    </main>
  );
}
