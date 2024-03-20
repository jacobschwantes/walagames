import { auth } from "@/auth";
import { NextResponse } from "next/server";
export async function GET(req: Request) {
  console.log("GET /api/sets");
  const session = await auth();
  console.log("session", session);
  const sessionToken = session?.sessionToken;
  if (!sessionToken) {
    return Response.error();
  }
  const sets = await fetch("http://localhost:8001" + "/sets", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionToken}`,
    },
  })
    .then((res) => res.json())
    .catch((e) => {
      console.error(e);
      return NextResponse.error();
    });

  return NextResponse.json(sets, { status: 200 });
}

export async function POST(req: Request) {
  console.log("POST /api/sets");
  const session = await auth();

  const sessionToken = session?.sessionToken;
  if (!sessionToken) {
    return NextResponse.error();
  }
  const body = await req.json();
  const sets = await fetch("http://localhost:8081/set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionToken}`,
    },
    body: JSON.stringify(body),
  })
    .then((res) => res.text())
    .catch((e) => {
      console.error(e);
      return NextResponse.error();
    });

  console.log("sets", sets);

  return NextResponse.json(sets, { status: 200 });
}
