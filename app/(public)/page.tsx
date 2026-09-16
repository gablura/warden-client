import { Hero } from "@/features/landing/components/Hero";
import { Stats } from "@/features/landing/components/Stats";
import { Problem } from "@/features/landing/components/Problem";
import { Features } from "@/features/landing/components/Features";
import { HowItWorks } from "@/features/landing/components/HowItWorks";
import { Trust } from "@/features/landing/components/Trust";
import { Cta } from "@/features/landing/components/Cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Problem />
      <Features />
      <HowItWorks />
      <Trust />
      <Cta />
    </>
  );
}
