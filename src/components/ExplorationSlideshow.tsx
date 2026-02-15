"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import ExpandableHudCard from "./ExpandableHudCard";
import { motion, PanInfo } from "framer-motion";
import { useIsMobile, useTouchNav } from "@/hooks/useMobile";

interface ExplorationSlideshowProps {
    isActive: boolean;
    onNext?: () => void;
    onReverse?: () => void;
}

const SLIDES = [
    {
        id: "exterior",
        title: "EXTERIOR",
        videoBg: "/assets/exteriors.mp4",
        cards: [
            { id: "EXT-01", title: "ORGANISMO REACTIVO", desc: "La fachada no es una superficie, sino un cuerpo vivo que percibe y responde. La arquitectura reacciona a la energía humana.", x: "58vw", y: "5vh", w: 300, mx: "10vw", my: "55vh", mw: 240 },
            { id: "EXT-02", title: "DINÁMICA DE FLUIDOS", desc: "Las curvas se dilatan, la luz se intensifica y el ritmo visual fluctúa. Movimientos lentos y continuos, siguiendo la lógica orgánica.", x: "52vw", y: "38vh", w: 380, mx: "10vw", my: "68vh", mw: 240 },
            { id: "EXT-03", title: "INTERACCIÓN NATURAL", desc: "El espectador no controla, influye. Como el viento en un árbol. No tocas la obra: la activas.", x: "68vw", y: "68vh", w: 260, mx: "10vw", my: "81vh", mw: 240 },
        ]
    },
    {
        id: "interior",
        title: "INTERIOR",
        videoBg: "/assets/interiors.mp4",
        cards: [
            { id: "INT-01", title: "ATMÓSFERA SENSIBLE", desc: "La interacción no es física, es emocional. La obra detecta cercanía, tiempo y ritmo, traduciendo datos en atmósfera.", x: "62vw", y: "4vh", w: 340, mx: "10vw", my: "55vh", mw: 240 },
            { id: "INT-02", title: "TRANSFORMACIÓN VISUAL", desc: "La luz se vuelve envolvente, las formas se expanden o repliegan. El espacio parece abrirse o recogerse según tu presencia.", x: "50vw", y: "52vh", w: 290, mx: "10vw", my: "68vh", mw: 240 },
            { id: "INT-03", title: "DIÁLOGO SILENCIOSO", desc: "No hay botones, solo presencia. No interactúas, convives. La obra deja de ser estructura y se adapta a tu energía.", x: "72vw", y: "32vh", w: 360, mx: "10vw", my: "81vh", mw: 240 },
        ]
    },
    {
        id: "trencadis",
        title: "TRENCADIS",
        videoBg: "/assets/trencadsi.mp4",
        cards: [
            { id: "TRN-01", title: "SISTEMA GENERATIVO", desc: "El trencadís ya era algorítmico antes de la computación. Fragmentos rotos, azar controlado y ritmo visual como lenguaje generativo.", x: "55vw", y: "60vh", w: 370, mx: "10vw", my: "55vh", mw: 240 },
            { id: "TRN-02", title: "PROCESO VIVO", desc: "No existe composición final, solo estados temporales de equilibrio. Miles de fragmentos digitales se reorganizan constantemente.", x: "60vw", y: "3vh", w: 270, mx: "10vw", my: "68vh", mw: 240 },
            { id: "TRN-03", title: "COREOGRAFÍA VISUAL", desc: "La interacción modifica el tamaño, la velocidad y el caos. Una danza entre azar y control donde el público altera la densidad.", x: "48vw", y: "30vh", w: 320, mx: "10vw", my: "81vh", mw: 240 },
        ]
    }
];

