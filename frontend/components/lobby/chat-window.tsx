"use client"

import { useForm } from "react-hook-form";
import { z } from "zod";
import { Message } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { twMerge } from "tailwind-merge";


const ChatWindowSchema = z.object({
  message: z.string().min(1, {
    message: "Message must be at least 1 character.",
  }),
});
interface ChatWindowProps {
  username?: string;
  sendMessage: (message: string) => void;
  messages: Message[];
  playerCount?: number;
}

export default function ChatWindow({
  sendMessage,
  messages,
  username,
  playerCount,
}: ChatWindowProps) {
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const form = useForm({
    defaultValues: {
      message: "",
    },
  });
  const handleSubmit = (data: z.infer<typeof ChatWindowSchema>) => {
    sendMessage(data.message);
    form.reset();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="flex flex-col border rounded-lg p-2 max-w-xs w-full gap-1 flex-1">
      <div className="flex-1">
        <div className="flex items-center gap-1">
          <div className="relative flex items-center h-2.5 w-2.5">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-ping absolute z-10 block "></span>
            <span className="h-2 w-2 rounded-full bg-green-400  absolute  block "></span>
          </div>
          <span className="flex items-center gap-2">
            {/* <PersonIcon className="h-3 w-3" /> */}
            <p className="font-medium text-xs">
              {playerCount} Player{playerCount && playerCount > 1 && "s"}{" "}
              Connected
            </p>
          </span>
        </div>
      </div>
      {/* TODO: fix this hard coded viewport size */}
      <ScrollArea className=" h-[50vh] overflow-hidden ">
        <ul className=" flex flex-col gap-2 w-full h-full ">
          {messages.map((message, index) =>
            message.username === "Server" ? (
              <ServerMessage
                key={message.message + index}
                message={message.message}
              />
            ) : (
              <ChatMessage
                key={message.message + index}
                message={message}
                username={username}
              />
            )
          )}
          <div ref={chatEndRef} />
        </ul>
      </ScrollArea>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="grid w-full gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Input placeholder="Type your message here" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Send message</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const ServerMessage: React.FC<{ message: string }> = ({ message }) => {
  return (
    <li>
      <p className="text-xs text-gray-500 font-medium text-center italic">
        {message}
      </p>
    </li>
  );
};

const ChatMessage: React.FC<{ message: Message; username: string }> = ({
  message,
  username,
}) => {
  return (
    <li className="text-black flex flex-col gap-1">
      <div className="flex w-full items-center">
        <div
          className={twMerge(
            "flex gap-1 items-center",
            message.username === username
              ? "order-2 flex-row-reverse"
              : "order-1"
          )}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage
              alt="avatar"
              src={
                message.imageURL ||
                `https://api.dicebear.com/7.x/notionists/svg?seed=${message.username}`
              }
            />
            <AvatarFallback className="text-xs">JS</AvatarFallback>
          </Avatar>
          <h3 className="text-xs">
            {message.username === username ? "You" : message.username}
          </h3>
        </div>
        <p
          className={twMerge(
            "text-xs text-zinc-500 whitespace-nowrap flex-1",
            message.username === username ? "text-left" : "text-right order-2"
          )}
        >
          {new Date(message.timestamp * 1000).toLocaleTimeString("en-US", {
            hour12: true,
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div
        className={twMerge(
          "  rounded-lg  p-2 w-3/4",
          message.username === username
            ? "ml-auto rounded-tr-none bg-black text-white"
            : "mr-auto rounded-tl-none bg-zinc-100"
        )}
      >
        <p className="text-xs">{message.message}</p>
      </div>
    </li>
  );
};
