---
title: JWT-Cookie伪造
---
# JWT-Cookie伪造

> Cookie是用来存储用户信息的
>
> 我们通过伪造cookie，可把自己假扮成其它用户(例如admin)，获得他的权限。
>

## 伪造原理

**JSON WEB Token**（**JWT**），是一种基于JSON的、用于在网络上声明某种主张的令牌（token）。

JWT通常由三部分组成: 头信息（header）, 消息体（payload）和签名（signature）

头信息指定了该JWT使用的签名算法:

```
header = '{"alg":"HS256","typ":"JWT"}'
```

`HS256` 表示使用了 HMAC-SHA256 来生成签名。

消息体包含了JWT的意图：

```
payload = '{"login":"admin","iat":1422779638}'//iat表示令牌生成的时间
```

未签名的令牌由`base64url`编码的头信息和消息体拼接而成（使用”.”分隔），签名则通过私有的key计算而成：

```
key = 'secretkey'  unsignedToken = encodeBase64(header) + '.' + encodeBase64(payload)  signature = HMAC-SHA256(key, unsignedToken)
```

最后在未签名的令牌尾部拼接上`base64url`编码的签名（同样使用”.”分隔）就是JWT了：

```
token = encodeBase64(header) + '.' + encodeBase64(payload) + '.' + encodeBase64(signature) # token看起来像这样: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dnZWRJbkFzIjoiYWRtaW4iLCJpYXQiOjE0MjI3Nzk2Mzh9.gzSraSYS8EXBxLN_oWnFSRgCzcmJmMjLiuyu5CSpyHI
```

## 伪造方法

一、爆破私有密钥

工具：[c-jwt-cracker](https://github.com/brendan-rius/c-jwt-cracker)

```
./jwtcrack eyJhbGci.eyJsb.gzSraSY #后边跟整个token
```

二、伪造admin权限

https://jwt.io/

用上边的网站把权限伪造成`admin`管理员权限

## 防御措施

使用复杂的secretkey

更新正在使用的JWT库，确保没有CVE（2018-0114）