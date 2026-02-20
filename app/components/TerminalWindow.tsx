'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { FaTimes, FaWindowMaximize, FaWindowMinimize } from 'react-icons/fa';

interface TerminalWindowProps {
    title: string;
    children: ReactNode;
    className?: string;
    id?: string;
}

export default function TerminalWindow({ title, children, className = "", id }: TerminalWindowProps) {
    return (
        <motion.div
            id={id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`bg-black border border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.2)] rounded-sm overflow-hidden mb-6 ${className}`}
        >
            {/* Title Bar */}
            <div className="bg-[#003300] border-b border-[#00ff41] p-2 flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                    <span className="text-[#00ff41] text-xs font-bold uppercase tracking-wider">
                        [{title}]
                    </span>
                </div>
                <div className="flex gap-2">
                    <FaWindowMinimize className="text-[#00ff41] hover:text-white cursor-pointer" size={12} />
                    <FaWindowMaximize className="text-[#00ff41] hover:text-white cursor-pointer" size={12} />
                    <FaTimes className="text-[#00ff41] hover:text-red-500 cursor-pointer" size={12} />
                </div>
            </div>

            {/* Content */}
            <div className="p-4 bg-black/90 text-[#00ff41] font-mono">
                {children}
            </div>
        </motion.div>
    );
}
