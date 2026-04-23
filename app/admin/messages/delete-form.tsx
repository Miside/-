"use client";

type DeleteFormProps = {
  actionType: "comment-delete" | "message-delete";
  id: number;
  label: string;
  redirectTo?: "/admin/messages" | "/admin/pending";
};

export function DeleteForm({ actionType, id, label, redirectTo }: DeleteFormProps) {
  return (
    <form
      action="/api/admin/actions"
      method="post"
      onSubmit={(event) => {
        if (!window.confirm("确定要永久删除吗？删除后不能恢复。")) {
          event.preventDefault();
        }
      }}
    >
      <input name="actionType" type="hidden" value={actionType} />
      <input name="id" type="hidden" value={String(id)} />
      {redirectTo ? <input name="redirectTo" type="hidden" value={redirectTo} /> : null}
      <button className="admin-action-button is-danger" type="submit">
        {label}
      </button>
    </form>
  );
}
