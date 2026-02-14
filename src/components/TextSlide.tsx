"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function TextSlide() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Typewriter effect using stagger
        const textElements = textRefs.current.filter(Boolean);

        const ctx = gsap.context(() => {
            // Initially hide text
            gsap.set(textElements, { opacity: 0, y: 20 });

            // Animate in when the container enters the viewport (or is pinned)
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top center", // Adjust based on when you want it to start
                end: "bottom center",
                onEnter: () => {
                    gsap.to(textElements, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 1.5, // Long stagger between paragraphs for reading time
                        ease: "power2.out",
                    });
                },
                toggleActions: "play none none reverse"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const addToRefs = (el: HTMLParagraphElement | null) => {
        if (el && !textRefs.current.includes(el)) {
            textRefs.current.push(el);
        }
    };

    return (
        <section
            ref={containerRef}
            className="relative z-20 w-full h-full flex items-center justify-center p-8 md:p-20 bg-black"
        >
            <div className="max-w-4xl w-full space-y-8 text-center md:text-left">
                <h2 className="sr-only">Manifiesto 2026</h2>

                <p ref={addToRefs} className="text-xl md:text-3xl font-light leading-relaxed text-white">
                    <span className="font-bold text-white">2026</span> es un año excepcional para la arquitectura y la cultura.
                </p>

                <p ref={addToRefs} className="text-lg md:text-2xl font-light leading-relaxed text-gray-300">
                    <span className="font-bold text-white">Barcelona, Capital Mundial de la Arquitectura 2026</span>,
                    reconocimiento otorgado por la <span className="font-bold text-white">UNESCO</span> y la <span className="font-bold text-white">Unión Internacional de Arquitectos</span>.
                </p>

                <p ref={addToRefs} className="text-lg md:text-2xl font-light leading-relaxed text-gray-300">
                    <span className="font-bold text-white">Año Gaudí 2026</span> — conmemoración oficial del centenario
                    de la muerte de Antoni Gaudí, promovida por la <span className="font-bold text-white">Generalitat de Catalunya</span>.
                </p>

                <p ref={addToRefs} className="text-lg md:text-2xl font-light leading-relaxed text-gray-300">
                    El <span className="font-bold text-white">Consell Antoni Gaudí</span> coordina la difusión, conservación
                    y puesta en valor del legado de Gaudí.
                </p>

                <p ref={addToRefs} className="text-lg md:text-2xl font-light leading-relaxed text-gray-300">
                    Esta confluencia convierte a <span className="font-bold text-white">Barcelona</span> en epicentro global
                    de la arquitectura, el arte y la innovación.
                </p>
            </div>
        </section>
    );
}
