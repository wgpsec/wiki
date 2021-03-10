---
title: 【防守方】Webshell排查
---
## 工具查杀

> 常见的检测方法有**基于主机的流量-文件-日志检测**、**关键字(危险函数)匹配**、**语义分析**等

使用工具查杀Web目录

Windows：D盾 - http://www.d99net.net/down/WebShellKill_V2.0.9.zip

Linux：河马 - https://www.shellpub.com/

```
工具查杀不靠谱，还是要手动查看Web目录下的可解析执行文件；

通过Web访问日志分析可快速定位到webshell位置。
```



## 网站被植入WebShell的应急响应流程

主要关注Web日志，看有哪些异常的HTTP访问

如果有备份源码的情况下可以，用文件对比的方法快速定位Webshell

> **1、定位时间和范围**：扫描WebShell位置；定位文件创建的时间；检查Web根目录.htaccess文件
>
> **2、Web日志审计**：例如查看access.log（`/var/log/nginx`），下载到本地审计
>
> **3、漏洞分析**：分析可能存在漏洞的地方，复现漏洞GetShell。
>
> **4、漏洞修复**：清除WebShell并修复漏洞
>
> **5、对系统和Web应用进行安全加固**
