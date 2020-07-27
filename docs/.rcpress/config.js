const path = require('path');
module.exports = {
  base: process.env.base || '',
  locales: {
    '/': {
      lang: 'zh-CN',
      title: '狼组安全团队公开知识库',
      description: '开放共享'
    },
    '/en-US': {
      lang: 'en-US',
      title: 'WgpSec Public Knowledge',
      description: 'Open & Sharing'
    }
  },
  logo: '/wgplogo.svg',
  head: [
    ['link', { rel: 'icon', href: `/wgplogo.svg` }],
    ['script', { async: '', src: `https://www.googletagmanager.com/gtag/js?id=UA-75902620-2` }],
    ['script', {},`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', 'UA-75902620-2');
    `],
    ['script',{},`
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?cfb14c98e953dafedf7fafd798c6c642";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
    `]
  ],
  serviceWorker: true,
  footer:
    'Powered by <a target="_blank" href="https://www.wgpsec.org">WgpSec</a> | Copyright © 2014-2020 狼组安全团队前端',
  themeConfig: {
    // repo: 'wgpsec/xxx', // 假定是 GitHub. 同时也可以是一个完整的 Gitee URL,默认为Gihub仓库，支持Github,Bitbucket,Gitee。
    docsRepo: 'wgpsec/WgpsecWiki', // 自定义文档仓库，默认和docsRepo的值一致
    docsRelativeDir: 'docs', // 项目根目录到文档的相对地址，默认为''
    docsDir: 'docs', // 文档目录 默认为docs
    docsBranch: 'master', // 文档所在git分支
    editLinks: false, // 默认是 false, 设置为 true 来启用
    editLinkText: '帮助我们改善此页面！', // 默认为 "Edit this page"
    showAvatarList: false // 是否显示编辑过此页面的用户用户列表, 设置为false关闭
    ,
    locales: {
      '/': {
        label: '简体中文',
        selectText: '语言(Lang)',
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新于', // string | false
        nav: [
          {
            text: '使用指南',
            link: '/guide/'
          },
          {
            text: '知识库',
            items: [
              { text: 'Web安全', link: '/knowledge/web/' },
              { text: 'CTF', link: '/knowledge/ctf/' },
            ],
            important: true
          },
          {
            text: '狼组官网',
            link: 'https://www.wgpsec.org',
          },
          {
            text: '投稿文章',
            link: 'mailto:admin@wgpsec.org',
            important: true
          },
          {
            text: '更新日志',
            link: '/update-log/',
            important: true
          },
          {
            text: 'GitHub',
            link: 'https://github.com/wgpsec',
            important: true
          }
        ],
        sidebar: {
          '/guide/': getGuideSidebar('开始使用'),
          '/knowledge/web/': [
            {
              title: 'Web安全',
              collapsable: false,
              children: ['','sql-injection','xss','expression-language-injection']
              // children: [
              //   {
              //     title: 'SQL注入',
              //     children: ['sql']
              //   },
              //   {
              //     title: 'XSS攻击',
              //     children: ['xss']
              //   }
              // ]
            },
          ],
          '/knowledge/ctf/': [
            {
              title: 'CTF',
              collapsable: false,
              children: ['']
            },
          ],
        }
      },
      '/en-US': {
        label: 'English',
        selectText: 'Language',
        editLinkText: 'Edit this page on GitHub',
        lastUpdated: 'Last updated on', // string | false
        nav: [
          {
            text: 'Use Guide',
            link: '/en-US/guide/'
          },
          {
            text: 'Site',
            link: 'https://www.wgpsec.org'
          },
          {
            text: 'Contribute',
            link: 'mailto:admin@wgpsec.org'
          },
          {
            text: 'Update Log',
            link: '/en-US/update-log/',
            important: true
          },
          {
            text: 'GitHub',
            link: 'https://github.com/wgpsec',
            important: true
          }
        ],
        sidebar: {
          '/en-US/guide/': getGuideSidebar('Get Started')
        }
      },
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, './components')
      }
    }
  }
};

function getGuideSidebar(start) {
  return [
    {
      title: start,
      collapsable: false,
      children: ['', 'how-to-contribute']
    },
  ];
}
