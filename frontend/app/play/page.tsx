import { auth } from "@/auth";
import {LobbyEntrance} from "@/components/game-client"
import type { NextPage } from "next";

interface PageProps {}
const Page: NextPage<PageProps> = async ({}) => {
    const session = await auth();
    const user = session?.user;
  return (
    <main className="max-w-7xl mx-auto min-h-screen flex flex-col">
     
        <LobbyEntrance user={user} />
 
    </main>
  );
};
export default Page;