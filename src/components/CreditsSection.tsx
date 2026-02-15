"use client";

import React, { useRef, useCallback, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useIsMobile } from "@/hooks/useMobile";

interface CreditsSectionProps {
    isActive: boolean;
    onReverse?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WaterTexture — Paints expanding/decaying mouse trail dots onto a canvas.
// Direction encoded in R/G, intensity in B.
// Source: Codrops "Creating a Water-like Distortion Effect with Three.js"
// ═══════════════════════════════════════════════════════════════════════════════

class WaterTexture {
    size: number;
    radius: number;
    maxAge: number;
    points: { x: number; y: number; age: number; force: number; vx: number; vy: number }[];
    last: { x: number; y: number } | null;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    texture: THREE.CanvasTexture;

    constructor(size = 128) {
        this.size = size;
        this.radius = size * 0.08;
        this.maxAge = 80;
        this.points = [];
        this.last = null;
        this.canvas = document.createElement("canvas");
        this.canvas.width = size;
        this.canvas.height = size;
        this.ctx = this.canvas.getContext("2d")!;
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.clear();
    }

    clear() {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.size, this.size);
    }

    addPoint(point: { x: number; y: number }) {
        let force = 0, vx = 0, vy = 0;
        if (this.last) {
            const dx = point.x - this.last.x;
            const dy = point.y - this.last.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);
            if (dist > 0.001) { vx = dx / dist; vy = dy / dist; }
            force = Math.min(distSq * 10000, 1);
        }
        this.last = { ...point };
        this.points.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
    }

    update() {
        this.clear();
        this.points = this.points.filter(p => p.age <= this.maxAge);
        for (const p of this.points) {
            const slow = 1 - p.age / this.maxAge;
            const f = p.force * (1 / this.maxAge) * slow;
            p.x += p.vx * f;
            p.y += p.vy * f;
            p.age++;
        }
        for (const p of this.points) this.drawPoint(p);
        this.texture.needsUpdate = true;
    }

    drawPoint(p: (typeof this.points)[0]) {
        const px = p.x * this.size;
        const py = p.y * this.size;

        const riseEnd = this.maxAge * 0.3;
        let intensity: number;
        if (p.age < riseEnd) {
            intensity = Math.sin((p.age / riseEnd) * (Math.PI / 2));
        } else {
            const t = 1 - (p.age - riseEnd) / (this.maxAge * 0.7);
            intensity = Math.max(0, -t * (t - 2));
        }
        intensity *= p.force;

        const red = ((p.vx + 1) / 2) * 255;
        const green = ((p.vy + 1) / 2) * 255;
        const blue = intensity * 255;

        const ctx = this.ctx;
        const offset = this.size * 5;
        ctx.shadowOffsetX = offset;
        ctx.shadowOffsetY = offset;
        ctx.shadowBlur = this.radius;
        ctx.shadowColor = `rgba(${red},${green},${blue},${0.2 * intensity})`;

        ctx.beginPath();
        ctx.fillStyle = "rgba(255,0,0,1)";
        ctx.arc(px - offset, py - offset, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// usePaddedSvgTexture — renders SVG to a padded canvas for displacement room
// ═══════════════════════════════════════════════════════════════════════════════

function usePaddedSvgTexture(src: string) {
    const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            const W = 2048;
            const canvasAspect = 2.8;
            const H = Math.round(W / canvasAspect);

            const canvas = document.createElement("canvas");
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.clearRect(0, 0, W, H);

            // Center logo within padded canvas
            const logoW = W * 0.9;
            const logoH = logoW * (img.height / img.width);
            const x = (W - logoW) / 2;
            const y = (H - logoH) / 2;
            ctx.drawImage(img, x, y, logoW, logoH);

            const tex = new THREE.CanvasTexture(canvas);
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.needsUpdate = true;
            setTexture(tex);
        };
        img.src = src;
    }, [src]);

    return texture;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uLogo;
  uniform sampler2D uBuildingTex;
  uniform sampler2D uTrail;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Read trail data: R = direction X, G = direction Y, B = intensity
    vec4 trail = texture2D(uTrail, uv);
    float dx = -(trail.r * 2.0 - 1.0);
    float dy = -(trail.g * 2.0 - 1.0);
    float intensity = trail.b;

    // UV displacement from trail (zero when no mouse movement)
    float amplitude = 0.08;
    vec2 disp = vec2(dx, dy) * intensity * amplitude;
    vec2 dUv = uv + disp;

    // Sample logo at displaced UV
    float baseAlpha = texture2D(uLogo, dUv).a;

    // Chromatic aberration along displacement direction
    float ca = intensity * 0.025;
    vec2 caDir = length(vec2(dx, dy)) > 0.001 ? normalize(vec2(dx, dy)) : vec2(1.0, 0.0);
    float rAlpha = texture2D(uLogo, dUv + caDir * ca).a;
    float bAlpha = texture2D(uLogo, dUv - caDir * ca).a;
    float alpha = max(baseAlpha, max(rAlpha, bAlpha));

    // Base white + building texture reveal (gated by intensity)
    vec3 white = vec3(0.92);
    vec4 bTex = texture2D(uBuildingTex, dUv * 1.3);
    float reveal = smoothstep(0.05, 0.45, intensity);
    vec3 color = mix(white, bTex.rgb * 1.2, reveal);

    // RGB channel split at chromatic edges
    color.r *= 1.0 + (rAlpha - baseAlpha) * 1.2;
    color.b *= 1.0 + (bAlpha - baseAlpha) * 1.2;

    // Warm glow near trail activity
    color += vec3(1.0, 0.97, 0.92) * intensity * 0.1;

    gl_FragColor = vec4(color, alpha);
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// LogoMesh — Three.js mesh with trail-driven distortion
// ═══════════════════════════════════════════════════════════════════════════════

