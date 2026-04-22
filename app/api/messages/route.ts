import {
  getPublicMessages,
  isDatabaseConfigured,
  saveAnonymousMessage,
} from "../../lib/anonymous-messages";

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
    const messages = await getPublicMessages();
    return Response.json({ messages });
  } catch (error) {
    console.error("Failed to load anonymous messages:", error);
    return Response.json({ message: "留言加载失败。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: MessagePayload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "提交内容格式不正确。" }, { status: 400 });
  }

  if (!isNonEmptyString(payload.content)) {
    return Response.json({ message: "请先写下你的留言。" }, { status: 400 });
  }

  const content = payload.content.trim();

  if (content.length > 500) {
    return Response.json({ message: "留言最多 500 个字。" }, { status: 400 });
  }

  const nickname = optionalString(payload.nickname);

  if (nickname && nickname.length > 24) {
    return Response.json({ message: "昵称最多 24 个字。" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return Response.json({ message: "数据库还没配置，暂时不能保存留言。" }, { status: 500 });
  }

  try {
    await saveAnonymousMessage({
      nickname,
      content,
    });
  } catch (error) {
    console.error("Failed to save anonymous message:", error);
    return Response.json({ message: "留言保存失败，请稍后再试。" }, { status: 500 });
  }

  return Response.json({
    ok: true,
    message: "留言发布成功。",
  });
}
