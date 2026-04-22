import { ContactForm } from "./contact-form";

const highlights = [
  "前端页面：负责展示网站内容和交互。",
  "后端接口：负责接收表单数据并返回结果。",
  "继续扩展：后面可以把留言保存到数据库。",
];

const cards = [
  {
    title: "展示内容",
    text: "首页可以放你的品牌、服务、产品介绍和联系方式。",
  },
  {
    title: "接收留言",
    text: "访客填写表单后，会提交到 Next.js 后端接口。",
  },
  {
    title: "连接数据库",
    text: "下一步可以接 Supabase 或 Neon，把留言真正保存起来。",
  },
];

const steps = [
  "先测试联系表单是否能提交成功。",
  "再决定留言保存到哪里，比如数据库、邮箱或后台页面。",
  "改完后推送到 GitHub，Vercel 会自动重新部署。",
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Website Starter</p>
          <h1>你的第一个全栈网站</h1>
          <p className="lede">
            这个版本不只是前端页面了。它已经加入了一个简单的后端接口，
            可以接收联系表单提交，为后面接数据库和后台管理打基础。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#contact">
              试试联系表单
            </a>
            <a className="secondary-button" href="#next-step">
              看下一步
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <span className="panel-badge">Live on uisit.cfd</span>
          <div className="panel-grid">
            {highlights.map((item) => (
              <div key={item} className="panel-item">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="sections">
        <div className="section-heading">
          <p className="section-kicker">现在网站多了什么</p>
          <h2>它已经从纯展示页面，迈出了后端的第一步。</h2>
        </div>
        <div className="card-grid">
          {cards.map((card) => (
            <article key={card.title} className="info-card">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-layout" id="contact">
        <div>
          <p className="section-kicker">后端接口演示</p>
          <h2>提交一条留言，看看前后端怎么配合。</h2>
          <p className="body-copy">
            表单会把内容发送到 <code>/api/contact</code>。目前后端会校验内容并返回成功消息，
            还不会永久保存。下一步接数据库后，就能把留言记录下来。
          </p>
        </div>
        <ContactForm />
      </section>

      <section className="section" id="next-step">
        <div className="section-heading">
          <p className="section-kicker">下一步</p>
          <h2>后端通常会从“接收数据”走向“保存数据”。</h2>
        </div>
        <ol className="step-list">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
