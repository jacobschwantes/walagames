"use client";
import { Fragment } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
interface LobbyCodeInputProps {}
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { joinLobby } from "@/actions/lobby";
import { redirect, useRouter } from "next/navigation";
const FormSchema = z.object({
  code: z.string(),
});

export default function LobbyCodeInput({ }: LobbyCodeInputProps) {
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const response = await joinLobby(data.code.toUpperCase());
    if ("error" in response) {
      form.setError("code", { type: "custom", message: response.error });
      console.error(response.error);
      toast.error(`Failed to join lobby. ${response.error}`);
      return;
    }
    const { server, token } = response;

    toast(`${server} ${token}`)

   

    router.push(`/lobby?token=${token}&code=${data.code.toUpperCase()}&server=${server}` )

  }

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lobby Code</FormLabel>
            <FormControl>
              <InputOTP
                {...field}
                onComplete={form.handleSubmit(onSubmit)}
                inputMode="text"
                autoFocus
                maxLength={4}
                render={({ slots }) => (
                  <InputOTPGroup className="gap-2">
                    {slots.map((slot, index) => (
                      <Fragment key={index}>
                        <InputOTPSlot
                          className="rounded-lg border border-sky-700 bg-sky-800/10 uppercase"
                          {...slot}
                        />
                      </Fragment>
                    ))}
                  </InputOTPGroup>
                )}
              />
            </FormControl>
            {/* <FormDescription>
              Please enter the lobby code.
            </FormDescription> */}
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
    </Form>
  );
}
