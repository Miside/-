import { redirect } from "next/navigation";
import {
  setCommentVisibility,
  setMessageVisibility,
  updateForceAnonymous,
  updateMaintenanceMode,
} from "../../../lib/anonymous-messages";

type AdminActionType =
  | "anonymous-mode"
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

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = formData.get("token");
  const actionType = formData.get("actionType") as AdminActionType | null;
  const value = parseBoolean(formData.get("value"));

  assertAdmin(token);

  const tokenString = String(token);

  if (actionType === "anonymous-mode") {
    await updateForceAnonymous(value);
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

  throw new Error("Invalid admin action");
}
