"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/lib/types";
import { StarFilledIcon, StarIcon } from "@radix-ui/react-icons";
import { Eye, LucideGamepad2 } from "lucide-react";
import Link from "next/link";
import { IconFlame, IconPlayerPlay, IconPlayerPlayFilled, IconSearch } from "@tabler/icons-react";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function QuizCard({
  quiz,
  profile,
}: {
  quiz: Quiz;
  profile: {
    name: string;
    image: string;
  };
}) {
  return (
    <Card className="w-full flex flex-col border border-zinc-700/20  transition-all ease-out duration-300 group bg-[#242a32]">
      <div className="w-full relative ">
        {/* {quiz.questions.length % 3 ? (
          <span className="absolute top-2 left-2 p-2 z-20 text-white px-2 py-1 bg-red-500 rounded-md text-xs flex items-center gap-0.5 font-medium">
            <IconFlame className="h-4 w-4" /> <span>Hot</span>
          </span>
        ) : (
          <></>
        )} */}

        <div className="absolute bottom-2 left-2 z-20">
          <p className=" text-white px-2.5 py-1 bg-[#242a32]/90 rounded-[var(--radius)] text-xs">
            {quiz.questions.length} Question
            {quiz.questions.length > 1 && "s"}
          </p>
        </div>
        <div className="relative w-full aspect-[16/8]  rounded-t-[var(--radius)]  overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-blue-950/60  to-transparent opacity-75"></div>
          <Image
            className="object-cover"
            alt="preview image"
            fill
            // TODO: set these sizes for performance
            // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            src={quiz.meta.image}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3  p-3">
        <div className="flex flex-col gap-0.5">
          <h2 className=" ">{quiz.meta.title}</h2>
          <div className="grid grid-cols-2">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5 rounded-full ">
                <AvatarImage
                  className=""
                  alt="avatar"
                  src={
                    profile.image ||
                    `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name}`
                  }
                />
                <AvatarFallback className="text-xs">
                  {profile.name}
                </AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground text-xs">{profile.name}</p>
            </div>
            <div className="flex items-center">
          
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 w-full">
          <div className="flex items-center gap-1.5">
            <IconPlayerPlayFilled className="h-5 w-5 text-yellow-500" />
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground ">Plays</p>
              <p className="text-sm text-foreground font-medium">231,364</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <StarFilledIcon className="h-5 w-5 text-yellow-500" />
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground ">Favorites</p>
              <p className="text-sm text-foreground font-medium">3,364</p>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-1 w-full">
            <Link className="flex-1" href={`/quiz/${quiz.id}`}>
              <Button
                size="sm"
                variant="actionHover"
                className=" flex gap-1 items-center w-full border text-xs"
              >
                <span>View Quiz</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

