"use client";
import { signIn } from "next-auth/react";
import { Button } from "./ui/button";

export function SignIn() {
  return <Button className="w-full" onClick={() => signIn("fusionauth")}>Sign In</Button>;
}
