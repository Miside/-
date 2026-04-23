import { NextResponse } from "next/server";
import { hasAdminAccessFromCookieHeader } from "../../../lib/admin-auth";
import {
  setCommentVisibility,
  setMessageVisibility,
  updateBlockedKeywords,
  updateForceAnonymous,
  updateMaintenanceMode,
  updateModerationEnabled,
} from "../../../lib/anonymous-messages";

type AdminActionType =
  | "anonymous-mode"
  | "blocked-keywords"
  | "comment-visibility"
  | "maintenance"
  | "message-visibility"
  | "moderation";

function assertAdmin(request: Request) {
  if (!hasAdminAccessFromCookieHeader(request.headers.get("cookie"))) {
    throw new Error("Unauthorized");
  }
}

function parseId(value: FormDataEntryValue | null) {
  const id = typeof value === "string" ? Number(value) : NaN;

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id");
  }

  return id;
}

function parseBoolean(value: FormDataEntryValue | null) {
  return value === "true";
}

function redirectToAdmin(request: Request) {
  return NextResponse.redirect(new URL("/admin/messages", request.url), 303);
}

function redirectToAdminWithError(request: Request, message: string) {
  return NextResponse.redirect(
    new URL(`/admin/messages?error=${encodeURIComponent(message)}`, request.url),
    303,
  );
}

export async function GET() {
  return NextResponse.json(
    {
      message: "This endpoint only handles admin button POST requests. Open /admin/messages instead.",
    },
    { status: 405 },
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const actionType = formData.get("actionType") as AdminActionType | null;
  const value = parseBoolean(formData.get("value"));

  try {
    assertAdmin(request);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    if (actionType === "anonymous-mode") {
      await updateForceAnonymous(value);
      return redirectToAdmin(request);
    }

    if (actionType === "blocked-keywords") {
      await updateBlockedKeywords(String(formData.get("blockedKeywords") || ""));
      return redirectToAdmin(request);
    }

    if (actionType === "maintenance") {
      await updateMaintenanceMode(value);
      return redirectToAdmin(request);
    }

    if (actionType === "moderation") {
      await updateModerationEnabled(value);
      return redirectToAdmin(request);
    }

    if (actionType === "message-visibility") {
      await setMessageVisibility(parseId(formData.get("id")), value);
      return redirectToAdmin(request);
    }

    if (actionType === "comment-visibility") {
      await setCommentVisibility(parseId(formData.get("id")), value);
      return redirectToAdmin(request);
    }

    return redirectToAdminWithError(request, "Invalid admin action.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin action failed.";
    return redirectToAdminWithError(request, message);
  }
}
