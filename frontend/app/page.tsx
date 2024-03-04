import { signIn, signOut, auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { PersonIcon } from "@radix-ui/react-icons";
import { LogOutIcon } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
export function SignIn({
  provider,
  ...props
}: { provider?: string } & React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn();
      }}
    >
      <Button {...props}>Sign In</Button>
    </form>
  );
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
      className=""
    >
      <Button className="" {...props}>
        <LogOutIcon className="w-5 h-5" />
      </Button>
    </form>
  );
}

export default async function Home() {
  const session = await auth();
  const user = session?.user?.email;

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-2xl flex justify-between">
        {session && (
          <p className="flex gap-2">
            <PersonIcon className="w-6 h-6" />
            <span className="font-medium">{session?.user?.email}</span>
          </p>
        )}
        {user ? <SignOut /> : <SignIn />}{" "}
      </div>
      <div className="flex flex-col gap-y-6 divide-y-2 items-start w-full max-w-2xl">
        {/* <div className="w-full">
          <h1 className="text-3xl font-bold">QuizBlitz</h1>
          <p>Please join a lobby or create a new one to start playing.</p>
        </div> */}
        <Link className="w-36" href="/play">
          <Button className="w-full">Play</Button>
        </Link>
      </div>
    </main>
  );
}
