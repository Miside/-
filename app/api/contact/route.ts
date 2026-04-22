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
    receivedAt: new Date().toISOString(),
  };

  console.log("New contact message:", contact);

  return Response.json({
    ok: true,
    message: "留言已收到。现在后端接口已经跑通了！",
  });
}
