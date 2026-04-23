type ActionFormProps = {
  actionType: "anonymous-mode" | "comment-visibility" | "maintenance" | "message-visibility";
  id?: number;
  isDanger?: boolean;
  label: string;
  token: string;
  value: boolean;
};

export function ActionForm({
  actionType,
  id,
  isDanger = false,
  label,
  token,
  value,
}: ActionFormProps) {
  return (
    <form action="/api/admin/actions" method="post">
      <input name="token" type="hidden" value={token} />
      <input name="actionType" type="hidden" value={actionType} />
      <input name="value" type="hidden" value={value ? "true" : "false"} />
      {id ? <input name="id" type="hidden" value={String(id)} /> : null}
      <button className={isDanger ? "admin-action-button is-danger" : "admin-action-button"} type="submit">
        {label}
      </button>
    </form>
  );
}
