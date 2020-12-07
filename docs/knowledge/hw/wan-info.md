---
title: 边界资产信息收集
---
# 边界资产信息收集
![](/images/hw/infoscan.png)

# Whois 聚合数据

微步在线：https://x.threatbook.cn/

# 集团结构

天眼查，网站备案看有哪些主域名，兄弟域名和关联域名

了解目标的组织架构，`股权穿透图`收集目标公司的子公司名称和联系邮箱

# 子域名

**在线收集**

FOFA: `domain="baidu.com"`

Rapiddns： https://rapiddns.io/subdomain

**OneForAll** 

```bash
python3 oneforall.py --target baidu.com run
```

# CDN绕过（IP资产收集）

**确认CDN**

多地ping： https://tools.ipip.net/httphead.php 

```bash
nslookup -qt=A xxx.com
#带cache或者其它别名还有返回多IP的都是有CDN
```

**绕过CDN**

注册查看邮件原文

**FOFA**：`title="网站名称"`

通过`ping`查找到的子域名辅助查找真实IP

# C段/旁站

FOFA直接搜（`ip="x.x.x.x/24"`）

**旁站查询（IP反查域名）**

FOFA搜IP查域名：`ip="x.x.x.x"`

https://site.ip138.com/ 

https://rapiddns.io/sameip

https://tools.ipip.net/ipdomain.php

# SRC 漏洞库

拿到子域的一些资产可以查找已公开漏洞，例如搜索`深信服VPN`

乌云镜像：https://wooyun.x10sec.org/ 

# Web指纹（网站架构）

> CMS框架、OS、脚本语言、中间件容器	（使用的版本是否存在历史漏洞）

相关工具：wappalyzer、Goby等

# 网站后台/敏感信息

网站通过Robots协议告诉搜索引擎哪些页面可以抓取，哪些页面不能抓取，可能存在一些敏感路径

> 备份文件、测试文件、Github泄露、SVN源码泄露
>
>  https://github.com/maurosoria/dirsearch 

```bash
python3 dirsearch.py -u <URL> -e *

--http-proxy=localhost:1080		#使用代理（也可以在配置文件设置）
```

# JS敏感API接口

jsfinder（扫API和子域名）：https://github.com/Threezh1/JSFinder

```bash
python JSFinder.py -d -u http://www.mi.com
```

# 端口服务扫描

对`常见高危端口进行扫描，探测Web服务端口

推荐工具御剑、Goby 

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
| 1433      | MSSQL                            | 注入、SA弱口令爆破                                           |
| 1521      | Oracle                           | 注入、TNS爆破                                                |
| 2049      | NFS                              | 配置不当                                                     |
| 2181      | ZooKeeper服务                    | 未授权访问                                                   |
| 3306      | MySQL                            | 注入、爆破、写shell、提权                                    |
| 3389      | RDP                              | 爆破、Shift后门、CVE-2019-0708远程代码执行                   |
| 4848      | GlassFish控制台                  | 爆破：控制台弱口令、认证绕过                                 |
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
| 11211     | Memcache                         | 未授权访问                                                   |
| 27017     | MongoDB                          | 未授权访问、爆破弱口令                                       |
| 50000     | SAP                              | 远程代码执行                                                 |
| 50070     | hadoop                           | 未授权访问                                                   |