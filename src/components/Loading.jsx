import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, Cpu } from 'lucide-react';

const Loading = ({ variant = 'inline', message = 'Loading...' }) => {
    const containerVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    };

    const iconVariants = {
        animate: {
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
            rotate: [0, 5, -5, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    if (variant === 'fullscreen') {
        return (
            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black"
            >
                {/* Animated Background Blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] animate-blob"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        variants={iconVariants}
                        animate="animate"
                        className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] bg-black border border-white/10 flex items-center justify-center shadow-2xl mb-8 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 animate-pulse"></div>
                        <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-emerald-500 relative z-10" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                    >
                        <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            AXON
                        </h2>
                        <div className="flex items-center gap-2 justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    if (variant === 'chat') {
        return (
            <div className="flex justify-start items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4 text-emerald-500 animate-pulse" />
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 italic mr-1">AI is thinking</span>
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-bounce"></span>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${variant === 'overlay' ? 'absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-50 rounded-[inherit]' : ''}`}>
            <motion.div
                variants={pulseVariants}
                animate="animate"
                className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
            >
                <Cpu className="w-6 h-6 text-emerald-500 animate-spin-slow" />
            </motion.div>
            {message && <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400/70 animate-pulse">{message}</p>}
        </div>
    );
};

export default Loading;
