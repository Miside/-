import {
  getPublicMessagesWithComments,
  getSiteSettings,
  isDatabaseConfigured,
} from "./lib/anonymous-messages";
import { hasAdminCookieValue } from "./lib/admin-auth";
import { MessageWall } from "./message-wall";
import { VisitTracker } from "./visit-tracker";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = isDatabaseConfigured()
    ? await getSiteSettings()
    : { force_anonymous: false, maintenance_mode: false };
  const hasAdminAccess = await canBypassMaintenance();
  const messages = settings.maintenance_mode ? [] : await loadMessages();

  if (settings.maintenance_mode && !hasAdminAccess) {
    return (
      <main className="page-shell">
        <VisitTracker />
        <section className="hero anonymous-hero">
          <div className="hero-copy">
            <p className="eyebrow">Maintenance</p>
            <h1>{"\u7f51\u7ad9\u7ef4\u62a4\u4e2d"}</h1>
            <p className="lede">
              {"\u7559\u8a00\u5899\u6682\u65f6\u5173\u95ed\uff0c\u7ad9\u957f\u6b63\u5728\u8c03\u6574\u5b89\u5168\u548c\u5ba1\u6838\u8bbe\u7f6e\u3002"}
            </p>
          </div>
        </section>
      </main>
    );
  }

  const visibleMessages = settings.maintenance_mode ? await loadMessages() : messages;

  return (
    <main className="page-shell">
      <VisitTracker />
      <section className="hero anonymous-hero">
        <div className="hero-copy">
          <p className="eyebrow">Anonymous Wall</p>
          <h1>{"\u533f\u540d\u7559\u8a00\u5899"}</h1>
          <p className="lede">
            {
              "\u4e0d\u7528\u767b\u5f55\uff0c\u4e0d\u5fc5\u7559\u4e0b\u771f\u5b9e\u8eab\u4efd\u3002\u5199\u4e0b\u4e00\u53e5\u60f3\u8bf4\u7684\u8bdd\uff0c\u6216\u8005\u770b\u770b\u522b\u4eba\u7559\u4e0b\u7684\u7247\u523b\u5fc3\u60c5\u3002"
            }
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#write">
              {"\u5199\u4e00\u6761\u7559\u8a00"}
            </a>
            <a className="secondary-button" href="#wall">
              {"\u6d4f\u89c8\u7559\u8a00\u5899"}
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <span className="panel-badge">Live on uisit.cfd</span>
          <div className="panel-grid">
            <div className="panel-item">{"\u533f\u540d\u53d1\u5e03\uff1a\u6635\u79f0\u53ef\u4ee5\u4e0d\u586b\u3002"}</div>
            <div className="panel-item">{"\u516c\u5f00\u5c55\u793a\uff1a\u7559\u8a00\u4f1a\u51fa\u73b0\u5728\u9996\u9875\u5899\u4e0a\u3002"}</div>
            <div className="panel-item">{"\u540e\u53f0\u7ba1\u7406\uff1a\u7ad9\u957f\u53ef\u4ee5\u67e5\u770b\u5e76\u5904\u7406\u7559\u8a00\u3002"}</div>
          </div>
        </div>
      </section>

      <section className="section" id="wall">
        <div className="section-heading">
          <p className="section-kicker">{"\u7559\u8a00\u5899"}</p>
          <h2>{"\u8fd9\u91cc\u6536\u96c6\u6240\u6709\u613f\u610f\u88ab\u770b\u89c1\u7684\u533f\u540d\u58f0\u97f3\u3002"}</h2>
        </div>
        <div id="write">
          <MessageWall initialMessages={visibleMessages} />
        </div>
      </section>
    </main>
  );
}

async function canBypassMaintenance() {
  const cookieStore = await cookies();
  return hasAdminCookieValue(cookieStore.get("admin_access")?.value);
}

async function loadMessages() {
  if (!isDatabaseConfigured()) {
    return [];
  }

  try {
    return await getPublicMessagesWithComments();
  } catch (error) {
    console.error("Failed to load messages for homepage:", error);
    return [];
  }
}
