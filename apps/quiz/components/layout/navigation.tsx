"use client";
import { cn } from "@/lib/utils";
import { BookOpenIcon, HomeIcon, Gamepad2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
export const Navigation = () => {
  const pathname = usePathname();
  const routes = [
    {
      name: "Home",
      icon: (props) => <HomeIcon {...props} />,
      href: "/",
      classNames: {
        icon: "text-sky-500",
        highlight: "from-sky-500",
      },
    },
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
      icon: (props) => <BookOpenIcon {...props} />,
      href: "/library",
      classNames: {
        icon: "text-violet-500",
        highlight: "from-violet-500",
      },
    },
  ];
  return (
    <div className="flex flex-col items-center gap-1.5">
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
      href={route.href}
      {...props}
      className={cn(
        " w-full px-4 py-3 rounded-lg relative overflow-hidden flex items-center transition-all duration-300 group",
        active ? "bg-[#262b35] brightness-110" : "hover:bg-[#21252e]"
      )}
    >
      <span
        className={cn(
          "absolute inset-0 w-2/3 blur-xl bg-gradient-to-r to-transparent opacity-25 transition-all duration-300 nav-item-active",
          active && route.classNames.highlight
        )}
      />
      <span className="flex gap-2.5 items-center relative z-10">
        <route.icon className={cn("h-5", route.classNames.icon)} />

        <span
          className={cn(
            "",
            active
              ? "text-white"
              : "text-zinc-300 group-hover:text-white transition-all duration-700"
          )}
        >
          {route.name}
        </span>
      </span>
    </Link>
  );
}
