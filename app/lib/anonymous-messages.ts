export type AnonymousMessageInput = {
  nickname: string | null;
  content: string;
};

export type AnonymousMessage = AnonymousMessageInput & {
  id: number;
  is_visible: boolean;
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
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Supabase request failed.");
  }

  return response;
}

export async function saveAnonymousMessage(message: AnonymousMessageInput) {
  await requestSupabase("/rest/v1/anonymous_messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(message),
  });
}

export async function getPublicMessages() {
  const response = await requestSupabase(
    "/rest/v1/anonymous_messages?select=id,nickname,content,is_visible,created_at&is_visible=eq.true&order=created_at.desc&limit=100",
    {
      method: "GET",
    },
  );

  return (await response.json()) as AnonymousMessage[];
}

export async function getAllMessages() {
  const response = await requestSupabase(
    "/rest/v1/anonymous_messages?select=id,nickname,content,is_visible,created_at&order=created_at.desc&limit=100",
    {
      method: "GET",
    },
  );

  return (await response.json()) as AnonymousMessage[];
}
