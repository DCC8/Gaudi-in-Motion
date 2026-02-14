"use client";

import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

interface IntroSectionProps {
    isActive?: boolean;
    onComplete?: () => void;
    onReverse?: () => void;
}

const TEXT_BLOCKS = [
    "GAUDI in Motion es una obra de arte digital generativo que transforma el legado de Antoni Gaudí en una experiencia viva, interactiva y en constante evolución.",
    "No es una pieza estática, sino un sistema creativo en tiempo real donde la arquitectura se convierte en luz, datos y movimiento.",
    "Cada imagen nace en el instante y se transforma con la presencia del espectador, convirtiendo el espacio en un organismo sensible que respira con quien lo habita.",
    "La arquitectura deja de ser contenedor para convertirse en emoción activa.",
    "El diseño se transforma en comportamiento.",
    "La tecnología se vuelve invisible y se convierte en lenguaje artístico.",
];

const SLIDE_MEDIA = [
    { type: "image" as const, src: "/slide 2/interaction.png" },
    { type: "video" as const, src: "/slide 2/vidio1guadi.mp4" },
    { type: "image" as const, src: "/slide 2/imagen1gaudi.webp" },
    { type: "video" as const, src: "/slide 2/video2gaudi.mp4" },
    { type: "image" as const, src: "/slide 2/imagen 4.webp" },
    { type: "image" as const, src: "/slide 2/imagne3gaudi.webp" },
];

