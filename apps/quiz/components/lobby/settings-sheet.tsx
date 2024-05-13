"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconSettings } from "@tabler/icons-react";

export function LobbySettingsSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="gap-1" variant="outline">
          <IconSettings className="h-4 w-4 text-violet-500" /> Settings
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Lobby settings</SheetTitle>
          <SheetDescription>
            Make changes to the lobby settings.
          </SheetDescription>
        </SheetHeader>
        <div></div>
      </SheetContent>
    </Sheet>
  );
}
