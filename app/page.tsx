import { ContactForm } from "./contact-form";

const highlights = [
  "前端页面：负责展示网站内容和交互。",
  "后端接口：负责接收表单数据并校验。",
  "数据库保存：配置 Supabase 后，留言会永久保存。",
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
    title: "保存数据",
    text: "配置 Supabase 后，留言会写入数据库，并能在后台查看。",
  },
];

const steps = [
  "在 Supabase 创建 contact_messages 数据表。",
  "在 Vercel 配置 SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY 和 ADMIN_TOKEN。",
  "重新部署后，打开后台页面查看新留言。",
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Website Starter</p>
          <h1>你的第一个全栈网站</h1>
          <p className="lede">
            这个版本不只是前端页面了。它已经加入后端接口、联系表单和数据库保存逻辑，
            配置 Supabase 后就能把访客留言保存下来。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#contact">
              试试联系表单
            </a>
            <a className="secondary-button" href="#next-step">
              看配置步骤
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
          <h2>它已经从纯展示页面，变成了能接收数据的网站。</h2>
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
            表单会把内容发送到 <code>/api/contact</code>。如果数据库环境变量已经配置，
            后端会把这条留言保存到 Supabase。
          </p>
        </div>
        <ContactForm />
      </section>

      <section className="section" id="next-step">
        <div className="section-heading">
          <p className="section-kicker">配置步骤</p>
          <h2>把 Supabase 信息填到 Vercel 后，留言就会真正保存。</h2>
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
