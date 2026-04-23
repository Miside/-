type KeywordsFormProps = {
  keywords: string;
  token: string;
};

export function KeywordsForm({ keywords, token }: KeywordsFormProps) {
  return (
    <form action="/api/admin/actions" className="keywords-form" method="post">
      <input name="token" type="hidden" value={token} />
      <input name="actionType" type="hidden" value="blocked-keywords" />
      <textarea
        name="blockedKeywords"
        placeholder="每行一个关键词，也可以用逗号分隔"
        rows={5}
        defaultValue={keywords}
      />
      <button className="admin-action-button" type="submit">
        保存关键词
      </button>
    </form>
  );
}
