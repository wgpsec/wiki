/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "antd-icon.svg",
    "revision": "f31032253edf454e1280c009ce0277a5"
  },
  {
    "url": "assets/css/13.styles.beab0d1e.css",
    "revision": "4bbce5651b58e620b166c2ea49c25ca1"
  },
  {
    "url": "assets/css/15.styles.a0dc74e6.css",
    "revision": "bfae747143c495094b77483463aabeb5"
  },
  {
    "url": "assets/css/16.styles.f5e3aa18.css",
    "revision": "68b329da9893e34099c7d8ad5cb9c940"
  },
  {
    "url": "assets/css/4.styles.16113a2f.css",
    "revision": "5792a02549211697611eab7871fd9a00"
  },
  {
    "url": "assets/css/7.styles.491aa110.css",
    "revision": "5792a02549211697611eab7871fd9a00"
  },
  {
    "url": "assets/css/styles.827355d0.css",
    "revision": "9dd9925c1363ab8564ed93979c850990"
  },
  {
    "url": "assets/js/16.277ceaf7.js",
    "revision": "7bf1ac8838fa26bc5c6a31e63664a394"
  },
  {
    "url": "assets/js/app.277ceaf7.js",
    "revision": "fd5f769e24442d54ba7042a086dea187"
  },
  {
    "url": "assets/js/en-US/guide/how-to-contribute.md.277ceaf7.js",
    "revision": "763af850001885880b1c32eaffd262a1"
  },
  {
    "url": "assets/js/en-US/guide/README.md.277ceaf7.js",
    "revision": "71e1ec53724ca548f29c9c20018aa3d5"
  },
  {
    "url": "assets/js/en-US/README.md.277ceaf7.js",
    "revision": "21ed58c0a5ee0196f3d661cee42c8662"
  },
  {
    "url": "assets/js/en-US/update-log.md.277ceaf7.js",
    "revision": "df2049f89736f4dac9df9e943be0507f"
  },
  {
    "url": "assets/js/guide/how-to-contribute.md.277ceaf7.js",
    "revision": "907100f0f37b0b8f2d138613d9731310"
  },
  {
    "url": "assets/js/guide/README.md.277ceaf7.js",
    "revision": "3b99cec9bc9e3f6da5884ddfa626123e"
  },
  {
    "url": "assets/js/knowledge/ctf/README.md.277ceaf7.js",
    "revision": "d1c127e1570073527d76c51d120ca6f1"
  },
  {
    "url": "assets/js/knowledge/web/README.md.277ceaf7.js",
    "revision": "c456bd8881190288b6b9ce615ad81040"
  },
  {
    "url": "assets/js/knowledge/web/sql-injection.md.277ceaf7.js",
    "revision": "17b8aeef7d3ce340a0c08e00fcf177aa"
  },
  {
    "url": "assets/js/knowledge/web/xss.md.277ceaf7.js",
    "revision": "2b264d1ab830dbdfc63f34d38d546c11"
  },
  {
    "url": "assets/js/LayoutWrapper.277ceaf7.js",
    "revision": "d776c92489e9be923e21ee52892bdc5a"
  },
  {
    "url": "assets/js/notFoundWrapper.277ceaf7.js",
    "revision": "229fbf5d11a13efb01bda06c789662a7"
  },
  {
    "url": "assets/js/README.md.277ceaf7.js",
    "revision": "bb4638317c09a3c4811ed8a5368b8461"
  },
  {
    "url": "assets/js/update-log.md.277ceaf7.js",
    "revision": "410ca84c708ff04aee4bccdf996fe0f9"
  },
  {
    "url": "assets/js/vendors~LayoutWrapper.277ceaf7.js",
    "revision": "6b40ba41a08f9ad3b8e3e38c907936fb"
  },
  {
    "url": "en-US/guide/how-to-contribute.html",
    "revision": "930f3dbc488872ee74e715bab7a5bffa"
  },
  {
    "url": "en-US/guide/index.html",
    "revision": "6cc494a1d81620b4c75b87bf8ee44f4f"
  },
  {
    "url": "en-US/index.html",
    "revision": "7ff18ba3c5423f2adafb5c4baa06ffa4"
  },
  {
    "url": "en-US/update-log.html",
    "revision": "d12d06dd93f5489ec5cef700b9bde53a"
  },
  {
    "url": "guide/how-to-contribute.html",
    "revision": "91e48d9cf0b6f26bee7ca1156c3ce7a6"
  },
  {
    "url": "guide/index.html",
    "revision": "fed9e63cb944fe1b6dae1380e539e900"
  },
  {
    "url": "index.html",
    "revision": "256c493bbb65f54e66630099763bc5af"
  },
  {
    "url": "knowledge/ctf/index.html",
    "revision": "1d3db5092a44d4119b7016f0b5358534"
  },
  {
    "url": "knowledge/web/index.html",
    "revision": "639c811d338ba8c31e92b567dfbe3910"
  },
  {
    "url": "knowledge/web/sql-injection.html",
    "revision": "e883956e93ac96cea058672586d191d3"
  },
  {
    "url": "knowledge/web/xss.html",
    "revision": "21598d1c09e231b0477ab0b004ad6d0d"
  },
  {
    "url": "logo-192x192.png",
    "revision": "a448fa4631b9f10f1ed112222cdab9db"
  },
  {
    "url": "logo-512x512.png",
    "revision": "dbbb455e9c76d80a564d4817e12df7d4"
  },
  {
    "url": "markdown-icon.svg",
    "revision": "f7794256a65696e3d5abe25368edff5f"
  },
  {
    "url": "update-log.html",
    "revision": "3c1db34a51a218ff4f30dd32a543dcc4"
  },
  {
    "url": "wgplogo.svg",
    "revision": "91d92b18733531ba1b3a0a0f393a4ad9"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0];
  const message = event.data;
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self
        .skipWaiting()
        .then(
          () => replyPort.postMessage({ error: null }),
          error => replyPort.postMessage({ error })
        )
    );
  }
});
