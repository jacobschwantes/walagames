import { NextMiddleware, NextRequest, NextResponse } from "next/server";
import { JWT, encode, getToken } from "next-auth/jwt";

interface BackendTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

type Token = {
  access_token: string;
  expires_at: number;
  refresh_token: string;
  name?: string;
  email?: string;
  picture?: string;
  sub: string;
  iat: number;
  exp: number;
  jti: string;
};

const sessionCookie = process.env.NEXTAUTH_URL?.startsWith("https://")
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

function signOut(request: NextRequest) {
  let response = NextResponse.next();
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.includes("next-auth")) response.cookies.delete(cookie.name);
  });

  return response;
}

function shouldUpdateToken(tokens: BackendTokens) {
  // TODO: Implement a better way to check if the token is expired
  if (Date.now() < (tokens.expires_at - 500) * 1000) {
    console.log("TOKEN IS NOT EXPIRED");
    console.log(
      "TOKEN EXPIRES IN",
      Math.floor((tokens.expires_at * 1000 - Date.now()) / 60 / 1000),
      "MINUTES"
    );
    return false;
  }
  console.log("TOKEN IS EXPIRED, REFRESHING");
  return true;
}

export const middleware: NextMiddleware = async (request: NextRequest) => {
  const jwt = await getToken({ req: request });

  if (!jwt) {
    console.log("calling signout");
    return signOut(request);
  }

  let response = NextResponse.next();

  const token: Token = jwt as Token;

  if (
    shouldUpdateToken({
      access_token: token.access_token,
      refresh_token: token.refresh_token,
      expires_at: token.expires_at,
    })
  ) {
    // Here yoy retrieve the new access token from your custom backend
    try {
      const newTokens = await refreshToken(jwt);
      const newSessionToken = await encode({
        secret: process.env.NEXTAUTH_SECRET!,
        token: {
          ...jwt,
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: newTokens.expires_at,
        },
        maxAge: 604800 /* TODO: 7 days -> get from the env */,
      });
      response = updateCookie(newSessionToken, request, response);
    } catch (error) {
      response = updateCookie(null, request, response);
    }
  }

  return response;
};

async function refreshToken(token: JWT): Promise<BackendTokens> {
  console.log("CALLING TOKEN REFRESH ENDPOINT");

  const params = new URLSearchParams();
  params.append("client_id", process.env.FUSIONAUTH_CLIENT_ID);
  params.append("client_secret", process.env.FUSIONAUTH_CLIENT_SECRET);
  params.append("grant_type", "refresh_token");
  params.append("access_token", token.access_token);
  params.append("refresh_token", token.refresh_token);


  const response = await fetch(process.env.FUSIONAUTH_URL + "/oauth2/token", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
    method: "POST",
  })
    .then((res) => res.json())
    .catch((e) => console.log(e));
  
  console.log(response)

  if (!response.access_token) {
    throw new Error("failed to refresh")
  }

  console.log("TOKENS REFRESHED");
  return {
    access_token: response.access_token,
    expires_at: Math.floor(Date.now() / 1000) + response.expires_in,
    // Fall back to old refresh token, but note that
    // many providers may only allow using a refresh token once.
    refresh_token: response.refresh_token ?? token.refresh_token,
  };
}

function updateCookie(
  sessionToken: string | null,
  request: NextRequest,
  response: NextResponse
) {
  if (sessionToken) {
    // set request cookies for the incoming getServerSession to read new session
    request.cookies.set(sessionCookie, sessionToken);

    // updated request cookies can only be passed to server if its passdown here after setting its updates
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // set response cookies to send back to browser
    response.cookies.set(sessionCookie, sessionToken, {
      httpOnly: true,
      maxAge: 604800 /* TODO: 7 days -> get from the env */,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } else {
    request.cookies.delete(sessionCookie);
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
    response.cookies.delete(sessionCookie);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
