"use client";

import React, { useRef, useLayoutEffect, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/all";

// Register Draggable
if (typeof window !== "undefined") {
    gsap.registerPlugin(Draggable);
}

interface DraggableSliderSectionProps {
    isActive: boolean;
    onReverse?: () => void;
    onNext?: () => void;
}

const SLIDES = [
    {
        id: 1,
        image: "/images/1barcelonacapital.jpg",
        title: "Barcelona Capital",
        desc: "Capital mundial de la arquitectura 2026. Un foro global que integra arte, tecnología y urbanismo para redefinir el espacio público."
    },
    {
        id: 2,
        image: "/images/añogaudi.jpg",
        title: "Año Gaudí",
        desc: "Homenaje a la visión arquitectónica como proceso estético vivo. Una celebración del método creativo reinterpretado con Inteligencia Artificial."
    },
    {
        id: 3,
        image: "/images/cultura.jpg",
        title: "Valores Culturales",
        desc: "Sostenibilidad, inclusión y belleza. Vincular el pasado con el futuro mediante tecnología al servicio de la experiencia humana."
    }
];

export default function DraggableSliderSection({ isActive, onReverse, onNext }: DraggableSliderSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sliderContainerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Cooldown ref to prevent rapid wheel events from triggering multiple slide changes
    const isWheelCoolingDown = useRef(false);
    // Flag to prevent useEffect[activeIndex] from firing a duplicate animation after drag snap
    const dragJustSnapped = useRef(false);

    // Helper to get slide width
    const getSlideWidth = useCallback(() => {
        if (!sliderRef.current?.children[0]) return 0;
        return (sliderRef.current.children[0] as HTMLElement).clientWidth + 40; // width + gap
    }, []);

    // Initialize Draggable - Once on mount
    useLayoutEffect(() => {
        if (!sliderRef.current || !sliderContainerRef.current) return;

        const slider = sliderRef.current;
        const ctx = gsap.context(() => {

            Draggable.create(slider, {
                type: "x",
                edgeResistance: 0.65,
                bounds: sliderContainerRef.current!,
                inertia: true,
                onDragStart: () => setIsDragging(true),
                onDragEnd: function () {
                    setIsDragging(false);
                    const slideWidth = getSlideWidth();
                    if (!slideWidth) return;
                    const x = (this as any).x as number;
                    const index = Math.round(-x / slideWidth);
                    const clampedIndex = Math.max(0, Math.min(index, SLIDES.length - 1));

                    // Mark that drag just snapped so useEffect doesn't double-animate
                    dragJustSnapped.current = true;

                    // Animate to snap position
                    gsap.to(slider, {
                        x: -clampedIndex * slideWidth,
                        duration: 0.5,
                        ease: "power2.out",
                        onComplete: () => setActiveIndex(clampedIndex)
                    });
                }
            });

        }, containerRef);

        // Update Draggable bounds on resize
        const handleResize = () => {
            const draggableInstance = Draggable.get(slider);
            if (draggableInstance) {
                draggableInstance.applyBounds(sliderContainerRef.current!);
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            ctx.revert();
        };
    }, [getSlideWidth]);

    // Handle Active State for Enabling/Disabling Interaction
    useEffect(() => {
        if (!sliderRef.current) return;
        const draggableInstance = Draggable.get(sliderRef.current);
        if (draggableInstance) {
            if (isActive) {
                draggableInstance.enable();
            } else {
                draggableInstance.disable();
            }
        }
    }, [isActive]);

    // Handle Active Index Change -> Animate Slider (only when not triggered by drag snap)
    useEffect(() => {
        if (!sliderRef.current) return;

        // Skip if this was triggered by drag snap (already animated in onDragEnd)
        if (dragJustSnapped.current) {
            dragJustSnapped.current = false;
            return;
        }

        const slideWidth = getSlideWidth();
        if (!slideWidth) return;

        gsap.to(sliderRef.current, {
            x: -activeIndex * slideWidth,
            duration: 0.6,
            ease: "power2.out"
        });
    }, [activeIndex, getSlideWidth]);

    const handleNextSlide = () => {
        if (activeIndex < SLIDES.length - 1) {
            setActiveIndex(prev => prev + 1);
        } else {
            // Reached end, navigate to next section
            onNext && onNext();
        }
    };

    const handlePrevSlide = () => {
        if (activeIndex > 0) {
            setActiveIndex(prev => prev - 1);
        } else {
            // Reached start, navigate to prev section
            onReverse && onReverse();
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!isActive || isWheelCoolingDown.current) return;

        // Scroll DOWN (DeltaY > 0) -> Next
        if (e.deltaY > 20) {
            isWheelCoolingDown.current = true;
            handleNextSlide();
            setTimeout(() => { isWheelCoolingDown.current = false; }, 600);
        }
        // Scroll UP (DeltaY < 0) -> Prev
        else if (e.deltaY < -20) {
            isWheelCoolingDown.current = true;
            handlePrevSlide();
            setTimeout(() => { isWheelCoolingDown.current = false; }, 600);
        }
    };

    return (
        <section
            ref={containerRef}
            onWheel={handleWheel}
            className="w-full h-full relative bg-black overflow-hidden flex no-swipe"
        >
            {/* LEFT: Info & Controls */}
            <div className="w-[30%] md:w-[25%] h-full relative z-50 bg-gradient-to-r from-black via-black to-transparent flex flex-col justify-center pl-8 md:pl-16 pr-4 pointer-events-none">
                <div className="pointer-events-auto">
                    {/* Counter */}
                    <div className="flex items-start text-[6vw] font-bold leading-none font-mono mb-8">
                        <span className="text-white">0{activeIndex + 1}</span>
                        <span className="text-white/20 ml-2 text-[2vw]">/ 0{SLIDES.length}</span>
                    </div>

                    {/* Content (Dynamic) */}
                    <div className="mb-12 min-h-[150px]">
                        <h2 className="text-3xl font-light text-white mb-2 transition-all duration-300">
                            {SLIDES[activeIndex].title}
                        </h2>
                        <p className="text-sm text-gray-400 max-w-[200px] transition-all duration-300">
                            {SLIDES[activeIndex].desc}
                        </p>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handlePrevSlide}
                            className={`w-12 h-12 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors ${activeIndex === 0 ? 'opacity-50' : 'opacity-100'}`}
                        >
                            ←
                        </button>
                        <button
                            onClick={handleNextSlide}
                            className={`w-12 h-12 border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors ${activeIndex === SLIDES.length - 1 ? 'opacity-50' : 'opacity-100'}`}
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: Linear Slider */}
            <div ref={sliderContainerRef} className="w-full h-full absolute top-0 left-0 pl-[25%] flex items-center overflow-hidden cursor-grab active:cursor-grabbing">
                {/* Slider Track */}
                <div ref={sliderRef} className="flex items-center gap-10 pl-10 h-[60vh]">
                    {SLIDES.map((slide, i) => (
                        <div
                            key={i}
                            className={`relative flex-shrink-0 w-[60vw] md:w-[40vw] h-full rounded-2xl overflow-hidden transition-all duration-500 group cursor-pointer border border-transparent hover:border-white/20 ${i === activeIndex ? 'opacity-100' : 'opacity-40'}`}
                            onClick={() => setActiveIndex(i)}
                        >
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                                draggable={false}
                            />
                            {/* Caption Overlay */}
                            <div className="absolute top-4 left-4 bg-white/90 text-black px-3 py-1 rounded text-xs font-bold uppercase flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-black"></div>
                                {slide.title}
                            </div>
                        </div>
                    ))}
                    {/* Spacer logic if needed for drag bounds? 
                        Draggable 'bounds' usually needs strict container dimensions. 
                        We handle movement mainly via index, Drag is for "flinging".
                    */}
                </div>
            </div>

            {/* Credits / Footer */}
            <div className="absolute bottom-6 left-8 md:left-16 text-[10px] text-white/30 font-mono tracking-widest pointer-events-none">
                SCROLL TO NAVIGATE _
            </div>
        </section>
    );
}
