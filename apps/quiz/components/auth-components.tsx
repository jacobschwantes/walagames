"use client";
import { signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { set } from "react-hook-form";

export function SignIn() {
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = () => {
    setSigningIn(true);
    signIn("fusionauth");
  };
  return (
    <Button
      disabled={signingIn}
      className="w-full flex bg-[#21252e] hover:bg-[#21252e] p-[30px] rounded-xl select-none text-zinc-200 hover:text-white transition-all duration-200 text-sm relative "
      onClick={handleSignIn}
    >
      {signingIn ? <span className="loader" /> : "Sign in"}
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
    <button
      disabled={signingOut}
      onClick={handleSignOut}
      className="bg-[#21252e] h-full aspect-square px-3 py-3 flex items-center justify-center rounded-xl group"
    >
      {signingOut ? (
        <span className="loader" />
      ) : (
        <LogOut className="h-5 w-5 text-zinc-400 group-hover:text-white transition-all duration-200" />
      )}
    </button>
  );
}
