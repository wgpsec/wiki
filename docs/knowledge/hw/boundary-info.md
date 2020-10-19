---
title: 【红队】 边界资产信息收集
---

# 边界资产信息收集

![](/images/infoscan.png)

# Whois 聚合数据

微步在线：https://x.threatbook.cn/

云悉指纹：https://www.yunsee.cn/

# 集团结构

天眼查：https://www.tianyancha.com/

网站备案看有哪些主域名（或者改后缀可能也有其它域名）

收集子公司的名称和联系邮箱

# 子域名（主公司/子公司）

**OneForAll (一个就够了)**

>  https://paper.seebug.org/1053/  帮助简介（把API、代理都配置好）

```bash
python3 oneforall.py --target example.com --port=80,443,8080,8009,7001 --valid=True --path=./subs.csv run

--port=PORT
请求验证子域的端口范围(默认只探测80端口)
--valid=VALID
只导出存活的子域结果(默认False)
--path=PATH
结果保存路径(默认None)
--takeover=TAKEOVER
检查子域接管(默认False)
```

**DNSdumpster**（在线）： https://dnsdumpster.com/ 

历史DNS记录： https://rapiddns.io/subdomain

**DNS枚举**

dnsenum:
   默认会对该域做暴力枚举。枚举结果 依赖于字典的质量。

theHarvester:
   theHarvester is a very simple, yet effective tool designed to be used in the early<br />stages of a penetration test. Use it for open source intelligence gathering and<br />helping to determine a company's external threat landscape on the internet. The<br />tool gathers emails, names, subdomains, IPs, and URLs using multiple public data<br />sources that include:<br />passive mode:<br />baidu, bing, bingapi, censys, crtsh, dogpile,<br />google, google-certificates, googleCSE, googleplus, google-profiles,<br />hunter, linkedin, netcraft, pgp, threatcrowd,<br />twitter, vhost, virustotal, yahoo,<br />Acitve mode:<br />DNS brute force: dictionary brute force enumeration

在线枚举:
   https://phpinfo.me/domain

# CDN绕过（IP资产收集）

**确认CDN**

多地ping： https://tools.ipip.net/httphead.php 

CMD-ping看回复（IP前的域名有无CDN或WAF）

国外访问： https://asm.ca.com/en/ping.php （针对小厂CDN，国外访问可能获得真实IP）



**绕过CDN**

注册查看邮件原文

用空间搜索引擎（**FOFA**：`title="公司名"`等特征 ）

通过查找到的子域名，辅助查找真实IP

邮件服务器（利用邮件服务器主动发邮件给自己，主动发起的连接不会用CDN）



**配置不当**

1、phpinfo

2、站点同时支持http和https访问，CDN只配置 https协议，那么这时访问http就可以轻易绕过。

> 得知真实IP后，可以改host访问
>
> 在这里https://www.ipip.net/ip.html 查询IP归属地，和目标公司匹配一下。



**CDN查询工具**

