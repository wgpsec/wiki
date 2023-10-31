---
title: 常见逻辑漏洞
date: 2020-1-22 20:05:00
---
**挖掘重点：**

业务流程和HTTP/HTTPS请求篡改

支付漏洞和越权漏洞是金融业务中常见的

## 支付漏洞

**(1) 密码重置**

验证码直接在HTTP响应中返回；

验证码未绑定用户，没和手机号和邮箱号做匹配验证；

未校验用户字段值，改自己密码，最后提交其它UID；

验证码不失效，可枚举；

**(2) 支付订单**

篡改支付金额，运费修改为负数，使总金额降低。

**(3) 竞争条件**

在文件上传中和购物时；

A用户余额10元，B商品5元，C商品6元;

A利用竞争条件多线程同时发起购买B和C的请求；

可能的结果有：

有一件商品购买失败；

商品都购买成功，但只扣了6元；

商品都购买成功，但余额为 -1元；

## 越权访问

越权访问他人信息或操纵他人账号

**水平越权：**

同级别(权限)用户之间，越权访问非法操纵其它账户；(这会导致大批量数据泄露，恶意篡改)

**垂直越权：**

不同级别之间的用户越权，普通用户执行管理员的功能；

**越权访问攻击测试：**

```bash
1、改ID; ?id=1
2、改用户名；login.php?username=admin
```

**越权访问修复建议：**

越权访问漏洞的主要原因是没有对用户的身份做判断和控制，防护这种漏洞可以通过session来控制。

用户登录成功后，把username和UID等信息写入到session中，

当查看个人信息时，从session中取出username，而不是从GET和POST取，此时username就是没被篡改的。

## 会话劫持

会话劫持（Session hijacking），这是一种通过获取用户 Session ID 后，使用该 Session ID 登录目标账号的攻击方法，此时攻击者实际上是使用了目标会话固定漏洞基本防御方法 账户的有效 Session。

会话劫持的第一步是取得一个合法的会话标识来伪装成合法用户，因此需要保证会话标识不被泄漏。 

------

受害者登录站点，服务器返回一个会话标识(Session ID)

黑客捕获这个**Session ID**（ 网络嗅探，XSS ），使用这个Session ID访问站点获得受害者合法会话

### **防御方法**

XSS漏洞引起的会话劫持：使用`http-only`来防止JS获取cookie中的Session ID信息

网络嗅探引起的会话劫持：使用`HTTPS+secure`来保证Session ID不被嗅探获取到

### Session机制

Session机制是一种**服务器端**的机制，服务器使用一种类似于散列表的结构来保存信息用于保持状态。

保存这个Session ID最为方便的方式是采用Cookie。

> Cookie的名字都是类似于SESSIONID；
>
> weblogic对于web应用程序生成的cookie，JSESSIONID；
>
> PHP中Session的默认名称是PHPSESSID。

### Cookie属性

**HttpOnly 设置方法**

服务端发送cookie的时候，可以设置`HTTP-Only` ，禁止 JS 获取Cookie内容

```http
Set-Cookie: SESSIONID=abc123; expires=Wednesday, 17-Nov-99 23:12:40 GMT; HttpOnly
```

**Secure**

设置cookie的某个值secure为True时， 此cookie只有在HTTPS协议中才会进行传输 

HTTP协议传输时，是不传输此协议的。 

## 会话固定

会话固定（Session fixation）是一种诱骗受害者使用攻击者指定的会话标识（Session ID）的攻击手段。这是攻击者获取合法会话标识的最简单的方法。会话固定也可以看成是会话劫持的一种类型，原因是会话固定的攻击的主要目的同样是获得目标用户的合法会话。不过会话固定还可以是强迫受害者使用攻击者设定的一个有效会话，以此来获得用户的敏感信息。

> - 访问网站时，网站会设置cookie中的Session ID
> - **当用户登录后，cookie中的SessionID保持不变**（**形成原因**）
> - 只要获取登陆前的Session ID内容，就可以知道登陆后的Session ID
> - 黑客用该Session ID构造链接，发送给受害者点击后，黑客成功劫持受害者的会话

### 漏洞检测

**访问网站（未登录）：*获取cookie信息，获取Session ID

**登录网站：**查看Cookie信息，获取Session ID

**查看登录前，登录后SessionID是否相同** 

### 防御方法

1、在用户登录成功后重新创建一个Session ID，使登录前的匿名会话强制失效 

```php
// 会话失效
session.invalidate();

// 会话重建
session=request.getSession(true);
```

2、**SessionID与浏览器绑定：**SessionID与所访问浏览器有变化，立即重置 

3、**SessionID与所访问的IP绑定：**SessionID与所访问IP有变化，立即重置 