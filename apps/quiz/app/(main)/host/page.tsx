"force-dynamic";
import type { NextPage } from "next";

import {  authOptions } from "@/auth";

import LobbyController from "@/components/lobby/lobby-controller";
import { getServerSession } from "next-auth";

interface PageProps {}
const Page: NextPage<PageProps> = async ({}) => {
  const session = await getServerSession(authOptions)

  return (
    <main className="flex  flex-col items-center w-full">
      <LobbyController isHost user={session.user} />
    </main>
  );
};
export default Page;
