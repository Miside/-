import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  setCommentVisibility,
  setMessageVisibility,
  updateBlockedKeywords,
  updateForceAnonymous,
  updateMaintenanceMode,
} from "../../../lib/anonymous-messages";

type AdminActionType =
  | "anonymous-mode"
  | "blocked-keywords"
  | "comment-visibility"
  | "maintenance"
  | "message-visibility";

function assertAdmin(token: FormDataEntryValue | null) {
  if (typeof token !== "string" || !process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
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

function redirectToAdmin(token: string) {
  redirect(`/admin/messages?token=${encodeURIComponent(token)}`);
}

function redirectToAdminWithError(token: string, message: string) {
  redirect(
    `/admin/messages?token=${encodeURIComponent(token)}&error=${encodeURIComponent(message)}`,
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
  const token = formData.get("token");
  const actionType = formData.get("actionType") as AdminActionType | null;
  const value = parseBoolean(formData.get("value"));

  try {
    assertAdmin(token);
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tokenString = String(token);

  try {
    if (actionType === "anonymous-mode") {
      await updateForceAnonymous(value);
      redirectToAdmin(tokenString);
    }

    if (actionType === "blocked-keywords") {
      await updateBlockedKeywords(String(formData.get("blockedKeywords") || ""));
      redirectToAdmin(tokenString);
    }

    if (actionType === "maintenance") {
      await updateMaintenanceMode(value);
      redirectToAdmin(tokenString);
    }

    if (actionType === "message-visibility") {
      await setMessageVisibility(parseId(formData.get("id")), value);
      redirectToAdmin(tokenString);
    }

    if (actionType === "comment-visibility") {
      await setCommentVisibility(parseId(formData.get("id")), value);
      redirectToAdmin(tokenString);
    }

    redirectToAdminWithError(tokenString, "Invalid admin action.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Admin action failed.";
    redirectToAdminWithError(tokenString, message);
  }
}
