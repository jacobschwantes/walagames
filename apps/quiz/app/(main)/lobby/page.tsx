"use client";
import LobbyController from "@/components/lobby/lobby-controller";
import { createLobby } from "@/actions/lobby";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}
export default function Page({ searchParams }: PageProps) {
  const router = useRouter();
  const search = useSearchParams();
  let { server, code, token, id } = searchParams;
  const [connectionStr, setConnectionStr] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const mountedRef = useRef(false);
  useEffect(() => {
    const handleCreateLobby = async () => {
      if (!server && !connectionStr) {
        try {
          console.log("calling create lobby");
          const response = await fetch("/api/lobby/host", {
            method: "POST",
            body: JSON.stringify({
              quizID: id,
            }),
          })
            .then((res) => res.json())
            .catch((err) => console.log(err));
          // if ("error" in response) {
          //   throw new Error(response.error);
          // }
          const { server, token, username } = response;
          setUsername(username);
          setConnectionStr(`ws://${server}/connect?token=${token}`);
        } catch (e) {
          e instanceof Error ? console.error(e.message) : console.error(e);
        }
      } else {
        setConnectionStr(`ws://${server}/connect?token=${token}`);
        router.replace("/lobby");
      }
    };
    if (mountedRef.current) {
      handleCreateLobby();
    }
    return () => {
      mountedRef.current = true;
    };
  }, []);

  return (
    <main className="flex  flex-col items-center w-full">
      {connectionStr ? (
        <LobbyController
          username={username || ""}
          connectionStr={connectionStr}
        />
      ) : (
        <div>loading</div>
      )}
    </main>
  );
}
