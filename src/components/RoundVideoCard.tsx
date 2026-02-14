"use client";

import React from "react";
import { motion } from "framer-motion";

interface RoundVideoCardProps {
    videoSrc: string;
    className?: string;
}

export default function RoundVideoCard({
    videoSrc,
    className = "",
}: RoundVideoCardProps) {
    return (
        <div className={`relative ${className}`}>
            <svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-2xl"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {/* SHAPE DEFINITION: Organic shape roughly based on the example */}
                    <path
                        id="combined-shape"
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

                    <clipPath id="video-mask">
                        <use href="#combined-shape" />
                    </clipPath>

                </defs>

                {/* MASKED CONTENT */}
                <foreignObject x="0" y="0" width="200" height="200" clipPath="url(#video-mask)">
                    <div className="w-full h-full bg-black/50">
                        <video
                            src={videoSrc}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>
                </foreignObject>

                {/* BORDER OVERLAY (Glassmorphism style) */}
                {/* Outer border - white/20 */}
                <use href="#combined-shape" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

                {/* Inner highlight - white/10 offset */}
                <use href="#combined-shape" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" transform="translate(1,1) scale(0.99)" style={{ transformOrigin: "center" }} />

            </svg>

            {/* Decorative Label */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="absolute top-10 right-6 bg-black/80 text-[#F5C26B] border border-white/10 px-3 py-1 rounded-md text-xs font-mono flex items-center gap-2 backdrop-blur-md z-10"
            >
                <span>&lt; Swirl /&gt;</span>
            </motion.div>
        </div>
    );
}
