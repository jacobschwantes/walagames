import { auth } from "@/auth";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  console.log("GET /api/lobby/host");
  const session = await auth();
  const sessionToken = session?.sessionToken;
  if (!sessionToken) {
    return Response.error();
  }
  const { server, token } = await fetch("http://localhost:8081/lobby/host", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
  })
    .then((res) => res.json())
    .catch((e) => {
      console.error(e);
      return { server: "", token: "" };
    });

  if (server === "" || token === "") {
    return NextResponse.error();
  }

  return NextResponse.json({ server, token }, { status: 200 });
}
