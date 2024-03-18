import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  const code = new URL(req.url).searchParams.get("code");

  const token = session.sessionToken;

  if (!token) {
    return Response.redirect("/api/auth/signin");
  }
  const ott = await fetch("http://localhost:8081/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.text())
    .catch((e) => {
      console.error(e);
      return "";
    });

  const lobbyData = code && await fetch("http://localhost:8081/lobby/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      code: code.toUpperCase(),
    }),
  })
    .then((res) => res.json())
    .catch((e) => {
      console.error(e);
      return {};
    });

  console.log(lobbyData);


  return Response.json({ ott, lobbyData });
}
