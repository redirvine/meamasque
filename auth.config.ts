import type { NextAuthConfig } from "next-auth";

const authPages = ["/login", "/forgot-password", "/reset-password"];

export default {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = authPages.some((p) => nextUrl.pathname.startsWith(p));

      if (!isLoggedIn && !isAuthPage) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isLoggedIn && nextUrl.pathname.startsWith("/admin")) {
        const role = (auth as { user?: { role?: string } })?.user?.role;
        if (role !== "admin") {
          return Response.redirect(new URL("/", nextUrl));
        }
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
