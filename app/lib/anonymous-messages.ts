export type AnonymousMessageInput = {
  nickname: string | null;
  content: string;
  ip_address: string | null;
  user_agent: string | null;
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
  ip_address: string | null;
  user_agent: string | null;
};

export type AnonymousComment = AnonymousCommentInput & {
  id: number;
  is_visible: boolean;
  created_at: string;
};

export type AnonymousMessageWithComments = AnonymousMessage & {
  comments: AnonymousComment[];
};

export type SiteSettings = {
  blocked_keywords: string | null;
  force_anonymous: boolean;
  maintenance_mode: boolean;
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
    body: JSON.stringify({
      ...message,
      is_visible: false,
    }),
  });
}

export async function saveAnonymousComment(comment: AnonymousCommentInput) {
  await requestSupabase("/rest/v1/anonymous_comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      ...comment,
      is_visible: false,
    }),
  });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await requestSupabase(
      "/rest/v1/site_settings?select=blocked_keywords,force_anonymous,maintenance_mode&id=eq.1&limit=1",
      {
        method: "GET",
      },
    );
    const rows = (await response.json()) as SiteSettings[];

    return rows[0] || { blocked_keywords: "", force_anonymous: false, maintenance_mode: false };
  } catch (error) {
    console.error("Failed to load site settings:", error);
    return { blocked_keywords: "", force_anonymous: false, maintenance_mode: false };
  }
}

export async function updateForceAnonymous(forceAnonymous: boolean) {
  const settings = await getSiteSettings();

  await requestSupabase("/rest/v1/site_settings?on_conflict=id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: 1,
      blocked_keywords: settings.blocked_keywords || "",
      force_anonymous: forceAnonymous,
      maintenance_mode: settings.maintenance_mode,
    }),
  });
}

export async function updateMaintenanceMode(maintenanceMode: boolean) {
  const settings = await getSiteSettings();

  await requestSupabase("/rest/v1/site_settings?on_conflict=id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: 1,
      blocked_keywords: settings.blocked_keywords || "",
      force_anonymous: settings.force_anonymous,
      maintenance_mode: maintenanceMode,
    }),
  });
}

export async function updateBlockedKeywords(blockedKeywords: string) {
  const settings = await getSiteSettings();

  await requestSupabase("/rest/v1/site_settings?on_conflict=id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: 1,
      blocked_keywords: blockedKeywords,
      force_anonymous: settings.force_anonymous,
      maintenance_mode: settings.maintenance_mode,
    }),
  });
}

export async function getPublicMessages() {
  const response = await requestSupabase(
    "/rest/v1/anonymous_messages?select=id,nickname,content,is_visible,ip_address,user_agent,created_at&is_visible=eq.true&order=created_at.desc&limit=100",
    {
      method: "GET",
    },
  );

  return (await response.json()) as AnonymousMessage[];
}

export async function getPublicMessagesWithComments() {
  const [messages, settings] = await Promise.all([getPublicMessages(), getSiteSettings()]);

  if (messages.length === 0) {
    return [] as AnonymousMessageWithComments[];
  }

  const ids = messages.map((message) => message.id).join(",");
  const response = await requestSupabase(
    `/rest/v1/anonymous_comments?select=id,message_id,nickname,content,is_visible,ip_address,user_agent,created_at&is_visible=eq.true&message_id=in.(${ids})&order=created_at.asc`,
    {
      method: "GET",
    },
  );
  const comments = (await response.json()) as AnonymousComment[];

  const messagesWithComments = messages.map((message) => ({
    ...message,
    comments: comments.filter((comment) => comment.message_id === message.id),
  }));

  if (!settings.force_anonymous) {
    return messagesWithComments;
  }

  return messagesWithComments.map((message) => ({
    ...message,
    nickname: null,
    comments: message.comments.map((comment) => ({
      ...comment,
      nickname: null,
    })),
  }));
}

export async function getAllMessages() {
  const response = await requestSupabase(
    "/rest/v1/anonymous_messages?select=id,nickname,content,is_visible,ip_address,user_agent,created_at&order=created_at.desc&limit=100",
    {
      method: "GET",
    },
  );

  return (await response.json()) as AnonymousMessage[];
}

export async function getAllComments() {
  const response = await requestSupabase(
    "/rest/v1/anonymous_comments?select=id,message_id,nickname,content,is_visible,ip_address,user_agent,created_at&order=created_at.asc&limit=500",
    {
      method: "GET",
    },
  );

  return (await response.json()) as AnonymousComment[];
}

export async function getAllMessagesWithComments() {
  const [messages, comments] = await Promise.all([getAllMessages(), getAllComments()]);

  return messages.map((message) => ({
    ...message,
    comments: comments.filter((comment) => comment.message_id === message.id),
  }));
}

export async function setMessageVisibility(id: number, isVisible: boolean) {
  await requestSupabase(`/rest/v1/anonymous_messages?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      is_visible: isVisible,
    }),
  });
}

export async function setCommentVisibility(id: number, isVisible: boolean) {
  await requestSupabase(`/rest/v1/anonymous_comments?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      is_visible: isVisible,
    }),
  });
}
