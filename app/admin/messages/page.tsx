import { ActionForm } from "./action-form";
import { AdminAutoRefresh } from "./admin-auto-refresh";
import { KeywordsForm } from "./keywords-form";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAllMessagesWithComments,
  getSiteSettings,
  isDatabaseConfigured,
  setCommentVisibility,
  setMessageVisibility,
} from "../../lib/anonymous-messages";
import { hasAdminCookieValue, isAdminToken } from "../../lib/admin-auth";
import { parseClientDetails } from "../../lib/client-details";
import { containsBlockedKeyword, detectUnsafeContent, parseKeywords } from "../../lib/content-filter";

const text = {
  adminDisabled: "\u540e\u53f0\u672a\u542f\u7528",
  configureToken: "\u8bf7\u5148\u5728 Vercel \u914d\u7f6e ADMIN_TOKEN\u3002",
  needToken: "\u9700\u8981\u8bbf\u95ee\u53e3\u4ee4",
  wrongToken: "\u8bbf\u95ee\u53e3\u4ee4\u4e0d\u6b63\u786e\u3002",
  tokenFormat: "\u767b\u5f55\u683c\u5f0f\uff1a/api/admin/access?token=\u4f60\u7684\u53e3\u4ee4",
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
  moderationMode: "\u5ba1\u6838\u6a21\u5f0f",
  moderationOn: "\u5df2\u5f00\u542f\uff1a\u65b0\u7559\u8a00\u548c\u8bc4\u8bba\u9700\u8981\u4f60\u901a\u8fc7\u540e\u624d\u516c\u5f00",
  moderationOff: "\u5df2\u5173\u95ed\uff1a\u901a\u8fc7\u5b89\u5168\u68c0\u6d4b\u7684\u5185\u5bb9\u4f1a\u76f4\u63a5\u516c\u5f00",
  enableModeration: "\u5f00\u542f\u5ba1\u6838",
  disableModeration: "\u5173\u95ed\u5ba1\u6838",
  keywordFilter: "\u5173\u952e\u8bcd\u8fc7\u6ee4",
  keywordFilterCopy: "\u547d\u4e2d\u5173\u952e\u8bcd\u7684\u65b0\u5185\u5bb9\u4f1a\u88ab\u62d2\u7edd\uff1b\u5df2\u53d1\u5e03\u7684\u547d\u4e2d\u5185\u5bb9\u4f1a\u81ea\u52a8\u9690\u85cf\u3002",
  id: "ID",
  ip: "IP",
  browser: "\u6d4f\u89c8\u5668",
  os: "\u7cfb\u7edf",
  device: "\u8bbe\u5907",
  userAgent: "\u8bbe\u5907\u539f\u6587",
};

