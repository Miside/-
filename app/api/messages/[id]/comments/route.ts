import {
  getSiteSettings,
  isDatabaseConfigured,
  saveAnonymousComment,
} from "../../../../lib/anonymous-messages";
import { isLikelyChinesePersonalName } from "../../../../lib/name-safety";

const messages = {
  badJson: "\u63d0\u4ea4\u5185\u5bb9\u683c\u5f0f\u4e0d\u6b63\u786e\u3002",
  badMessage: "\u7559\u8a00 ID \u4e0d\u6b63\u786e\u3002",
  emptyContent: "\u8bf7\u5148\u5199\u4e0b\u4f60\u7684\u8bc4\u8bba\u3002",
  contentTooLong: "\u8bc4\u8bba\u6700\u591a 300 \u4e2a\u5b57\u3002",
  nicknameTooLong: "\u6635\u79f0\u6700\u591a 24 \u4e2a\u5b57\u3002",
  nicknameLooksLikeName: "\u6635\u79f0\u4e0d\u80fd\u4f7f\u7528\u50cf\u4e2d\u6587\u4eba\u540d\u7684\u5185\u5bb9\uff0c\u8bf7\u6362\u6210\u7f51\u540d\u6216\u7559\u7a7a\u3002",
  databaseMissing: "\u6570\u636e\u5e93\u8fd8\u6ca1\u914d\u7f6e\uff0c\u6682\u65f6\u4e0d\u80fd\u4fdd\u5b58\u8bc4\u8bba\u3002",
  maintenance: "\u7f51\u7ad9\u6b63\u5728\u7ef4\u62a4\uff0c\u6682\u65f6\u4e0d\u80fd\u53d1\u5e03\u3002",
  saveFailed: "\u8bc4\u8bba\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
  saved: "\u8bc4\u8bba\u5df2\u63d0\u4ea4\uff0c\u7b49\u5f85\u7ad9\u957f\u5ba1\u6838\u3002",
};

type CommentPayload = {
  nickname?: unknown;
  content?: unknown;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request, context: RouteContext) {
  const params = await context.params;
  const messageId = Number(params.id);

  if (!Number.isInteger(messageId) || messageId <= 0) {
    return Response.json({ message: messages.badMessage }, { status: 400 });
  }

  let payload: CommentPayload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: messages.badJson }, { status: 400 });
  }

  if (!isNonEmptyString(payload.content)) {
    return Response.json({ message: messages.emptyContent }, { status: 400 });
  }

  const content = payload.content.trim();

  if (content.length > 300) {
    return Response.json({ message: messages.contentTooLong }, { status: 400 });
  }

  const nickname = optionalString(payload.nickname);

  if (nickname && nickname.length > 24) {
    return Response.json({ message: messages.nicknameTooLong }, { status: 400 });
  }

  if (isLikelyChinesePersonalName(nickname)) {
    return Response.json({ message: messages.nicknameLooksLikeName }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return Response.json({ message: messages.databaseMissing }, { status: 500 });
  }

  const settings = await getSiteSettings();

  if (settings.maintenance_mode && !canBypassMaintenance(request)) {
    return Response.json({ message: messages.maintenance }, { status: 503 });
  }

  try {
    await saveAnonymousComment({
      message_id: messageId,
      nickname,
      content,
      ip_address: getClientIp(request),
      user_agent: request.headers.get("user-agent"),
    });
  } catch (error) {
    console.error("Failed to save anonymous comment:", error);
    return Response.json({ message: messages.saveFailed }, { status: 500 });
  }

  return Response.json({
    ok: true,
    message: messages.saved,
  });
}

function canBypassMaintenance(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return false;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  return cookieHeader
    .split(";")
    .map((item) => item.trim())
    .some((item) => item === `admin_access=${adminToken}`);
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    null
  );
}
