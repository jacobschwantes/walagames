import { NextResponse } from "next/server";
import { auth } from "@/auth";
export async function POST(req: Request) {
  console.log("GET /api/lobby/host");
  const code = new URL(req.url).searchParams.get("code");
  console.log("code", code);
  const session = await auth();
  const sessionToken = session?.sessionToken;
  console.log("sessionToken", sessionToken);
  if (!sessionToken) {
    return Response.error();
  }
  const res = await fetch("http://localhost:8081/lobby/" + code, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
    },
  })
    .then(async (res) => {
      if (res.ok) {
        return res.json();
      }
      await res.text().then((text) => {
        console.error(text);
      });

      return { server: "", token: "" };
    })
    .catch((e) => {
      console.error(e);
      return { server: "", token: "" };
    });

  if (res.server === "" || res.token === "") {
    return NextResponse.error();
  }

  return NextResponse.json(res, { status: 200 });
}

export async function GET() {
  return NextResponse.error();
}