export default function ExplorationSlideshow({ isActive, onNext, onReverse }: ExplorationSlideshowProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const slideRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isTransitioningRef = useRef(false);
    const isMobile = useIsMobile();

    const handleNextSlide = useCallback(() => {
        if (isTransitioningRef.current) return;
        isTransitioningRef.current = true;

        if (currentSlideIndex < SLIDES.length - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        } else {
            // Loop internal navigation
            setCurrentSlideIndex(0);
        }
        setTimeout(() => isTransitioningRef.current = false, 1000);
    }, [currentSlideIndex]);

    const handlePrevSlide = useCallback(() => {
        if (isTransitioningRef.current) return;
        isTransitioningRef.current = true;

        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
        } else {
            setCurrentSlideIndex(SLIDES.length - 1);
        }
        setTimeout(() => isTransitioningRef.current = false, 1000);
    }, [currentSlideIndex]);

    const [focusedCardId, setFocusedCardId] = useState<string | null>(null);

    // GSAP Transition Effect
    useEffect(() => {
        if (!slideRef.current) return;

        // Simple fade/scale transition
        gsap.fromTo(slideRef.current,
            { opacity: 0, scale: 1.1 },
            { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
        );

    }, [currentSlideIndex]);

    // Video lifecycle: pause when section is inactive
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (isActive) {
            video.play().catch(() => { });
        } else {
            video.pause();
        }
    }, [isActive, currentSlideIndex]);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (focusedCardId) return; // Disable swipe when focused
        if (Math.abs(info.offset.x) > 50) { // Threshold for swipe
            if (info.offset.x > 0) {
                handlePrevSlide();
            } else {
                handleNextSlide();
            }
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!isActive || isTransitioningRef.current || focusedCardId) return; // Disable scroll when focused

        // If scrolling down
        if (e.deltaY > 20) {
            if (currentSlideIndex < SLIDES.length - 1) {
                isTransitioningRef.current = true;
                setCurrentSlideIndex(prev => prev + 1);
                setTimeout(() => isTransitioningRef.current = false, 1000);
            } else {
                // Last slide, exit section
                onNext && onNext();
            }
        }
        // If scrolling up
        else if (e.deltaY < -20) {
            if (currentSlideIndex > 0) {
                isTransitioningRef.current = true;
                setCurrentSlideIndex(prev => prev - 1);
                setTimeout(() => isTransitioningRef.current = false, 1000);
            } else {
                // First slide, reverse section
                onReverse && onReverse();
            }
        }
    };

    // Touch navigation for section-level swipe
    const handleTouchNext = useCallback(() => {
        if (isTransitioningRef.current || focusedCardId) return;
        if (currentSlideIndex < SLIDES.length - 1) {
            isTransitioningRef.current = true;
            setCurrentSlideIndex(prev => prev + 1);
            setTimeout(() => isTransitioningRef.current = false, 1000);
        } else {
            onNext?.();
        }
    }, [currentSlideIndex, focusedCardId, onNext]);

    const handleTouchPrev = useCallback(() => {
        if (isTransitioningRef.current || focusedCardId) return;
        if (currentSlideIndex > 0) {
            isTransitioningRef.current = true;
            setCurrentSlideIndex(prev => prev - 1);
            setTimeout(() => isTransitioningRef.current = false, 1000);
        } else {
            onReverse?.();
        }
    }, [currentSlideIndex, focusedCardId, onReverse]);

    const touchRef = useTouchNav(handleTouchNext, handleTouchPrev);

    const combinedRef = useCallback((el: HTMLDivElement | null) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        (touchRef as React.MutableRefObject<HTMLElement | null>).current = el;
    }, [touchRef]);

    const activeSlide = SLIDES[currentSlideIndex];

    return (
        <motion.section
            ref={combinedRef}
            className="w-full h-full relative overflow-hidden bg-black no-swipe"
            onWheel={handleWheel}
            drag={!focusedCardId && !isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
        >
            {/* Background (Video) */}
            <div ref={slideRef} className="absolute inset-0 z-0 pointer-events-none bg-black">
                <video
                    ref={videoRef}
                    key={activeSlide.id}
                    className="w-full h-full object-cover opacity-60 transition-opacity duration-1000"
                    autoPlay={isActive}
                    loop
                    muted
                    playsInline
                    src={activeSlide.videoBg}
                />
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Backdrop for Focus Mode */}
            <div className={`absolute inset-0 z-20 bg-black/80 backdrop-blur-sm transition-opacity duration-500 pointer-events-none ${focusedCardId ? 'opacity-100' : 'opacity-0'}`}></div>

            {/* Large Left Title */}
            <div className={`absolute top-1/2 left-4 md:left-12 -translate-y-1/2 z-10 pointer-events-none select-none transition-opacity duration-300 ${focusedCardId ? 'opacity-20' : 'opacity-100'}`}>
                <h1 className="text-[20vw] md:text-[12vw] font-bold text-white/10 leading-none tracking-tighter mix-blend-overlay">
                    {activeSlide.title}
                </h1>
                <h2 className="text-2xl md:text-4xl font-bold text-white ml-2 tracking-widest mt-[-2vw]">
                    {activeSlide.title}
                </h2>
            </div>

            {/* Draggable HUD Cards */}
            <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                {/* Pointer events auto for children */}
                <div className="w-full h-full relative pointer-events-auto">
                    {activeSlide.cards.map((card) => (
                        <ExpandableHudCard
                            key={card.id}
                            id={card.id}
                            title={card.title}
                            description={card.desc}
                            initialX={isMobile ? card.mx : card.x}
                            initialY={isMobile ? card.my : card.y}
                            cardWidth={isMobile ? card.mw : card.w}
                            isFocused={focusedCardId === card.id}
                            onToggleFocus={() => setFocusedCardId(focusedCardId === card.id ? null : card.id)}
                            onDismiss={() => setFocusedCardId(null)}
                            anyFocused={!!focusedCardId}
                        />
                    ))}
                </div>
            </div>

            {/* Slideshow Navigation (Bottom Right) */}
            <div className="absolute bottom-4 right-4 md:bottom-12 md:right-12 z-40 flex items-center gap-4 md:gap-6 pointer-events-auto">
                <div className="flex gap-2">
                    {SLIDES.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 rounded-full cursor-pointer transition-all ${idx === currentSlideIndex ? 'bg-white scale-125' : 'bg-white/30'}`}
                            onClick={() => setCurrentSlideIndex(idx)}
                        ></div>
                    ))}
                </div>

                <button onClick={handlePrevSlide} className="p-3 border border-white/20 rounded-full hover:bg-white/10 text-white transition-colors">
                    ←
                </button>
                <button onClick={handleNextSlide} className="p-3 border border-white/20 rounded-full hover:bg-white/10 text-white transition-colors">
                    →
                </button>
            </div>

            {/* Technical Overlay — desktop only */}
            <div className="absolute top-8 left-8 z-30 font-mono text-xs text-white/50 pointer-events-none select-none hidden md:block">
                 // SLIDESHOW_MODE: ACTIVE
                <br />
                 // INDEX: 0{currentSlideIndex + 1} / 03
            </div>

        </motion.section>
    );
}
