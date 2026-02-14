"use client";

import React from "react";
import { motion } from "framer-motion";
import ResizableImageCard from "./ResizableImageCard";
import RoundImageCard from "./RoundImageCard";

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

export default function FloatingCards({ variant = "standard", constraintsRef }: FloatingCardsProps) {
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
                        // Added no-swipe here manually since RoundImageCard doesn't have it built-in like ResizableImageCard might 
                        // (Wait, ResizableImageCard has it on the root). 
                        // Wrapper needs 'no-swipe' for Observer to ignore it.
                        >
                            <RoundImageCard
                                src={card.src}
                                tag={card.tag}
                                className={card.organicSize} // RoundImageCard expects w/h classes
                            />
                        </motion.div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
