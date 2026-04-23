import {
  getPublicMessagesWithComments,
  getSiteSettings,
  isDatabaseConfigured,
  saveAnonymousMessage,
} from "../../lib/anonymous-messages";
import { isLikelyChinesePersonalName } from "../../lib/name-safety";

const messages = {
  badJson: "\u63d0\u4ea4\u5185\u5bb9\u683c\u5f0f\u4e0d\u6b63\u786e\u3002",
  emptyContent: "\u8bf7\u5148\u5199\u4e0b\u4f60\u7684\u7559\u8a00\u3002",
  contentTooLong: "\u7559\u8a00\u6700\u591a 500 \u4e2a\u5b57\u3002",
  nicknameTooLong: "\u6635\u79f0\u6700\u591a 24 \u4e2a\u5b57\u3002",
  nicknameLooksLikeName: "\u6635\u79f0\u4e0d\u80fd\u4f7f\u7528\u50cf\u4e2d\u6587\u4eba\u540d\u7684\u5185\u5bb9\uff0c\u8bf7\u6362\u6210\u7f51\u540d\u6216\u7559\u7a7a\u3002",
  databaseMissing: "\u6570\u636e\u5e93\u8fd8\u6ca1\u914d\u7f6e\uff0c\u6682\u65f6\u4e0d\u80fd\u4fdd\u5b58\u7559\u8a00\u3002",
  maintenance: "\u7f51\u7ad9\u6b63\u5728\u7ef4\u62a4\uff0c\u6682\u65f6\u4e0d\u80fd\u53d1\u5e03\u3002",
  loadFailed: "\u7559\u8a00\u52a0\u8f7d\u5931\u8d25\u3002",
  saveFailed: "\u7559\u8a00\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
  saved: "\u7559\u8a00\u5df2\u63d0\u4ea4\uff0c\u7b49\u5f85\u7ad9\u957f\u5ba1\u6838\u3002",
};

type MessagePayload = {
  nickname?: unknown;
  content?: unknown;
};

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return Response.json({ messages: [] });
  }

  try {
    const settings = await getSiteSettings();
    const publicMessages = settings.maintenance_mode ? [] : await getPublicMessagesWithComments();
    return Response.json({ messages: publicMessages });
  } catch (error) {
    console.error("Failed to load anonymous messages:", error);
    return Response.json({ message: messages.loadFailed }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: MessagePayload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: messages.badJson }, { status: 400 });
  }

  if (!isNonEmptyString(payload.content)) {
    return Response.json({ message: messages.emptyContent }, { status: 400 });
  }

  const content = payload.content.trim();

  if (content.length > 500) {
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

  if (settings.maintenance_mode) {
    return Response.json({ message: messages.maintenance }, { status: 503 });
  }

  try {
    await saveAnonymousMessage({
      nickname,
      content,
      ip_address: getClientIp(request),
      user_agent: request.headers.get("user-agent"),
    });
  } catch (error) {
    console.error("Failed to save anonymous message:", error);
    return Response.json({ message: messages.saveFailed }, { status: 500 });
  }

  return Response.json({
    ok: true,
    message: messages.saved,
  });
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
