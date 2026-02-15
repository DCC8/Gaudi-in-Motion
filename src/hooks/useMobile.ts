"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── useIsMobile ─────────────────────────────────────────────────────────────
// Returns true when viewport width < 768px (Tailwind md breakpoint).

export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return isMobile;
}

// ─── useTouchNav ─────────────────────────────────────────────────────────────
// Attaches touchstart/touchend to a ref element.
// Fires onNext on swipe-up (deltaY > threshold) and onPrev on swipe-down.

export function useTouchNav(
    onNext: () => void,
    onPrev: () => void,
    threshold = 50
) {
    const ref = useRef<HTMLElement | null>(null);
    const startY = useRef(0);
    const cooldown = useRef(false);

    const onNextRef = useRef(onNext);
    const onPrevRef = useRef(onPrev);
    onNextRef.current = onNext;
    onPrevRef.current = onPrev;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleTouchStart = (e: TouchEvent) => {
            startY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (cooldown.current) return;
            const deltaY = startY.current - e.changedTouches[0].clientY;

            if (Math.abs(deltaY) < threshold) return;

            cooldown.current = true;
            setTimeout(() => { cooldown.current = false; }, 450);

            if (deltaY > 0) {
                onNextRef.current();
            } else {
                onPrevRef.current();
            }
        };

        el.addEventListener("touchstart", handleTouchStart, { passive: true });
        el.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            el.removeEventListener("touchstart", handleTouchStart);
            el.removeEventListener("touchend", handleTouchEnd);
        };
    }, [threshold]);

    return ref;
}
