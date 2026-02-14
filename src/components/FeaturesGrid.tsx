"use client";

import { motion } from "framer-motion";

const features = [
    {
        title: "Parametric logic",
        description: "Algorithmic generation of forms based on nature's geometry.",
        colSpan: "col-span-12 md:col-span-6 lg:col-span-4",
        h: "h-64",
    },
    {
        title: "Organic Structuralism",
        description: "hyper-optimized structures mimicking bone and tree formations.",
        colSpan: "col-span-12 md:col-span-6 lg:col-span-8",
        h: "h-64",
    },
    {
        title: "Light Synthesis",
        description: "Controlling photon paths through chromatic glass interfaces.",
        colSpan: "col-span-12 md:col-span-4",
        h: "h-96",
    },
    {
        title: "Trencadís 2.0",
        description: "Digital mosaics reassembling fragmented data into coherent visual streams.",
        colSpan: "col-span-12 md:col-span-4",
        h: "h-96",
    },
    {
        title: "Catenary Physics",
        description: "Real-time gravity simulation for perfect load distribution.",
        colSpan: "col-span-12 md:col-span-4",
        h: "h-96",
    },
];

export default function FeaturesGrid() {
    return (
        <section className="w-full h-full bg-black px-4 py-20 md:px-20 relative z-10 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <motion.h2
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-light mb-16 uppercase tracking-tight"
                >
                    Digital <span className="font-bold">Ecosystem</span>
                </motion.h2>

                <div className="grid grid-cols-12 gap-4">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            className={`relative border border-white/10 rounded-xl bg-[#0a0a0a] backdrop-blur-sm p-8 flex flex-col justify-end overflow-hidden group hover:border-white/30 transition-all duration-500 hover:bg-[#111] ${f.colSpan} ${f.h}`}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                        >
                            {/* Tech Header */}
                            <div className="absolute top-4 left-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-orange-500/50 rounded-full"></span>
                                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">MODULE_0{i + 1}</span>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                            {/* Grid Overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

                            <div className="relative z-10">
                                <h3 className="text-xl md:text-2xl font-bold uppercase mb-2 group-hover:text-white transition-colors tracking-tight">{f.title}</h3>
                                <p className="text-sm md:text-base text-gray-500 font-mono max-w-sm group-hover:text-gray-300 transition-colors border-l border-white/10 pl-3">
                                    {f.description}
                                </p>
                            </div>

                            {/* Grid deco */}
                            <div className="absolute top-4 right-4 text-[10px] text-white/20 font-mono tracking-widest">
                                /// {i + 1 < 10 ? `0${i + 1}` : i + 1}
                            </div>

                            {/* Bottom Corner Accent */}
                            <div className="absolute bottom-0 right-0 p-2 opacity-30">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M20 1L20 20L1 20" stroke="white" strokeWidth="1" />
                                </svg>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
