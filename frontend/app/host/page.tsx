import type { NextPage } from "next";

import { auth } from "@/auth";

import LobbyController from "@/components/lobby/lobby-controller";

interface PageProps {}
const Page: NextPage<PageProps> = async ({}) => {
  const session = await auth();

  return (
    <main className="flex  flex-col items-center w-full">
      <LobbyController isHost user={session.user} />
    </main>
  );
};
export default Page;
