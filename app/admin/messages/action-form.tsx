type ActionFormProps = {
  action: () => Promise<void>;
  isDanger?: boolean;
  label: string;
};

export function ActionForm({ action, isDanger = false, label }: ActionFormProps) {
  return (
    <form action={action}>
      <button className={isDanger ? "admin-action-button is-danger" : "admin-action-button"} type="submit">
        {label}
      </button>
    </form>
  );
}
