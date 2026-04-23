"use server";

import { revalidatePath } from "next/cache";
import {
  setCommentVisibility,
  setMessageVisibility,
  updateForceAnonymous,
} from "../lib/anonymous-messages";

function assertAdmin(token: string) {
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    throw new Error("Unauthorized");
  }
}

export async function updateMessageVisibility(id: number, isVisible: boolean, token: string) {
  assertAdmin(token);
  await setMessageVisibility(id, isVisible);
  revalidatePath("/admin/messages");
  revalidatePath("/");
}

export async function updateCommentVisibility(id: number, isVisible: boolean, token: string) {
  assertAdmin(token);
  await setCommentVisibility(id, isVisible);
  revalidatePath("/admin/messages");
  revalidatePath("/");
}

export async function updateAnonymousMode(forceAnonymous: boolean, token: string) {
  assertAdmin(token);
  await updateForceAnonymous(forceAnonymous);
  revalidatePath("/admin/messages");
  revalidatePath("/");
}
