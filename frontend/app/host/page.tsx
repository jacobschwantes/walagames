"force-dynamic"
import type { NextPage } from "next";

import { auth } from "@/auth";

import LobbyController from "@/components/lobby/lobby-controller";

interface PageProps {}
const Page: NextPage<PageProps> = async ({}) => {
  const session = await auth();


  const token = session?.sessionToken;
  const ott = await fetch("http://localhost:8080/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.text())
    .catch((e) => {
      console.error(e);
      return "";
    });
  return (
    <main className="flex  flex-col items-center w-full">
      <LobbyController isHost user={session.user} />
    </main>
  );
};
export default Page;
