"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLobbyContext } from "@/lib/lobby-provider";
import { Quiz } from "@/lib/types";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
interface GameOptionsProps {
  quiz: Quiz;
}
export default function GameOptions({ quiz }: GameOptionsProps) {
  const { meta } = quiz;
  return (
    <div className=" max-w-5xl mx-auto flex gap-5 items-start">
      <div className="w-[400px] relative">
        <div className="flex flex-col justify-between gap-0.5 absolute bottom-5 left-5 z-20 ">
          <h2 className="text-2xl">{meta.title}</h2>
          <p className="text-zinc-200  text-sm">{meta.category}</p>
        </div>

        <div className="relative w-full aspect-video rounded-xl overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-blue-950 to-transparent opacity-80"></div>
          <Image
            objectFit="cover"
            alt="preview image"
            fill
            // TODO: set these sizes for performance
            // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={meta.image}
          />
        </div>
      </div>
      <div>
        <TabsDemo id={quiz.id} />
      </div>
    </div>
  );
}

export function TabsDemo({ id }: { id: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selected = params.get("play") || "solo";

  const { createLobby } = useLobbyContext();
  const handleCreateLobby = async () => {
    try {
      await createLobby(id);
      router.push("/lobby");
    } catch (e) {
      toast(e.message);
    }
  };

  const handleChange = (value: string) => {
    router.push(`${pathname}?play=${value}`);
  };

  return (
    <Tabs value={selected} onValueChange={handleChange} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="solo">Solo</TabsTrigger>
        <TabsTrigger value="host">Host</TabsTrigger>
      </TabsList>
      <TabsContent value="solo">
        <Card>
          <CardHeader>
            <CardTitle>Solo</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@peduarte" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="host">
        <Card>
          <CardHeader>
            <CardTitle>Host</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateLobby}
              // size="lg"
              variant="sky"
              className=" flex gap-1 items-center w-full"
            >
              <svg
                className="h-[.65rem] w-[.65rem] text-white"
                viewBox="0 0 448 512"
              >
                <path
                  fill="currentColor"
                  d="m424.4 214.7-352-208.1c-28.6-16.9-72.4-.5-72.4 41.3v416.1c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"
                />
              </svg>
              Create
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
