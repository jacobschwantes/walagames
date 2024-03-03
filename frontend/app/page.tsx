import {signIn, signOut, auth} from "@/auth"
import { Button } from "@/components/ui/button"


import Image from "next/image";
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
  )
}

export function SignOut(props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <form
      action={async () => {
       "use server";
        await signOut();
      }}
      className="w-full"
    >
      <Button variant="ghost" className="w-full p-0" {...props}>
        Sign Out
      </Button>
    </form>
  )
}

export default async function Home() {
  const session = await auth();
  const user = session?.user?.email;
  





  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {user ? <SignOut/> : <SignIn />}
     {session && <p>Logged in as {session?.user?.email}</p>}
    </main>
  );
}
