export const runtime = "edge";

/*

* JOIN *
TODO: Get user info from server session
TODO: Translate code prefix to realtime endpoint
TODO: Post userinfo to /join/code, get token or return error
TODO: Redirect to /lobby with token, server endpoint, code

*/

export async function POST(req: Request) {
  return Response.json({ message: "Hello world!" });
}
