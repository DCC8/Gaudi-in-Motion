"use client";

import React from "react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface DraggableCardProps {
    children: ReactNode;
    className?: string;
    width?: string;
    height?: string;
    initialX?: number;
    initialY?: number;
}

export default function DraggableCard({ children, className = "", width = "w-64", height = "h-40", initialX = 0, initialY = 0 }: DraggableCardProps) {
    const [constraints, setConstraints] = React.useState({ left: -1000, right: 1000, top: -1000, bottom: 1000 });

    React.useEffect(() => {
        setConstraints({
            left: -window.innerWidth / 2,
            right: window.innerWidth / 2,
            top: -window.innerHeight / 2,
            bottom: window.innerHeight / 2
        });
    }, []);

    return (
        <motion.div
            drag
            dragConstraints={constraints}
            // Limit drag to window roughly
            // Actually, ref constraints are better, but window constraints are requested.
            // We can use a ref to a container. For now, use viewport constraints if possible or just large constraints.
            // To strictly constrain to screen, we need a ref to a parent container.
            dragElastic={0.1}
            dragMomentum={true}
            initial={{ x: initialX, y: initialY, opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // smooth ease
            className={`absolute z-30 flex flex-col overflow-hidden rounded-xl border border-white/20 bg-black/10 backdrop-blur-md shadow-2xl cursor-grab active:cursor-grabbing ${width} ${height} ${className}`}
        >
            {children}
        </motion.div>
    );
}
