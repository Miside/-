export function parseKeywords(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/[\n,，、]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const builtInHarmfulPatterns = [
  "傻逼",
  "傻b",
  "煞笔",
  "脑残",
  "废物",
  "垃圾",
  "贱人",
  "狗东西",
  "滚",
  "去死",
  "死全家",
  "妈的",
  "草你",
  "操你",
  "cnm",
  "nmsl",
  "sb",
  "idiot",
  "stupid",
  "fuck",
  "shit",
  "kill yourself",
];

const negativeIntentPatterns = [
  "恶心",
  "真烂",
  "太烂",
  "讨厌你",
  "恨你",
  "羞辱",
  "曝光你",
  "人肉",
  "开盒",
];

export function containsBlockedKeyword(content: string, keywords: string[]) {
  const normalizedContent = normalize(content);

  return keywords.some((keyword) => {
    const normalizedKeyword = normalize(keyword);
    return normalizedKeyword.length > 0 && normalizedContent.includes(normalizedKeyword);
  });
}

export function detectUnsafeContent(content: string, extraKeywords: string[] = []) {
  const normalizedContent = normalize(content);
  const allPatterns = [...builtInHarmfulPatterns, ...negativeIntentPatterns, ...extraKeywords];
  const matched = allPatterns.find((pattern) => {
    const normalizedPattern = normalize(pattern);
    return normalizedPattern.length > 0 && normalizedContent.includes(normalizedPattern);
  });

  return {
    matched: matched || null,
    unsafe: Boolean(matched),
  };
}

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s._\-*~`!！?？。，“”"'‘’、，,]/g, "");
}
