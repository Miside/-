import { AdminAutoRefresh } from "../messages/admin-auto-refresh";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getVisitorLogs, isDatabaseConfigured, type VisitorLog } from "../../lib/anonymous-messages";
import { hasAdminCookieValue, isAdminToken } from "../../lib/admin-auth";
import { parseClientDetails } from "../../lib/client-details";

type VisitsPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function VisitsPage({ searchParams }: VisitsPageProps) {
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

  let visits: VisitorLog[] = [];

  try {
    visits = await getVisitorLogs();
  } catch (error) {
    console.error("Failed to load visitor logs:", error);
    return (
      <AdminNotice
        kicker="访问记录未启用"
        title="请先在 Supabase SQL Editor 运行 visitor_logs 建表 SQL。"
      />
    );
  }

  return (
    <main className="page-shell">
      <AdminAutoRefresh />
      <section className="section">
        <div className="section-heading">
          <p className="section-kicker">访问记录</p>
          <h1 className="admin-title">最近 300 次访问</h1>
        </div>
        <div className="admin-nav">
          <a className="admin-action-button" href="/admin/messages">
            留言后台
          </a>
        </div>

        <div className="message-list">
          {visits.length === 0 ? (
            <p className="body-copy">现在还没有访问记录。</p>
          ) : (
            visits.map((visit) => <VisitCard key={visit.id} visit={visit} />)
          )}
        </div>
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

function VisitCard({ visit }: { visit: Awaited<ReturnType<typeof getVisitorLogs>>[number] }) {
  const details = parseClientDetails(visit.user_agent);

  return (
    <article className="message-card">
      <div>
        <h2>{visit.path || "未知页面"}</h2>
        <span className="status-pill">{visit.country || "未知地区"}</span>
      </div>
      <time dateTime={visit.created_at}>
        {new Date(visit.created_at).toLocaleString("zh-CN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </time>
      <dl className="admin-meta-list">
        <Meta label="ID" value={visit.id} />
        <Meta label="IP" value={visit.ip_address} />
        <Meta label="页面" value={visit.path} />
        <Meta label="来源页" value={visit.referer} />
        <Meta label="国家" value={visit.country} />
        <Meta label="地区" value={visit.region} />
        <Meta label="城市" value={decodeHeaderValue(visit.city)} />
        <Meta
          label="浏览器"
          value={`${details.browser}${details.browserVersion !== "-" ? ` ${details.browserVersion}` : ""}`}
        />
        <Meta
          label="系统"
          value={`${details.os}${details.osVersion !== "-" ? ` ${details.osVersion}` : ""}`}
        />
        <Meta label="内核" value={details.engine} />
        <Meta label="设备" value={details.device} />
        <Meta label="平台" value={visit.platform} />
        <Meta label="时区" value={visit.timezone} />
        <Meta label="屏幕" value={visit.screen} />
        <Meta label="窗口" value={visit.viewport} />
        <Meta label="语言" value={visit.languages?.join(", ") || visit.accept_language} />
        <Meta label="设备原文" value={visit.user_agent} />
      </dl>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: number | string | null | undefined }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "-"}</dd>
    </div>
  );
}

function decodeHeaderValue(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
