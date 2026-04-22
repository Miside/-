import {
  getPublicMessages,
  isDatabaseConfigured,
  saveAnonymousMessage,
} from "../../lib/anonymous-messages";

const messages = {
  badJson: "\u63d0\u4ea4\u5185\u5bb9\u683c\u5f0f\u4e0d\u6b63\u786e\u3002",
  emptyContent: "\u8bf7\u5148\u5199\u4e0b\u4f60\u7684\u7559\u8a00\u3002",
  contentTooLong: "\u7559\u8a00\u6700\u591a 500 \u4e2a\u5b57\u3002",
  nicknameTooLong: "\u6635\u79f0\u6700\u591a 24 \u4e2a\u5b57\u3002",
  databaseMissing: "\u6570\u636e\u5e93\u8fd8\u6ca1\u914d\u7f6e\uff0c\u6682\u65f6\u4e0d\u80fd\u4fdd\u5b58\u7559\u8a00\u3002",
  loadFailed: "\u7559\u8a00\u52a0\u8f7d\u5931\u8d25\u3002",
  saveFailed: "\u7559\u8a00\u4fdd\u5b58\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
  saved: "\u7559\u8a00\u53d1\u5e03\u6210\u529f\u3002",
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
    const publicMessages = await getPublicMessages();
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

  if (!isDatabaseConfigured()) {
    return Response.json({ message: messages.databaseMissing }, { status: 500 });
  }

  try {
    await saveAnonymousMessage({
      nickname,
      content,
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
