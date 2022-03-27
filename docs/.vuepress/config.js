module.exports = {
  title: "狼组安全团队公开知识库",
  theme: "antdocs",
  description: "致力于打造信息安全乌托邦",
  base: "/",
  // base: process.env.NODE_ENV === "production" ? './' : '/',
  dest: "public",
  head: [
    ["link", { rel: "icon", href: "/assets/logo.svg" }],
    ["script", { type: "text/javascript", src: "/assets/js/push.js" }],

    ["meta", { name: "referrer", content: "never" }],
    ["meta", { name: "keywords", content: "知识库,公开知识库,狼组,狼组安全团队知识库,knowledge" }],
    ["meta", {
      name: "description",
      content: "为了让安全爱好者拥有一个良好的学习环境，我们打造了一个免费开放且持续更新的网络安全知识库知识整合站点，WgpSec狼组安全团队公开知识，由WgpSec狼组安全团队成员以及社区使用者共同进行维护。"
    }]
  ],
  plugins: {
    "@vuepress/active-header-links": {},
    "sitemap": {
      hostname: "https://wiki.wgpsec.org"
    },
    "@vssue/vuepress-plugin-vssue": {
      // 设置 `platform` 而不是 `api`
      platform: "github",

      // 其他的 Vssue 配置
      owner: "keac",
      repo: "wiki-talk",
      clientId: "GITHUB_ClientId",
      clientSecret: "GITHUB_ClientSecret",
      autoCreateIssue: true
    }
  },
  markdown: {
    lineNumbers: true,
    anchor: {
      permalinkBefore: false
    }
  },
  themeConfig: {
    backToTop: true,
    smoothScroll: true,
    logo: "/assets/logo.svg",
    nav: require("./config/nav"),
    sidebar: require("./config/sidebar"),
    sidebarDepth: 0,
    activeHeaderLinks: false,
    lastUpdated: "上次更新",
    repo: "https://github.com/wgpsec",
    editLinks: false,
    ads: {
      style: 3,
      title: "赞助商",
      btnText: "成为赞助商",
      msgTitle: "成为赞助商",
      msgText: "如果您有品牌推广、活动推广、招聘推广、社区合作等需求，欢迎联系我们，成为赞助商。您的广告将出现在 狼组安全团队公开知识库 侧边栏等页面。",
      msgOkText: "确定"
    }
  }
};
