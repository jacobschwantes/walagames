import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LifeBuoy, LogOut, Settings, UserIcon } from "lucide-react";
import { IconBellFilled } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Navigation } from "./navigation";
import { User, getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { SignIn, SignOut } from "../auth-components";
import { Button } from "../ui/button";
import Link from "next/link";
import { LobbyCodeDrawer } from "../game/code-drawer";
import { Notifications, NotificationsDrawer } from "../ui/notifications";
export const Header = async () => {
  const session = await getServerSession(authOptions);
  return (
    <header className=" w-full  border-b py-3">
      <div className="justify-between flex gap-2.5 max-w-[90rem] mx-auto px-3 ">
        <div className="flex gap-8">
          <Link href="/" className="flex items-center justify-center gap-1.5">
            <Image src="/icon.webp" width={36} height={36} />
            <h1 className="text-2xl font-medium">QuizBlitz</h1>
          </Link>

          <Navigation />
        </div>
        <div>
          <LobbyCodeDrawer />
        </div>
        <div className=" ">
          {session && session.user ? (
            <div className="flex gap-2 h-full items-center">
              <UserDropdown user={session.user} />
              <Notifications />
              <SignOut />
            </div>
          ) : (
            <SignIn />
          )}
        </div>{" "}
      </div>
    </header>
  );
};

export function UserDropdown({ user }: { user: User }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 border-[1.5px] border-blue-500 rounded-full ">
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
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black">
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Keyboard shortcuts</span>
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LifeBuoy className="mr-2 h-4 w-4" />
          <span>Support</span>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
