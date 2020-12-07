(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{747:function(_,v,t){"use strict";t.r(v);var r=t(103),e=Object(r.a)({},(function(){var _=this,v=_.$createElement,t=_._self._c||v;return t("ContentSlotsDistributor",{attrs:{"slot-key":_.$parent.slotKey}},[t("h1",{attrs:{id:"网络安全设备常识"}},[_._v("网络安全设备常识 "),t("a",{staticClass:"header-anchor",attrs:{href:"#网络安全设备常识"}},[_._v("#")])]),_._v(" "),t("h1",{attrs:{id:"防火墙"}},[_._v("防火墙 "),t("a",{staticClass:"header-anchor",attrs:{href:"#防火墙"}},[_._v("#")])]),_._v(" "),t("p",[t("strong",[_._v("简介")])]),_._v(" "),t("p",[_._v("网络层的防护设备，依照特殊的规则允许或者限制传输的数据通过")]),_._v(" "),t("p",[_._v("是由软件和硬件设备组合而成，在内部网和外部网之间、专用网和公共网之间的界面上构造的保护屏障")]),_._v(" "),t("p",[_._v("下一代防火墙("),t("strong",[_._v("NG Firewall")]),_._v(")是一款可以全面应对应用层威胁的高性能防火墙，提供网络层应用层一体化防护")]),_._v(" "),t("p",[_._v("防火墙主要用于边界安全的防护的权限控制和安全域的划分")]),_._v(" "),t("p",[_._v("防火墙主要在网络第二到第四层起作用，它的作用在第四到第七层一般很微弱")]),_._v(" "),t("p",[_._v("而反病毒软件主要在第五到第七层起作用")]),_._v(" "),t("p",[t("strong",[_._v("防火墙分类")])]),_._v(" "),t("blockquote",[t("p",[t("strong",[_._v("硬件")]),_._v("如华为的硬件防火墙")]),_._v(" "),t("p",[t("strong",[_._v("软件防火墙")]),_._v("：如微软自带的防火墙、云防火墙如阿里云的ECS规则")]),_._v(" "),t("p",[t("strong",[_._v("WAF")]),_._v("(Web应用防火墙)：如"),t("a",{attrs:{href:"http://www.safedog.cn/",target:"_blank",rel:"noopener noreferrer"}},[_._v("安全狗"),t("OutboundLink")],1),_._v(" 、"),t("a",{attrs:{href:"http://www.d99net.net/index.asp",target:"_blank",rel:"noopener noreferrer"}},[_._v("D盾"),t("OutboundLink")],1)]),_._v(" "),t("p",[t("strong",[_._v("云WAF")]),_._v("：阿里 云盾")])]),_._v(" "),t("p",[t("strong",[_._v("功能：")])]),_._v(" "),t("p",[_._v("所谓“防火墙”，是指一种将内部网和公众访问网分开的方法，它实际上是一种隔离技术。\n单向防护控制，只管进，不管出。所以很多木马从内网网外网连接，这叫反向连接。")]),_._v(" "),t("p",[t("strong",[_._v("部署：")])]),_._v(" "),t("p",[_._v("部署于内、外网络边界和各个区域之间，用于权限访问控制和安全域划分。")]),_._v(" "),t("p",[_._v("防火墙的部署主要有三种模式：透明、路由和混合")]),_._v(" "),t("blockquote",[t("p",[t("strong",[_._v("1.透明模式")])]),_._v(" "),t("p",[_._v("此时防火墙对于子网用户和路由器来说是完全透明的，也就是说，用户完全感觉不到防火墙的存在。")]),_._v(" "),t("p",[_._v("无需修改任何已有的网络配置，内部网络和外部网络必须处于同一个子网。")]),_._v(" "),t("p",[t("strong",[_._v("2.路由模式")])]),_._v(" "),t("p",[_._v("当防火墙位于内部网络和外部网络之间时，需要将防火墙与内部网络、外部网络以及DMZ 三个区域相连的接口分别配置成不同网段的IP 地址，重新规划原有的网络拓扑，此时相当于一台路由器。")]),_._v(" "),t("p",[_._v("采用路由模式时，可以完成ACL 包过滤、ASPF 动态过滤、NAT 转换等功能。然而，路由模式需要对网络拓扑进行修改（内部网络用户需要更改网关、路由器需要更改路由配置等）")]),_._v(" "),t("p",[t("strong",[_._v("3.混合模式")])]),_._v(" "),t("p",[_._v("防火墙既存在工作在路由模式的接口（接口具有IP 地址），又存在工作在透明模式的接口（接口无IP 地址），则防火墙工作在混合模式下。")]),_._v(" "),t("p",[_._v("混合模式主要用于透明模式作双机备份的情况，此时启动VRRP（Virtual Router Redundancy Protocol，虚拟路由冗余协议）功能的接口需要配置IP 地址，其它接口不配置IP地址。")]),_._v(" "),t("p",[_._v("内部网络和外部网络必须处于同一个子网。")])]),_._v(" "),t("p",[t("strong",[_._v("功能模块：")])]),_._v(" "),t("blockquote",[t("p",[_._v("**NAT：**把内网地址映射到外网")]),_._v(" "),t("p",[_._v("**路由：**路由寻址")]),_._v(" "),t("p",[_._v("**策略：**过滤规则")])]),_._v(" "),t("h1",{attrs:{id:"utm"}},[_._v("UTM "),t("a",{staticClass:"header-anchor",attrs:{href:"#utm"}},[_._v("#")])]),_._v(" "),t("p",[_._v("(Unified Threat Management)，"),t("strong",[_._v("统一威胁管理")]),_._v("\n具备防火墙、IPS入侵检测、防病毒、防垃圾邮件等综合功能。\n同时开启多项功能会大大降低UTM性能、所以主要用于对性能要求不高的中低端领域。\n在高端领域，比如电信、金融仍然以防火墙和IPS为主流。")]),_._v(" "),t("h1",{attrs:{id:"负载均衡"}},[_._v("负载均衡 "),t("a",{staticClass:"header-anchor",attrs:{href:"#负载均衡"}},[_._v("#")])]),_._v(" "),t("p",[_._v("负载均衡（Load Balance）建立在现有网络结构之上，它提供了一种廉价有效透明的方法扩展网络设备和服务器的带宽")]),_._v(" "),t("p",[_._v("增加吞吐量、加强网络数据处理能力、提高网络的灵活性和可用性。")]),_._v(" "),t("p",[_._v("把任务分摊到多个操作单元上进行执行，从而共同完成工作任务。")]),_._v(" "),t("p",[t("strong",[_._v("主要目的")]),_._v("是实现资源的有效利用，分担共同压力，避免资源分布不均。")]),_._v(" "),t("p",[_._v("**部署三种模式：**路由模式、桥接模式、服务直接返回模式。")]),_._v(" "),t("blockquote",[t("p",[_._v("路由模式部署灵活，越60%用户采用这种方式部署；\n桥模式不改变现有的网络架构；\n服务直接返回(DSR)比较适合吞吐量大，特别是内容分发的网络应用。30%用户采用这种模式。")])]),_._v(" "),t("h1",{attrs:{id:"gap网闸"}},[_._v("GAP网闸： "),t("a",{staticClass:"header-anchor",attrs:{href:"#gap网闸"}},[_._v("#")])]),_._v(" "),t("p",[_._v("(安全隔离网闸)\n安全网闸是一种由带有多种控制功能专用硬件在电路上切断网络之间的链路层连接，并能够在网络间进行安全适度的应用数据交换的网络安全设备。\n专门用来做数据交换，相比于防火墙，能够对应用数据进行检查，防止泄密、进行病毒和木马检查。\n物理隔离，只有数据文件的无协议摆渡，阻断具有潜在攻击的一切连接。")]),_._v(" "),t("p",[_._v("保密单位、科研单位、石化、石油对网闸的需求非常大。要做内外网隔离、大网透传、数据摆渡。\n"),t("strong",[_._v("安全性高于防火墙，性能不如防火墙。")])]),_._v(" "),t("p",[t("strong",[_._v("主要功能：")])]),_._v(" "),t("p",[_._v("安全隔离、内核防护、协议转换、病毒查杀、访问控制、安全审计、身份认证")]),_._v(" "),t("p",[t("strong",[_._v("部署：")])]),_._v(" "),t("p",[_._v("部署于不同区域之间物理隔离、不同网络之间物理隔离、网络边界物理隔离，也常用于数据同步、信息发布等。")]),_._v(" "),t("h1",{attrs:{id:"vpn虚拟专用网络"}},[_._v("VPN虚拟专用网络: "),t("a",{staticClass:"header-anchor",attrs:{href:"#vpn虚拟专用网络"}},[_._v("#")])]),_._v(" "),t("p",[_._v("(Virtual private network)，在公用网络上建立专用网络,进行加密通讯。\nVPN网关通过对数据包的加密和数据包目标地址的转换实现远程访问。\nVPN隧道协议主要有三种：PPTP、L2TP、IPSec\n常用类型有SSL VPN (以HTTPS为基础的VPN技术，外网访问内网平台)和IPSec VPN")]),_._v(" "),t("h1",{attrs:{id:"ids和ips"}},[_._v("IDS和IPS "),t("a",{staticClass:"header-anchor",attrs:{href:"#ids和ips"}},[_._v("#")])]),_._v(" "),t("p",[_._v("IDS 专业上讲就是依照一定的安全策略，对网络、系统的运行状况进行监视")]),_._v(" "),t("p",[_._v("尽可能发现各种攻击企图、攻击行为或者攻击结果，以保证网络系统资源的机密性、完整性和可用性。")]),_._v(" "),t("p",[_._v("IDS入侵检测系统是一个监听设备，没有跨接在任何链路上，无须网络流量流经它便可以工作。")]),_._v(" "),t("p",[_._v("因此，对IDS的部署，唯一的要求是：IDS应当挂接在所有所关注流量都必须流经的链路上。")]),_._v(" "),t("p",[_._v("IPS同时具备检测和防御功能，IPS在入口处就开始检测， 而不是等到进入内部网络后再检测这样，检测效率和内网的安全性都大大提高。")]),_._v(" "),t("p",[_._v("入侵预防系统专门深入网络数据内部，查找它所认识的攻击代码特征，过滤有害数据流，丢弃有害数据包，并进行记载，以便事后分析。")]),_._v(" "),t("p",[_._v("IPS是一种失效既阻断机制，当IPS被攻击失效后， 它会阻断网络连接， 就像防火墙一样， 使被保护资源与外界隔断。")]),_._v(" "),t("h1",{attrs:{id:"hids-基于主机的入侵检测系统"}},[_._v("HIDS 基于主机的入侵检测系统 "),t("a",{staticClass:"header-anchor",attrs:{href:"#hids-基于主机的入侵检测系统"}},[_._v("#")])]),_._v(" "),t("blockquote",[t("p",[_._v("作为计算机系统的监视器和分析器，它并不作用于外部接口")]),_._v(" "),t("p",[_._v("而是专注于系统内部，监视系统全部或部分的动态的行为以及整个计算机系统的状态")]),_._v(" "),t("p",[_._v("HIDS动态地检查网络数据包、文件、日志等。")])]),_._v(" "),t("p",[t("a",{attrs:{href:"https://www.freebuf.com/articles/es/194510.html",target:"_blank",rel:"noopener noreferrer"}},[_._v("企业安全建设之HIDS"),t("OutboundLink")],1)]),_._v(" "),t("h1",{attrs:{id:"堡垒机"}},[_._v("堡垒机 "),t("a",{staticClass:"header-anchor",attrs:{href:"#堡垒机"}},[_._v("#")])]),_._v(" "),t("p",[_._v("堡垒机，也叫做运"),t("strong",[_._v("维安全审计系统")])]),_._v(" "),t("p",[t("strong",[_._v("核心功能：4A")])]),_._v(" "),t("blockquote",[t("p",[_._v("身份验证 Authentication")]),_._v(" "),t("p",[_._v("账号管理 Account")]),_._v(" "),t("p",[_._v("授权控制 Authorization")]),_._v(" "),t("p",[_._v("安全审计 Audit")])]),_._v(" "),t("p",[_._v("堡垒机是用来控制哪些人可以登录哪些资产（事先防范和事中控制），以及录像记录登录资产后做了什么事情（事后溯源.）")]),_._v(" "),t("p",[t("a",{attrs:{href:"https://www.jumpserver.org/",target:"_blank",rel:"noopener noreferrer"}},[_._v("jumpserver"),t("OutboundLink")],1),_._v(" 是全球首款完全开源的堡垒机 。")]),_._v(" "),t("p",[_._v("应用：比如用堡垒机实现"),t("a",{attrs:{href:"https://yq.aliyun.com/articles/636281",target:"_blank",rel:"noopener noreferrer"}},[_._v("单点登录"),t("OutboundLink")],1)]),_._v(" "),t("h1",{attrs:{id:"蜜罐"}},[_._v("蜜罐 "),t("a",{staticClass:"header-anchor",attrs:{href:"#蜜罐"}},[_._v("#")])]),_._v(" "),t("p",[_._v("蜜罐是一种软件应用系统，用来称当入侵诱饵，引诱黑客前来攻击。")]),_._v(" "),t("p",[_._v("攻击者入侵后，通过监测与分析，就可以知道他是如何入侵的，利用了什么漏洞和工具。")]),_._v(" "),t("p",[_._v("有两种基本类型的蜜罐技术：")]),_._v(" "),t("blockquote",[t("ul",[t("li",[_._v("高交互性蜜罐—设置一个全功能的应用环境，引诱黑客攻击。")]),_._v(" "),t("li",[_._v("低交互性蜜罐—模拟一个生产环境，所以只能提供有限的信息。")])])]),_._v(" "),t("p",[t("a",{attrs:{href:"https://ipot.sec-wiki.com/",target:"_blank",rel:"noopener noreferrer"}},[_._v("一个专注蜜罐技术研究的网站"),t("OutboundLink")],1)]),_._v(" "),t("p",[_._v("Github-project："),t("a",{attrs:{href:"https://github.com/paralax/awesome-honeypots/blob/master/README_CN.md",target:"_blank",rel:"noopener noreferrer"}},[_._v("最优秀的蜜罐列表"),t("OutboundLink")],1)]),_._v(" "),t("h1",{attrs:{id:"soc"}},[_._v("SOC "),t("a",{staticClass:"header-anchor",attrs:{href:"#soc"}},[_._v("#")])]),_._v(" "),t("blockquote",[t("p",[_._v("SEM，security event management，安全事件管理，指对事件进行实时监控，收集信息差展生通知和告警的行为。")]),_._v(" "),t("p",[_._v("SIM，security information management，安全信息管理，指对SEM收集和产生的数据进行长期保存以供历史和趋势分析的行为。")]),_._v(" "),t("p",[_._v("SIEM，security information and event management，安全信息和事件管理，即SEM和SIM的结合体。")]),_._v(" "),t("p",[_._v("SOC，security operations center，安全运营中心。")]),_._v(" "),t("p",[_._v("TI，Threat Intelligence，威胁情报。SOC偏重内部网络态势感知，而TI偏重于外部网络态势感知比如新出了什么漏洞、病毒、安全事件等等。")]),_._v(" "),t("p",[_._v("SA，situational awareness，态势感知。")]),_._v(" "),t("p",[_._v("SRC，Security Response Center，安全响应中心。狭义上只是一个提交产品漏洞的入口，但广义上包含各种安全系统及系统维护人员。")])]),_._v(" "),t("p",[_._v("**他们的关系是：**SRC > SA >= SOC [ + TI ] >= SIEM = SEM+SIM。")]),_._v(" "),t("p",[_._v("一款典型的"),t("strong",[_._v("SIEM")]),_._v("产品具有以下功能："),t("strong",[_._v("资产发现")]),_._v("、"),t("strong",[_._v("漏洞扫描")]),_._v("、"),t("strong",[_._v("入侵检测")]),_._v("、"),t("strong",[_._v("日志存储分析")]),_._v("和"),t("strong",[_._v("可视化展示")])]),_._v(" "),t("p",[t("a",{attrs:{href:"https://cybersecurity.att.com/products/ossim",target:"_blank",rel:"noopener noreferrer"}},[_._v("OSSIM"),t("OutboundLink")],1),_._v("，开源安全信息管理系统（Open Source Security Information Management）")]),_._v(" "),t("blockquote",[t("p",[_._v("在产品形式上和Kali类似是一个基于Debain进行二次开发的Linux发行版")]),_._v(" "),t("p",[_._v("OSSIM使用Nmap等实现资产发现、使用Nessus等实现漏洞扫描、使用Snort等实现入侵检测")]),_._v(" "),t("p",[_._v("使用MySQL等进行数据存储，自己实现的部分主要是工具、数据整合和可视化展示")])]),_._v(" "),t("p",[t("strong",[_._v("安装：")])]),_._v(" "),t("p",[_._v("ISO文件下载地址：https://www.alienvault.com/products/ossim/download")]),_._v(" "),t("p",[_._v("基础配置：CPU----2*2，内存----8G，硬盘----20G以上")]),_._v(" "),t("p",[_._v("OSSIM包含服务器组件+Sensor，Sensor相当于一个Client")]),_._v(" "),t("p",[t("a",{attrs:{href:"https://www.secpulse.com/archives/67350.html",target:"_blank",rel:"noopener noreferrer"}},[_._v("安全脉搏-OSSIM操作实践"),t("OutboundLink")],1)])])}),[],!1,null,null,null);v.default=e.exports}}]);