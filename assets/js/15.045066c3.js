(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{857:function(s,a,t){"use strict";t.r(a);var n=t(105),e=Object(n.a)({},(function(){var s=this,a=s.$createElement,t=s._self._c||a;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h1",{attrs:{id:"git基本用法"}},[s._v("Git基本用法 "),t("a",{staticClass:"header-anchor",attrs:{href:"#git基本用法"}},[s._v("#")])]),s._v(" "),t("h1",{attrs:{id:"基本设置"}},[s._v("基本设置 "),t("a",{staticClass:"header-anchor",attrs:{href:"#基本设置"}},[s._v("#")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" config --lsit "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看配置信息")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[t("strong",[s._v("配置用户信息")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" config --global user.name "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"wintrysec"')]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" config --global user.email "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"xksec@foxmail.com"')]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br")])]),t("p",[t("strong",[s._v("初始化版本控制")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" init "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#每个项目只一次")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[t("strong",[s._v("添加文件追踪")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("add")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v(".")]),s._v("   "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#更新提交的时候写单个文件或目录名")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[t("strong",[s._v("提交文件 （-m 后表示说明内容，需要加引号）")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" commit -m “这里是说明消息”\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[t("strong",[s._v("查看当前修改状态")])]),s._v(" "),t("p",[s._v("常在执行 add 后，执行 commit 之前使用，也可以在 commit之后使用")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" status\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[t("strong",[s._v("其它常用参数")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#以下命令，在.git根目录工作区使用")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看历史记录")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" log\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#对比两次提交的不同")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("diff")]),s._v(" commit_id\t\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("diff")]),s._v(" HEAD^\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#切换到历史版本")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" reset commit_id\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" reset --hard HEAD^\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看stash列表，保存到git栈的git 工作状态")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" stash list\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" stash pop\t"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#从git栈中弹出内容")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#git stash list看不到的话")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("cat")]),s._v(" .git/refs/stash\t\t"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#会有一个hash")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("diff")]),s._v(" hash值\t\t"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#即可看到内容差异")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br"),t("span",{staticClass:"line-number"},[s._v("15")]),t("br"),t("span",{staticClass:"line-number"},[s._v("16")]),t("br"),t("span",{staticClass:"line-number"},[s._v("17")]),t("br"),t("span",{staticClass:"line-number"},[s._v("18")]),t("br"),t("span",{staticClass:"line-number"},[s._v("19")]),t("br"),t("span",{staticClass:"line-number"},[s._v("20")]),t("br")])]),t("h1",{attrs:{id:"远程仓库"}},[s._v("远程仓库 "),t("a",{staticClass:"header-anchor",attrs:{href:"#远程仓库"}},[s._v("#")])]),s._v(" "),t("p",[t("strong",[s._v("1.登陆github账号")])]),s._v(" "),t("p",[t("strong",[s._v("2.创建 SSH Key")])]),s._v(" "),t("p",[s._v("【C盘—->用户/user—->Administrator（自己的用户名）】")]),s._v(" "),t("p",[s._v("看看有没有 .ssh 目录，如果有，再看看这个目录下有没有 id_rsa 和 id_rsa.pub")]),s._v(" "),t("p",[s._v("如果已经有了，可直接跳到下一步。")]),s._v(" "),t("p",[s._v("如果没有，打开 Shell（Windows下打开Git Bash），创建 SSH Key：")]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[s._v("ssh-keygen -t rsa -C "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"xksec@foxmail.com"')]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[t("strong",[s._v("3.登陆 GitHub，打开 “Settings”")])]),s._v(" "),t("p",[s._v("“SSH Keys” 页面，“New SSH key”，“粘贴公钥”")]),s._v(" "),t("p",[t("strong",[s._v("4.创建项目，并复制项目地址，添加远程仓库")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" remote "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("add")]),s._v(" origin https://github.com/wintrysec/wintrysec.github.io.git\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[t("strong",[s._v("5.把所有推送到远端仓库")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" push -u origin master\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("h1",{attrs:{id:"更新远程仓库"}},[s._v("更新远程仓库 "),t("a",{staticClass:"header-anchor",attrs:{href:"#更新远程仓库"}},[s._v("#")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" pull\t"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#拉取更新，每次必做防止团队合作干掉别人上传的代码")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("add")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v(".")]),s._v("   "),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#更新文件后添加追踪")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" commit -m “这里是说明消息”\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" status\t"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看当前修改状态")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" branch\t"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看当前分支")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" push\t"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#推送向远程仓库")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br")])]),t("p",[t("strong",[s._v("分支管理")])]),s._v(" "),t("div",{staticClass:"language-bash line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-bash"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" branch\t\t\t"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#查看当前分支")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" chechout aaa \t"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#切换分支aaa")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" branck aaa \t\t"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#创建aaa分支")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" chechout -b aaa \n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#本地创建 aaa分支，同时切换到aaa分支")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#只有提交的时候才会在服务端上创建一个分支")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br")])])])}),[],!1,null,null,null);a.default=e.exports}}]);