import { AdminAutoRefresh } from "../messages/admin-auto-refresh";
import { MessageList } from "../messages/message-list";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getPendingMessagesWithComments,
  isDatabaseConfigured,
} from "../../lib/anonymous-messages";
import { hasAdminCookieValue, isAdminToken } from "../../lib/admin-auth";

type PendingPageProps = {
  searchParams: Promise<{
    error?: string;
    token?: string;
  }>;
};

export default async function PendingPage({ searchParams }: PendingPageProps) {
  const params = await searchParams;
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return <AdminNotice kicker="后台未启用" title="请先在 Vercel 配置 ADMIN_TOKEN。" />;
  }

  if (params.token) {
    if (isAdminToken(params.token)) {
      redirect(`/api/admin/access?token=${encodeURIComponent(params.token)}`);
    }

    return <AdminNotice kicker="需要访问口令" title="访问口令不正确。" />;
  }

  const cookieStore = await cookies();
  const hasAdminAccess = hasAdminCookieValue(cookieStore.get("admin_access")?.value);

  if (!hasAdminAccess) {
    return <AdminNotice kicker="需要访问口令" title="请先通过后台入口登录。" />;
  }

  if (!isDatabaseConfigured()) {
    return <AdminNotice kicker="数据库未配置" title="请先配置 Supabase 环境变量。" />;
  }

  const messages = await getPendingMessagesWithComments();

  return (
    <main className="page-shell">
      <AdminAutoRefresh />
      <section className="section">
        <div className="section-heading">
          <p className="section-kicker">待审核</p>
          <h1 className="admin-title">未公开的留言和评论</h1>
        </div>
        <div className="admin-nav">
          <a className="admin-action-button" href="/admin/messages">
            全部留言
          </a>
          <a className="admin-action-button" href="/admin/visits">
            访问记录
          </a>
        </div>

        {params.error ? <p className="form-message is-error">{params.error}</p> : null}

        <MessageList
          emptyText="现在没有待审核内容。"
          messages={messages}
          redirectTo="/admin/pending"
        />
      </section>
    </main>
  );
}

function AdminNotice({ kicker, title }: { kicker: string; title: string }) {
  return (
    <main className="page-shell">
      <section className="section">
        <p className="section-kicker">{kicker}</p>
        <h1 className="admin-title">{title}</h1>
        <p className="body-copy">登录入口：/api/admin/access?token=你的口令</p>
      </section>
    </main>
  );
}
