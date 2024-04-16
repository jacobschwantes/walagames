"use client";
import * as React from "react";
import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFormStatus } from "react-dom";
import { Save, SaveIcon } from "lucide-react";
import { Button } from "./button";

const buttonVariants = {
  color: {
    sky: {
      card: "bg-sky-500 border-sky-500",
      face: "from-sky-600 to-sky-800 via-sky-700",
      border: "border-sky-800 from-sky-900 via-sky-800 to-sky-900",
    },
    violet: {
      card: "bg-violet-500 border-violet-500",
      face: "from-violet-600 to-violet-800 via-violet-700",
      border: "border-violet-800 from-violet-900 via-violet-800 to-violet-900",
    },
    green: {
      card: "bg-green-500 border-green-500",
      face: "from-green-600 to-green-800 via-green-700",
      border: "border-green-800 from-green-900 via-green-800 to-green-900",
    },
    fuchsia: {
      card: "bg-fuchsia-500 border-fuchsia-500",
      face: "from-fuchsia-600 to-fuchsia-800 via-fuchsia-700",
      border:
        "border-fuchsia-800 from-fuchsia-900 via-fuchsia-800 to-fuchsia-900",
    },
    cyan: {
      card: "bg-cyan-500 border-cyan-500",
      face: "from-cyan-600 to-cyan-800 via-cyan-700",
      border: "border-cyan-800 from-cyan-900 via-cyan-800 to-cyan-900",
    },
    blue: {
      card: "bg-blue-500 border-blue-500",
      face: "from-blue-600 to-blue-800 via-blue-700",
      border: "border-blue-800 from-blue-900 via-blue-800 to-blue-900",
    },
  },
  borderRadius: {
    md: {
      card: "rounded-md",
      face: "rounded-b-md",
      border: "rounded-md",
    },
    lg: {
      card: "rounded-lg",
      face: "rounded-b-lg",
      border: "rounded-lg",
    },
    xl: {
      card: "rounded-xl",
      face: "rounded-b-xl",
      border: "rounded-xl",
    },
    "2xl": {
      card: "rounded-2xl",
      face: "rounded-b-2xl",
      border: "rounded-2xl",
    },
  },
};

export interface PushButtonProps extends HTMLMotionProps<"button"> {
  color: "sky" | "violet" | "green" | "fuchsia" | "cyan" | "blue";
  borderRadius?: "md" | "lg" | "xl" | "2xl";
  offset?: number;
}
const PushButton: React.FC<PushButtonProps> = ({
  color,
  borderRadius = "md",
  className,
  children,
  offset = 3,
  ...props
}) => {
  const inside = {
    initial: { y: -offset },
    animate: {
      y: -1,
      transition: {
        duration: 0.1,
      },
    },
  };

  const face = {
    initial: { y: offset },
    animate: {
      y: offset - 1,
      transition: {
        duration: 0.1,
      },
    },
  };
  return (
    <motion.button
      initial="initial"
      whileTap="animate"
      className={cn("group relative px-4 py-2", className)}
      {...props}
    >
      <motion.span
        variants={inside}
        className="relative z-20 flex items-center justify-center text-white"
      >
        {children as React.ReactNode}
      </motion.span>
      <motion.div
        variants={inside}
        className={cn(
          " w-full h-full overflow-hidden absolute border-t-[1px] border-x-[1px]  z-10 inset-0",
          buttonVariants.color[color].card,
          buttonVariants.borderRadius[borderRadius].card,
          "group-disabled:brightness-50"
        )}
      >
        <motion.div
          variants={face}
          className={cn(
            "bg-gradient-to-t w-full h-full scale-x-[1] scale-y-[.92] blur-xl absolute ",
            // buttonVariants.color[color].face,
            buttonVariants.borderRadius[borderRadius].face
          )}
        />
      </motion.div>
      <span
        className={cn(
          "w-full h-full absolute from-10% to-90% block inset-0 scale-x-[1] bg-gradient-to-r ",
          buttonVariants.color[color].border,
          buttonVariants.borderRadius[borderRadius].border
        )}
      />
    </motion.button>
  );
};

const SaveButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button variant="violet" className="">
      <motion.span layout className="flex gap-1  items-center">
        {pending ? (
          <motion.span layout className="loader h-4 w-4" />
        ) : (
          <Save className="h-4 w-4 text-white" />
        )}
        Save
      </motion.span>
    </Button>
  );
};

export { PushButton, SaveButton };
