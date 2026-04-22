"use client";

import { FormEvent, useState } from "react";

type SubmitState = {
  type: "idle" | "success" | "error";
  message: string;
};

export function ContactForm() {
  const [state, setState] = useState<SubmitState>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setState({ type: "idle", message: "" });

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "提交失败，请稍后再试。");
      }

      setState({ type: "success", message: result.message });
      form.reset();
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
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        <span>你的名字</span>
        <input name="name" type="text" placeholder="例如：小明" required />
      </label>

      <label>
        <span>邮箱</span>
        <input name="email" type="email" placeholder="you@example.com" required />
      </label>

      <label>
        <span>留言</span>
        <textarea name="message" placeholder="写下你想说的话" rows={5} required />
      </label>

      <button className="primary-button form-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "提交中..." : "提交留言"}
      </button>

      {state.message ? (
        <p className={`form-message ${state.type === "error" ? "is-error" : "is-success"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
