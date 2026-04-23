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

export type PublicAnonymousMessage = Omit<AnonymousMessage, "ip_address" | "user_agent">;

export type PublicAnonymousComment = Omit<AnonymousComment, "ip_address" | "user_agent">;

export type AnonymousMessageWithComments = PublicAnonymousMessage & {
  comments: PublicAnonymousComment[];
};

export type SiteSettings = {
  blocked_keywords: string | null;
  force_anonymous: boolean;
  maintenance_mode: boolean;
  moderation_enabled: boolean;
};

export type VisitorLogInput = {
  accept_language: string | null;
  city: string | null;
  country: string | null;
  ip_address: string | null;
  languages: string[] | null;
  path: string | null;
  platform: string | null;
  referer: string | null;
  region: string | null;
  screen: string | null;
  timezone: string | null;
  user_agent: string | null;
  viewport: string | null;
};

export type VisitorLog = VisitorLogInput & {
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
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Supabase request failed.");
  }

  return response;
}

export async function saveAnonymousMessage(message: AnonymousMessageInput, isVisible = false) {
  await requestSupabase("/rest/v1/anonymous_messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      ...message,
      is_visible: isVisible,
    }),
  });
}

export async function saveAnonymousComment(comment: AnonymousCommentInput, isVisible = false) {
  await requestSupabase("/rest/v1/anonymous_comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      ...comment,
      is_visible: isVisible,
    }),
  });
}

export async function saveVisitorLog(log: VisitorLogInput) {
  await requestSupabase("/rest/v1/visitor_logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(log),
  });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await requestSupabase(
      "/rest/v1/site_settings?select=blocked_keywords,force_anonymous,maintenance_mode,moderation_enabled&id=eq.1&limit=1",
      {
        method: "GET",
      },
    );
    const rows = (await response.json()) as SiteSettings[];

    return (
      rows[0] || {
        blocked_keywords: "",
        force_anonymous: false,
        maintenance_mode: false,
        moderation_enabled: true,
      }
    );
  } catch (error) {
    console.error("Failed to load site settings:", error);
    return {
      blocked_keywords: "",
      force_anonymous: false,
      maintenance_mode: false,
      moderation_enabled: true,
    };
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
      moderation_enabled: settings.moderation_enabled,
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
      moderation_enabled: settings.moderation_enabled,
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
      moderation_enabled: settings.moderation_enabled,
    }),
  });
}

export async function updateModerationEnabled(moderationEnabled: boolean) {
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
      maintenance_mode: settings.maintenance_mode,
      moderation_enabled: moderationEnabled,
    }),
  });
}

export async function getPublicMessages() {
  const response = await requestSupabase(
    "/rest/v1/anonymous_messages?select=id,nickname,content,is_visible,created_at&is_visible=eq.true&order=created_at.desc&limit=100",
    {
      method: "GET",
    },
  );

  return (await response.json()) as PublicAnonymousMessage[];
}

export async function getPublicMessagesWithComments() {
  const [messages, settings] = await Promise.all([getPublicMessages(), getSiteSettings()]);

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
  const comments = (await response.json()) as PublicAnonymousComment[];

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

export async function getVisitorLogs() {
  const response = await requestSupabase(
    "/rest/v1/visitor_logs?select=id,ip_address,user_agent,referer,path,accept_language,country,region,city,timezone,screen,viewport,platform,languages,created_at&order=created_at.desc&limit=300",
    {
      method: "GET",
    },
  );

  return (await response.json()) as VisitorLog[];
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
