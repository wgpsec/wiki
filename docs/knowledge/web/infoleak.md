---
title: 信息泄露漏洞
date: 2020-1-22 20:01:00
---

## 页面未授权访问

### 漏洞概述

网站备份文件、日志文件、配置文件等可直接访问下载，phpinfo页面和其它未授权访问页面，导致敏感信息泄露给攻击者进一步的攻击提供信息。

**Druid未授权访问，Druid是一个 JDBC 组件**，在未授权访问页面提取网站用户的session，伪造用户session进行登录

WEB-INF/web.xml 泄露

### 漏洞利用

通过目录扫描的方式发现信息泄露页面，可用于信息收集和配置文件审计

```bash
#以下目录文件可访问
/druid/index.html
/WEB-INF/web.xml
/WEB-INF/database.properties
/phpinfo.php
/_config/
/.config/
/config/
/www.rar
/sql.bak
/wwwroot.rar
#举例部分
```

### 修复建议

从网站目录中删除泄露信息的相关文件

### 寻找资产

**FOFA：**

```C#
//Druid未授权访问
title="Druid Stat Index"
```

**Google：**

```c#
//PHPINFO页面
inurl:phpinfo.php intitle:phpinfo()
info.php test.php
    
//Druid未授权访问
inurl:"druid/index.html" intitle:"Druid Stat Index"
```

### 漏洞实例

```
http://178.206.237.37/resin-doc/examples/ioc-appconfig/viewfile?file=WEB-INF/web.xml

http://wigon.top/JPSHOP/druid/index.html
https://119.254.82.231/druid/basic.json
```

## 源码泄露

> **源码泄露类最好用的工具**：https://github.com/kost/dvcs-ripper
>
> 直接在Win10子系统安装perl环境执行脚本即可，可clone源码和历史提交

### .DS_Store源码泄露

在发布代码时未删除文件夹中隐藏的.DS_store，被发现后，获取了敏感的文件名等信息

```bash
dumpall -u http://example.com/.DS_Store/
```

### .hg源码泄漏

hg init的时候会生成.hg

```bash
./rip-hg.pl -v -u http://www.example.com/.hg/

cat .hg/store/fncache
```

### CVS泄漏

```bash
/CVS/Root 返回根信息
/CVS/Entries 返回所有文件的结构

rip-cvs.pl -v -u http://www.example.com/CVS/
```

### .SVN源码泄露

#### 漏洞概述

在使用 SVN 管理本地代码过程中，使用 svn checkout 功能来更新代码时，项目目录下会自动生成隐藏的`.svn`文件夹。

一些网站管理员在发布代码时，不愿意使用“导出”功能，而是直接复制代码文件夹到WEB服务器上，这就使得`.svn`隐藏文件夹被暴露于外网环境

#### 漏洞验证

访问目标存在以下文件

```
.svn/entries
.svn/wc.db
```

#### 漏洞利用

**`.svn/pristine` 目录**

直接访问获得文件源代码

**wc.db文件**

用`Navicat`软件打开 `wc.db`文件，可以看到 NODES 表，遍历这个表里的每一行，就可以下载到整个项目里的代码了，而且还能得到对应的真实文件名。

`REPOSITORY`表里面存储了svn的项目路径和 uuid，如果没有做访问IP限制的话，可以直接使用此信息取得此项目的SVN权限（下载、提交等）

```
./rip-svn.pl -v -u http://www.example.com/.svn/

http://47.110.235.233:8089/.svn/pristine/
```

#### 修复建议

1、不要使用svn checkout和svn up更新服务器上的代码，使用svn export（导出）功能代替；

2、服务器软件（Nginx、apache、tomcat、IIS等）设置目录权限，禁止访问.svn目录；

3、删除 .svn 文件夹

### .Git源码泄露

#### 漏洞概述

在运行git init初始化代码库的时候，会在当前目录下面产生一个.git的隐藏文件，用来记录代码的变更记录；在发布代码的时候，.git目录没有删除，使用这个文件，可以恢复源代码。

#### 漏洞验证

```
/.git/config 页面存在
```

#### 漏洞利用

**文件夹分析**

**index：**文件保存暂存区信息

**info：**存放仓库的信息

**object：**存放所有git对象的地方

**refs：**存放提交hash的地方

**config：**github的配置信息

**description：**仓库的描述信息，主要给gitweb等git托管系统使用

**HEAD：**映射到ref引用，能够找到下一次commit的前一次哈希值	

```bash
rip-git.pl -v -u http://www.example.com/.git/
```

**Stash**

```bash
#需要使用可还原历史版本那个Githack才行

1、查看 .git/refs/stash 找到 stash 对应的 hash

2、git diff hash值
```

**Log**

1、执行 `git log` 查看历史记录

2、与上（某）次提交进行比对

```bash
git diff log中的hash前四位
# 或者
git diff HEAD^
```

3、或者直接切换到上个 (3e25d) 版本 

```bash
git reset --hard 3e25d
# 或
git reset --hard HEAD^
```