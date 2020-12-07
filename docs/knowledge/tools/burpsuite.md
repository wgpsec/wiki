---
title: BurpSuite简要手册
---
# BurpSuite简要手册
**灵活使用Burp可以提高渗透测试和漏洞挖掘的效率**

# 选项摘要

```bash
Proxy		#一个拦截HTTP/S的代理服务器
Spider		#是一个应用智能感应的网络爬虫，它能完整的枚举应用程序的内容和功能。
Scanner		#[仅限专业版]——是一个高级的工具，执行后，它能自动地发现web 应用程序的安全漏洞。
Intruder	#枚举和fuzzing
Repeater	#数据包重放
Sequencer	#会话令牌和重要数据项的随机性分析工具。
Decoder		#智能解码编码工具
Comparer	#可视化的“差异”比较工具
```

# Intruder模块详解

**Positions 有效负载位置—攻击类型**

> **`Sniper`**：单独参数Fuzz
>
> **`Battering ram`**：多个位置相同参数Fuzz
>
> **`Pitchfork`**：多参数同时顺序Fuzz（顺序爆破用户名和对应ID）
>
> **`Cluster bomb`**：多参数遍历Fuzz（例如用户名+密码爆破）

# 代理设置

**拦截HTTPS代理**

> 1、 浏览器设置好BurpSuite代理服务器后，访问http://burp ，下载CA证书
>
> 2、双击安装这个证书，在浏览器`证书机构`处导入证书
>
> 注意：安装到受信任的根证书颁发机构

**APP抓包**

> 1、`Proxy Listeners` => 选中当前在用的代理 => `Edit` => `Bind to address` => `All interfaces` 
>
> 2、 手机和PC连接同一Wifi，手机设置HTTP代理为BurpSuite所在的PC的IP和端口 

**代理链**（SSR+Bp）

 User options下的Connections页面中，有『Upstream Proxy Servers』和『SOCKS Proxy』 

# Burp拓展插件

### CO2：一个增强采集扩展（应用商店可安装）

> **SQLMapper**：GUI形式的sqlmap，便于构建命令
>
> **User Generator**：用户生成器， 使用名称统计信息生成名称或用户名
>
> **Name Mangler**：给出一个简短的名称和用户名列表，生成潜在用户名列表
>
> **CeWLer**： 从现有的Burp历史中提取字典
>
> **Masher**：生成自定义密码字典

### chunked-coding-converter.0.2.1.jar

国人c0ny1最新版 burp分块输出，也是对抗waf的插件

地址：https://github.com/c0ny1/chunked-coding-converter

### BurpShiroPassiveScan

Shiro反序列化被动扫描

### passive-scan-client.0.1

配合Xray被动扫描

-----

当然还有很多要学的，自己编写插件等等~

[官方文档](https://portswigger.net/burp/documentation/contents)