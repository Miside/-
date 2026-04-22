import { getPublicMessages, isDatabaseConfigured } from "./lib/anonymous-messages";
import { MessageWall } from "./message-wall";

export default async function Home() {
  const messages = isDatabaseConfigured() ? await getPublicMessages() : [];

  return (
    <main className="page-shell">
      <section className="hero anonymous-hero">
        <div className="hero-copy">
          <p className="eyebrow">Anonymous Wall</p>
          <h1>匿名留言墙</h1>
          <p className="lede">
            不用登录，不必留下真实身份。写下一句想说的话，或者看看别人留下的片刻心情。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#write">
              写一条留言
            </a>
            <a className="secondary-button" href="#wall">
              浏览留言墙
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <span className="panel-badge">Live on uisit.cfd</span>
          <div className="panel-grid">
            <div className="panel-item">匿名发布：昵称可以不填。</div>
            <div className="panel-item">公开展示：留言会出现在首页墙上。</div>
            <div className="panel-item">后台管理：站长可以查看并处理留言。</div>
          </div>
        </div>
      </section>

      <section className="section" id="wall">
        <div className="section-heading">
          <p className="section-kicker">留言墙</p>
          <h2>这里收集所有愿意被看见的匿名声音。</h2>
        </div>
        <div id="write">
          <MessageWall initialMessages={messages} />
        </div>
      </section>
    </main>
  );
}
