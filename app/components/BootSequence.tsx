'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootSequenceProps {
    onComplete: () => void;
}

const bootLines = [
    "BIOS Tarih 01/01/26 12:00:00 Sürüm: 2.0.26",
    "CPU: Quantum Core i9-9900K @ 5.00GHz",
    "Bellek Testi: 65536K TAMAM",
    "Birincil Sürücü Algılanıyor ... YEA-CV-DISK",
    "Kernel Yükleniyor...",
    "Yapay Zekâ Çekirdeği Başlatılıyor...",
    "Modüller Yükleniyor: [XAI, LLM, RAG, NLP]",
    "Sistem Kontrolü: TAMAM",
    "ERİŞİM ONAYLANDI",
    "Hoş Geldiniz, Kullanıcı.",
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
    const [lines, setLines] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < bootLines.length) {
            const timeout = setTimeout(() => {
                setLines(prev => [...prev, bootLines[currentIndex]]);
                setCurrentIndex(prev => prev + 1);
            }, 50); // Much faster speed
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                onComplete();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, onComplete]);

    // Allow skipping on click or any key press
    useEffect(() => {
        const handleKeyDown = () => onComplete();
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black text-[#00ff41] font-mono p-8 z-50 overflow-hidden cursor-pointer"
            onClick={onComplete}
        >
            <div className="max-w-3xl mx-auto">
                {lines.map((line, index) => (
                    <div key={index} className="mb-1">
                        <span className="opacity-50 mr-2">{`>`}</span>
                        {line}
                    </div>
                ))}
                {currentIndex < bootLines.length && (
                    <div className="animate-pulse">_</div>
                )}
            </div>

            <div className="absolute bottom-8 left-0 w-full text-center opacity-50 text-xs animate-pulse">
                [ATLAMAK İÇİN TIKLAYIN VEYA SİSTEM BAŞLATILMASINI BEKLEYİN]
            </div>

            {/* Scanline effect specifically for boot screen */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] bg-[length:100%_2px,3px_100%] pointer-events-none" />
        </motion.div>
    );
}
