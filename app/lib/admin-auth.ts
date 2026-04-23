export const ADMIN_COOKIE_NAME = "admin_access";

export function isAdminToken(value: string | null | undefined) {
  return Boolean(process.env.ADMIN_TOKEN && value === process.env.ADMIN_TOKEN);
}

export function hasAdminCookieValue(value: string | null | undefined) {
  return isAdminToken(value);
}

export function hasAdminAccessFromCookieHeader(cookieHeader: string | null) {
  return hasAdminCookieValue(getCookieValue(cookieHeader, ADMIN_COOKIE_NAME));
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const prefix = `${name}=`;
  const cookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(prefix.length);

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
