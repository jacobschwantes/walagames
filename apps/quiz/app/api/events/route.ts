export const runtime = "nodejs";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import EventSource from "eventsource";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  const resp = new EventSource(
      "http://localhost:8080/events?stream=" + session.user.id, {
          headers: {
          Authorization: process.env.API_KEY,
          "X-User-ID": session.user.id,
        }
    }
  );

  req.signal.addEventListener("abort", async () => {
    console.log("abort");
    resp.close();
    await writer.close();
  });

  resp.onmessage = async (event) => {
    console.log("message", event.data);
    await writer.write(encoder.encode(event.data));
  };

  resp.onerror = async (event) => {
    console.log("error", event);
    await writer.close();
  };

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Encoding": "none",
    },
  });
}

