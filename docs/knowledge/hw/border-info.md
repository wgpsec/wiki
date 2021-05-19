---
title: 互联网边界打点
---
## 边界资产收集

![](/images/hw/infoscan.png)

### Whois 聚合数据

微步在线：https://x.threatbook.cn/

### 集团结构

天眼查、爱企查等，查询目标企业的组织架构，一级单位、二级单位（对外投资）。

根据目标的组织架构，收集目标的`一级域名`（ICP备案反查、whois反查）和`邮箱资产`

### 子域名

**在线收集**

FOFA: `domain="baidu.com"`

Rapiddns： https://rapiddns.io/subdomain

字典爆破：https://phpinfo.me/domain/ 

### CDN绕过（IP资产收集）

**确认CDN**

多地ping： https://tools.ipip.net/httphead.php 

```bash
nslookup -qt=A xxx.com
#带cache或者其它别名还有返回多IP的都是有CDN
```

**绕过CDN**

FOFA：

```bash
title="网站名称"
cert="一级域名"
icon_hash="251555155"

asn="12345"
#如果找到了一个非IDC资产的目标IP，可以配合ASN码查找IP资产
```

注册查看邮件原文

通过`ping`查找到的子域名辅助查找真实IP

### C段/旁站

**C段（会有较大偏差）**

FOFA直接搜（`ip="x.x.x.x/24"`）

**旁站查询（IP反查域名）**

FOFA搜IP查域名：`ip="x.x.x.x"`

https://site.ip138.com/ 

https://rapiddns.io/sameip11

https://tools.ipip.net/ipdomain.php

### SRC 漏洞库

拿到子域的一些资产可以查找已公开漏洞

乌云镜像：https://wooyun.x10sec.org/ 

### Web指纹（网站架构）

OA协同办公、服务器中间件、CMS框架、脚本语言

相关工具：wappalyzer

通过识别到的指纹信息搜索相关应用是否存在漏洞

### 目录扫描

网站通过Robots协议告诉搜索引擎哪些页面可以抓取，哪些页面不能抓取，可能存在一些敏感路径

可以发现备份文件、测试文件、源码泄露、网站后台...

https://github.com/maurosoria/dirsearch 

```bash
python3 dirsearch.py -u <URL> -e *

--http-proxy=localhost:1080		#使用代理（也可以在配置文件设置）
```

### JS敏感API接口

发现未授权访问的文件上传等接口

1、jsfinder（发现API接口）：https://github.com/Threezh1/JSFinder

```bash
python JSFinder.py -d -u http://www.mi.com
```

2、网页源码搜索`location.href`跳转

### 端口服务扫描

对`常见高危端口进行扫描

**常见端口服务渗透**

| 端口号    | 端口说明               | 渗透思路                                                     |
| :-------- | :--------------------- | :----------------------------------------------------------- |
| 21/69     | FTP/TFTP：文件传输协议 | 爆破、匿名访问                                               |
| 22        | SSH：远程连接          | 用户名枚举、爆破                                             |
| 23        | Telnet：远程连接       | 爆破                                                         |
| 53        | DNS：域名系统          | DNS域传送\DNS缓存投毒\DNS欺骗\利用DNS隧道技术刺透防火墙      |
| 389       | LDAP                   | 未授权访问（通过LdapBrowser工具直接连入）                    |
| 445       | SMB服务                | 爆破、ms17_010远程代码执行                                   |
| 873       | rsync服务              | 未授权访问                                                   |
| 1090/1099 | Java-rmi               | JAVA反序列化远程命令执行漏洞                                 |
| 1433      | MSSQL                  | SQL注入、SA弱口令爆破                                        |
| 1521      | Oracle                 | SQL注入、TNS爆破                                             |
| 2049      | NFS                    | 配置不当                                                     |
| 2181      | ZooKeeper服务          | 未授权访问                                                   |
| 3306      | MySQL                  | 注入、爆破、Web目录写shell                                   |
| 3389      | RDP                    | 爆破、CVE-2019-0708远程代码执行                              |
| 4848      | GlassFish控制台        | 爆破：控制台弱口令、认证绕过                                 |
| 5900      | VNC                    | 爆破弱口令、认证绕过                                         |
| 6379      | Redis                  | 未授权访问、爆破弱口令                                       |
| 7001      | WebLogic中间件         | 反序列化、控制台弱口令+部署war包                             |
| 9043      | WebSphere控制台        | 控制台弱口令https://:9043/ibm/console/logon.jsp、远程代码执行 |
| 9200/9300 | Elasticsearch服务      | 远程代码执行                                                 |
| 11211     | Memcache               | 未授权访问（nc -vv 目标 IP 11211）                           |
| 27017     | MongoDB                | 未授权访问、爆破弱口令                                       |
| 50000     | SAP                    | 远程代码执行                                                 |
| 50070     | hadoop                 | 未授权访问                                                   |

Web端口：

```
80,81,82,443,5000,7001,7010,7100,7547,7777,7801,8000,8001,8002,8003,8005,8009,8010,8011,8060,8069,8070,8080,8081,8082,8083,8085,8086,8087,8088,8089,8090,8091,8161,8443,8880,8888,8970,8989,9000,9001,9002,9043,9090,9200,9300,9443,9898,9900,9998,10002,50000,50070
```

服务器：

```
21,22,445,3389,5900
```

数据库：

```
1433,1521,3306,6379,11211,27017
```

## 互联网敏感信息收集

### 邮箱发现

```
1、网站官网页面
2、爱企查等批量查询
3、https://hunter.io
```

然后使用`SNETCracker`爆破SMTP和POP3

### 源码发现

```
1、Github
2、Gitee
```

可能有些源码中会存在账号信息

### 文档发现

百度文库：https://wenku.baidu.com

原创力文档：https://max.book118.com

凌风云：https://wenku.lingfengyun.com

### 账号信息

搜索引擎：Google、百度

百度贴吧

天涯论坛

## 边界入口打点

### 一、弱口令+文件上传

事实证明弱口令还是存在很多的，大多是一些正在开发测试的站点

弱口令进去后台，找文件上传点Getshell

```bash
Web后台：admin、123456、111111、admin@123、654321、000000、qazwsx
```

### 二、高危组件

```
Shiro反序列化（jsp写的登录框）
Weblogic反序列化（T3和IIOP协议反序列化导致的代码执行）
Struts2命令执行（很少见了-重点关注016、045和046）
```

### 三、OA办公平台

```bash
致远OA（Seeyon）
通达OA（Tongda）
泛微OA（Weaver）
蓝凌OA（Landray）

RCE、文件上传、SQL注入等历史漏洞
```

### 四、SQL注入

SQL注入解出密码进后台或者直接shell

高校类的站点有很多Asp和PHP的网站，在登录、注册、查询功能处存在SQL注入漏洞可能性较大。

### 五、VPN & 邮箱

```bash
通过信息收集和社工的方式获取目标的VPN账号，直接到内网
注意收集目标邮箱，尝试破解进去一个，可以获得大量资料，或者精准邮件钓鱼
```



