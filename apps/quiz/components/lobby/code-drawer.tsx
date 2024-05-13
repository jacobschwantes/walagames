"use client";
import { Fragment, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { usePathname, useRouter } from "next/navigation";
import { useLobbyContext } from "@/components/providers/lobby-provider";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function LobbyCodeDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { joinLobby, lobbyState } = useLobbyContext();
  const router = useRouter();
  const handleJoin = async (lobbyCode: string): Promise<void | Error> => {
    const response = await joinLobby(lobbyCode);
    if (response instanceof Error) {
      throw new Error(response.message); // ! this is not clean
    }

    setOpen(false);

    router.push("/lobby");
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {lobbyState ? (
        <div>
          {lobbyState.code}
          {pathname != "/lobby" && <Link href="/lobby">back to lobby</Link>}
        </div>
      ) : (
        <DrawerTrigger asChild>
          <Button variant="outline">Enter Code</Button>
        </DrawerTrigger>
      )}
      <DrawerContent>
        <div className="mx-auto w-full max-w-xs">
          <DrawerHeader>
            <DrawerTitle className="pt-4">Join Lobby</DrawerTitle>
            <DrawerDescription>Enter the 4-letter lobby code.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-0">
            <LobbyCodeForm onSubmit={handleJoin} />
            <div className="mt-3 h-24"></div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

const FormSchema = z.object({
  code: z.string(),
});
interface LobbyFormProps {
  onSubmit: (code: string) => Promise<void | Error>;
}
function LobbyCodeForm({ onSubmit }: LobbyFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onComplete(data: z.infer<typeof FormSchema>) {
    try {
      await onSubmit(data.code.toUpperCase());
    } catch (error) {
      if (error instanceof Error) {
        form.setError("code", { type: "custom", message: error.message });
      }
    }
  }

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem className="relative">
            <FormMessage className="absolute -bottom-7"/>
            <FormControl>
              <InputOTP
                {...field}
                onComplete={form.handleSubmit(onComplete)}
                inputMode="text"
                // disabled={form.formState.isValidating}
                autoFocus
                maxLength={4}
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2 w-full">
                    {slots.map((slot, index) => (
                      <Fragment key={index}>
                        <InputOTPSlot
                          className={cn(
                            "rounded-lg border border-blue-600 bg-blue-900/15 uppercase w-1/4 duration-0 aspect-square",
                            form.formState.errors.code &&
                            "border-red-600 bg-red/900/15 shake",
                            form.formState.isSubmitting && "brightness-75"
                          )}
                          {...slot}
                        />
                      </Fragment>
                    ))}
                  </InputOTPGroup>
                )}
              />
            </FormControl>
          </FormItem>
        )}
      ></FormField>
    </Form>
  );
}
