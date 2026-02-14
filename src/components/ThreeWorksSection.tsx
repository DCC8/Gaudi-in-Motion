"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import GooeyImage from "./GooeyImage";

interface ThreeWorksSectionProps {
    isActive: boolean;
    onNext?: () => void;
    onReverse?: () => void;
}

const CARDS = [
    {
        id: 1,
        title: "EXTERIORS",
        desc: "La arquitectura exterior como piel viva y reactiva.",
        image: "/images/slide_3_exteriors.png",
        coords: "41.4036° N"
    },
    {
        id: 2,
        title: "INTERIORS",
        desc: "El interior como espacio sensorial y emocional.",
        image: "/images/slide_3_interiors.png",
        coords: "2.1744° E"
    },
    {
        id: 3,
        title: "TRENCADIS",
        desc: "El trencadís como sistema infinito de fragmentación y recomposición.",
        image: "/images/slide_3_trencadis.png",
        coords: "OBJECT_88"
    }
];

const HoverTypewriter = ({ text, isHovered }: { text: string; isHovered: boolean }) => {
    const [displayedText, setDisplayedText] = React.useState("");

    React.useEffect(() => {
        if (isHovered) {
            let i = 0;
            const timer = setInterval(() => {
                setDisplayedText(text.substring(0, i + 1));
                i++;
                if (i > text.length) clearInterval(timer);
            }, 30); // Speed
            return () => clearInterval(timer);
        } else {
            setDisplayedText("");
        }
    }, [isHovered, text]);

    return (
        <span className="font-mono text-xs text-white/90 leading-relaxed block min-h-[40px]">
            {displayedText}
            {isHovered && displayedText.length < text.length && <span className="animate-pulse">_</span>}
        </span>
    );
};

export default function ThreeWorksSection({ isActive, onNext, onReverse }: ThreeWorksSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [hoveredCard, setHoveredCard] = React.useState<number | null>(null);

    const handleWheel = (e: React.WheelEvent) => {
        if (!isActive) return;
        if (e.deltaY > 20) {
            onNext && onNext();
        } else if (e.deltaY < -20) {
            onReverse && onReverse();
        }
    };

    return (
        <section
            ref={sectionRef}
            onWheel={handleWheel}
            className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-8 md:p-16 relative overflow-hidden"
        >
            {/* Intro Text */}
            <div className="max-w-4xl text-center mb-12 relative z-10">
                <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-200">
                    La obra se articula como una colección de 3 piezas generativas que exploran tres dimensiones fundamentales del universo gaudiniano. (expandible a otros conceptos)
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl relative z-10 h-[65vh]">
                {CARDS.map((card) => (
                    <div
                        key={card.id}
                        className="relative flex flex-col h-full bg-[#080808] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/30 transition-colors duration-300"
                        onMouseEnter={() => setHoveredCard(card.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                    >

                        {/* HUD Header */}
                        <div className="flex justify-between items-center px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-gray-500 tracking-widest">
                                    SYS_VISUAL_0{card.id}
                                </span>
                                <span className="text-xs font-bold uppercase text-white/90 tracking-widest">
                                    // {card.title}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                            </div>
                        </div>

                        {/* Image Container */}
                        <div className="flex-grow w-full relative p-4 pb-0">
                            <div className="w-full h-full relative rounded-t-lg overflow-hidden border-t border-l border-r border-white/5 bg-black">
                                <GooeyImage imageSrc={card.image} isActive={isActive} />

                                {/* Inner corner markers */}
                                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20"></div>
                                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20"></div>
                            </div>
                        </div>

                        {/* HUD Footer */}
                        <div className="px-5 py-4 bg-white/[0.02] border-t border-white/5 relative min-h-[100px] flex flex-col justify-between">

                            {/* Typewriter Description */}
                            <div className="mb-2">
                                <HoverTypewriter text={card.desc} isHovered={hoveredCard === card.id} />
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-mono text-gray-600 uppercase">Input Stream</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-mono text-[#FF7E00] uppercase block mb-0.5">
                                        CO-ORDS
                                    </span>
                                    <span className="text-xs font-mono text-white/80">
                                        {card.coords}
                                    </span>
                                </div>
                            </div>

                            {/* Corner Accent */}
                            <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/40"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Background Grain/Grid */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

        </section>
    );
}
