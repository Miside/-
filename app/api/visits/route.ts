import { getClientIp } from "../../lib/client-details";
import { isDatabaseConfigured, saveVisitorLog } from "../../lib/anonymous-messages";

type VisitPayload = {
  languages?: unknown;
  path?: unknown;
  platform?: unknown;
  referer?: unknown;
  screen?: unknown;
  timezone?: unknown;
  viewport?: unknown;
};

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json({ ok: true });
  }

  let payload: VisitPayload = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  try {
    await saveVisitorLog({
      accept_language: request.headers.get("accept-language"),
      city: request.headers.get("x-vercel-ip-city") || request.headers.get("cf-ipcity"),
      country: request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry"),
      ip_address: getClientIp(request),
      languages: normalizeStringArray(payload.languages),
      path: optionalString(payload.path),
      platform: optionalString(payload.platform),
      referer: optionalString(payload.referer) || request.headers.get("referer"),
      region: request.headers.get("x-vercel-ip-country-region") || request.headers.get("cf-region"),
      screen: optionalString(payload.screen),
      timezone: optionalString(payload.timezone),
      user_agent: request.headers.get("user-agent"),
      viewport: optionalString(payload.viewport),
    });
  } catch (error) {
    console.error("Failed to save visitor log:", error);
  }

  return Response.json({ ok: true });
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim().slice(0, 500) : null;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}
