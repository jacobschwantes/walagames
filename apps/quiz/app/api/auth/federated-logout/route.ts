import { NextApiRequest, NextApiResponse } from "next";
import { cookies } from "next/headers";

export async function GET(request: NextApiRequest) {
  try {
    console.log("GET /api/auth/endsession");

    const cookieNames = [
      "next-auth.session-token",
      "next-auth.callback-url",
      "next-auth.csrf-token",
    ];

    // Clear the cookies and set headers
    cookieNames.forEach((cookieName) => {
      cookies().set(cookieName, "deleted", {
        maxAge: 0,
        path: "/",
      });
    });

    // Respond with a success message
    return Response.redirect(process.env.NEXTAUTH_URL + "/");
  } catch (err) {
    console.error(err);
    // Respond with an error message
    return new Response("Failed to end session", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
