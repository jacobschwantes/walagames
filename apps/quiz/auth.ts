import NextAuth from "next-auth";
import FusionAuthProvider from "next-auth/providers/fusionauth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const fusionAuthIssuer = process.env.FUSIONAUTH_ISSUER;
const fusionAuthClientId = process.env.FUSIONAUTH_CLIENT_ID;
const fusionAuthClientSecret = process.env.FUSIONAUTH_CLIENT_SECRET;
const fusionAuthUrl = process.env.FUSIONAUTH_URL;

const missingError = "missing in environment variables.";
if (!fusionAuthIssuer) {
  throw Error("FUSIONAUTH_ISSUER" + missingError);
}
if (!fusionAuthClientId) {
  throw Error("FUSIONAUTH_CLIENT_ID" + missingError);
}
if (!fusionAuthClientSecret) {
  throw Error("FUSIONAUTH_CLIENT_SECRET" + missingError);
}
if (!fusionAuthUrl) {
  throw Error("FUSIONAUTH_URL" + missingError);
}

export const authOptions = {
  providers: [
    FusionAuthProvider({
      issuer: fusionAuthIssuer,
      clientId: fusionAuthClientId,
      clientSecret: fusionAuthClientSecret,
      // client: {
      //   id_token_signed_response_alg: "HS256",
      // },
      profile(profile) {
        console.log("profile in provider:", profile);
        return {
          id: profile.sub,
          email: profile.email,
          name: profile?.preferred_username,
          image: profile?.picture,
          roles: profile?.roles,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token, profile }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.roles = token.roles;
      }

      return session;
    },

    async jwt({ token, account, profile }) {
      // console.log("jwt token", token);
      if (account) {
        console.log("INTIAL LOGIN, SAVING TOKENS IN JWT");
        // Save the access token and refresh token in the JWT on the initial login
        return {
          access_token: account.access_token,
          expires_at: account.expires_at,
          refresh_token: account.refresh_token,
          roles: profile.roles,
          ...token,
        };
      }
      // console.log("token", token)
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, signOut };

function signOut() {
  console.log("SIGNING OUT");

  const cookieNames = ["next-auth.session-token", "next-auth.csrf-token"];

  // Clear the cookies and set headers
  cookieNames.forEach((cookieName) => {
    cookies().set(cookieName, "deleted", {
      maxAge: 0,
      path: "/",
    });
  });

  cookies().set("next-auth.callback-url", "/", {
    maxAge: 0,
    path: "/",
  });

 return Response.redirect(process.env.NEXTAUTH_URL + "/");
}