type MessagesPageProps = {
  searchParams: Promise<{
    error?: string;
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

  if (params.token) {
    if (isAdminToken(params.token)) {
      redirect(`/api/admin/access?token=${encodeURIComponent(params.token)}`);
    }

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

  const cookieStore = await cookies();
  const hasAdminAccess = hasAdminCookieValue(cookieStore.get("admin_access")?.value);

  if (!hasAdminAccess) {
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

  const [rawMessages, settings] = await Promise.all([getAllMessagesWithComments(), getSiteSettings()]);
  const messages = await hideBlockedContent(rawMessages, parseKeywords(settings.blocked_keywords));

  return (
    <main className="page-shell">
      <AdminAutoRefresh />
      <section className="section">
        <div className="section-heading">
          <p className="section-kicker">{text.admin}</p>
          <h1 className="admin-title">{text.title}</h1>
        </div>
        <div className="admin-nav">
          <a className="admin-action-button" href="/admin/visits">
            访问记录
          </a>
        </div>

        {params.error ? <p className="form-message is-error">{params.error}</p> : null}

        <div className="admin-setting-panel">
          <div>
            <h2>{text.anonymousMode}</h2>
            <p>{settings.force_anonymous ? text.anonymousModeOn : text.anonymousModeOff}</p>
          </div>
          <ActionForm
            actionType="anonymous-mode"
            isDanger={settings.force_anonymous}
            label={settings.force_anonymous ? text.disableAnonymous : text.enableAnonymous}
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
            value={!settings.maintenance_mode}
          />
        </div>

        <div className="admin-setting-panel">
          <div>
            <h2>{text.moderationMode}</h2>
            <p>{settings.moderation_enabled ? text.moderationOn : text.moderationOff}</p>
          </div>
          <ActionForm
            actionType="moderation"
            isDanger={settings.moderation_enabled}
            label={settings.moderation_enabled ? text.disableModeration : text.enableModeration}
            value={!settings.moderation_enabled}
          />
        </div>

        <div className="admin-setting-panel is-stacked">
          <div>
            <h2>{text.keywordFilter}</h2>
            <p>{text.keywordFilterCopy}</p>
          </div>
          <KeywordsForm keywords={settings.blocked_keywords || ""} />
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
                    <dt>{text.id}</dt>
                    <dd>{message.id}</dd>
                  </div>
                  <ClientMeta ipAddress={message.ip_address} userAgent={message.user_agent} />
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
                          <dt>{text.id}</dt>
                          <dd>{comment.id}</dd>
                        </div>
                        <ClientMeta ipAddress={comment.ip_address} userAgent={comment.user_agent} />
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

async function hideBlockedContent(
  messages: Awaited<ReturnType<typeof getAllMessagesWithComments>>,
  blockedKeywords: string[],
) {
  if (blockedKeywords.length === 0) {
    return messages;
  }

  await Promise.all(
    messages.flatMap((message) => {
      const tasks: Promise<void>[] = [];
      const messageMatches =
        containsBlockedKeyword(message.content, blockedKeywords) ||
        containsBlockedKeyword(message.nickname || "", blockedKeywords) ||
        detectUnsafeContent(message.content, blockedKeywords).unsafe ||
        detectUnsafeContent(message.nickname || "", blockedKeywords).unsafe;

      if (message.is_visible && messageMatches) {
        tasks.push(setMessageVisibility(message.id, false));
        message.is_visible = false;
      }

      for (const comment of message.comments) {
        const commentMatches =
          containsBlockedKeyword(comment.content, blockedKeywords) ||
          containsBlockedKeyword(comment.nickname || "", blockedKeywords) ||
          detectUnsafeContent(comment.content, blockedKeywords).unsafe ||
          detectUnsafeContent(comment.nickname || "", blockedKeywords).unsafe;

        if (comment.is_visible && commentMatches) {
          tasks.push(setCommentVisibility(comment.id, false));
          comment.is_visible = false;
        }
      }

      return tasks;
    }),
  );

  return messages;
}

function ClientMeta({
  ipAddress,
  userAgent,
}: {
  ipAddress: string | null;
  userAgent: string | null;
}) {
  const details = parseClientDetails(userAgent);

  return (
    <>
      <div>
        <dt>{text.ip}</dt>
        <dd>{ipAddress || "-"}</dd>
      </div>
      <div>
        <dt>{text.browser}</dt>
        <dd>
          {details.browser}
          {details.browserVersion !== "-" ? ` ${details.browserVersion}` : ""}
        </dd>
      </div>
      <div>
        <dt>{text.os}</dt>
        <dd>
          {details.os}
          {details.osVersion !== "-" ? ` ${details.osVersion}` : ""}
        </dd>
      </div>
      <div>
        <dt>内核</dt>
        <dd>{details.engine}</dd>
      </div>
      <div>
        <dt>{text.device}</dt>
        <dd>{details.device}</dd>
      </div>
      <div>
        <dt>{text.userAgent}</dt>
        <dd>{userAgent || "-"}</dd>
      </div>
    </>
  );
}
