export type AnonymousMessageInput = {
  nickname: string | null;
  content: string;
};

export type AnonymousMessage = AnonymousMessageInput & {
  id: number;
  is_visible: boolean;
  created_at: string;
};

export type AnonymousCommentInput = {
  message_id: number;
  nickname: string | null;
  content: string;
};

export type AnonymousComment = AnonymousCommentInput & {
  id: number;
  is_visible: boolean;
  created_at: string;
};

export type AnonymousMessageWithComments = AnonymousMessage & {
  comments: AnonymousComment[];
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

export async function saveAnonymousComment(comment: AnonymousCommentInput) {
  await requestSupabase("/rest/v1/anonymous_comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(comment),
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

export async function getPublicMessagesWithComments() {
  const messages = await getPublicMessages();

  if (messages.length === 0) {
    return [] as AnonymousMessageWithComments[];
  }

  const ids = messages.map((message) => message.id).join(",");
  const response = await requestSupabase(
    `/rest/v1/anonymous_comments?select=id,message_id,nickname,content,is_visible,created_at&is_visible=eq.true&message_id=in.(${ids})&order=created_at.asc`,
    {
      method: "GET",
    },
  );
  const comments = (await response.json()) as AnonymousComment[];

  return messages.map((message) => ({
    ...message,
    comments: comments.filter((comment) => comment.message_id === message.id),
  }));
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
