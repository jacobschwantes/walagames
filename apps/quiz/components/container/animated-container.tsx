"use client";
import { motion } from "framer-motion";
const AnimatedContainer = ({ children }) => {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
      animate={{ y: 0, opacity: 1 }}
    >
      {children}
    </motion.div>
  );
};

export { AnimatedContainer };
