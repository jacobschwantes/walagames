import { NextPageContext, NextComponentType } from "next";
import { Button } from "@/components/ui/button";
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
import { auth, signOut } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "next-auth";
import { CarrotIcon } from "lucide-react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { SignOut } from "./auth-components";
interface HeaderProps {}
const Header: NextComponentType<
  NextPageContext,
  {},
  HeaderProps
> = async ({}) => {
  const session = await auth();

  return (
    <header className="w-full p-2 px-4 flex justify-between items-center bg-gray-950/40 border-b border-b-sky-500">
      <div>
        <h1 className="text-5xl font-bold italic">
          <span className="text-red-500">Quiz</span>
          <span className="text-sky-500">Blitz</span>
        </h1>
      </div>
      {session && session.user && (
        <div className="flex items-center gap-4">
          <div className=" rounded-lg flex items-center gap-2 bg-zinc-900">
            <div className="w-8 flex items-center justify-center h-8 m-2 rounded-md border border-sky-500 bg-gradient-to-t from-sky-500 to-transparent">
              01
            </div>{" "}
            <div className="w-[2px] h-5 bg-zinc-700"></div>
            <div className="flex flex-col items-center justify-between h-full p-2">
              <div className="border relative w-full h-2">
                <div
                  style={{ width: "30%" }}
                  className="absolute h-full left-0 top-0 bottom-0 bg-sky-500"
                ></div>
              </div>

              <p className="font-medium text-zinc-500 px-1">193 / 200 XP</p>
            </div>
          </div>
          <DropdownMenuDemo user={session.user} />
          {/* <h1>{session?.user.name}</h1> */}
        </div>
      )}
    </header>
  );
};
export default Header;

export function DropdownMenuDemo({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex gap-3 hover:bg-zinc-900/50 p-3 rounded-lg select-none cursor-pointer items-center">
          <Avatar className="h-9 w-9 border-2 border-sky-500 rounded-full ">
            <AvatarImage
              className=""
              alt="avatar"
              src={
                user.image ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${user.name}`
              }
            />
            <AvatarFallback className="text-xs">{user.name}</AvatarFallback>
          </Avatar>
          <div>
            <span className="flex items-center gap-2">
              <p className="text-large font-medium text-zinc-100">
                {user.name}
              </p>
              <ChevronDownIcon className="text-zinc-400 h-4 w-4" />
            </span>
            <p className="text-sm font-light text-zinc-400">{user.email}</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 ">
        {/* <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator /> */}
        <DropdownMenuGroup>
          {/* <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem> */}
          <DropdownMenuItem>
            Settings
            {/* <DropdownMenuShortcut>⌘S</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>

        {/* <DropdownMenuSeparator /> */}

        <DropdownMenuItem>Support</DropdownMenuItem>

        {/* <DropdownMenuSeparator /> */}

        <DropdownMenuItem>
          <SignOut>Sign Out </SignOut>
          {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
