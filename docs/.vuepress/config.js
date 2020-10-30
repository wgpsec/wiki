module.exports = {
  title: '狼组安全团队公开知识库',
  theme: 'antdocs',
  description: '开放共享',
  base: '/',
  dest: 'public',
  head: [
    ['link', { rel: 'icon', href: '/assets/logo.svg' }],
    ['script', { type: 'text/javascript', src: '/assets/js/push.js' }],

    ['meta', { name: 'referrer', content: 'never' }],
    ['meta', { name: 'keywords', content: '知识库,公开知识库,狼组,狼组安全团队知识库,knowledge' }]
  ],
  plugins: {
    'sitemap': {
      hostname: 'https://wiki.wgpsec.org'
    },
  },
  markdown: {
    lineNumbers: false,
    anchor: { 
      permalinkBefore: false
    }
  },
  themeConfig: {
    backToTop: true,
    smoothScroll: true,
    logo: '/assets/logo.svg',
    nav: require('./config/nav'),
    sidebar: require('./config/sidebar'),
    sidebarDepth: 0,
    lastUpdated: '上次更新',
    repo: 'https://github.com/wgpsec',
    editLinks: false,
    ads:{
      style: 3, 
      title: '赞助商', 
      btnText: '成为赞助商',
      msgTitle: '成为赞助商',
      msgText: '如果您有品牌推广、活动推广、招聘推广、社区合作等需求，欢迎联系我们，成为赞助商。您的广告将出现在 狼组安全团队公开知识库 侧边栏等页面。',
      msgOkText: '确定',
    },
  }
};
