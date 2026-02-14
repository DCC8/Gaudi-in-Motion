"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface ResizableImageCardProps {
    src: string;
    tag: string;
    initialWidth?: number;
    initialHeight?: number;
    className?: string;
    alt?: string;
    constraintsRef?: React.RefObject<any>;
}

export default function ResizableImageCard({
    src,
    tag,
    initialWidth = 256, // w-64
    initialHeight = 256, // h-64
    className = "",
    alt = "Architecture detail",
    constraintsRef
}: ResizableImageCardProps) {
    const [width, setWidth] = useState(initialWidth);
    const [height, setHeight] = useState(initialHeight);
    const cardRef = useRef<HTMLDivElement>(null);

    // Resize logic
    const handleResize = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Stop drag from parent motion.div key? 
        // Actually, if we put the resize handle inside the draggable motion.div, dragging it drags the parent.
        // We need to prevent drag propagation.
        // Framer motion drag can be controlled by `dragControls` or `dragListener={false}` on specific parts.
        // Or we can use `onPointerDownCapture` to stop propagation?
    };

    // Simplified Resize: Use CSS resize if browser supports it well enough with overflow: hidden?
    // But CSS resize handle is ugly.
    // Let's stick to Framer Motion for dragging, and standard React pointer events for resizing.

    const resizeRef = useRef<HTMLDivElement>(null);

    const onResizeStart = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = width;
        const startHeight = height;

        const onMove = (moveEvent: PointerEvent) => {
            const newWidth = Math.max(100, startWidth + (moveEvent.clientX - startX));
            const newHeight = Math.max(100, startHeight + (moveEvent.clientY - startY));
            setWidth(newWidth);
            setHeight(newHeight);
        };

        const onUp = () => {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
        };

        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
    };

    return (
        <motion.div
            drag
            dragConstraints={constraintsRef}
            dragMomentum={false}
            className={`absolute shadow-2xl rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/10 group ${className} no-swipe`}
            style={{ width, height }}
            whileHover={{ scale: 1.02, zIndex: 50 }}
            whileTap={{ scale: 0.98, cursor: "grabbing" }}
        >
            <div className="relative w-full h-full flex flex-col">
                {/* Tech Header */}
                <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-start z-10 pointer-events-none">
                    <span className="text-[9px] font-mono text-white/50 tracking-widest uppercase bg-black/70 px-1 rounded">IMG_DAT_0{Math.floor(initialWidth % 9)}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/50 animate-pulse box-content border border-black/20" />
                </div>

                <img
                    src={src}
                    alt={alt}
                    className="dither-img w-full h-full object-cover pointer-events-none select-none transition-all duration-700 ease-out"
                    style={{
                        filter: "contrast(1.15) saturate(0.5) brightness(0.85)",
                    }}
                />

                {/* Dither Pattern Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none mix-blend-overlay transition-opacity duration-700 group-hover:opacity-0"
                    style={{
                        opacity: 0.35,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                        backgroundSize: "128px 128px",
                    }}
                />



                {/* Footer / Label */}
                <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider pl-1 border-l-2 border-orange-500/80 leading-none">{tag}</span>
                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest pl-1">CO-ORDS: {(initialWidth * 7) % 100}.{(initialHeight * 3) % 100}</span>
                    </div>
                </div>

                {/* Resize Handle */}
                <div
                    onPointerDown={onResizeStart}
                    className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-50 flex items-end justify-end p-2 opacity-50 group-hover:opacity-100 transition-opacity"
                >
                    {/* Visual indicator - Corner lines */}
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 1L10 10L1 10" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
}
