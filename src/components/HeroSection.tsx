"use client";

import React, { useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import HeroControls, { ShaderConfig } from "./HeroControls";
import HeroShader from "./HeroShader";

interface HeroSectionProps {
    isActive: boolean;
}

export default function HeroSection({ isActive }: HeroSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [shaderConfig, setShaderConfig] = useState<ShaderConfig>({
        distortionStrength: 2.0,
        speed: 1.5,
        noiseScale: 6.7,
        colorRevealRadius: 0.3,
        glowIntensity: 0.77,
    });

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
                    imageSrc="/images/Untitled_Image_8_2026-02-13_13-37.png"
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
