import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set("admin_access", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: true,
  });

  return response;
}