function LogoMesh({
    isActive,
    waterTexRef,
    logoTex,
}: {
    isActive: boolean;
    waterTexRef: React.MutableRefObject<WaterTexture | null>;
    logoTex: THREE.CanvasTexture;
}) {
    const { viewport, invalidate } = useThree();
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const buildingTex = useTexture(
        "/logo/Untitled_Building_Texture_Extraction_2026-02-14_16-12.png"
    );

    useEffect(() => {
        if (buildingTex) {
            buildingTex.wrapS = THREE.RepeatWrapping;
            buildingTex.wrapT = THREE.RepeatWrapping;
        }
    }, [buildingTex]);

    const uniforms = useMemo(
        () => ({
            uLogo: { value: logoTex },
            uBuildingTex: { value: buildingTex },
            uTrail: { value: null as THREE.Texture | null },
        }),
        [logoTex, buildingTex]
    );

    useFrame(() => {
        if (!isActive) return;
        invalidate();

        const water = waterTexRef.current;
        if (water) {
            water.update();
            if (materialRef.current) {
                materialRef.current.uniforms.uTrail.value = water.texture;
            }
        }
    });

    useEffect(() => {
        if (isActive) invalidate();
    }, [isActive, invalidate]);

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CreditsSection
// ═══════════════════════════════════════════════════════════════════════════════

export default function CreditsSection({ isActive, onReverse }: CreditsSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const logoContainerRef = useRef<HTMLDivElement>(null);
    const [showCursor, setShowCursor] = useState(false);
    const waterTexRef = useRef<WaterTexture | null>(null);
    const logoTex = usePaddedSvgTexture("/logo/Logo-Flowners_texto_white_3k.svg");
    const isMobile = useIsMobile();

    useEffect(() => {
        waterTexRef.current = new WaterTexture(128);
        return () => { waterTexRef.current = null; };
    }, []);

    // Feed position to WaterTexture (normalized to logo container)
    const feedWaterTexture = useCallback((clientX: number, clientY: number) => {
        const el = logoContainerRef.current;
        if (el && waterTexRef.current) {
            const rect = el.getBoundingClientRect();
            const x = (clientX - rect.left) / rect.width;
            const y = (clientY - rect.top) / rect.height;
            if (x >= -0.05 && x <= 1.05 && y >= -0.05 && y <= 1.05) {
                waterTexRef.current.addPoint({
                    x: Math.max(0, Math.min(1, x)),
                    y: Math.max(0, Math.min(1, y)),
                });
            }
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${e.clientX - 40}px, ${e.clientY - 40}px)`;
        }
        feedWaterTexture(e.clientX, e.clientY);
    }, [feedWaterTexture]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        if (touch) {
            feedWaterTexture(touch.clientX, touch.clientY);
        }
    }, [feedWaterTexture]);

    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            if (e.deltaY < -20) onReverse?.();
        },
        [onReverse]
    );

    return (
        <section
            ref={sectionRef}
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseEnter={() => setShowCursor(true)}
            onMouseLeave={() => setShowCursor(false)}
            className={`w-full h-full relative bg-black overflow-hidden no-swipe flex flex-col items-center justify-center ${isMobile ? '' : 'cursor-none'}`}
        >
            {/* Custom circle cursor — desktop only */}
            <div
                ref={cursorRef}
                className={`pointer-events-none fixed top-0 left-0 z-50 w-20 h-20 rounded-full border border-white/25 ${isMobile ? 'hidden' : ''}`}
                style={{
                    opacity: showCursor ? 1 : 0,
                    transition: "opacity 0.2s ease",
                    willChange: "transform",
                    background:
                        "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
                }}
            />

            {/* Header text */}
            <p className="text-sm md:text-base font-mono text-white/40 tracking-[0.3em] uppercase mb-12 z-10">
                Proyecto conceptualizado y producido por
            </p>

            {/* Logo — generous container (2.8:1 aspect) for displacement headroom */}
            <div
                ref={logoContainerRef}
                className="relative w-[90vw] md:w-[700px] md:max-w-[90vw]"
                style={{ aspectRatio: "2.8 / 1" }}
            >
                {logoTex && (
                    <Canvas
                        camera={{ position: [0, 0, 5], fov: 50 }}
                        dpr={[1, 2]}
                        gl={{ antialias: true, alpha: true }}
                        frameloop="demand"
                        className={isMobile ? '' : 'cursor-none'}
                        style={{ background: "transparent" }}
                    >
                        <React.Suspense fallback={null}>
                            <LogoMesh
                                isActive={isActive}
                                waterTexRef={waterTexRef}
                                logoTex={logoTex}
                            />
                        </React.Suspense>
                    </Canvas>
                )}
            </div>

            {/* Bottom year */}
            <p className="mt-16 text-xs font-mono text-white/20 tracking-[0.5em] z-10">
                2026
            </p>
        </section>
    );
}
