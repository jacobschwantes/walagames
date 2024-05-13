import { authOptions } from "@/auth";
import GameClient from "@/components/game/game-client";
import { getServerSession } from "next-auth";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default async function Page({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div>Not authenticated</div>;
  }

  const id = session.user.id;
  return (
    <main className="">
      <GameClient id={id} />
    </main>
  );
}
