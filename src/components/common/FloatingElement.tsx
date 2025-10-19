import React from 'react';
import { motion } from 'motion/react';

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
}

export function FloatingElement({ children, delay = 0 }: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
