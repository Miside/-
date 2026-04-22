"use client";

import { FormEvent, useState } from "react";
import type { AnonymousMessage } from "./lib/anonymous-messages";

const text = {
  anonymousUser: "\u533f\u540d\u7528\u6237",
  emptyTitle: "\u8fd8\u6ca1\u6709\u7559\u8a00",
  emptyCopy: "\u7b2c\u4e00\u6761\u533f\u540d\u7559\u8a00\uff0c\u53ef\u4ee5\u7531\u4f60\u6765\u5199\u3002",
  errorFallback: "\u63d0\u4ea4\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
  labelNickname: "\u6635\u79f0\uff0c\u53ef\u9009",
  labelContent: "\u7559\u8a00",
  nicknamePlaceholder: "\u4e0d\u586b\u5c31\u662f\u533f\u540d\u7528\u6237",
  contentPlaceholder: "\u5199\u4e0b\u4e00\u53e5\u60f3\u8bf4\u7684\u8bdd",
  publishing: "\u53d1\u5e03\u4e2d...",
  publish: "\u533f\u540d\u53d1\u5e03",
};

type SubmitState = {
  type: "idle" | "success" | "error";
  message: string;
};

type MessageWallProps = {
  initialMessages: AnonymousMessage[];
};

export function MessageWall({ initialMessages }: MessageWallProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [state, setState] = useState<SubmitState>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function refreshMessages() {
    const response = await fetch("/api/messages", {
      cache: "no-store",
    });
    const result = await response.json();

    if (response.ok && Array.isArray(result.messages)) {
      setMessages(result.messages);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setState({ type: "idle", message: "" });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: formData.get("nickname"),
          content: formData.get("content"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || text.errorFallback);
      }

      setState({ type: "success", message: result.message });
      form.reset();
      await refreshMessages();
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : text.errorFallback,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="wall-layout">
      <form className="message-form" onSubmit={handleSubmit}>
        <label>
          <span>{text.labelNickname}</span>
          <input name="nickname" type="text" maxLength={24} placeholder={text.nicknamePlaceholder} />
        </label>

        <label>
          <span>{text.labelContent}</span>
          <textarea
            name="content"
            maxLength={500}
            placeholder={text.contentPlaceholder}
            rows={6}
            required
          />
        </label>

        <button className="primary-button form-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? text.publishing : text.publish}
        </button>

        {state.message ? (
          <p className={`form-message ${state.type === "error" ? "is-error" : "is-success"}`}>
            {state.message}
          </p>
        ) : null}
      </form>

      <div className="public-messages">
        {messages.length === 0 ? (
          <div className="empty-wall">
            <h2>{text.emptyTitle}</h2>
            <p>{text.emptyCopy}</p>
          </div>
        ) : (
          messages.map((message) => (
            <article className="wall-card" key={message.id}>
              <div className="wall-card-meta">
                <strong>{message.nickname || text.anonymousUser}</strong>
                <time dateTime={message.created_at}>
                  {new Date(message.created_at).toLocaleString("zh-CN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </div>
              <p>{message.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
