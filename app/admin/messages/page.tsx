import { updateCommentVisibility, updateMessageVisibility } from "../actions";
import { VisibilityButton } from "./visibility-button";
import { getAllMessagesWithComments, isDatabaseConfigured } from "../../lib/anonymous-messages";

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

  const messages = await getAllMessagesWithComments();

  return (
    <main className="page-shell">
      <section className="section">
        <div className="section-heading">
          <p className="section-kicker">{text.admin}</p>
          <h1 className="admin-title">{text.title}</h1>
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
                <VisibilityButton
                  action={async () => {
                    "use server";
                    await updateMessageVisibility(message.id, !message.is_visible, params.token || "");
                  }}
                  hiddenLabel={text.hide}
                  isVisible={message.is_visible}
                  visibleLabel={text.show}
                />
                <time dateTime={message.created_at}>
                  {new Date(message.created_at).toLocaleString("zh-CN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
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
                      <VisibilityButton
                        action={async () => {
                          "use server";
                          await updateCommentVisibility(comment.id, !comment.is_visible, params.token || "");
                        }}
                        hiddenLabel={text.hide}
                        isVisible={comment.is_visible}
                        visibleLabel={text.show}
                      />
                      <time dateTime={comment.created_at}>
                        {new Date(comment.created_at).toLocaleString("zh-CN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
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
