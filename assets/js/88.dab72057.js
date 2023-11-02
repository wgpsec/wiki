(window.webpackJsonp=window.webpackJsonp||[]).push([[88],{866:function(s,a,n){"use strict";n.r(a);var t=n(105),e=Object(t.a)({},(function(){var s=this,a=s.$createElement,n=s._self._c||a;return n("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[n("h1",{attrs:{id:"nmap端口扫描"}},[s._v("nmap端口扫描 "),n("a",{staticClass:"header-anchor",attrs:{href:"#nmap端口扫描"}},[s._v("#")])]),s._v(" "),n("p",[n("a",{attrs:{href:"https://nmap.org/man/zh/",target:"_blank",rel:"noopener noreferrer"}},[s._v("nmap官方文档"),n("OutboundLink")],1)]),s._v(" "),n("h1",{attrs:{id:"常用参数"}},[s._v("常用参数 "),n("a",{staticClass:"header-anchor",attrs:{href:"#常用参数"}},[s._v("#")])]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[s._v("nmap -T4 -A -v -Pn IP\t\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#最常用的一种扫描")]),s._v("\n\n-T4\t\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#设置时序，越高扫描越快")]),s._v("\n-A\t\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#启用操作系统检测，版本检测，脚本扫描和跟踪路由")]),s._v("\n-v\t\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#增加详细级别（使用-vv或更高级别以获得更好的效果）")]),s._v("\n-Pn\t\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#无ping扫描")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br")])]),n("h2",{attrs:{id:"主机发现"}},[s._v("主机发现 "),n("a",{staticClass:"header-anchor",attrs:{href:"#主机发现"}},[s._v("#")])]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[s._v("nmap "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("Scan Type"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("(")]),s._v("s"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("[")]),s._v("Options"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("]")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("{")]),s._v("target specification"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("}")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#指令格式")]),s._v("\n\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#Scan Types 指探测类型：")]),s._v("\n-PS 指 TCP SYN Ping，\n-PA 指 TCP ACK Ping，\n-PU 指 UDP Ping\n-PE \n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#ICMP Ping，现在很多主机封锁这些报文，适用于管理员监视内部网络")]),s._v("\n\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#Options 指探测选项：")]),s._v("\n-n 指不对活动的 IP 地址进行反向域名解析，用以提高扫描速度\n-R 指对活动的 IP 进行反向域名解析\n\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#target specification 指探测的目标地址或 IP 地址范围")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".0.1-255\n\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br"),n("span",{staticClass:"line-number"},[s._v("8")]),n("br"),n("span",{staticClass:"line-number"},[s._v("9")]),n("br"),n("span",{staticClass:"line-number"},[s._v("10")]),n("br"),n("span",{staticClass:"line-number"},[s._v("11")]),n("br"),n("span",{staticClass:"line-number"},[s._v("12")]),n("br"),n("span",{staticClass:"line-number"},[s._v("13")]),n("br"),n("span",{staticClass:"line-number"},[s._v("14")]),n("br"),n("span",{staticClass:"line-number"},[s._v("15")]),n("br"),n("span",{staticClass:"line-number"},[s._v("16")]),n("br")])]),n("p",[n("strong",[s._v("默认主机发现扫描")])]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[s._v("nmap "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".0.1-255\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br")])]),n("p",[s._v("Nmap 会发送一个 ICMP echo 请求，一个 TCP SYN 包给 443 端口，一个 TCP ACK 包给 80 端口和一个 ICMP 时间戳请求")]),s._v(" "),n("p",[s._v("这就等价于使用命令 "),n("code",[s._v("nmap -PE -PS443 -PA80 -PP 192.168.0.1-255")])]),s._v(" "),n("p",[s._v("此命令返回一个 IP 地址段中活动的主机，及其 IP 地址，主机域名，开启的服务以及相应的端口，MAC 地址等信息")]),s._v(" "),n("p",[n("strong",[s._v("其它命令")])]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[s._v("nmap -sP "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".0.1-255\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#ping扫描，只列出存活主机，速度最快")]),s._v("\nnmap -Pn "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".0.1-255\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#无ping扫描，结果和默认主机发现一样")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br")])]),n("h2",{attrs:{id:"其它参数"}},[s._v("其它参数 "),n("a",{staticClass:"header-anchor",attrs:{href:"#其它参数"}},[s._v("#")])]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[s._v("-O\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#启用操作系统检测")]),s._v("\n-sV\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#探测服务版本信息")]),s._v("\n-v\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#增加详细级别（使用-vv或更高级别以获得更好的效果）")]),s._v("\n--script"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("script_name\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#使用nse脚本")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br")])]),n("h1",{attrs:{id:"端口扫描"}},[s._v("端口扫描 "),n("a",{staticClass:"header-anchor",attrs:{href:"#端口扫描"}},[s._v("#")])]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[s._v("nmap -p "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("1")]),s._v("-65535 "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".0.8\t\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# -p选项，只扫描指定的端口")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br")])]),n("h2",{attrs:{id:"nmap所识别的6个端口状态"}},[s._v("Nmap所识别的6个端口状态 "),n("a",{staticClass:"header-anchor",attrs:{href:"#nmap所识别的6个端口状态"}},[s._v("#")])]),s._v(" "),n("p",[n("strong",[s._v("open(开放的)")])]),s._v(" "),n("p",[s._v("应用程序正在该端口接收TCP 连接或者UDP报文。")]),s._v(" "),n("p",[n("strong",[s._v("closed(关闭的)")])]),s._v(" "),n("p",[s._v("关闭的端口对于Nmap也是可访问的(它接受Nmap的探测报文并作出响应)， 但没有应用程序在其上监听。")]),s._v(" "),n("p",[n("strong",[s._v("filtered(被过滤的)")])]),s._v(" "),n("p",[s._v("由于包过滤阻止探测报文到达端口， Nmap无法确定该端口是否开放。")]),s._v(" "),n("p",[s._v("过滤可能来自专业的防火墙设备，路由器规则 或者主机上的软件防火墙。")]),s._v(" "),n("p",[n("strong",[s._v("unfiltered(未被过滤的)")])]),s._v(" "),n("p",[s._v("未被过滤状态意味着端口可访问，但Nmap不能确定它是开放还是关闭。")]),s._v(" "),n("p",[s._v("只有用于映射防火墙规则集的ACK扫描才会把端口分类到这种状态。")]),s._v(" "),n("p",[s._v("用其它类型的扫描如窗口扫描，SYN扫描，或者FIN扫描来扫描未被过滤的端口可以帮助确定 端口是否开放。")]),s._v(" "),n("p",[n("strong",[s._v("open|filtered(开放或者被过滤的)")])]),s._v(" "),n("p",[s._v("当无法确定端口是开放还是被过滤的，Nmap就把该端口划分成 这种状态。")]),s._v(" "),n("p",[s._v("开放的端口不响应就是一个例子。没有响应也可能意味着报文过滤器丢弃 了探测报文或者它引发的任何响应。")]),s._v(" "),n("p",[s._v("因此Nmap无法确定该端口是开放的还是被过滤的。 UDP，IP协议， FIN，Null，和Xmas扫描可能把端口归入此类。")]),s._v(" "),n("p",[n("strong",[s._v("closed|filtered(关闭或者被过滤的)")])]),s._v(" "),n("p",[s._v("该状态用于Nmap不能确定端口是关闭的还是被过滤的。 它只可能出现在IPID Idle扫描中。")]),s._v(" "),n("h2",{attrs:{id:"端口扫描技术"}},[s._v("端口扫描技术 "),n("a",{staticClass:"header-anchor",attrs:{href:"#端口扫描技术"}},[s._v("#")])]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#只列举常见的，详细可参考官方文档")]),s._v("\n  -sT\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#TCP连接扫描")]),s._v("\n  -sS\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#SYN扫描")]),s._v("\n  -sU\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#UDP扫描")]),s._v("\n  -sA\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#ACK扫描")]),s._v("\n  -sF\t"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#FIN扫描")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br")])]),n("p",[n("strong",[s._v("TCP连接扫描")])]),s._v(" "),n("p",[s._v("使用操作系统的网络连接系统调用 connect()，对目标主机发起 TCP 三路握手，待完成后 Nmap 立即中断此次连接。")]),s._v(" "),n("p",[s._v("Nmap 通过获取每个尝试连接的状态信息来判定侦测端口的状态")]),s._v(" "),n("p",[n("strong",[s._v("SYN扫描")])]),s._v(" "),n("p",[s._v("Nmap 产生一个 SYN 数据报文，如果侦测端口开放并返回 SYN-ACK 响应报文")]),s._v(" "),n("p",[s._v("Nmap 据此发送 RST 报文给侦测端口结束当前连接，这样做的好处在于缩短了端口扫描时间")]),s._v(" "),n("p",[n("strong",[s._v("UDP扫描")])]),s._v(" "),n("p",[s._v("UDP 本身是无连接的协议，Nmap 向目标主机的端口发送 UDP 探测报文")]),s._v(" "),n("p",[s._v("如果端口没有开放，被侦测主机将会发送一个 ICMP 端口不可到达的消息")]),s._v(" "),n("p",[s._v("Nmap 根据这个消息确定端口闭合（closed）或者被过滤 (unfiltered)")]),s._v(" "),n("p",[s._v("通常没有回复意味着端口是开放（open）状态 。")]),s._v(" "),n("p",[n("strong",[s._v("ACK扫描")])]),s._v(" "),n("p",[s._v("这种扫描比较特殊，它不能确切知道端口的基本状态，而是主要用来探测防火墙是否存在以及其中设定的过滤规则")]),s._v(" "),n("p",[n("strong",[s._v("FIN扫描")])]),s._v(" "),n("p",[s._v("和 SYN 扫描相比，这种方式更为隐蔽，因此能够穿过防火墙的过滤")]),s._v(" "),n("p",[s._v("关闭（closed）端口将会返回合适的 RST 报文，而开放端口将忽略这样的侦测报文")]),s._v(" "),n("p",[s._v("具备类似防火墙不敏感特性的还有 -sN NULL 扫描，-sX X-mas 扫描。")]),s._v(" "),n("h1",{attrs:{id:"防火墙-ids逃逸"}},[s._v("防火墙/IDS逃逸 "),n("a",{staticClass:"header-anchor",attrs:{href:"#防火墙-ids逃逸"}},[s._v("#")])]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[s._v("nmap -f --mtu"),n("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("16")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".0.8\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#报文分段，mtu必须是8的倍数")]),s._v("\n\nnmap -sI www.0day.com:80 "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".0.8\t\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#源IP欺骗")]),s._v("\n\nnmap --source-port "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("53")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".0.8\t\t\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#源端口欺骗")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#防火墙对服务器的设置会根据端口选择是否信任数据流")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#管理员可能会认为这些端口不会有攻击发生，所以可以利用这些端口扫描")]),s._v("\n\nnmap --data-length "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("30")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".0.8\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#在原来报文基础上，附加随机数据，达到规避防火墙的效果")]),s._v("\n\nnmap --spoof-mac "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("0")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[s._v("192.168")]),s._v(".0.8\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[s._v("#指定一个随机的MAC地址")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br"),n("span",{staticClass:"line-number"},[s._v("8")]),n("br"),n("span",{staticClass:"line-number"},[s._v("9")]),n("br"),n("span",{staticClass:"line-number"},[s._v("10")]),n("br"),n("span",{staticClass:"line-number"},[s._v("11")]),n("br"),n("span",{staticClass:"line-number"},[s._v("12")]),n("br"),n("span",{staticClass:"line-number"},[s._v("13")]),n("br"),n("span",{staticClass:"line-number"},[s._v("14")]),n("br"),n("span",{staticClass:"line-number"},[s._v("15")]),n("br"),n("span",{staticClass:"line-number"},[s._v("16")]),n("br")])])])}),[],!1,null,null,null);a.default=e.exports}}]);