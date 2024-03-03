import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import GoogleProvider from "@auth/core/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db"

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  theme: {
    logo: "https://next-auth.js.org/img/logo/logo-sm.png",
  },
  adapter: PrismaAdapter(prisma),
  // session: {
  //   strategy: "jwt",
  // },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
