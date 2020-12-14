---
title: IIS
---

## IIS简介
IIS是Internet Information Services的缩写，意为互联网信息服务，是由微软公司提供的基于运行Microsoft Windows的互联网基本服务

## PUT写文件漏洞

**漏洞概述**

```http
#影响版本
IIS 6.0
```

IIS Server在Web服务扩展中开启了WebDAV，配置了可以写入的权限，造成任意文件上传

**漏洞利用**：借助BurpSuite写入即可

## 解析漏洞

**漏洞概述**

IIS 6.0在处理含有特殊符号的文件路径时会出现逻辑错误，从而造成文件解析漏洞

```
test.asp;.jpg
```

---------------

IIS 7/7.5在Fast-CGI运行模式下

在一个文件路径(/xx.jpg)后面加上/.xx.php会将/xx.jpg/.xx.php 解析为 php 文件

```
copy a.jpg/b + b.txt/a c.jpg
```

**修复建议**

1）对新建目录文件名进行过滤，不允许新建包含‘.’的文件；

2）限制上传的脚本执行权限，不允许执行脚本；

3）配置cgi.pathinfo为0 (php.ini中)