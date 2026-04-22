import { isDatabaseConfigured, saveContactMessage } from "../../lib/contact-messages";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "提交内容格式不正确。" }, { status: 400 });
  }

  if (!isNonEmptyString(payload.name)) {
    return Response.json({ message: "请填写你的名字。" }, { status: 400 });
  }

  if (!isNonEmptyString(payload.email) || !isEmail(payload.email)) {
    return Response.json({ message: "请填写正确的邮箱。" }, { status: 400 });
  }

  if (!isNonEmptyString(payload.message)) {
    return Response.json({ message: "请填写留言内容。" }, { status: 400 });
  }

  const contact = {
    name: payload.name.trim(),
    email: payload.email.trim(),
    message: payload.message.trim(),
  };

  if (!isDatabaseConfigured()) {
    console.log("New contact message without database:", contact);

    return Response.json({
      ok: true,
      saved: false,
      message: "留言已收到。数据库还没配置，所以暂时没有保存。",
    });
  }

  try {
    await saveContactMessage(contact);
  } catch (error) {
    console.error("Failed to save contact message:", error);

    return Response.json({ message: "留言保存失败，请稍后再试。" }, { status: 500 });
  }

  return Response.json({
    ok: true,
    saved: true,
    message: "留言已保存到数据库。",
  });
}
