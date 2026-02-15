"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { Observer } from "gsap/all";
import VideoBackground from "@/components/VideoBackground";
import LiquidTitle from "@/components/LiquidTitle";
import DraggableCard from "@/components/DraggableCard";

import TextSlide from "@/components/TextSlide";
import FloatingCards from "@/components/FloatingCards";
import IntroSection from "@/components/IntroSection";
import StatementSection from "@/components/StatementSection";
import DraggableSliderSection from "@/components/DraggableSliderSection";
import ThreeWorksSection from "@/components/ThreeWorksSection";
import ExplorationSlideshow from "@/components/ExplorationSlideshow";
import HeroSection from "@/components/HeroSection";
import MethodologySection from "@/components/MethodologySection";
import ClosingSection from "@/components/ClosingSection";
import CreditsSection from "@/components/CreditsSection";

// ...


import RoundVideoCard from "@/components/RoundVideoCard";
import { motion } from "framer-motion";

// Register Plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const constraintsRef = useRef(null);

  // Refs for GSAP
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]); // The "bg" elements
  const outerWrappersRef = useRef<(HTMLDivElement | null)[]>([]);
  const innerWrappersRef = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize refs array
  const addToRefs = (el: any, refArray: React.MutableRefObject<any[]>) => {
    if (el && !refArray.current.includes(el)) {
      refArray.current.push(el);
    }
  };

  const animatingRef = useRef(false);

  const gotoSection = useCallback((index: number, direction: number) => {
    const sections = sectionsRef.current;
    const images = imagesRef.current;
    const outerWrappers = outerWrappersRef.current;
    const innerWrappers = innerWrappersRef.current;

    // Wrap index
    if (index < 0) index = sections.length - 1;
    if (index >= sections.length) index = 0;

    if (animatingRef.current) return;
    animatingRef.current = true;
    setIsAnimating(true);

    let fromTop = direction === -1,
      dFactor = fromTop ? -1 : 1,
      tl = gsap.timeline({
        defaults: { duration: 1.25, ease: "power1.inOut" },
        onComplete: () => {
          animatingRef.current = false;
          setIsAnimating(false);
        }
      });

    // Animate OUT previous
    // We need to know previous index. We can track it in a ref or use state (but state might be stale in callback if not in dependency?)
    // `currentIndex` from state might be stale if not in deps.
    // Better to pass `currentIndex` or track `currentIndexRef`.
    // Let's use a ref for current index to be safe with Observer.
    // However, `currentIndex` state is used for rendering.
    // For now, let's rely on the passed index if we track "current" globally?
    // Actually, `gotoSection` needs to know "from where".
    // Let's add `currentIndexRef`.
  }, []);

  // Wait, I need to implement `currentIndexRef` to make this robust without re-creating the callback.
  const currentIndexRef = useRef(0);

  // Re-implement gotoSection with Refs
  const navigateTo = useCallback((index: number, direction: number) => {
    const sections = sectionsRef.current;
    const images = imagesRef.current;
    const outerWrappers = outerWrappersRef.current;
    const innerWrappers = innerWrappersRef.current;

    let currentIdx = currentIndexRef.current;

    // Bounds check (No wrapping)
    if (index < 0 || index >= sections.length) return;

    if (animatingRef.current) return;
    animatingRef.current = true;
    setIsAnimating(true);

    let dFactor = direction === -1 ? -1 : 1;

    const tl = gsap.timeline({
      defaults: { duration: 1.25, ease: "power1.inOut" },
      onComplete: () => {
        animatingRef.current = false;
        setIsAnimating(false);
      }
    });

    if (currentIdx >= 0 && sections[currentIdx]) {
      gsap.set(sections[currentIdx], { zIndex: 0 });
      tl.to(images[currentIdx], { yPercent: -15 * dFactor })
        .set(sections[currentIdx], { autoAlpha: 0 });
    }

    if (sections[index]) {
      gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
      tl.fromTo([outerWrappers[index], innerWrappers[index]], {
        yPercent: i => i ? -100 * dFactor : 100 * dFactor
      }, { yPercent: 0 }, 0)
        .fromTo(images[index], { yPercent: 15 * dFactor }, { yPercent: 0 }, 0);
    }

    currentIndexRef.current = index;
    setCurrentIndex(index);
  }, []);

  useEffect(() => {
    const sections = sectionsRef.current;
    const images = imagesRef.current;
    const outerWrappers = outerWrappersRef.current;
    const innerWrappers = innerWrappersRef.current;

    // Initial Setup
    gsap.set(outerWrappers, { yPercent: 100 });
    gsap.set(innerWrappers, { yPercent: -100 });

    // Set first section active
    gsap.set(sections[0], { autoAlpha: 1, zIndex: 1 });
    gsap.set([outerWrappers[0], innerWrappers[0]], { yPercent: 0 });
    gsap.set(images[0], { yPercent: 0 });

    // Sections that handle their own scroll/wheel navigation internally
    // These use Lenis + ScrollTrigger or custom wheel handlers
    const selfScrollingSections = new Set([2, 3, 4, 5, 6, 7, 8, 9]); // IntroSection, StatementSection, DraggableSlider, ThreeWorks, ExplorationSlideshow, Methodology, Closing, Credits

    // Initialize Observer
    Observer.create({
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      onDown: (e) => {
        if (selfScrollingSections.has(currentIndexRef.current)) return;
        // Don't navigate when dragging cards or interacting with no-swipe elements
        if ((e.event?.target as HTMLElement)?.closest?.('.no-swipe')) return;
        navigateTo(currentIndexRef.current - 1, -1);
      },
      onUp: (e) => {
        if (selfScrollingSections.has(currentIndexRef.current)) return;
        if ((e.event?.target as HTMLElement)?.closest?.('.no-swipe')) return;
        navigateTo(currentIndexRef.current + 1, 1);
      },
      tolerance: 10,
      preventDefault: false
    });

    return () => {
      Observer.getAll().forEach(o => o.kill());
    };
  }, [navigateTo]); // navigateTo is stable via useCallback

  const [constraints, setConstraints] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

  useEffect(() => {
    const updateConstraints = () => {
      setConstraints({
        left: -window.innerWidth / 2,
        right: window.innerWidth / 2,
        top: -window.innerHeight / 2,
        bottom: window.innerHeight / 2
      });
    };
    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  // Data for the sections to map? Or manual? 
  // Manual gives more control over content types (props, structure).

  return (
    <main className="fixed w-full h-dvh-safe bg-black overflow-hidden selection:bg-white selection:text-black">
      {/* Global Video Background if it persists across all sections? 
            The swipe effect covers everything. 
            If text slide needs a black bg, it will cover the video.
            If we want video visible on Hero only, put it in Hero.
        */}

      {/* -------------------- SECTION 1: HERO -------------------- */}
      <section
        ref={(el) => { if (el) sectionsRef.current[0] = el; }}
        className="fixed top-0 left-0 w-full h-full invisible z-0"
      >
        <div ref={(el) => { if (el) outerWrappersRef.current[0] = el; }} className="outer w-full h-full overflow-hidden">
          <div ref={(el) => { if (el) innerWrappersRef.current[0] = el; }} className="inner w-full h-full overflow-hidden">
            <div ref={(el) => { if (el) imagesRef.current[0] = el; }} className="bg w-full h-full absolute top-0 left-0 bg-black flex flex-col items-center justify-center">
              <HeroSection isActive={currentIndex === 0} />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- SECTION 2: TEXT SLIDE -------------------- */}
      <section
        ref={(el) => { if (el) sectionsRef.current[1] = el; }}
        className="fixed top-0 left-0 w-full h-full invisible z-0"
      >
        <div ref={(el) => { if (el) outerWrappersRef.current[1] = el; }} className="outer w-full h-full overflow-hidden">
          <div ref={(el) => { if (el) innerWrappersRef.current[1] = el; }} className="inner w-full h-full overflow-hidden">
            <div ref={(el) => { if (el) imagesRef.current[1] = el; }} className="bg w-full h-full absolute top-0 left-0 bg-black flex flex-col items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                {/* Force TextSlide to be fully centered and contained */}
                <div className="w-full relative">
                  <TextSlide />

                  {/* Floating Gaudi Cards - Draggable & Resizable */}
                  <FloatingCards variant="standard" constraintsRef={constraintsRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- SECTION 3: INTRO (Split Layout) -------------------- */}
      <section
        ref={(el) => { if (el) sectionsRef.current[2] = el; }}
        className="fixed top-0 left-0 w-full h-full invisible z-0"
      >
        <div ref={(el) => { if (el) outerWrappersRef.current[2] = el; }} className="outer w-full h-full overflow-hidden">
          <div ref={(el) => { if (el) innerWrappersRef.current[2] = el; }} className="inner w-full h-full overflow-hidden">
            <div ref={(el) => { if (el) imagesRef.current[2] = el; }} className="bg w-full h-full absolute top-0 left-0 flex flex-col items-center justify-center">
              <IntroSection
                isActive={currentIndex === 2}
                onComplete={() => !isAnimating && navigateTo(3, 1)}
                onReverse={() => !isAnimating && navigateTo(1, -1)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- SECTION 4: STATEMENT (Scrollable) -------------------- */}
      <section
        ref={(el) => { if (el) sectionsRef.current[3] = el; }}
        className="fixed top-0 left-0 w-full h-full invisible z-0"
      >
        <div ref={(el) => { if (el) outerWrappersRef.current[3] = el; }} className="outer w-full h-full overflow-hidden">
          <div ref={(el) => { if (el) innerWrappersRef.current[3] = el; }} className="inner w-full h-full overflow-hidden">
            <div ref={(el) => { if (el) imagesRef.current[3] = el; }} className="bg w-full h-full absolute top-0 left-0 bg-black flex flex-col items-center justify-center">
              <StatementSection
                isActive={currentIndex === 3}
                onComplete={() => !isAnimating && navigateTo(4, 1)}
                onReverse={() => !isAnimating && navigateTo(2, -1)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- SECTION 5: INTERACTIVE TABS -------------------- */}
      <section
        ref={(el) => { if (el) sectionsRef.current[4] = el; }}
        className="fixed top-0 left-0 w-full h-full invisible z-0"
      >
        <div ref={(el) => { if (el) outerWrappersRef.current[4] = el; }} className="outer w-full h-full overflow-hidden">
          <div ref={(el) => { if (el) innerWrappersRef.current[4] = el; }} className="inner w-full h-full overflow-hidden">
            <div ref={(el) => { if (el) imagesRef.current[4] = el; }} className="bg w-full h-full absolute top-0 left-0 bg-black flex flex-col items-center justify-center">
              <DraggableSliderSection
                isActive={currentIndex === 4}
                onReverse={() => !isAnimating && navigateTo(3, -1)}
                onNext={() => !isAnimating && navigateTo(5, 1)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- SECTION 6: THREE WORKS -------------------- */}
      <section
        ref={(el) => { if (el) sectionsRef.current[5] = el; }}
        className="fixed top-0 left-0 w-full h-full invisible z-0"
      >
        <div ref={(el) => { if (el) outerWrappersRef.current[5] = el; }} className="outer w-full h-full overflow-hidden">
          <div ref={(el) => { if (el) innerWrappersRef.current[5] = el; }} className="inner w-full h-full overflow-hidden">
            <div ref={(el) => { if (el) imagesRef.current[5] = el; }} className="bg w-full h-full absolute top-0 left-0 bg-black flex flex-col items-center justify-center">
              <ThreeWorksSection
                isActive={currentIndex === 5}
                onReverse={() => !isAnimating && navigateTo(4, -1)}
                onNext={() => !isAnimating && navigateTo(6, 1)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- SECTION 7: EXPLORATION SLIDESHOW -------------------- */}
      <section
        ref={(el) => { if (el) sectionsRef.current[6] = el; }}
        className="fixed top-0 left-0 w-full h-full invisible z-0"
      >
        <div ref={(el) => { if (el) outerWrappersRef.current[6] = el; }} className="outer w-full h-full overflow-hidden">
          <div ref={(el) => { if (el) innerWrappersRef.current[6] = el; }} className="inner w-full h-full overflow-hidden">
            <div ref={(el) => { if (el) imagesRef.current[6] = el; }} className="bg w-full h-full absolute top-0 left-0 bg-black flex flex-col items-center justify-center">
              <ExplorationSlideshow
                isActive={currentIndex === 6}
                onReverse={() => !isAnimating && navigateTo(5, -1)}
                onNext={() => !isAnimating && navigateTo(7, 1)} // Exploration usually has scrolling, but here it's navigating to 7 (Methodology)
              />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- SECTION 8: METHODOLOGY (Bento Grid) -------------------- */}
      <section
        ref={(el) => { if (el) sectionsRef.current[7] = el; }}
        className="fixed top-0 left-0 w-full h-full invisible z-0"
      >
        <div ref={(el) => { if (el) outerWrappersRef.current[7] = el; }} className="outer w-full h-full overflow-hidden">
          <div ref={(el) => { if (el) innerWrappersRef.current[7] = el; }} className="inner w-full h-full overflow-hidden">
            {/* No 'bg-black' here because the component has its own styling/transparency? 
                 Actually MethodologySection has transparent parts. We need a background. 
                 Let's use the black background. */}
            <div ref={(el) => { if (el) imagesRef.current[7] = el; }} className="bg w-full h-full absolute top-0 left-0 bg-black flex flex-col items-center justify-center">
              <MethodologySection
                isActive={currentIndex === 7}
                onComplete={() => !isAnimating && navigateTo(8, 1)}
                onReverse={() => !isAnimating && navigateTo(6, -1)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- SECTION 9: CLOSING -------------------- */}
      <section
        ref={(el) => { if (el) sectionsRef.current[8] = el; }}
        className="fixed top-0 left-0 w-full h-full invisible z-0"
      >
        <div ref={(el) => { if (el) outerWrappersRef.current[8] = el; }} className="outer w-full h-full overflow-hidden">
          <div ref={(el) => { if (el) innerWrappersRef.current[8] = el; }} className="inner w-full h-full overflow-hidden">
            <div ref={(el) => { if (el) imagesRef.current[8] = el; }} className="bg w-full h-full absolute top-0 left-0 bg-black flex flex-col items-center justify-center">
              <ClosingSection
                isActive={currentIndex === 8}
                onComplete={() => !isAnimating && navigateTo(9, 1)}
                onReverse={() => !isAnimating && navigateTo(7, -1)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- SECTION 10: CREDITS -------------------- */}
      <section
        ref={(el) => { if (el) sectionsRef.current[9] = el; }}
        className="fixed top-0 left-0 w-full h-full invisible z-0"
      >
        <div ref={(el) => { if (el) outerWrappersRef.current[9] = el; }} className="outer w-full h-full overflow-hidden">
          <div ref={(el) => { if (el) innerWrappersRef.current[9] = el; }} className="inner w-full h-full overflow-hidden">
            <div ref={(el) => { if (el) imagesRef.current[9] = el; }} className="bg w-full h-full absolute top-0 left-0 bg-black flex flex-col items-center justify-center">
              <CreditsSection
                isActive={currentIndex === 9}
                onReverse={() => !isAnimating && navigateTo(8, -1)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- BACK TO TOP BUTTON -------------------- */}
      {currentIndex > 0 && (
        <button
          onClick={() => !isAnimating && navigateTo(0, -1)}
          className="no-swipe fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 group flex items-center gap-3 cursor-pointer"
          aria-label="Volver al inicio"
        >
          <span className="w-px h-8 bg-white/20 group-hover:bg-white/50 group-hover:h-10 transition-all duration-300" />
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/25 group-hover:text-white/60 transition-colors duration-300">
            Inicio
          </span>
        </button>
      )}

    </main >
  );
}
