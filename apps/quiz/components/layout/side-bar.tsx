import {
  BookOpenIcon,
  HomeIcon,
  Gamepad2Icon,
  UserIcon,
  PanelLeft,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { NextPageContext, NextComponentType } from "next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ChevronDownIcon } from "@radix-ui/react-icons";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { Navigation } from "./navigation";
import { getServerSession } from "next-auth";
import { authOptions, signOut } from "@/auth";
import { SignIn, SignOut } from "../auth-components";
export const SideBar = async () => {
  const session = await getServerSession(authOptions);
  return (
    <nav className=" w-80 h-full  px-4 flex flex-col gap-2.5 pb-4">
      <div className="flex items-center w-full justify-between px-2 py-4">
        <div className="flex items-center justify-center gap-1.5">
          <Image src="/icon.png" width={36} height={36} />
          <h1 className="text-2xl font-medium">QuizBlitz</h1>
        </div>
        <PanelLeft className="h-5 text-[#5d677d]" />
      </div>
      <Navigation />
      <div className="w-full mt-auto ">
        {session && session.user ? (
          <div className="flex gap-1.5 h-full">
            <Link
              href="/profile"
              className="flex gap-2 bg-[#21252e] px-3 py-3 rounded-xl select-none cursor-pointer items-center flex-1 group relative overflow-hidden"
            >
              <div className=" opacity-0 group-hover:opacity-100 flex transition-all duration-300 absolute inset-0 z-10 items-center justify-center bg-[#1a1e24]/20 backdrop-blur-lg">
                <p className="text-sm">View profile</p>
              </div>

              <Avatar className="h-9 w-9 border-2 border-sky-500 rounded-full ">
            <AvatarImage
              className=""
              alt="avatar"
              src={
                session.user.image ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${session.user.name}`
              }
            />
            <AvatarFallback className="text-xs">{session.user.name}</AvatarFallback>
          </Avatar>
              {/* <div className="flex items-center justify-center h-9 w-9 rounded-lg border border-sky-500 bg-gradient-to-t from-sky-500 to-transparent">
                01
              </div> */}
              <div className="flex flex-col justify-between flex-1">
                <p className="text-sm font-medium text-zinc-100">
                  {session.user.name}
                </p>

                <p className="text-xs font-light text-zinc-400">Premium</p>
                {/* <div className=" relative w-full bg-zinc-900 h-1.5 rounded">
                  <div
                    style={{ width: "30%" }}
                    className="absolute h-full left-0 top-0 bottom-0 bg-sky-500 rounded"
                  />
                </div> */}
              </div>
              {/* <ChevronDownIcon className="text-zinc-400 h-6 w-6 data-[state=open]:rotate-180" /> */}
            </Link>
            <SignOut />
          </div>
        ) : (
          <SignIn />
        )}
      </div>
    </nav>
  );
};



export function DropdownMenuDemo({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex gap-3 bg-[#21252e] px-3 py-3 rounded-xl select-none cursor-pointer items-center flex-1">
          {/* <Avatar className="h-9 w-9 border-2 border-sky-500 rounded-full ">
            <AvatarImage
              className=""
              alt="avatar"
              src={
                user.image ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`
              }
            />
            <AvatarFallback className="text-xs">{user.name}</AvatarFallback>
          </Avatar> */}
          <div className="flex items-center justify-center h-9 w-9 rounded-lg border border-sky-500 bg-gradient-to-t from-sky-500 to-transparent">
            01
          </div>
          <div className="flex flex-col justify-between gap-1 flex-1">
            <p className="text-sm font-medium text-zinc-100">{user.name}</p>

            {/* <p className="text-sm font-light text-zinc-400">{user.email}</p> */}
            <div className=" relative w-full bg-zinc-900 h-1.5 rounded">
              <div
                style={{ width: "30%" }}
                className="absolute h-full left-0 top-0 bottom-0 bg-sky-500 rounded"
              />
            </div>
          </div>
          {/* <ChevronDownIcon className="text-zinc-400 h-6 w-6 data-[state=open]:rotate-180" /> */}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 rounded-xl">
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <SignOut />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
