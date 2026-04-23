"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  setCommentVisibility,
  setMessageVisibility,
  updateMaintenanceMode,
  updateForceAnonymous,
} from "../lib/anonymous-messages";
import { hasAdminCookieValue } from "../lib/admin-auth";

async function assertAdmin() {
  const cookieStore = await cookies();

  if (!hasAdminCookieValue(cookieStore.get("admin_access")?.value)) {
    throw new Error("Unauthorized");
  }
}

export async function updateMessageVisibility(id: number, isVisible: boolean) {
  await assertAdmin();
  await setMessageVisibility(id, isVisible);
  revalidatePath("/admin/messages");
  revalidatePath("/");
}

export async function updateCommentVisibility(id: number, isVisible: boolean) {
  await assertAdmin();
  await setCommentVisibility(id, isVisible);
  revalidatePath("/admin/messages");
  revalidatePath("/");
}

export async function updateAnonymousMode(forceAnonymous: boolean) {
  await assertAdmin();
  await updateForceAnonymous(forceAnonymous);
  revalidatePath("/admin/messages");
  revalidatePath("/");
}

export async function updateMaintenance(maintenanceMode: boolean) {
  await assertAdmin();
  await updateMaintenanceMode(maintenanceMode);
  revalidatePath("/admin/messages");
  revalidatePath("/");
}
