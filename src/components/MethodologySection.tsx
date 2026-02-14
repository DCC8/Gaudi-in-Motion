"use client";

import React from "react";
import { motion } from "framer-motion";

interface MethodologySectionProps {
    isActive: boolean;
    onComplete?: () => void;
    onReverse?: () => void;
}

export default function MethodologySection({ isActive, onComplete, onReverse }: MethodologySectionProps) {
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Boundary detection for scrolling behavior on mobile/overflow
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtTop = scrollTop <= 5;
        const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 5;
        const isOverflowing = scrollHeight > clientHeight;

        if (!isOverflowing) {
            if (e.deltaY < -10) onReverse?.();
            else if (e.deltaY > 10) onComplete?.();
            return;
        }

        if (isAtTop && e.deltaY < -10) {
            onReverse?.();
        } else if (isAtBottom && e.deltaY > 10) {
            onComplete?.();
        }
    };

    return (
        <section className="w-full h-full flex items-center justify-center relative bg-black">
            {/* Scrollable Container */}
            <div
                ref={containerRef}
                onWheel={handleWheel}
                className="w-full h-full overflow-y-auto overflow-x-hidden no-swipe p-6 md:p-12 lg:p-20 flex flex-col items-center justify-center scroll-smooth"
            >
                <div className="w-full h-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-auto lg:grid-rows-[auto_1fr_1fr] gap-6 min-h-min">

                    {/* --- HEADER (Full Width) --- */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col justify-end mb-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={isActive ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                                Framework de Interactividad
                            </h2>
                            <div className="h-0.5 w-20 bg-indigo-500 mb-4" />
                            <p className="text-lg text-white/60 max-w-2xl font-light leading-relaxed">
                                Una arquitectura tecnológica diseñada para transformar la presencia humana en
                                arte generativo vivo, sin latencia y en constante evolución.
                            </p>
                        </motion.div>
                    </div>

                    {/* --- STEP 1: CAPTURA --- */}
                    <BentoCard className="md:col-span-1 lg:col-span-1 row-span-1" delay={0.1}>
                        <div className="h-full flex flex-col p-6 relative z-10">
                            <StepNumber>01</StepNumber>
                            <div className="flex-1 flex items-center justify-center py-4">
                                <RadarIcon isActive={isActive} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">Captura</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-light">
                                    Sensores de profundidad e infrarrojos mapean la presencia y movimiento del usuario en tiempo real con precisión milimétrica.
                                </p>
                            </div>
                        </div>
                    </BentoCard>

                    {/* --- STEP 2: INTERPRETACIÓN --- */}
                    <BentoCard className="md:col-span-1 lg:col-span-1 row-span-1" delay={0.2}>
                        <div className="h-full flex flex-col p-6 relative z-10">
                            <StepNumber>02</StepNumber>
                            <div className="flex-1 flex items-center justify-center py-4">
                                <DataStreamIcon isActive={isActive} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">Interpretación</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-light">
                                    Los datos brutos se convierten en señales digitales que alimentan el sistema nervioso central de la obra.
                                </p>
                            </div>
                        </div>
                    </BentoCard>

                    {/* --- CENTER VISUAL (Node Chain Diagram) --- */}
                    <BentoCard className="md:col-span-2 lg:col-span-2 lg:row-span-2 relative overflow-hidden" delay={0.3}>
                        {/* Header */}
                        <div className="absolute top-4 left-5 z-10">
                            <span className="text-[9px] font-mono text-white/30 tracking-[0.3em] uppercase">// System Overview</span>
                        </div>
                        {/* Centered Diagram */}
                        <div className="absolute inset-0 flex items-center justify-center px-4">
                            <SystemDiagram isActive={isActive} />
                        </div>
                        {/* Footer */}
                        <div className="absolute bottom-4 left-5 right-5 z-10">
                            <div className="w-full bg-white/8 h-px mb-3" />
                            <div className="flex justify-between items-center text-[9px] font-mono">
                                <span className="text-white/30">Pipeline: SDXL Turbo + LORA</span>
                                <span className="text-white/30">Latency: 15FPS</span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                    <span className="text-emerald-400/70">Streaming</span>
                                </span>
                            </div>
                        </div>
                    </BentoCard>

                    {/* --- STEP 3: GENERACIÓN IA --- */}
                    <BentoCard className="md:col-span-1 lg:col-span-1 row-span-1" delay={0.4}>
                        <div className="h-full flex flex-col p-6 relative z-10">
                            <StepNumber>03</StepNumber>
                            <div className="flex-1 flex items-center justify-center py-4">
                                <NeuralMeshIcon isActive={isActive} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">Generación IA</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-light">
                                    Algoritmos generativos crean geometría viva que muta y evoluciona sin repetirse jamás, basada en tus gestos.
                                </p>
                            </div>
                        </div>
                    </BentoCard>

                    {/* --- STEP 4: SALIDA VISUAL --- */}
                    <BentoCard className="md:col-span-1 lg:col-span-1 row-span-1" delay={0.5}>
                        <div className="h-full flex flex-col p-6 relative z-10">
                            <StepNumber>04</StepNumber>
                            <div className="flex-1 flex items-center justify-center py-4">
                                <WaveformIcon isActive={isActive} />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">Salida Visual</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-light">
                                    Renderizado de alta frecuencia (60fps+) para una experiencia visual fluida y sin latencia perceptible.
                                </p>
                            </div>
                        </div>
                    </BentoCard>

                </div>
            </div>
        </section>
    );
}

// --- SUBCOMPONENTS ---

function BentoCard({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={`relative rounded-2xl overflow-hidden bg-transparent border border-white/15 hover:border-white/40 transition-all duration-500 group ${className}`}
        >
            {children}
        </motion.div>
    );
}

function StepNumber({ children }: { children: React.ReactNode }) {
    return (
        <span className="text-[10px] font-mono text-white/30 tracking-widest">
            // {children}
        </span>
    );
}

// --- ICONS (SVG ANIMATIONS - Optimized for small sizes) ---

function RadarIcon({ isActive }: { isActive: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className="w-32 h-32 fill-none stroke-[1.2]" style={{ filter: "drop-shadow(0 0 8px rgba(129, 140, 248, 0.4))" }}>
            {[1, 2, 3].map((i) => (
                <motion.circle
                    key={i}
                    cx="50"
                    cy="50"
                    r={12 * i}
                    className="stroke-indigo-400"
                    animate={isActive ? { r: [12 * i, 48], opacity: [0.8, 0] } : {}}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
                />
            ))}
            <circle cx="50" cy="50" r="14" className="stroke-indigo-300/30" strokeWidth="0.5" />
            <motion.line
                x1="50" y1="50" x2="50" y2="8"
                className="stroke-indigo-300"
                strokeWidth="1.5"
                animate={isActive ? { rotate: [0, 360] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "50px 50px" }}
            />
            <circle cx="50" cy="50" r="3" className="fill-white" />
            <circle cx="50" cy="50" r="6" className="fill-indigo-400/20" />
        </svg>
    )
}

function DataStreamIcon({ isActive }: { isActive: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className="w-32 h-32 fill-none stroke-[1.2]" style={{ filter: "drop-shadow(0 0 6px rgba(129, 140, 248, 0.3))" }}>
            {[0, 1, 2, 3].map((i) => (
                <motion.path
                    key={i}
                    d={`M${15 + i * 20} 85 C ${15 + i * 20} 55, ${85 - i * 20} 45, ${85 - i * 20} 15`}
                    className="stroke-indigo-400/80"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={isActive ? { pathLength: 1, opacity: [0, 1, 0] } : {}}
                    transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.35, repeatDelay: 0.3 }}
                />
            ))}
            {[20, 50, 80].map((y, i) => (
                <motion.circle
                    key={`dot-${i}`}
                    cx="50"
                    cy={y}
                    r="2.5"
                    className="fill-indigo-300"
                    animate={isActive ? { opacity: [0.2, 1, 0.2], r: [1.5, 3.5, 1.5] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
                />
            ))}
            <line x1="50" y1="10" x2="50" y2="90" className="stroke-white/10" strokeWidth="0.3" strokeDasharray="2 4" />
        </svg>
    )
}

function NeuralMeshIcon({ isActive }: { isActive: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className="w-32 h-32 fill-none" style={{ filter: "drop-shadow(0 0 8px rgba(129, 140, 248, 0.35))" }}>
            <motion.path
                d="M15 50 Q 50 15 85 50"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.2"
                animate={isActive ? { d: ["M15 50 Q 50 15 85 50", "M15 50 Q 50 85 85 50", "M15 50 Q 50 15 85 50"] } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
                d="M50 15 Q 85 50 50 85"
                stroke="rgba(129, 140, 248, 0.9)"
                strokeWidth="1.2"
                animate={isActive ? { d: ["M50 15 Q 85 50 50 85", "M50 15 Q 15 50 50 85", "M50 15 Q 85 50 50 85"] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.path
                d="M25 25 Q 50 50 75 25"
                stroke="rgba(199, 210, 254, 0.4)"
                strokeWidth="0.8"
                animate={isActive ? { d: ["M25 25 Q 50 50 75 25", "M25 75 Q 50 50 75 75", "M25 25 Q 50 50 75 25"] } : {}}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            {/* Neural nodes */}
            {[[30, 35], [70, 35], [50, 65], [35, 55], [65, 55]].map(([cx, cy], i) => (
                <motion.circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="3"
                    className="fill-indigo-300"
                    animate={isActive ? { r: [2, 4.5, 2], opacity: [0.4, 1, 0.4] } : {}}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                />
            ))}
            {/* Connection lines between nodes */}
            <line x1="30" y1="35" x2="70" y2="35" className="stroke-white/15" strokeWidth="0.5" />
            <line x1="30" y1="35" x2="50" y2="65" className="stroke-white/15" strokeWidth="0.5" />
            <line x1="70" y1="35" x2="50" y2="65" className="stroke-white/15" strokeWidth="0.5" />
            <line x1="35" y1="55" x2="65" y2="55" className="stroke-indigo-400/20" strokeWidth="0.5" />
        </svg>
    )
}

function WaveformIcon({ isActive }: { isActive: boolean }) {
    return (
        <svg viewBox="0 0 100 100" className="w-32 h-32" style={{ filter: "drop-shadow(0 0 6px rgba(129, 140, 248, 0.3))" }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <motion.rect
                    key={i}
                    x={18 + i * 10}
                    y={50}
                    width="6"
                    rx="3"
                    height="6"
                    className="fill-indigo-400"
                    animate={isActive ? {
                        height: [6, 40 + Math.sin(i) * 15, 6],
                        y: [47, 30 - Math.sin(i) * 8, 47],
                        opacity: [0.5, 1, 0.5]
                    } : {}}
                    transition={{ duration: 1.0 + i * 0.08, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                />
            ))}
            <line x1="12" y1="50" x2="88" y2="50" className="stroke-white/15" strokeWidth="0.5" />
        </svg>
    )
}


function SystemDiagram({ isActive }: { isActive: boolean }) {
    // TouchDesigner-style node chain
    // Row 1: Input → Pre-Process → IA Ingestion
    // Row 2: Post-Process → Upscaling → Output
    const NW = 90, NH = 62; // node dimensions
    const row1Y = 20, row2Y = 140;
    const cols = [100, 250, 400]; // x positions for 3 columns (centered in 500 viewBox)

    const nodes = [
        { x: cols[0], y: row1Y, label: "INPUT", color: "#818cf8" },
        { x: cols[1], y: row1Y, label: "PRE-PROCESS", color: "#818cf8" },
        { x: cols[2], y: row1Y, label: "IA INGESTION", color: "#a78bfa" },
        { x: cols[0], y: row2Y, label: "POST-PROCESS", color: "#a78bfa" },
        { x: cols[1], y: row2Y, label: "UPSCALING", color: "#34d399" },
        { x: cols[2], y: row2Y, label: "OUTPUT", color: "#34d399" },
    ];

    // Wire paths: connector points (right edge of node → left edge of next)
    const wires = [
        // Row 1: Input→Pre-Process
        { d: `M${cols[0] + NW / 2} ${row1Y + NH / 2} L${cols[1] - NW / 2} ${row1Y + NH / 2}` },
        // Row 1: Pre-Process→IA Ingestion
        { d: `M${cols[1] + NW / 2} ${row1Y + NH / 2} L${cols[2] - NW / 2} ${row1Y + NH / 2}` },
        // Vertical: IA Ingestion→Post-Process (diagonal down-left)
        { d: `M${cols[2] + NW / 2 - 20} ${row1Y + NH} C${cols[2]} ${row1Y + NH + 35}, ${cols[0] + NW} ${row2Y - 35}, ${cols[0] + NW / 2 - 20} ${row2Y}` },
        // Row 2: Post-Process→Upscaling
        { d: `M${cols[0] + NW / 2} ${row2Y + NH / 2} L${cols[1] - NW / 2} ${row2Y + NH / 2}` },
        // Row 2: Upscaling→Output
        { d: `M${cols[1] + NW / 2} ${row2Y + NH / 2} L${cols[2] - NW / 2} ${row2Y + NH / 2}` },
    ];

    return (
        <svg viewBox="0 0 500 270" className="w-full h-auto max-h-full">
            <defs>
                <filter id="nodeGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {/* ── WIRES ── */}
            {wires.map((wire, i) => (
                <g key={`wire-${i}`}>
                    <path d={wire.d} fill="none" className="stroke-white/8" strokeWidth="1" />
                    <motion.path
                        d={wire.d}
                        fill="none"
                        className="stroke-indigo-400/50"
                        strokeWidth="1.5"
                        strokeDasharray="6 8"
                        animate={isActive ? { strokeDashoffset: [0, -28] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                    />
                    {/* Traveling particle */}
                    <motion.circle
                        r="2.5"
                        className="fill-indigo-400"
                        style={{ filter: "url(#nodeGlow)" }}
                        animate={isActive ? {
                            offsetDistance: ["0%", "100%"],
                            opacity: [0, 1, 1, 0],
                        } : { opacity: 0 }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                    >
                        <set attributeName="offset-path" to={`path('${wire.d}')`} />
                    </motion.circle>
                </g>
            ))}

            {/* ── CONNECTOR DOTS (in/out ports on nodes) ── */}
            {nodes.map((node, i) => (
                <g key={`ports-${i}`}>
                    {/* Input port (left) - skip first node */}
                    {i !== 0 && i !== 3 && (
                        <circle cx={node.x - NW / 2} cy={node.y + NH / 2} r="3" fill={node.color} opacity={0.6} />
                    )}
                    {/* Output port (right) - skip last node */}
                    {i !== 5 && i !== 2 && (
                        <circle cx={node.x + NW / 2} cy={node.y + NH / 2} r="3" fill={node.color} opacity={0.6} />
                    )}
                    {/* Special ports for the diagonal wire */}
                    {i === 2 && (
                        <circle cx={node.x + NW / 2 - 20} cy={node.y + NH} r="3" fill={node.color} opacity={0.6} />
                    )}
                    {i === 3 && (
                        <circle cx={node.x + NW / 2 - 20} cy={node.y} r="3" fill={node.color} opacity={0.6} />
                    )}
                </g>
            ))}

            {/* ── NODES ── */}
            {nodes.map((node, i) => (
                <g key={`node-${i}`} transform={`translate(${node.x - NW / 2}, ${node.y})`}>
                    {/* Node body */}
                    <rect
                        width={NW} height={NH} rx="6"
                        fill="rgba(255,255,255,0.03)"
                        stroke={node.color}
                        strokeWidth="1"
                        opacity={0.7}
                    />
                    {/* Top header bar */}
                    <rect width={NW} height="14" rx="6" fill={node.color} opacity={0.12} />
                    <rect x="0" y="8" width={NW} height="6" fill={node.color} opacity={0.12} />
                    {/* Label */}
                    <text x={NW / 2} y="10" textAnchor="middle" fill={node.color} fontSize="6.5" fontFamily="monospace" fontWeight="bold" opacity={0.9}>
                        {node.label}
                    </text>
                </g>
            ))}

            {/* ── NODE ANIMATIONS (inside each node) ── */}

            {/* 1: INPUT - Waveform signal */}
            <g transform={`translate(${cols[0]}, ${row1Y + 40})`}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <motion.line
                        key={`inp-${i}`}
                        x1={-32 + i * 9} y1="0"
                        x2={-32 + i * 9} y2="0"
                        stroke="#818cf8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        animate={isActive ? {
                            y1: [0, -6 - Math.sin(i * 1.2) * 6, 0],
                            y2: [0, 6 + Math.sin(i * 1.2) * 6, 0],
                        } : {}}
                        transition={{ duration: 0.8 + i * 0.05, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
                    />
                ))}
            </g>

            {/* 2: PRE-PROCESS - Grid filter / matrix dots */}
            <g transform={`translate(${cols[1]}, ${row1Y + 40})`}>
                {[-2, -1, 0, 1, 2].map((row) =>
                    [-3, -2, -1, 0, 1, 2, 3].map((col) => (
                        <motion.circle
                            key={`pp-${row}-${col}`}
                            cx={col * 6} cy={row * 6}
                            r="1.2"
                            fill="#818cf8"
                            animate={isActive ? {
                                opacity: [0.15, 0.9, 0.15],
                                r: [0.8, 1.8, 0.8],
                            } : {}}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: (Math.abs(row) + Math.abs(col)) * 0.12,
                                ease: "easeInOut",
                            }}
                        />
                    ))
                )}
            </g>

            {/* 3: IA INGESTION - Neural mesh / orbiting */}
            <g transform={`translate(${cols[2]}, ${row1Y + 40})`}>
                <motion.circle
                    cx="0" cy="0" r="14"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="0.6"
                    strokeDasharray="4 3"
                    animate={isActive ? { rotate: 360 } : {}}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "0px 0px" }}
                />
                <motion.circle
                    cx="0" cy="0" r="8"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="0.5"
                    strokeDasharray="3 3"
                    animate={isActive ? { rotate: -360 } : {}}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "0px 0px" }}
                />
                <motion.circle
                    cx="0" cy="0" r="3"
                    fill="#a78bfa"
                    animate={isActive ? { r: [2, 4, 2], opacity: [0.5, 1, 0.5] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                {[0, 1, 2].map((i) => (
                    <motion.circle
                        key={`ai-dot-${i}`}
                        cx="0" cy="-12"
                        r="1.5"
                        fill="white"
                        opacity={0.8}
                        animate={isActive ? { rotate: [i * 120, i * 120 + 360] } : {}}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        style={{ transformOrigin: "0px 0px" }}
                    />
                ))}
            </g>

            {/* 4: POST-PROCESS - Color correction bars */}
            <g transform={`translate(${cols[0]}, ${row2Y + 40})`}>
                {[
                    { x: -28, color: "#f87171", h: 12 },
                    { x: -18, color: "#a78bfa", h: 18 },
                    { x: -8, color: "#818cf8", h: 10 },
                    { x: 2, color: "#34d399", h: 16 },
                    { x: 12, color: "#a78bfa", h: 14 },
                    { x: 22, color: "#818cf8", h: 8 },
                ].map((bar, i) => (
                    <motion.rect
                        key={`bar-${i}`}
                        x={bar.x} y={-bar.h / 2}
                        width="7" height={bar.h}
                        rx="1.5"
                        fill={bar.color}
                        opacity={0.7}
                        animate={isActive ? {
                            height: [bar.h, bar.h * 0.4, bar.h * 1.3, bar.h],
                            y: [-bar.h / 2, -bar.h * 0.2, -bar.h * 0.65, -bar.h / 2],
                            opacity: [0.5, 0.9, 0.7, 0.5],
                        } : {}}
                        transition={{ duration: 2 + i * 0.15, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                    />
                ))}
            </g>

            {/* 5: UPSCALING - Expanding squares */}
            <g transform={`translate(${cols[1]}, ${row2Y + 40})`}>
                {[1, 2, 3].map((i) => (
                    <motion.rect
                        key={`scale-${i}`}
                        x={-5 * i} y={-5 * i}
                        width={10 * i} height={10 * i}
                        rx="2"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="0.8"
                        animate={isActive ? {
                            opacity: [0.2, 0.8, 0.2],
                            scale: [0.9, 1.15, 0.9],
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
                        style={{ transformOrigin: "0px 0px" }}
                    />
                ))}
                <motion.text
                    x="0" y="2"
                    textAnchor="middle"
                    fill="#34d399"
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    animate={isActive ? { opacity: [0.4, 1, 0.4] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    8K
                </motion.text>
            </g>

            {/* 6: OUTPUT - Live render display */}
            <g transform={`translate(${cols[2]}, ${row2Y + 24})`}>
                <rect x="-30" y="-8" width="60" height="34" rx="2" fill="none" stroke="#34d399" strokeWidth="0.6" opacity={0.3} />
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <motion.rect
                        key={`out-${i}`}
                        x={-26 + i * 7.5}
                        y="0"
                        width="5"
                        rx="1"
                        height="4"
                        fill="#34d399"
                        animate={isActive ? {
                            height: [4, 14 + Math.sin(i * 0.9) * 8, 4],
                            y: [10, 4 - Math.sin(i * 0.9) * 4, 10],
                            opacity: [0.3, 0.9, 0.3],
                        } : {}}
                        transition={{ duration: 1.2 + i * 0.06, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
                    />
                ))}
                {/* LIVE badge */}
                <motion.circle
                    cx="25" cy="-4" r="2"
                    fill="#34d399"
                    animate={isActive ? { opacity: [1, 0.2, 1] } : {}}
                    transition={{ duration: 0.7, repeat: Infinity }}
                />
                <text x="19" y="-2" fill="#34d399" fontSize="4.5" fontFamily="monospace" opacity={0.8}>LIVE</text>
            </g>

        </svg>
    )
}
