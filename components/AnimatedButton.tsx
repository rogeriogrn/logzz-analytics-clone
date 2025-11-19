import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<"button">, 'ref'> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
    children: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    variant = 'primary',
    children,
    className = '',
    ...props
}) => {
    const baseClasses = 'font-bold rounded-xl transition-colors shadow-sm';

    const variantClasses = {
        primary: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20',
        secondary: 'bg-white/80 text-slate-600 hover:bg-white border border-slate-200',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20',
        success: 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
    };

    return (
        <motion.button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17
            }}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default AnimatedButton;
