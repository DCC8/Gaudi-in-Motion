"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useMobile";

export interface ShaderConfig {
    distortionStrength: number;
    speed: number;
    noiseScale: number;
    colorRevealRadius: number;
    glowIntensity: number;
}

interface HeroControlsProps {
    config: ShaderConfig;
    onChange: (newConfig: ShaderConfig) => void;
}

const sliderClass = "w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full";

export default function HeroControls({ config, onChange }: HeroControlsProps) {
    const isMobile = useIsMobile();
    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (key: keyof ShaderConfig, value: number) => {
        onChange({ ...config, [key]: value });
    };

    const controls: { key: keyof ShaderConfig; label: string; min: number; max: number; step: number; decimals: number }[] = [
        { key: "distortionStrength", label: "Distortion", min: 0, max: 2, step: 0.01, decimals: 2 },
        { key: "speed", label: "Flow Speed", min: 0, max: 2, step: 0.1, decimals: 2 },
        { key: "noiseScale", label: "Noise Scale", min: 1, max: 10, step: 0.1, decimals: 1 },
        { key: "colorRevealRadius", label: "Reveal Radius", min: 0.05, max: 0.8, step: 0.01, decimals: 2 },
        { key: "glowIntensity", label: "Glow", min: 0, max: 1, step: 0.01, decimals: 2 },
    ];

    const panelContent = (
        <>
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[10px] uppercase text-gray-400 tracking-widest font-mono">Shader Control</span>
            </div>

            <div className="space-y-3">
                {controls.map(({ key, label, min, max, step, decimals }) => (
                    <div key={key}>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase font-mono">
                            <span>{label}</span>
                            <span>{config[key].toFixed(decimals)}</span>
                        </div>
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={config[key]}
                            onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                            className={sliderClass}
                        />
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-2 border-t border-white/5 text-[9px] text-gray-600 font-mono text-center">
                // SYSTEM_OVERRIDE_ACTIVE
            </div>
        </>
    );

    // Desktop: original layout
    if (!isMobile) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute right-8 top-1/2 -translate-y-1/2 z-40 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl w-64 pointer-events-auto"
            >
                {panelContent}
            </motion.div>
        );
    }

    // Mobile: toggle button + bottom sheet
    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 z-50 w-10 h-10 bg-black/70 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center pointer-events-auto"
                aria-label="Toggle shader controls"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/70">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            </button>

            {/* Bottom sheet panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 p-4 rounded-t-2xl pointer-events-auto max-h-[60vh] overflow-y-auto"
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center mb-3">
                            <div className="w-10 h-1 bg-white/20 rounded-full" />
                        </div>
                        {panelContent}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
