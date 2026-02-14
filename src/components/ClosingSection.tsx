"use client";

import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface ClosingSectionProps {
    isActive: boolean;
    onComplete?: () => void;
    onReverse?: () => void;
}

const SLIDES = [
    {
        lines: [
            "GAUDÍ in Motion no compite con la arquitectura física de Gaudí.",
            "La complementa, la expande y la proyecta hacia nuevas audiencias globales.",
            "Es una propuesta que honra la innovación de Gaudí",
            "desde la creatividad contemporánea.",
        ],
    },
    {
        heading: "GAUDÍ in Motion representa:",
        lines: [
            "Una obra emblemática para el Año Gaudí 2026.",
            "Una experiencia cultural que combina patrimonio e innovación.",
            "Una pieza diseñada para dialogar con la ciudadanía y con el discurso institucional de Barcelona y Catalunya.",
            "Una carta de presentación internacional donde la cultura catalana y la arquitectura conviven con la tecnología más avanzada.",
        ],
    },
];

export default function ClosingSection({ isActive, onComplete, onReverse }: ClosingSectionProps) {
    const stepRef = useRef(0);
    const animatingRef = useRef(false);
    const cooldownRef = useRef(false);
    const slidesRef = useRef<(HTMLDivElement | null)[]>([]);

    const onCompleteRef = useRef(onComplete);
    const onReverseRef = useRef(onReverse);
    onCompleteRef.current = onComplete;
    onReverseRef.current = onReverse;

    const goToStep = useCallback((newStep: number, direction: 1 | -1) => {
        const oldStep = stepRef.current;
        if (newStep === oldStep || animatingRef.current) return;

        animatingRef.current = true;

        const oldSlide = slidesRef.current[oldStep];
        const newSlide = slidesRef.current[newStep];

        const tl = gsap.timeline({
            onComplete: () => { animatingRef.current = false; },
        });

        if (oldSlide) {
            tl.to(oldSlide, {
                autoAlpha: 0,
                y: -20 * direction,
                filter: "blur(6px)",
                duration: 0.4,
                ease: "power2.in",
            });
        }

        if (newSlide) {
            tl.fromTo(
                newSlide,
                { autoAlpha: 0, y: 30 * direction, filter: "blur(6px)" },
                {
                    autoAlpha: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 0.5,
                    ease: "power2.out",
                },
                "-=0.1"
            );
        }

        stepRef.current = newStep;
    }, []);

    useEffect(() => {
        if (!isActive) return;

        stepRef.current = 0;
        animatingRef.current = false;
        cooldownRef.current = false;

        slidesRef.current.forEach((slide, i) => {
            if (!slide) return;
            gsap.set(slide, {
                autoAlpha: i === 0 ? 1 : 0,
                y: i === 0 ? 0 : 30,
                filter: i === 0 ? "blur(0px)" : "blur(6px)",
            });
        });
    }, [isActive]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (cooldownRef.current || animatingRef.current) return;

        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, 500);

        if (e.deltaY > 0) {
            if (stepRef.current < SLIDES.length - 1) {
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
            <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
                {SLIDES.map((slide, i) => (
                    <div
                        key={i}
                        ref={(el) => { slidesRef.current[i] = el; }}
                        className="absolute inset-0 flex flex-col items-center justify-center px-8 md:px-20"
                        style={{
                            opacity: i === 0 ? 1 : 0,
                            willChange: "transform, opacity, filter",
                        }}
                    >
                        <div className="max-w-4xl text-center space-y-5">
                            {slide.heading && (
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                    {slide.heading}
                                </h3>
                            )}
                            {slide.lines.map((line, j) => (
                                <p
                                    key={j}
                                    className={`text-xl md:text-2xl lg:text-3xl font-light leading-relaxed ${slide.heading ? "text-gray-300" : "text-gray-200"}`}
                                >
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Subtle bottom indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {SLIDES.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === 0 ? "bg-white/60" : "bg-white/15"}`}
                    />
                ))}
            </div>
        </section>
    );
}
