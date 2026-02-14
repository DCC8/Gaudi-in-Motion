"use client";

import React, { useRef, useLayoutEffect, useState } from "react";
import gsap from "gsap";

interface InteractiveTabsSectionProps {
    isActive: boolean;
    onReverse?: () => void;
    onNext?: () => void;
}

const TABS = [
    {
        id: "contexto",
        label: "Contexto 2026",
        image: "/artifacts/sagrada_familia_1770893496588.png",
        content: "Barcelona se convierte en el epicentro mundial de la arquitectura. Una oportunidad única para redefinir el espacio urbano.",
        tag: "FORO GLOBAL"
    },
    {
        id: "vision",
        label: "Visión Gaudí",
        image: "/artifacts/la_pedrera_1770893530424.png", // Morph to Casa Mila
        content: "Reinterpretamos la obra de Gaudí no como un monumento estático, sino como un sistema vivo que evoluciona con datos.",
        tag: "IA GENERATIVA"
    },
    {
        id: "valores",
        label: "Valores",
        image: "/artifacts/park_guell_1770893514527.png",
        content: "Sostenibilidad, inclusión y belleza. Tecnología al servicio de la experiencia humana, conectando pasado y futuro.",
        tag: "HUMANISMO DIGITAL"
    }
];

export default function InteractiveTabsSection({ isActive, onReverse, onNext }: InteractiveTabsSectionProps) {
    const [activeTab, setActiveTab] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Entrance Animation
    useLayoutEffect(() => {
        if (!isActive) return;

        const ctx = gsap.context(() => {
            gsap.from(".tab-item", {
                x: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.2
            });

            // Image Entrance removed to ensure visibility
        }, containerRef);

        return () => ctx.revert();
    }, [isActive]);

    const handleWheel = (e: React.WheelEvent) => {
        if (!isActive) return;
        // Simple navigation guards
        if (e.deltaY < -20) {
            onReverse && onReverse();
        } else if (e.deltaY > 20) {
            onNext && onNext();
        }
    };

    return (
        <section
            ref={containerRef}
            onWheel={handleWheel}
            className="w-full h-full relative bg-black overflow-hidden flex items-center justify-center"
        >
            <div className="w-full max-w-[90%] h-[80%] grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* LEFT: Visual (Sticky behavior technically, but fixed in grid) */}
                <div className="relative h-full w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0a0a0a] image-container group">
                    {/* Render ALL images stacked, fade in/out based on activeTab */}
                    {TABS.map((tab, index) => (
                        <div
                            key={tab.id}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeTab === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            <img
                                src={tab.image}
                                alt={tab.label}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-105"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

                            {/* HUD Elements specific to image? */}
                            <div className="absolute bottom-6 left-6 z-20">
                                <span className="text-[10px] font-mono text-primary-400 tracking-widest border border-primary-500/50 px-2 py-1 rounded">
                                    {tab.tag}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Shared Overlay or Noise */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none z-30 mix-blend-overlay"></div>
                </div>

                {/* RIGHT: Interactive Content */}
                <div className="flex flex-col justify-center pl-0 md:pl-10 space-y-2">
                    {TABS.map((tab, index) => (
                        <div
                            key={tab.id}
                            className={`tab-item group relative p-6 border-l-2 transition-all duration-300 cursor-pointer ${activeTab === index
                                    ? 'border-primary-500 bg-white/5'
                                    : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                                }`}
                            onMouseEnter={() => setActiveTab(index)}
                            onClick={() => setActiveTab(index)}
                        >
                            <div className="flex justify-between items-baseline mb-2">
                                <h3 className={`text-2xl md:text-3xl font-light transition-colors ${activeTab === index ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
                                    }`}>
                                    {tab.label}
                                </h3>
                                <span className={`text-xs font-mono transition-opacity ${activeTab === index ? 'text-primary-400 opacity-100' : 'opacity-0'
                                    }`}>
                                    0{index + 1}
                                </span>
                            </div>

                            {/* Collapsible Content */}
                            <div className={`overflow-hidden transition-all duration-500 ease-out ${activeTab === index ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                                }`}>
                                <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base max-w-md">
                                    {tab.content}
                                </p>

                                {activeTab === index && (
                                    <div className="mt-4 flex items-center gap-2 text-xs text-white/50 uppercase tracking-widest group/btn">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                        <span>Active Data Stream</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Hint */}
                    <div className="mt-8 text-xs text-white/30 uppercase tracking-widest animate-pulse">
                        * Interact to Explore
                    </div>
                </div>

            </div>
        </section>
    );
}
