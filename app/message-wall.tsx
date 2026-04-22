"use client";

import { FormEvent, useState } from "react";
import type { AnonymousMessage } from "./lib/anonymous-messages";

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
        throw new Error(result.message || "提交失败，请稍后再试。");
      }

      setState({ type: "success", message: result.message });
      form.reset();
      await refreshMessages();
    } catch (error) {
      setState({
        type: "error",
        message: error instanceof Error ? error.message : "提交失败，请稍后再试。",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="wall-layout">
      <form className="message-form" onSubmit={handleSubmit}>
        <label>
          <span>昵称，可选</span>
          <input name="nickname" type="text" maxLength={24} placeholder="不填就是匿名用户" />
        </label>

        <label>
          <span>留言</span>
          <textarea
            name="content"
            maxLength={500}
            placeholder="写下一句想说的话"
            rows={6}
            required
          />
        </label>

        <button className="primary-button form-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "发布中..." : "匿名发布"}
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
            <h2>还没有留言</h2>
            <p>第一条匿名留言，可以由你来写。</p>
          </div>
        ) : (
          messages.map((message) => (
            <article className="wall-card" key={message.id}>
              <div className="wall-card-meta">
                <strong>{message.nickname || "匿名用户"}</strong>
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
