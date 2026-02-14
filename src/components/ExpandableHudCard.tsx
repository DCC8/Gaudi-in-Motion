"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

interface ExpandableHudCardProps {
    id: string;
    title: string;
    description: string;
    initialX?: number | string;
    initialY?: number | string;
    cardWidth?: number;
    icon?: React.ReactNode;
    isFocused?: boolean;
    onToggleFocus?: () => void;
    onDismiss?: () => void;
    anyFocused?: boolean;
}

export default function ExpandableHudCard({
    id,
    title,
    description,
    initialX = 0,
    initialY = 0,
    cardWidth = 340,
    icon,
    isFocused = false,
    onToggleFocus,
    onDismiss,
    anyFocused = false
}: ExpandableHudCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // If another card is focused and this one isn't, we might want to fade it out or disable interaction
    const isOtherFocused = anyFocused && !isFocused;

    return (
        <motion.div
            drag={!isFocused}
            dragMomentum={false}
            initial={{ x: initialX, y: initialY }}
            animate={{
                // Center relative to the viewport/container
                x: isFocused ? "calc(50vw - 50%)" : initialX,
                y: isFocused ? "calc(50vh - 50%)" : initialY,
                width: cardWidth,
                height: "auto",
                scale: isFocused ? 2.2 : 1,
                zIndex: isFocused ? 60 : (isOtherFocused ? 10 : 30),
                backgroundColor: "rgba(10, 10, 10, 0.9)",
                borderColor: isFocused ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.3)",
                boxShadow: isFocused ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "0 0 0 0 rgba(0, 0, 0, 0)",
                opacity: isOtherFocused ? 0.3 : 1, // Dim if another card is focused
                filter: isOtherFocused ? "blur(2px)" : "none"
            }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className={`absolute flex flex-col overflow-hidden rounded-xl border bg-[#0a0a0a]/95 cursor-pointer group shadow-2xl`}
            onClick={(e) => {
                e.stopPropagation(); // Prevent dismissing when clicking the card itself
                onToggleFocus && onToggleFocus();
            }}
            ref={containerRef}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 w-full border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isFocused ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]'} animate-pulse`}></div>
                    <span className="font-mono text-sm text-white/90 font-bold tracking-widest uppercase">
                        {title}
                    </span>
                </div>
                {/* Focus Icon / Indicator */}
                <span className={`text-white/50 text-xs transform transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {isFocused ? 'CLOSE' : 'EXPAND'}
                </span>
            </div>

            {/* Content - Always Visible */}
            <div className="px-5 py-5 overflow-hidden">
                <p className="font-mono text-xs text-gray-400 leading-relaxed">
                    {description}
                </p>

                <div className="mt-3 flex justify-between items-center text-[10px] text-gray-600 font-mono border-t border-white/5 pt-2">
                    <span>ID: {id}</span>
                    <span>STATUS: {isFocused ? 'FOCUSED' : 'ONLINE'}</span>
                </div>
            </div>

            {/* Corner Accents (Always visible) */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20"></div>
        </motion.div>
    );
}
