---
title: 任意文件下载漏洞
---
# 任意文件下载漏洞

一些网站由于业务需求，往往需要提供文件查看或文件下载功能，若对用户查看或下载的文件限制不严

则用户就能够查看或下载任意敏感文件，这就是文件下载漏洞。 

## 漏洞利用

### 读取服务端文件

目标网站发现如下链接：`http://www.xx.com/down.php?file=/updown/1.txt`

在**file参数**后尝试下载index.php首页文件，然后在首页文件继续找其它配置文件，获取数据库配置信息等。

## 防护方法

> php.ini配置open_basedir限定文件访问范围
>
> 过滤.(点)，使用户在url中不能回溯上级目录
>
> 正则严格判断用户输入参数的格式

## 代码审计方法

**关注以下函数：**

```php
file_get_contents()//将整个文件读入一个字符串
highlight_file()//语法高亮一个文件
fopen()			//打开文件或者 URL
file()			//把整个文件读取入一个数组
readfile()		//读取文件并写入到输出缓冲
fread()			//读取文件（可安全用于二进制文件）
fgets()			//从文件指针中读取一行
fgetss()		//从文件指针中读取一行并过滤掉 HTML 标记
parse_ini_file()//解析一个配置文件，返回一个联合数组
show_source()	//highlight_file()的别名
```

# 任意文件删除漏洞

关注函数：

```php
unlink()
```

相关漏洞：[Discuz!X ≤3.4 任意文件删除漏洞](https://vulhub.org/#/environments/discuz/x3.4-arbitrary-file-deletion/)

