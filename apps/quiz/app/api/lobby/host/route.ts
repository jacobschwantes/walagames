import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

// export const runtime = "edge";

/*
* HOST *
TODO: Get userinfo from server session
TODO: Use geo info to find closest server location using haversine formula
TODO: Post userinfo to realtime server /host endpoint, get token
TODO: Redirect to /lobby with token and server endpoint

*/
export async function POST(req: Request) {
  const endpoint = "localhost:8081";

  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.error();
  }

  const body = await req.json();

  const { token } = await fetch(`http://${endpoint}/host`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${process.env.API_KEY}`,
    },
    body: JSON.stringify({
      user: {
        id: session.user.id,
        username: session.user?.name,
        image: session.user.image,
      },
      quizID: body.quizID,
    }),
  })
    .then((res) => res.json())
    .catch((err) => console.log(err));

  return Response.json({
    token,
    server: endpoint,
    username: session.user.name,
  });
}
