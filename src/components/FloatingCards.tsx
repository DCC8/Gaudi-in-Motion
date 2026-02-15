"use client";

import React from "react";
import { motion } from "framer-motion";
import ResizableImageCard from "./ResizableImageCard";
import RoundImageCard from "./RoundImageCard";
import { useIsMobile } from "@/hooks/useMobile";

interface FloatingCardsProps {
    variant?: "standard" | "organic";
    constraintsRef?: React.RefObject<any>;
}

const cardData = [
    {
        src: "/images/sagradafamilia.jpg",
        tag: "Sagrada Familia",
        className: "top-[3%] left-[2%]",
        initialWidth: 240,
        initialHeight: 280,
        organicSize: "w-64 h-64"
    },
    {
        src: "/images/casabatllo.jpg",
        tag: "Casa Batlló",
        className: "top-[12%] right-[2%]",
        initialWidth: 200,
        initialHeight: 210,
        organicSize: "w-56 h-56"
    },
    {
        src: "/images/parc guell.jpg",
        tag: "Park Güell",
        className: "bottom-[8%] right-[6%]",
        initialWidth: 260,
        initialHeight: 190,
        organicSize: "w-72 h-72"
    },
    {
        src: "/images/lapedrera.jpg",
        tag: "La Pedrera",
        className: "bottom-[3%] left-[4%]",
        initialWidth: 190,
        initialHeight: 200,
        organicSize: "w-48 h-48"
    },
];

// Mobile: 2 small decorative cards at the bottom
const mobileCards = [
    {
        src: "/images/sagradafamilia.jpg",
        tag: "Sagrada Familia",
        style: { bottom: "6%", left: "5%", width: 100, height: 120 },
        rotate: -4,
    },
    {
        src: "/images/parc guell.jpg",
        tag: "Park Güell",
        style: { bottom: "4%", right: "8%", width: 80, height: 90 },
        rotate: 3,
    },
];

export default function FloatingCards({ variant = "standard", constraintsRef }: FloatingCardsProps) {
    const isMobile = useIsMobile();

    // Mobile: show 2 small decorative cards at bottom
    if (isMobile) {
        return (
            <div className="absolute inset-0 z-30 pointer-events-none">
                {mobileCards.map((card, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-lg overflow-hidden border border-white/10 shadow-lg pointer-events-auto no-swipe"
                        style={{
                            ...card.style,
                            rotate: card.rotate,
                        }}
                        drag
                        dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                        dragElastic={0.3}
                        whileTap={{ scale: 1.05 }}
                    >
                        <img
                            src={card.src}
                            alt={card.tag}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                            <span className="text-[8px] font-mono text-white/70 uppercase tracking-wider">{card.tag}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    // Desktop: original full cards
    return (
        <div ref={constraintsRef} className="absolute inset-0 z-30 pointer-events-none">
            {cardData.map((card, index) => (
                <React.Fragment key={index}>
                    {variant === "standard" ? (
                        <ResizableImageCard
                            src={card.src}
                            tag={card.tag}
                            className={`${card.className} pointer-events-auto`}
                            initialWidth={card.initialWidth}
                            initialHeight={card.initialHeight}
                            constraintsRef={constraintsRef}
                        />
                    ) : (
                        <motion.div
                            drag
                            dragConstraints={constraintsRef}
                            className={`absolute ${card.className} pointer-events-auto cursor-grab active:cursor-grabbing no-swipe`}
                        >
                            <RoundImageCard
                                src={card.src}
                                tag={card.tag}
                                className={card.organicSize}
                            />
                        </motion.div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
