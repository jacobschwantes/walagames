"use client";
import { LayoutGroup, motion } from "framer-motion";
const AnimatedContainer = ({ children, direction = "up", ...props }) => {
  return (
    <motion.div
      initial={{ y: direction === "up" ? 3 : -2, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
      animate={{ y: 0, opacity: 1 }}
      {...props}
    >
      <LayoutGroup>{children}</LayoutGroup>
    </motion.div>
  );
};

export { AnimatedContainer };
