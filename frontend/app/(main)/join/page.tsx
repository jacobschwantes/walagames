import { auth } from "@/auth";
import GameClient from "@/components/game/game-client";
import { useLobby } from "@/hooks/lobby";
import { useState } from "react";
import LobbyCodeInput from "@/components/lobby/lobby-code-input";
import { connect } from "http2";
import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LobbyController from "@/components/lobby/lobby-controller";

interface PageProps {
  params: {
    code: string;
  };
}
const Page: NextPage<PageProps> = async ({ params }) => {
  const session = await auth();
  return (
    <main className="flex  flex-col items-center w-full">
      <LobbyController user={session.user} />
    </main>
  );
};
export default Page;
