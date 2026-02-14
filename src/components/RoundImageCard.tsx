"use client";

import React from "react";
import { motion } from "framer-motion";

interface RoundImageCardProps {
    src: string;
    tag: string;
    className?: string;
    alt?: string;
}

export default function RoundImageCard({
    src,
    tag,
    className = "",
    alt = "Architecture detail"
}: RoundImageCardProps) {
    return (
        <div className={`relative ${className} group`}>
            <svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {/* SHAPE DEFINITION: Organic shape roughly based on the example */}
                    <path
                        id="combined-shape-img"
                        d="M 20,40 
               C 20,10 50,10 70,10 
               L 120,10 
               C 150,10 160,30 160,50
               C 160,70 120,70 120,90
               C 120,110 160,110 160,140
               C 160,170 140,190 110,190
               L 60,190
               C 30,190 20,170 20,150
               L 20,40 Z"
                    />

                    <clipPath id="image-mask">
                        <use href="#combined-shape-img" />
                    </clipPath>

                </defs>

                {/* MASKED CONTENT */}
                <foreignObject x="0" y="0" width="200" height="200" clipPath="url(#image-mask)">
                    <div className="w-full h-full bg-gray-900">
                        {/* 
                    Using a placeholder colored div if src is empty or error, 
                    but assuming valid src. 
                    We'll use object-cover.
                */}
                        <img
                            src={src}
                            alt={alt}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                        />
                    </div>
                </foreignObject>

                {/* BORDER OVERLAY (Glassmorphism style) */}
                <use href="#combined-shape-img" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <use href="#combined-shape-img" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" transform="translate(1,1) scale(0.99)" style={{ transformOrigin: "center" }} />

            </svg>

            {/* Decorative Label */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 right-6 bg-black/80 text-white border border-white/10 px-3 py-1 rounded-full text-[10px] font-mono flex items-center gap-2 backdrop-blur-md shadow-xl z-10 pointer-events-none"
            >
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                <span>{tag}</span>
            </motion.div>
        </div>
    );
}
