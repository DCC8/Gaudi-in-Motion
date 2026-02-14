"use client";

import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import gsap from "gsap";
import ScrambleText from "./ScrambleText";

interface BarcelonaSectionProps {
    isActive: boolean;
    onComplete?: () => void;
    onReverse?: () => void;
    onNext?: () => void;
}

const Counter = ({ end, duration = 2, delay = 0 }: { end: number, duration?: number, delay?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const obj = { value: 0 };
        gsap.to(obj, {
            value: end,
            duration: duration,
            delay: delay,
            ease: "power2.out",
            onUpdate: () => {
                setCount(Math.round(obj.value));
            }
        });
    }, [end, duration, delay]);

    return <span ref={ref} className="font-mono text-primary-400">{count.toLocaleString()}</span>;
};

export default function BarcelonaSection({ isActive, onComplete, onReverse, onNext }: BarcelonaSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [startAnim, setStartAnim] = useState(false);

    useLayoutEffect(() => {
        if (!isActive) {
            setStartAnim(false);
            return;
        }

        const ctx = gsap.context(() => {
            setStartAnim(true);

            // Image Entrance
            gsap.from(".hero-image-container", {
                xPercent: -10,
                opacity: 0,
                scale: 0.9,
                duration: 1.5,
                ease: "power3.out"
            });

            // Text Stagger
            gsap.from(".text-content > *", {
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                delay: 0.5,
                ease: "power2.out"
            });

        }, containerRef);

        return () => ctx.revert();
    }, [isActive]);

    // Navigation handlers
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        // Simple navigation logic
        if (isActive) {
            if (e.deltaY < -20) {
                onReverse && onReverse();
            } else if (e.deltaY > 20) {
                onNext && onNext();
            }
        }
    };

    return (
        <section
            ref={containerRef}
            onWheel={handleWheel}
            className="w-full h-full relative bg-black overflow-hidden flex items-center justify-center"
        >

            <div className="w-full max-w-[90%] h-[80%] grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

                {/* Left: Huge HUD Image (Static Implementation) */}
                <div className="hero-image-container h-full w-full relative flex items-center justify-center p-4">
                    <div className="relative w-full h-full max-h-[70vh] rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] group shadow-2xl">

                        {/* Tech Header */}
                        <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start z-10 pointer-events-none">
                            <span className="text-[9px] font-mono text-white/50 tracking-widest uppercase bg-black/40 px-1 rounded backdrop-blur-md">IMG_SEQ_2026</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse border border-black/20" />
                        </div>

                        {/* Image */}
                        <img
                            src="/artifacts/sagrada_familia_1770893496588.png"
                            alt="Barcelona 2026"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        />

                        {/* Grid Overlay */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

                        {/* Footer */}
                        <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                            <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider pl-1 border-l-2 border-primary-500 leading-none">BARCELONA 2026</span>
                                <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest pl-1">LAT: 41.38 _ LON: 2.16</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right: Text Content */}
                <div ref={contentRef} className="text-content space-y-8 text-left pl-0 md:pl-10 relative z-20">

                    {/* Header Block */}
                    <div className="space-y-2">
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            Barcelona 2026 <br />
                            <span className="text-gray-400 font-light">es un foro global</span>
                        </h2>
                        <div className="text-xl md:text-2xl text-gray-300 font-light flex flex-col md:flex-row gap-2 md:gap-4">
                            <span>con más de {startAnim && <Counter end={200} delay={1} />} iniciativas</span>
                            <span className="hidden md:inline text-gray-600">|</span>
                            <span>y {startAnim && <Counter end={1500} delay={1.5} />} actividades.</span>
                        </div>
                    </div>

                    <div className="h-px w-20 bg-primary-500/50" />

                    {/* Main Copy - Typewriter/Scramble */}
                    <div className="space-y-6 text-lg md:text-xl text-gray-300 font-light leading-relaxed">
                        <div>
                            {isActive && <ScrambleText text="GAUDI in Motion contribuye a posicionar Barcelona" delay={2} />}
                            <br />
                            {isActive && <ScrambleText text="como referente en innovación cultural," delay={2.5} />}
                        </div>

                        <div>
                            {isActive && <ScrambleText text="integrar arte, tecnología y urbanismo," delay={3.2} />}
                            <br />
                            {isActive && <ScrambleText text="y ofrecer experiencias ciudadanas inclusivas." delay={3.7} />}
                        </div>

                        <div className="pt-4">
                            <p className="text-2xl md:text-3xl font-normal text-white italic">
                                "{isActive && <ScrambleText text="Es una obra que dialoga" delay={4.5} revealSpeed={1} />}
                                <br />
                                <span className="pl-4">
                                    {isActive && <ScrambleText text="con el paisaje urbano y la comunidad." delay={5.2} revealSpeed={1} />}
                                    "</span>
                            </p>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}
