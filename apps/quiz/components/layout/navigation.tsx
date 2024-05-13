"use client";
import { cn } from "@/lib/utils";
import { IconHomeFilled, IconStack2Filled } from "@tabler/icons-react";
import { BookOpenIcon, HomeIcon, Gamepad2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
export const Navigation = () => {
  const pathname = usePathname();
  const routes = [
    // {
    //   name: "Home",
    //   icon: (props) => <IconHomeFilled {...props} />,
    //   href: "/",
    //   classNames: {
    //     icon: "text-blue-600",
    //     highlight: "bg-blue-500",
    //   },
    // },
    // {
    //   name: "Play",
    //   icon: (props) => <Gamepad2Icon {...props} />,
    //   href: "/play",
    //   classNames: {
    //     icon: "text-violet-500",
    //     highlight: "from-violet-500",
    //   },
    // },
    {
      name: "Library",
      icon: (props) => <IconStack2Filled {...props} />,
      href: "/library",
      classNames: {
        icon: "text-violet-500",
        highlight: "bg-violet-500",
      },
    },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {routes.map((route) => (
        <NavButton
          key={route.name}
          route={route}
          active={
            route.href === "/"
              ? route.href === pathname
              : pathname.includes(route.href)
          }
        />
      ))}
    </div>
  );
};
function NavButton({ route, active, ...props }) {
  return (
    <Link
      draggable={false}
      href={route.href}
      {...props}
      className={cn(
        " w-full px-3 py-2 rounded-lg  relative overflow-hidden select-none  flex items-center justify-center  transition-all duration-300 group",
        active
          ? "bg-[#2b303b44] brightness-110 border-primary/60"
          : "hover:bg-[#20242e] border-transparent hover:border-primary/60"
      )}
    >
      {/* {active && (
        <motion.span
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 0.75 }}
          transition={{ duration: 0.3, ease: [0, 0.71, 0.2, 1.01] }}
          className={cn(
            "absolute -bottom-8 blur-xl h-full w-1/2",
            route.classNames.highlight
          )}
        />
      )} */}
      <span
        className={cn(
          "absolute inset-0 w-2/3 blur-xl bg-gradient-to-r to-transparent opacity-25 transition-all duration-300 nav-item-active",
          // active && route.classNames.highlight
        )}
      />
      <span className="flex gap-1 items-center relative z-10 text-sm">
        <route.icon
          className={cn(
            "h-5 transtion-all duration-700",
            route.classNames.icon 
          )}
        />

        <span
          className={cn(
            "",
            active
              ? "text-white"
              : "text-zinc-200 group-hover:text-white transition-all duration-700"
          )}
        >
          {route.name}
        </span>
      </span>
    </Link>
  );
}
