export type ContactMessageInput = {
  name: string;
  email: string;
  message: string;
};

export type ContactMessage = ContactMessageInput & {
  id: number;
  created_at: string;
};

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isDatabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

async function requestSupabase(path: string, init: RequestInit) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Supabase request failed.");
  }

  return response;
}

export async function saveContactMessage(message: ContactMessageInput) {
  await requestSupabase("/rest/v1/contact_messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(message),
  });
}

export async function getContactMessages() {
  const response = await requestSupabase(
    "/rest/v1/contact_messages?select=id,name,email,message,created_at&order=created_at.desc&limit=50",
    {
      method: "GET",
    },
  );

  return (await response.json()) as ContactMessage[];
}
