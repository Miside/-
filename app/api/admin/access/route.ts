import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isAdminToken } from "../../../lib/admin-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!isAdminToken(token)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const response = NextResponse.redirect(new URL("/admin/messages", request.url));

  response.cookies.set(ADMIN_COOKIE_NAME, token || "", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: url.protocol === "https:",
  });

  return response;
}
