const highlights = [
  "上手快：今天能看，今天就能改。",
  "结构清楚：首页、介绍、亮点、下一步都已经准备好。",
  "适合上线：后面可以直接部署到 Vercel 并绑定域名。",
];

const cards = [
  {
    title: "品牌展示",
    text: "用一个首页把你是谁、你做什么、为什么值得信任说清楚。",
  },
  {
    title: "产品介绍",
    text: "把访客的注意力引到你真正想让他们了解或点击的地方。",
  },
  {
    title: "继续扩展",
    text: "以后想加登录、表单、后台接口、支付页面，都可以继续往上接。",
  },
];

const steps = [
  "先改文案，把网站名称、介绍、联系方式换成你自己的。",
  "本地预览确认页面没问题，再上传到 GitHub。",
  "导入 Vercel，绑定你的 www 域名，就可以正式上线。",
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Website Starter</p>
          <h1>先把你的第一个网站立起来</h1>
          <p className="lede">
            这是一个给新手起步用的展示型网站模板。你可以先把它当成线上名片，
            后面再一点点改成自己的品牌页、产品页或项目介绍页。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#next-step">
              看下一步怎么改
            </a>
            <a className="secondary-button" href="#sections">
              先看看页面结构
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <span className="panel-badge">Ready for www.231065.xyz</span>
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
          <p className="section-kicker">你现在拿到的是什么</p>
          <h2>一套不复杂、但能直接开始使用的首页骨架。</h2>
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

      <section className="section split-layout">
        <div>
          <p className="section-kicker">页面建议</p>
          <h2>适合谁先用这个模板</h2>
          <p className="body-copy">
            如果你现在还没有产品站、个人主页或者项目介绍页，这个模板很适合直接拿来起步。
            先把内容换成自己的，再慢慢加入图片、案例、联系表单和更多页面。
          </p>
        </div>
        <div className="quote-card">
          <p>“先上线，再打磨” 比一直停在想法里，更容易把事情推进下去。</p>
        </div>
      </section>

      <section className="section" id="next-step">
        <div className="section-heading">
          <p className="section-kicker">你下一步做什么</p>
          <h2>照着这 3 步走，就能把这个网站变成你自己的。</h2>
        </div>
        <ol className="step-list">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="section cta-strip">
        <div>
          <p className="section-kicker">已经有域名了</p>
          <h2>很好，后面可以直接把 www 绑定到 Vercel。</h2>
        </div>
        <a className="primary-button" href="https://vercel.com" target="_blank" rel="noreferrer">
          打开 Vercel
        </a>
      </section>
    </main>
  );
}