export default function IntroSection({ isActive = false, onComplete, onReverse }: IntroSectionProps) {
    const stepRef = useRef(0);
    const animatingRef = useRef(false);
    const cooldownRef = useRef(false);
    const textRefs = useRef<(HTMLDivElement | null)[]>([]);
    const mediaContainerRef = useRef<HTMLDivElement>(null);
    const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
    const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

    // Keep callbacks fresh without re-creating handlers
    const onCompleteRef = useRef(onComplete);
    const onReverseRef = useRef(onReverse);
    onCompleteRef.current = onComplete;
    onReverseRef.current = onReverse;

    // Animate between steps
    const goToStep = useCallback((newStep: number, direction: 1 | -1) => {
        const oldStep = stepRef.current;
        if (newStep === oldStep || animatingRef.current) return;

        animatingRef.current = true;

        const oldSlide = textRefs.current[oldStep];
        const newSlide = textRefs.current[newStep];
        const dots = dotsRef.current;

        const tl = gsap.timeline({
            onComplete: () => { animatingRef.current = false; },
        });

        // Exit current text
        if (oldSlide) {
            tl.to(oldSlide, {
                autoAlpha: 0,
                y: -25 * direction,
                filter: "blur(6px)",
                duration: 0.35,
                ease: "power2.in",
            });
        }

        // Enter new text (slight overlap for fluidity)
        if (newSlide) {
            tl.fromTo(
                newSlide,
                { autoAlpha: 0, y: 30 * direction, filter: "blur(6px)" },
                {
                    autoAlpha: 1,
                    y: 0,
                    filter: "blur(0px)",
                    duration: 0.45,
                    ease: "power2.out",
                },
                "-=0.1"
            );
        }

        // Update dots directly
        dots.forEach((dot, i) => {
            if (!dot) return;
            const active = i === newStep;
            gsap.to(dot, {
                width: active ? 6 : 4,
                height: active ? 6 : 4,
                backgroundColor: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                scale: active ? 1 : 0.7,
                duration: 0.3,
                ease: "power2.out",
            });
        });

        // Crossfade media
        const oldMedia = mediaRefs.current[oldStep];
        const newMedia = mediaRefs.current[newStep];

        if (oldMedia) {
            gsap.to(oldMedia, {
                autoAlpha: 0,
                scale: 1.05,
                duration: 0.5,
                ease: "power2.in",
            });
            // Pause old video if applicable
            const oldVideo = oldMedia.querySelector("video");
            if (oldVideo) oldVideo.pause();
        }

        if (newMedia) {
            gsap.fromTo(newMedia,
                { autoAlpha: 0, scale: 0.95 },
                { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power2.out", delay: 0.15 }
            );
            // Play new video if applicable
            const newVideo = newMedia.querySelector("video");
            if (newVideo) newVideo.play().catch(() => {});
        }

        stepRef.current = newStep;
    }, []);

    // Reset everything when section becomes active
    useEffect(() => {
        if (!isActive) return;

        stepRef.current = 0;
        animatingRef.current = false;
        cooldownRef.current = false;

        textRefs.current.forEach((slide, i) => {
            if (!slide) return;
            gsap.set(slide, {
                autoAlpha: i === 0 ? 1 : 0,
                y: i === 0 ? 0 : 30,
                filter: i === 0 ? "blur(0px)" : "blur(6px)",
            });
        });

        dotsRef.current.forEach((dot, i) => {
            if (!dot) return;
            gsap.set(dot, {
                width: i === 0 ? 6 : 4,
                height: i === 0 ? 6 : 4,
                backgroundColor: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                scale: i === 0 ? 1 : 0.7,
            });
        });

        // Reset media: show first, hide rest, manage video playback
        mediaRefs.current.forEach((media, i) => {
            if (!media) return;
            gsap.set(media, { autoAlpha: i === 0 ? 1 : 0, scale: 1 });
            const video = media.querySelector("video");
            if (video) {
                if (i === 0) video.play().catch(() => {});
                else video.pause();
            }
        });
    }, [isActive]);

    // 1 wheel tick = 1 step. Cooldown prevents double-firing.
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (cooldownRef.current || animatingRef.current) return;

        cooldownRef.current = true;
        setTimeout(() => { cooldownRef.current = false; }, 450);

        if (e.deltaY > 0) {
            // Down → next
            if (stepRef.current < TEXT_BLOCKS.length - 1) {
                goToStep(stepRef.current + 1, 1);
            } else {
                onCompleteRef.current?.();
            }
        } else if (e.deltaY < 0) {
            // Up → prev
            if (stepRef.current > 0) {
                goToStep(stepRef.current - 1, -1);
            } else {
                onReverseRef.current?.();
            }
        }
    }, [goToStep]);

    return (
        <section
            onWheel={handleWheel}
            className="w-full h-full relative bg-black overflow-hidden no-swipe"
        >
            {/* Ambient radial light */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_50%,rgba(18,18,18,1)_0%,rgba(0,0,0,1)_100%)]" />

            <div className="relative w-full h-full flex flex-row items-center z-10">

                {/* LEFT: Text Column */}
                <div className="w-1/2 h-full flex items-center justify-center relative px-16 md:px-24">

                    {/* Progress Dots */}
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-30">
                        {TEXT_BLOCKS.map((_, i) => (
                            <div
                                key={i}
                                ref={(el) => { dotsRef.current[i] = el; }}
                                className="rounded-full"
                                style={{
                                    width: i === 0 ? 6 : 4,
                                    height: i === 0 ? 6 : 4,
                                    backgroundColor: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                                }}
                            />
                        ))}
                    </div>

                    {/* Stacked Text Blocks */}
                    <div className="relative w-full max-w-lg h-[200px]">
                        {TEXT_BLOCKS.map((text, i) => (
                            <div
                                key={i}
                                ref={(el) => { textRefs.current[i] = el; }}
                                className="absolute inset-0 flex flex-col justify-center"
                                style={{
                                    opacity: i === 0 ? 1 : 0,
                                    willChange: "transform, opacity, filter",
                                }}
                            >
                                <span className="text-white/25 font-mono text-[10px] mb-5 tracking-[0.4em] uppercase">
                                    {String(i + 1).padStart(2, "0")} / {String(TEXT_BLOCKS.length).padStart(2, "0")}
                                </span>
                                <p className="text-xl md:text-2xl lg:text-3xl font-light text-gray-200 leading-relaxed">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Media */}
                <div className="w-1/2 h-full flex items-center justify-center relative px-12">
                    <div
                        ref={mediaContainerRef}
                        className="relative w-full max-w-md aspect-[3/4] rounded-[32px] overflow-hidden border border-white/[0.06] shadow-[0_0_60px_rgba(0,0,0,0.5)]"
                    >
                        {/* Stacked media layers */}
                        {SLIDE_MEDIA.map((media, i) => (
                            <div
                                key={i}
                                ref={(el) => { mediaRefs.current[i] = el; }}
                                className="absolute inset-0"
                                style={{
                                    opacity: i === 0 ? 1 : 0,
                                    willChange: "transform, opacity",
                                }}
                            >
                                {media.type === "video" ? (
                                    <video
                                        className="w-full h-full object-cover"
                                        loop
                                        muted
                                        playsInline
                                        src={media.src}
                                    />
                                ) : (
                                    <img
                                        src={media.src}
                                        alt={`Gaudi ${i + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        ))}

                        {/* Cinematic gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />

                        {/* HUD Overlay */}
                        <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
                            <div className="flex justify-between items-start">
                                <span className="text-[9px] font-mono text-white/30 tracking-[0.25em] uppercase">
                                    SYS_VISUAL_01
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-mono text-white/30 tracking-[0.25em] uppercase">
                                    LAT: 12ms
                                </span>
                                <span className="text-[9px] font-mono text-white/30 tracking-[0.25em] uppercase">
                                    RENDER: LIVE
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
