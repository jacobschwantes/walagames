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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { joinLobby } from "@/actions/lobby";
import { useRouter } from "next/navigation";
interface PageProps {
  params: {
    code: string;
  };
}

export default function Page({ params }) {
  const router = useRouter();
  const { code } = params;

  const handleJoin = async (lobbyCode: string): Promise<void | Error> => {
    const response = await joinLobby(lobbyCode);
    if ("error" in response) {
      throw new Error(response.error);
    }
    const { server, token } = response;

    router.push(`/lobby?token=${token}&code=${lobbyCode}&server=${server}`);
  };

  return (
    <main className="flex  flex-col items-center w-full">
      <LobbyCodeForm onSubmit={handleJoin} />
    </main>
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
          <FormItem>
            <FormLabel>Lobby Code</FormLabel>
            <FormControl>
              <InputOTP
                {...field}
                onComplete={form.handleSubmit(onComplete)}
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
            <FormMessage />
          </FormItem>
        )}
      ></FormField>
    </Form>
  );
}
