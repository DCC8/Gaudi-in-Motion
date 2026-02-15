"use client";

import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import gsap from "gsap";
import HeroControls, { ShaderConfig } from "./HeroControls";
import HeroShader from "./HeroShader";
import { useIsMobile } from "@/hooks/useMobile";

interface HeroSectionProps {
    isActive: boolean;
}

export default function HeroSection({ isActive }: HeroSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const [shaderConfig, setShaderConfig] = useState<ShaderConfig>({
        distortionStrength: 2.0,
        speed: 1.5,
        noiseScale: 6.7,
        colorRevealRadius: 0.3,
        glowIntensity: 0.77,
    });

    // Lower defaults on mobile for performance
    useEffect(() => {
        if (isMobile) {
            setShaderConfig({
                distortionStrength: 0.5,
                speed: 0.5,
                noiseScale: 3,
                colorRevealRadius: 0.15,
                glowIntensity: 0.3,
            });
        }
    }, [isMobile]);

    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {}, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="w-full h-screen relative bg-black overflow-hidden">

            {/* Full Screen Shader Canvas (includes Text) */}
            <div className="absolute inset-0 z-10 w-full h-full">
                <HeroShader
                    imageSrc="/images/hero_bg.jpg"
                    config={shaderConfig}
                    isActive={isActive}
                />
            </div>


            {/* Shader Controls HUD */}
            <HeroControls config={shaderConfig} onChange={setShaderConfig} />

            {/* Footer / Scroll Hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-[10px] tracking-[0.3em] font-mono pointer-events-none animate-pulse z-20">
                SCROLL TO EXPLORE
            </div>

        </section>
    );
}
