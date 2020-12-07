---
title: 【蓝队】Webshell排查
---
## Webshell排查
常见的检测方法有**基于主机的流量-文件-日志检测**、**关键字(危险函数)匹配**、**语义分析**等

## 工具查杀

使用工具查杀Web目录

**Windows**：D盾 - http://www.d99net.net/down/WebShellKill_V2.0.9.zip

**Linux**：河马 - https://www.shellpub.com/

**在线查杀**：WEBDIR+ - https://scanner.baidu.com/#/pages/intro

## 网站被植入WebShell的应急响应流程

**主要关注Web日志，看有哪些异常的HTTP访问**

**如果有备份源码的情况下可以，用文件对比的方法快速定位Webshell**

> **1、定位时间和范围**：扫描WebShell位置；定位文件创建的时间；检查Web根目录.htaccess文件
>
> **2、Web日志审计**：例如查看access.log（`/var/log/nginx`），下载到本地审计
>
> **3、漏洞分析**：分析可能存在漏洞的地方，复现漏洞GetShell。
>
> **4、漏洞修复**：清除WebShell并修复漏洞
>
> **5、对系统和Web应用进行安全加固**

## Volatility 内存取证

 [识“黑”寻踪 之 内存取证](https://paper.seebug.org/papers/Security%20Conf/KCon/2018/25%E6%97%A5/25%E6%97%A5NO.7-%E8%AF%86%E9%BB%91%E5%AF%BB%E8%B8%AA%E4%B9%8B%E5%86%85%E5%AD%98%E5%8F%96%E8%AF%81-%E4%BC%8D%E6%99%BA%E6%B3%A2-ok.pdf) 

[Tomcat下基于Listener的内存Webshell分析](http://foreversong.cn/archives/1547)