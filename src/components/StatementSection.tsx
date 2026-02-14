"use client";

import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import NoiseBackground from "./NoiseBackground";
import ScrambleText, { ScrambleTextHandle } from "./ScrambleText";

interface StatementSectionProps {
    isActive: boolean;
    onComplete?: () => void;
    onReverse?: () => void;
}

// Maps each slide index to the range of ScrambleText refs it contains
const SCRAMBLE_RANGES: [number, number][] = [
    [0, 1],    // Slide 0: 2 scrambles
    [2, 6],    // Slide 1: 5 scrambles
    [7, 10],   // Slide 2: 4 scrambles
    [11, 13],  // Slide 3: 3 scrambles
];

const SLIDE_COUNT = SCRAMBLE_RANGES.length;

export default function StatementSection({ isActive, onComplete, onReverse }: StatementSectionProps) {
    const stepRef = useRef(0);
    const animatingRef = useRef(false);
    const cooldownRef = useRef(false);
    const noiseIntensityRef = useRef(0.3);

    const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
    const scrambleRefs = useRef<ScrambleTextHandle[]>([]);

    const onCompleteRef = useRef(onComplete);
    const onReverseRef = useRef(onReverse);
    onCompleteRef.current = onComplete;
    onReverseRef.current = onReverse;

    const addScrambleRef = (ref: ScrambleTextHandle | null) => {
        if (ref && !scrambleRefs.current.includes(ref)) {
            scrambleRefs.current.push(ref);
        }
    };

    const triggerScramble = useCallback((slideIndex: number) => {
        const range = SCRAMBLE_RANGES[slideIndex];
        if (!range) return;
        const [start, end] = range;
        for (let i = start; i <= end; i++) {
            scrambleRefs.current[i]?.play();
        }
    }, []);

    const goToStep = useCallback((newStep: number, direction: 1 | -1) => {
        const oldStep = stepRef.current;
        if (newStep === oldStep || animatingRef.current) return;

        animatingRef.current = true;

        const oldSlide = slidesRef.current[oldStep];
        const newSlide = slidesRef.current[newStep];

        const tl = gsap.timeline({
            onComplete: () => { animatingRef.current = false; },
        });

        // Exit old slide
        if (oldSlide) {
            tl.to(oldSlide, {
                autoAlpha: 0,
                scale: direction > 0 ? 1.04 : 0.96,
                filter: "blur(6px)",
                duration: 0.35,
                ease: "power2.in",
            });
        }

        // Enter new slide
        if (newSlide) {
            tl.fromTo(
                newSlide,
                { autoAlpha: 0, scale: direction > 0 ? 0.96 : 1.04, filter: "blur(6px)" },
                {
                    autoAlpha: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 0.45,
                    ease: "power2.out",
                    onStart: () => {
                        // Scramble only when advancing forward
                        if (direction > 0) triggerScramble(newStep);
                    },
                },
                "-=0.1"
            );
        }

        // Drive noise intensity from progress
        noiseIntensityRef.current = 0.3 + (newStep / (SLIDE_COUNT - 1)) * 0.7;

        stepRef.current = newStep;
    }, [triggerScramble]);

    // Reset on activation
    useEffect(() => {
        if (!isActive) return;

        stepRef.current = 0;
        animatingRef.current = false;
        cooldownRef.current = false;
        noiseIntensityRef.current = 0.3;

        slidesRef.current.forEach((slide, i) => {
            if (!slide) return;
            gsap.set(slide, {
                autoAlpha: i === 0 ? 1 : 0,
                scale: 1,
                filter: "blur(0px)",
            });
        });

        // Trigger first slide's scramble after a short delay
        const timer = setTimeout(() => triggerScramble(0), 150);
        return () => clearTimeout(timer);
    }, [isActive, triggerScramble]);

    // 1 wheel tick = 1 step
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (cooldownRef.current || animatingRef.current) return;

        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, 450);

        if (e.deltaY > 0) {
            if (stepRef.current < SLIDE_COUNT - 1) {
                goToStep(stepRef.current + 1, 1);
            } else {
                onCompleteRef.current?.();
            }
        } else if (e.deltaY < 0) {
            if (stepRef.current > 0) {
                goToStep(stepRef.current - 1, -1);
            } else {
                onReverseRef.current?.();
            }
        }
    }, [goToStep]);

    return (
        <section
            onWheel={handleWheel}
            className="w-full h-full relative bg-black overflow-hidden no-swipe"
        >
            <NoiseBackground intensityRef={noiseIntensityRef} isActive={isActive} />

            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 md:p-20 z-10">

                {/* Slide 0 */}
                <div
                    ref={el => { slidesRef.current[0] = el; }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ opacity: 1 }}
                >
                    <div className="max-w-4xl text-center space-y-2 leading-tight">
                        <ScrambleText ref={addScrambleRef} text="GAUDI in Motion nace como una pieza artística concebida" className="block text-2xl md:text-3xl font-light text-gray-200" manualTrigger />
                        <ScrambleText ref={addScrambleRef} text="para ser experimentada, no solo contemplada." className="block text-2xl md:text-3xl font-light text-gray-200" manualTrigger delay={0.2} />
                    </div>
                </div>

                {/* Slide 1 */}
                <div
                    ref={el => { slidesRef.current[1] = el; }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ opacity: 0 }}
                >
                    <div className="max-w-4xl text-center space-y-4 leading-normal">
                        <ScrambleText ref={addScrambleRef} text="Una obra que no se define por una imagen final," className="block text-2xl md:text-3xl font-light text-gray-200" manualTrigger />
                        <ScrambleText ref={addScrambleRef} text="sino por su comportamiento." className="block text-2xl md:text-3xl font-light text-gray-200" manualTrigger delay={0.2} />
                        <div className="h-4" />
                        <ScrambleText ref={addScrambleRef} text="Cada composición visual se genera en el instante," className="block text-xl md:text-2xl font-light text-gray-400" manualTrigger delay={0.5} />
                        <ScrambleText ref={addScrambleRef} text="impulsada por modelos de inteligencia artificial" className="block text-xl md:text-2xl font-light text-gray-400" manualTrigger delay={0.7} />
                        <ScrambleText ref={addScrambleRef} text="y modulada por la presencia del público," className="block text-xl md:text-2xl font-light text-gray-400" manualTrigger delay={0.9} />
                    </div>
                </div>

                {/* Slide 2 */}
                <div
                    ref={el => { slidesRef.current[2] = el; }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ opacity: 0 }}
                >
                    <div className="max-w-4xl text-center space-y-6 leading-tight">
                        <ScrambleText ref={addScrambleRef} text="Gaudí no construía formas." className="block text-3xl md:text-5xl font-bold text-white" manualTrigger />
                        <ScrambleText ref={addScrambleRef} text="Construía sistemas." className="block text-3xl md:text-5xl font-bold text-white" manualTrigger delay={0.2} />
                        <div className="h-4" />
                        <ScrambleText ref={addScrambleRef} text="Sistemas inspirados en la naturaleza," className="block text-xl md:text-2xl font-mono text-primary-300" manualTrigger delay={0.8} />
                        <ScrambleText ref={addScrambleRef} text="en el equilibrio entre fuerza y belleza." className="block text-xl md:text-2xl font-mono text-primary-300" manualTrigger delay={1.0} />
                    </div>
                </div>

                {/* Slide 3 */}
                <div
                    ref={el => { slidesRef.current[3] = el; }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ opacity: 0 }}
                >
                    <div className="max-w-5xl text-center space-y-8 leading-tight">
                        <div className="space-y-1">
                            <p className="text-2xl md:text-4xl font-light text-gray-400">Donde antes había piedra,</p>
                            <ScrambleText ref={addScrambleRef} text="ahora hay DATOS." className="block text-3xl md:text-5xl font-bold text-white glow-text" manualTrigger />
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl md:text-4xl font-light text-gray-400">Donde antes había gravedad,</p>
                            <ScrambleText ref={addScrambleRef} text="ahora hay ALGORITMOS." className="block text-3xl md:text-5xl font-bold text-white glow-text" manualTrigger delay={0.2} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl md:text-4xl font-light text-gray-400">Donde antes había materia,</p>
                            <ScrambleText ref={addScrambleRef} text="ahora hay LUZ y TIEMPO REAL." className="block text-3xl md:text-5xl font-bold text-white glow-text" manualTrigger delay={0.4} />
                        </div>
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-xs animate-pulse">
                    SCROLL TO EXPLORE
                </div>
            </div>

            <style jsx global>{`
                .glow-text { text-shadow: 0 0 20px rgba(255, 255, 255, 0.6); }
            `}</style>
        </section>
    );
}
