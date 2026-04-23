type ActionFormProps = {
  actionType:
    | "anonymous-mode"
    | "comment-delete"
    | "comment-visibility"
    | "maintenance"
    | "message-delete"
    | "message-visibility"
    | "moderation";
  id?: number;
  isDanger?: boolean;
  label: string;
  redirectTo?: "/admin/messages" | "/admin/pending";
  value: boolean;
};

export function ActionForm({
  actionType,
  id,
  isDanger = false,
  label,
  redirectTo,
  value,
}: ActionFormProps) {
  return (
    <form action="/api/admin/actions" method="post">
      <input name="actionType" type="hidden" value={actionType} />
      <input name="value" type="hidden" value={value ? "true" : "false"} />
      {redirectTo ? <input name="redirectTo" type="hidden" value={redirectTo} /> : null}
      {id ? <input name="id" type="hidden" value={String(id)} /> : null}
      <button className={isDanger ? "admin-action-button is-danger" : "admin-action-button"} type="submit">
        {label}
      </button>
    </form>
  );
}
