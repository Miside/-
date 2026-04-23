import { ActionForm } from "./action-form";
import { DeleteForm } from "./delete-form";
import { parseClientDetails } from "../../lib/client-details";
import type { getAllMessagesWithComments } from "../../lib/anonymous-messages";

const text = {
  anonymous: "匿名用户",
  browser: "浏览器",
  comments: "评论",
  deleteComment: "删除评论",
  deleteMessage: "删除留言",
  device: "设备",
  hidden: "已隐藏",
  hide: "隐藏",
  id: "ID",
  ip: "IP",
  os: "系统",
  show: "恢复",
  userAgent: "设备原文",
  visible: "公开",
};

type MessageListProps = {
  emptyText: string;
  messages: Awaited<ReturnType<typeof getAllMessagesWithComments>>;
  redirectTo?: "/admin/messages" | "/admin/pending";
};

export function MessageList({ emptyText, messages, redirectTo }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="body-copy">{emptyText}</p>;
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <article className="message-card" key={message.id}>
          <div>
            <h2>{message.nickname || text.anonymous}</h2>
            <span className={message.is_visible ? "status-pill" : "status-pill is-hidden"}>
              {message.is_visible ? text.visible : text.hidden}
            </span>
          </div>
          <div className="admin-button-row">
            <ActionForm
              actionType="message-visibility"
              id={message.id}
              isDanger={message.is_visible}
              label={message.is_visible ? text.hide : text.show}
              redirectTo={redirectTo}
              value={!message.is_visible}
            />
            <DeleteForm
              actionType="message-delete"
              id={message.id}
              label={text.deleteMessage}
              redirectTo={redirectTo}
            />
          </div>
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
                <div className="admin-button-row">
                  <ActionForm
                    actionType="comment-visibility"
                    id={comment.id}
                    isDanger={comment.is_visible}
                    label={comment.is_visible ? text.hide : text.show}
                    redirectTo={redirectTo}
                    value={!comment.is_visible}
                  />
                  <DeleteForm
                    actionType="comment-delete"
                    id={comment.id}
                    label={text.deleteComment}
                    redirectTo={redirectTo}
                  />
                </div>
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
      ))}
    </div>
  );
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
