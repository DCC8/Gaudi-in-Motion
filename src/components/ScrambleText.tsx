import React, { useRef, useLayoutEffect, useImperativeHandle, forwardRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

export interface ScrambleTextHandle {
    play: () => void;
    reset: () => void;
}

interface ScrambleTextProps {
    text: string;
    className?: string;
    scrambleSpeed?: number;
    revealSpeed?: number;
    delay?: number;
    as?: React.ElementType;
    trigger?: string | HTMLElement | null;
    scroller?: HTMLElement | null;
    start?: string;
    manualTrigger?: boolean; // If true, only plays via ref
}

const ScrambleText = forwardRef<ScrambleTextHandle, ScrambleTextProps>(({
    text,
    className = "",
    revealSpeed = 1.5,
    delay = 0,
    as: Component = "span",
    trigger,
    scroller,
    start = "top 80%",
    manualTrigger = false
}, ref) => {
    const elementRef = useRef<HTMLElement>(null);
    const timelineRef = useRef<gsap.core.Tween | null>(null);

    // Expose methods
    useImperativeHandle(ref, () => ({
        play: () => {
            timelineRef.current?.restart();
        },
        reset: () => {
            if (elementRef.current) elementRef.current.textContent = "";
            timelineRef.current?.pause(0);
        }
    }));

    useLayoutEffect(() => {
        const el = elementRef.current;
        if (!el) return;

        let progress = { value: 0 };

        // Kill previous
        if (timelineRef.current) timelineRef.current.kill();

        // Animation — write directly to DOM, no React re-renders
        const anim = gsap.to(progress, {
            value: 1,
            duration: revealSpeed,
            delay: delay,
            paused: true,
            ease: "none",
            onUpdate: () => {
                const p = progress.value;
                const length = text.length;
                const revealedLength = Math.floor(length * p);

                let output = text.substring(0, revealedLength);

                const remaining = length - revealedLength;
                const scrambleLength = Math.min(remaining, 5);

                for (let i = 0; i < scrambleLength; i++) {
                    output += CHARS[Math.floor(Math.random() * CHARS.length)];
                }

                if (el) el.textContent = output;
            },
            onComplete: () => {
                if (el) el.textContent = text;
            }
        });

        timelineRef.current = anim;

        if (!manualTrigger) {
            ScrollTrigger.create({
                trigger: trigger || el,
                scroller: scroller || window,
                start: start,
                onEnter: () => anim.play(),
            });
        }

        return () => {
            anim.kill();
        };
    }, [text, revealSpeed, delay, trigger, scroller, start, manualTrigger]);

    // Use 'any' to bypass strict ref/children checks for dynamic component
    const Tag = Component as any;

    return <Tag ref={elementRef} className={className} />;
});

ScrambleText.displayName = "ScrambleText";

export default ScrambleText;