[https://get-site-ip.com/](https://get-site-ip.com/)<br />



***Github Tools***

[https://github.com/Tai7sy/fuckcdn](https://github.com/Tai7sy/fuckcdn)<br />[https://github.com/boy-hack/w8fuckcdn](https://github.com/boy-hack/w8fuckcdn)<br />


**绕过文章**

[https://opendatasecurity.io/how-to-bypass-cdn/](https://opendatasecurity.io/how-to-bypass-cdn/)<br />[https://topic.alibabacloud.com/a/11-ways-to-bypass-cdn-to-find-real-ip_8_8_31062138.html](https://topic.alibabacloud.com/a/11-ways-to-bypass-cdn-to-find-real-ip_8_8_31062138.html)<br />




# C段/旁站

将C段收集的相关IP，推测该单位所在的IP段，再针对IP段进行服务器端口扫描

利用FOFA空间搜索引擎（`title="xxx" && host="xxx.com"`）

**ASN码查询C段（大型企业才有）**

 https://tools.ipip.net/as.php （在这输入IP查ASN码）

 https://www.cidr-report.org/cgi-bin/as-report?as=AS37963 （查询ASN码对应的资产列表）

**旁站查询（IP反查域名）**

443 看证书、FOFA搜IP查域名

 http://dns.bugscaner.com/ 

 https://site.ip138.com/ 

# SRC 漏洞库

拿到子域的一些资产可以查找已公开漏洞，例如搜索`深信服VPN`

乌云镜像：https://wooyun.x10sec.org/ 

# Web指纹（网站架构）

> CMS框架、OS、脚本语言、中间件容器	（使用的版本是否存在历史漏洞）


***在线CMS识别工具***

[https://www.yunsee.cn/](https://www.yunsee.cn/)<br />[http://whatweb.bugscaner.com/look/](http://whatweb.bugscaner.com/look/)<br />[https://www.whatweb.net/](https://www.whatweb.net/)<br />


***本地识别工具***

御剑Web指纹识别工具<br />轻量web指纹识别工具<br />WebRobo<br />椰树<br />[https://github.com/urbanadventurer/WhatWeb](https://github.com/urbanadventurer/WhatWeb)<br />[https://github.com/AliasIO/Wappalyzer](https://github.com/AliasIO/Wappalyzer)<br />[https://github.com/iniqua/plecost](https://github.com/iniqua/plecost)<br />[https://github.com/w-digital-scanner/w11scan](https://github.com/w-digital-scanner/w11scan)<br />[http://521.li/post/670.html](http://521.li/post/670.html)

# GPS

个人/企业公司GPS信息泄露
不论是员工个人或者企业泄露的公司照片都可能泄露公司的GPS信息，可以利用exiftool读取照片里面的隐藏信息，但是有些社交平台发布的照片会清洗掉很多敏感信息，但是QQ微信直接收到的图片都可以。
```
root@kali:/home/kali/桌面# exiftool 1.jpg 
ExifTool Version Number         : 12.05
File Name                       : 1.jpg
Directory                       : .
File Size                       : 53 kB
File Modification Date/Time     : 2020:09:15 10:54:31+08:00
File Access Date/Time           : 2020:10:19 12:55:48+08:00
File Inode Change Date/Time     : 2020:10:19 12:55:47+08:00
File Permissions                : rwxrw-rw-
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
JFIF Version                    : 1.01
Resolution Unit                 : inches
X Resolution                    : 120
Y Resolution                    : 120
Image Width                     : 1080
Image Height                    : 357
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Image Size                      : 1080x357
Megapixels                      : 0.386
root@kali:/home/kali/桌面# 
```


# 网站后台/敏感信息

网站通过Robots协议告诉搜索引擎哪些页面可以抓取，哪些页面不能抓取，可能存在一些敏感路径

> 备份文件、测试文件、Github泄露、SVN源码泄露
>
>  https://github.com/maurosoria/dirsearch 

```bash
python3 dirsearch.py -r -R 3 -s 3 -u <URL> -e *

--http-proxy=localhost:1080		#使用代理（也可以在配置文件设置）
-s DELAY, --delay=DELAY  	 	#设置请求之间的延时
-r -R 3							#递归扫描
```

# JS敏感API接口

jsfinder（扫API和子域名）：https://github.com/Threezh1/JSFinder

```bash
python JSFinder.py -d -u http://www.mi.com
```

# APP/微信小程序

通过移动端的程序，找到信息泄露、真实IP等，多端不同步等漏洞。

# 端口服务扫描

对`1-65535`端口扫描，探测Web服务端口

```bash
sudo masscan -p 1-65535 139.224.94.40-139.224.94.50 --rate 4000	#只扫相关性高点的几个
sudo masscan -p 80,443 139.224.94.0/24 --rate 1000000	#全C段扫描
```

`masscan+nmap`结合扫描研究，速度和准确率的结合

https://zhuanlan.zhihu.com/p/77656471

## 常见端口服务渗透

| 端口号    | 端口说明                         | 渗透思路                                                     |
| :-------- | :------------------------------- | :----------------------------------------------------------- |
| 21/69     | FTP/TFTP：文件传输协议           | 爆破、内网嗅探                                               |
| 22        | SSH：远程连接                    | 用户名枚举、爆破                                             |
| 23        | Telnet：远程连接                 | 爆破、内网嗅探                                               |
| 25        | SMTP：邮件服务                   | 邮件伪造                                                     |
| 53        | DNS：域名系统                    | DNS域传送\DNS缓存投毒\DNS欺骗\利用DNS隧道技术刺透防火墙      |
| 389       | LDAP                             | 未授权访问（通过LdapBrowser工具直接连入）                    |
| 443       | https服务                        | OpenSSL 心脏滴血（nmap -sV --script=ssl-heartbleed 目标）    |
| 445       | SMB服务                          | ms17_010远程代码执行                                         |
| 873       | rsync服务                        | 未授权访问                                                   |
| 1090/1099 | Java-rmi                         | JAVA反序列化远程命令执行漏洞                                 |
| 1352      | Lotus Domino邮件服务             | 爆破：弱口令、信息泄漏：源代码                               |
| 1433      | MSSQL                            | 注入、SA弱口令爆破、提权                                     |
| 1521      | Oracle                           | 注入、TNS爆破                                                |
| 2049      | NFS                              | 配置不当                                                     |
| 2181      | ZooKeeper服务                    | 未授权访问                                                   |
| 3306      | MySQL                            | 注入、爆破、写shell、提权                                    |
| 3389      | RDP                              | 爆破、Shift后门、CVE-2019-0708远程代码执行                   |
| 4848      | GlassFish控制台                  | 爆破：控制台弱口令、认证绕过                                 |
| 5000      | Sybase/DB2数据库                 | 爆破、注入                                                   |
| 5432      | PostgreSQL                       | 爆破弱口令、高权限执行系统命令                               |
| 5632      | PcAnywhere服务                   | 爆破弱口令                                                   |
| 5900      | VNC                              | 爆破：弱口令、认证绕过                                       |
| 6379      | Redis                            | 未授权访问、爆破弱口令                                       |
| 7001      | WebLogic中间件                   | 反序列化、控制台弱口令+部署war包、SSRF                       |
| 8000      | jdwp                             | JDWP 远程命令执行漏洞（[工具](https://github.com/IOActive/jdwp-shellifier)） |
| 8080/8089 | Tomcat/JBoss/Resin/Jetty/Jenkins | 反序列化、控制台弱口令、未授权                               |
| 8161      | ActiveMQ                         | admin/admin、任意文件写入、反序列化                          |
| 8069      | Zabbix                           | 远程命令执行                                                 |
| 9043      | WebSphere控制台                  | 控制台弱口令https://:9043/ibm/console/logon.jsp、远程代码执行 |
| 9200/9300 | Elasticsearch服务                | 远程代码执行                                                 |
| 11211     | Memcache                         | 未授权访问（nc -vv 目标 11211）                              |
| 27017     | MongoDB                          | 未授权访问、爆破弱口令                                       |
| 50000     | SAP                              | 远程代码执行                                                 |
| 50070     | hadoop                           | 未授权访问                                                   |
