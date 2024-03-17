import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();

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
  return Response.json({ ott });
}
