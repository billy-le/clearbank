import { APPWRITE_SESSION } from "./constants";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const session = request.cookies.get(APPWRITE_SESSION)?.value;

	if (session && !request.nextUrl.pathname.startsWith("/")) {
		return Response.redirect(new URL("/", request.url));
	}

	if (!session && !request.nextUrl.pathname.startsWith("/sign-in")) {
		return Response.redirect(new URL("/sign-in", request.url));
	}
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
