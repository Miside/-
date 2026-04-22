import { getContactMessages, isDatabaseConfigured } from "../../lib/contact-messages";

type MessagesPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const params = await searchParams;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return (
      <main className="page-shell">
        <section className="section">
          <p className="section-kicker">后台未启用</p>
          <h1 className="admin-title">请先在 Vercel 配置 ADMIN_TOKEN。</h1>
        </section>
      </main>
    );
  }

  if (params.token !== adminToken) {
    return (
      <main className="page-shell">
        <section className="section">
          <p className="section-kicker">需要访问口令</p>
          <h1 className="admin-title">请在网址后加上正确的 token。</h1>
          <p className="body-copy">格式：/admin/messages?token=你的口令</p>
        </section>
      </main>
    );
  }

  if (!isDatabaseConfigured()) {
    return (
      <main className="page-shell">
        <section className="section">
          <p className="section-kicker">数据库未配置</p>
          <h1 className="admin-title">请先配置 Supabase 环境变量。</h1>
        </section>
      </main>
    );
  }

  const messages = await getContactMessages();

  return (
    <main className="page-shell">
      <section className="section">
        <div className="section-heading">
          <p className="section-kicker">留言后台</p>
          <h1 className="admin-title">最近 50 条联系表单留言</h1>
        </div>

        <div className="message-list">
          {messages.length === 0 ? (
            <p className="body-copy">现在还没有留言。</p>
          ) : (
            messages.map((message) => (
              <article className="message-card" key={message.id}>
                <div>
                  <h2>{message.name}</h2>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </div>
                <time dateTime={message.created_at}>
                  {new Date(message.created_at).toLocaleString("zh-CN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
                <p>{message.message}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
