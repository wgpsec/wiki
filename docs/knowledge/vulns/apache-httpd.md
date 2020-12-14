---
title: Apache-httpd
---

## 应用简介
Apache HTTPD是一款HTTP服务器，它可以通过mod_php来运行PHP网页。

## [CVE-2017-15715]-HTTPD 换行解析漏洞

**漏洞概述**

```http
#影响版本
2.4.0~2.4.29
```

在解析PHP时，`1.php\x0A`将被按照PHP后缀进行解析，导致绕过一些服务器的安全策略

**漏洞利用**

上传文件时，在1.php后面插入一个`\x0A`（注意，不能是`\x0D\x0A`，只能是一个`\x0A`）

访问刚才上传的`/1.php%0a`，发现能够成功解析

## [配置错误]-HTTPD 多后缀解析漏洞

**漏洞概述**

Apache HTTPD 支持一个文件拥有多个后缀，并为不同后缀执行不同的指令。比如，如下配置文件：

```
AddType text/html .html
AddLanguage zh-CN .cn
```

其给`.html`后缀增加了media-type，值为`text/html`；

给`.cn`后缀增加了语言，值为`zh-CN`。

此时，如果用户请求文件`index.cn.html`，他将返回一个中文的html页面。

以上就是Apache多后缀的特性。如果运维人员给`.php`后缀增加了处理器：

```
AddHandler application/x-httpd-php .php
```

那么，在有多个后缀的情况下，只要一个文件含有`.php`后缀的文件即将被识别成PHP文件，没必要是最后一个后缀。利用这个特性，将会造成一个可以绕过上传白名单的解析漏洞。

**漏洞利用**

上传文件名为`xxx.php.jpg`的文件，利用Apache解析漏洞进行getshell

**修复建议**

```php
//1、使用SetHandler,写好正则

<FileMatch ".+\.php$">
SetHandler application/x-httpd-php
</FileMatch>
    
//2、禁止.php这样的文件执行

<FileMatch ".+\.ph(p[3457]?|t|tml)\.">
Require all denied
</FileMatch>
```

## [配置错误]-SSI 远程命令执行漏洞

**漏洞概述**

在测试任意文件上传漏洞的时候，目标服务端可能不允许上传php后缀的文件。如果`目标服务器开启了SSI与CGI支持`，我们可以上传一个shtml文件，并利用`<!--#exec cmd="id" -->`语法执行任意命令

**漏洞利用**

上传一个shell.shtml文件，上传成功后访问shell.shtml