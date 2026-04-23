import { ActionForm } from "./action-form";
import {
  getAllMessagesWithComments,
  getSiteSettings,
  isDatabaseConfigured,
} from "../../lib/anonymous-messages";

const text = {
  adminDisabled: "\u540e\u53f0\u672a\u542f\u7528",
  configureToken: "\u8bf7\u5148\u5728 Vercel \u914d\u7f6e ADMIN_TOKEN\u3002",
  needToken: "\u9700\u8981\u8bbf\u95ee\u53e3\u4ee4",
  wrongToken: "\u8bf7\u5728\u7f51\u5740\u540e\u52a0\u4e0a\u6b63\u786e\u7684 token\u3002",
  tokenFormat: "\u683c\u5f0f\uff1a/admin/messages?token=\u4f60\u7684\u53e3\u4ee4",
  databaseMissing: "\u6570\u636e\u5e93\u672a\u914d\u7f6e",
  configureDatabase: "\u8bf7\u5148\u914d\u7f6e Supabase \u73af\u5883\u53d8\u91cf\u3002",
  admin: "\u7559\u8a00\u540e\u53f0",
  title: "\u6700\u8fd1 100 \u6761\u533f\u540d\u7559\u8a00",
  empty: "\u73b0\u5728\u8fd8\u6ca1\u6709\u7559\u8a00\u3002",
  anonymous: "\u533f\u540d\u7528\u6237",
  visible: "\u516c\u5f00",
  hidden: "\u5df2\u9690\u85cf",
  hide: "\u9690\u85cf",
  show: "\u6062\u590d",
  comments: "\u8bc4\u8bba",
  anonymousMode: "\u5168\u7ad9\u533f\u540d\u6a21\u5f0f",
  anonymousModeOn: "\u5df2\u5f00\u542f\uff1a\u9996\u9875\u4e0d\u663e\u793a\u4efb\u4f55\u6635\u79f0",
  anonymousModeOff: "\u5df2\u5173\u95ed\uff1a\u9996\u9875\u6b63\u5e38\u663e\u793a\u6635\u79f0",
  enableAnonymous: "\u5f00\u542f\u5168\u7ad9\u533f\u540d",
  disableAnonymous: "\u5173\u95ed\u5168\u7ad9\u533f\u540d",
  maintenanceMode: "\u7ef4\u62a4\u6a21\u5f0f",
  maintenanceOn: "\u5df2\u5f00\u542f\uff1a\u524d\u53f0\u53ea\u663e\u793a\u7ef4\u62a4\u9875\uff0c\u7528\u6237\u4e0d\u80fd\u53d1\u5e03",
  maintenanceOff: "\u5df2\u5173\u95ed\uff1a\u524d\u53f0\u6b63\u5e38\u8bbf\u95ee",
  enableMaintenance: "\u5f00\u542f\u7ef4\u62a4",
  disableMaintenance: "\u5173\u95ed\u7ef4\u62a4",
  adminAccess: "\u672c\u673a\u8c03\u8bd5\u5165\u53e3",
  adminAccessCopy: "\u7ef4\u62a4\u6a21\u5f0f\u4e0b\uff0c\u666e\u901a\u8bbf\u5ba2\u770b\u4e0d\u5230\u7559\u8a00\u5899\uff1b\u4f60\u5728\u672c\u673a\u6253\u5f00\u8fd9\u4e2a\u5165\u53e3\u540e\u53ef\u4ee5\u7ee7\u7eed\u8c03\u8bd5\u524d\u53f0\u3002",
  openAdminAccess: "\u6253\u5f00\u672c\u673a\u8c03\u8bd5",
  ip: "IP",
  userAgent: "\u8bbe\u5907",
};

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
          <p className="section-kicker">{text.adminDisabled}</p>
          <h1 className="admin-title">{text.configureToken}</h1>
        </section>
      </main>
    );
  }

  if (params.token !== adminToken) {
    return (
      <main className="page-shell">
        <section className="section">
          <p className="section-kicker">{text.needToken}</p>
          <h1 className="admin-title">{text.wrongToken}</h1>
          <p className="body-copy">{text.tokenFormat}</p>
        </section>
      </main>
    );
  }

  if (!isDatabaseConfigured()) {
    return (
      <main className="page-shell">
        <section className="section">
          <p className="section-kicker">{text.databaseMissing}</p>
          <h1 className="admin-title">{text.configureDatabase}</h1>
        </section>
      </main>
    );
  }

  const [messages, settings] = await Promise.all([getAllMessagesWithComments(), getSiteSettings()]);

  return (
    <main className="page-shell">
      <section className="section">
        <div className="section-heading">
          <p className="section-kicker">{text.admin}</p>
          <h1 className="admin-title">{text.title}</h1>
        </div>

        <div className="admin-setting-panel">
          <div>
            <h2>{text.anonymousMode}</h2>
            <p>{settings.force_anonymous ? text.anonymousModeOn : text.anonymousModeOff}</p>
          </div>
          <ActionForm
            actionType="anonymous-mode"
            isDanger={settings.force_anonymous}
            label={settings.force_anonymous ? text.disableAnonymous : text.enableAnonymous}
            token={params.token || ""}
            value={!settings.force_anonymous}
          />
        </div>

        <div className="admin-setting-panel">
          <div>
            <h2>{text.maintenanceMode}</h2>
            <p>{settings.maintenance_mode ? text.maintenanceOn : text.maintenanceOff}</p>
          </div>
          <ActionForm
            actionType="maintenance"
            isDanger={settings.maintenance_mode}
            label={settings.maintenance_mode ? text.disableMaintenance : text.enableMaintenance}
            token={params.token || ""}
            value={!settings.maintenance_mode}
          />
        </div>

        <div className="admin-setting-panel">
          <div>
            <h2>{text.adminAccess}</h2>
            <p>{text.adminAccessCopy}</p>
          </div>
          <a className="admin-action-button" href={`/api/admin/access?token=${encodeURIComponent(params.token || "")}`}>
            {text.openAdminAccess}
          </a>
        </div>

        <div className="message-list">
          {messages.length === 0 ? (
            <p className="body-copy">{text.empty}</p>
          ) : (
            messages.map((message) => (
              <article className="message-card" key={message.id}>
                <div>
                  <h2>{message.nickname || text.anonymous}</h2>
                  <span className={message.is_visible ? "status-pill" : "status-pill is-hidden"}>
                    {message.is_visible ? text.visible : text.hidden}
                  </span>
                </div>
                <ActionForm
                  actionType="message-visibility"
                  id={message.id}
                  isDanger={message.is_visible}
                  label={message.is_visible ? text.hide : text.show}
                  token={params.token || ""}
                  value={!message.is_visible}
                />
                <time dateTime={message.created_at}>
                  {new Date(message.created_at).toLocaleString("zh-CN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
                <dl className="admin-meta-list">
                  <div>
                    <dt>{text.ip}</dt>
                    <dd>{message.ip_address || "-"}</dd>
                  </div>
                  <div>
                    <dt>{text.userAgent}</dt>
                    <dd>{message.user_agent || "-"}</dd>
                  </div>
                </dl>
                <p>{message.content}</p>
                <div className="admin-comments">
                  <h3>
                    {text.comments}
                    <span>{message.comments.length}</span>
                  </h3>
                  {message.comments.map((comment) => (
                    <div className="admin-comment-card" key={comment.id}>
                      <div>
                        <strong>{comment.nickname || text.anonymous}</strong>
                        <span className={comment.is_visible ? "status-pill" : "status-pill is-hidden"}>
                          {comment.is_visible ? text.visible : text.hidden}
                        </span>
                      </div>
                      <ActionForm
                        actionType="comment-visibility"
                        id={comment.id}
                        isDanger={comment.is_visible}
                        label={comment.is_visible ? text.hide : text.show}
                        token={params.token || ""}
                        value={!comment.is_visible}
                      />
                      <time dateTime={comment.created_at}>
                        {new Date(comment.created_at).toLocaleString("zh-CN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                      <dl className="admin-meta-list">
                        <div>
                          <dt>{text.ip}</dt>
                          <dd>{comment.ip_address || "-"}</dd>
                        </div>
                        <div>
                          <dt>{text.userAgent}</dt>
                          <dd>{comment.user_agent || "-"}</dd>
                        </div>
                      </dl>
                      <p>{comment.content}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
