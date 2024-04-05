import {  authOptions } from "@/auth";
import GameClient from "@/components/game/game-client";
import { useLobby } from "@/hooks/lobby";
import { useState } from "react";

import { connect } from "http2";
import type { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import LobbyController from "@/components/set/lobby/lobby-controller";
import { getServerSession } from "next-auth";

interface PageProps {
  params: {
    code: string;
  };
}
const Page: NextPage<PageProps> = async ({ params }) => {
  const session = await getServerSession(authOptions);
  return (
    <main className="flex  flex-col items-center w-full">
      <LobbyController user={session.user} />
    </main>
  );
};
export default Page;
