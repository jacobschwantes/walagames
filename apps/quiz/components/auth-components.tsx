"use client";
import { signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { IconLogout } from "@tabler/icons-react";

export function SignIn() {
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = () => {
    setSigningIn(true);
    signIn("fusionauth");
  };
  return (
    <Button
      disabled={signingIn}
      className="w-full flex bg-[#252933] hover:bg-[#282c37] p-[30px] rounded-xl select-none text-zinc-200 hover:text-white transition-all duration-200 text-sm relative "
      onClick={handleSignIn}
    >
      {signingIn ? <span className="loader h-4 w-4" /> : "Sign in"}
    </Button>
  );
}

export function SignOut() {
  const [signingOut, setSigningOut] = useState(false);
  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };
  return (
    <Button
      variant="outline"
      size="icon"
      disabled={signingOut}
      onClick={handleSignOut}
    >
      {signingOut ? (
        <span className="loader h-4 w-4" />
      ) : (
        <IconLogout className="h-4 w-4" />
      )}
    </Button>
  );
}
