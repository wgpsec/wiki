---
title: 【红队】横向移动之--内网信息收集
---
>  **信息收集的深度，直接关系到内网渗透测试结果的成败** 

**进入内网后，红队专家一般会在本机以及内部网络 开展进一步信息收集和情报刺探工作。**

包括收集当前 计算机的网络连接、进程列表、命令执行历史记录、 数据库信息、当前用户信息、管理员登录信息、总结 密码规律、补丁更新频率等信息；

同时对内网的其他 计算机或服务器的IP、主机名、开放端口、开放服务、 开放应用等情况进行情报刺探。

再利用内网计算机、 服务器不及时修复漏洞、不做安全防护、同口令等弱 点来进行横向渗透扩大战果。

对于含有域的内网，红队专家会在扩大战果的同时 去寻找域管理员登录的蛛丝马迹。

一旦发现某台服务 器有域管理员登录，就可以利用Mimikatz等工具去尝 试获得登录账号密码明文，或者Hashdump工具去导出 NTLM哈希，继而实现对域控服务器的渗透控制。

在内网漫游过程中，红队专家会重点关注邮件服务 器权限、OA系统权限、版本控制服务器权限、集中运维管理平台权限、统一认证系统权限、域控权限等位 置，尝试突破核心系统权限、控制核心业务、获取核心数据，最终完成目标突破工作。

# 本机信息收集

**用户权限**

```bash
whoami /all    
#查当前用户在目标系统中的具体权限

query user   
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
#查看系统的基本信息（系统版本、软件及补丁的安装情况）

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

net statistics workstation
#查看主机开机时间
```

**网络信息**

```bash
netstat -ano
#查看本机所有的tcp,udp端口连接及其对应的pid

netstat -anob   
#查看本机所有的tcp,udp端口连接,pid及其对应的发起程序

net share
#查看本机共享列表，和可访问的域共享列表

wmic share get name,path,status
#利用wmic查找共享列表

route print
arp -a
#查看路由表和arp缓存

REG QUERY "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
#查看代理配置情况
```

 wmic，Windows管理工具，提供了从命令行接口和批命令脚本执行系统管理的支持。自xp之后系统自带 

**防火墙的信息和配置（配置防火墙需要管理员权限）**

```bash
netsh advfirewall firewall    
#查看防火墙配置

netsh firewall set opmode disable
#关闭防火墙，Server 2003及之前的版本

netsh advfirewall set allprofiles state off
#关闭防火墙，Server 2003之后的版本

netsh firewall add allowedprogram c:\nc.exe "allow nc" enable
#Server 2003及之前的版本允许指定程序的全部连接

#Server 2003之后的版本
#允许入站
netsh advfirewall firewall add rule name="pass nc" dir=in action=allow program="c:\nc.exe"

#允许出站
netsh advfirewall firewall add rule name="Allow nc" dir=out action=allow program="c:\nc.exe"

#3389端口放行
netsh advfirewall firewall add rule name="remote Desktop" protocol=TCP dir=in localport=3389 action=allow

#自定义防火墙日志存储位置
netsh advfirewall set currentprofile logging filename "c:\windows\temp\fw.log"
```

**操作当前机器的远程桌面连接服务（开启和关闭rdp，需要管理员权限）**

```bash
wmic RDTOGGLE WHERE ServerName='%COMPUTERNAME%' call SetAllowTSConnections 1    
#开启

wmic RDTOGGLE WHERE ServerName='%COMPUTERNAME%' call SetAllowTSConnections 0    
#关闭

#下边的命令查询RDP服务的端口，返回一个十六进制的端口
REG QUERY "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" /V PortNumber
```

# 主机发现

**基于ARP**

 arp可以轻易bypass掉各类应用层防火墙，除非是专业的arp防火墙 

```bash
sudo netdiscover -r 192.168.2.0/16 -i eth0 
#Linux下推荐使用，kali自带，通过端口转发或边界代理

arp-scan.exe -t 192.168.2.0/24
#Windows下推荐使用，上传到目标主机
```

 arp-scan.exe下载地址：https://github.com/QbsuranAlang/arp-scan-windows-  

**基于ICMP**

```bash
for /L %I in (1,1,254) DO @ping -w 1 -n 1 192.168.2.%I | findstr "TTL="
```

**SPN扫描服务**

每个重要的服务在域中都有对用的SPN，所以不必使用端口扫描，只需利用SPN扫描就能找到大部分应用服务器

```bash
#查看当前域内的所有SPN（系统命令）
setspn -q */*
```

使用PowerShell-AD-Recon脚本

PowerShell-AD-Recon：https://github.com/PyroTek3/PowerShell-AD-Recon 

```bash
powershell -nop -exec bypass -c "& {Import-Module '.\Discover-PSInterestingServices.ps1';Discover-PSInterestingServices}"
```

**nmap端口扫描（上边界代理）**

一般前边的方法能用，就不用代理扫

如果上代理扫没被封`IP`的话可以尝试`Goby`资产梳理一波（谨慎使用）

```bash
proxychains nmap -T4 -A 10.1.1.0/24
```

**基于MSF的服务发现（上代理）**

```bash
#ARP
auxiliary/scanner/discovery/arp_sweep

#UDP
auxiliary/scanner/discovery/udp_sweep

#HTTP服务发现
auxiliary/scanner/http/http_version

#SMB服务发现
use auxiliary/scanner/smb/smb_version
```

**寻找原则：尽量不做大规模扫描（防止被踢出内网）**

1. Hosts文件（看域名绑定）
2. 各类history
   1. Bash
   2. ssh know_hosts
   3. 浏览器历史  https://xenarmor.com/password-secrets-of-popular-web-browsers/ 
3. 各类配置文件
   1. Zabbix（找到server位置，用默认密码去碰内网设备）
   2. 主机edr配置文件
4. PAC列表（Windows上代理出网，里面会写全内网所有主机域名）
5. DNS查询
   1. 直接指定DNS服务器为内网DNS，通过域名爆破工具查询
   2. 域传送在内网很常见
6. arp表（周围存活主机）

# 域信息收集

**判断主域（定位域控）**

原理：域服务器通常会同时作为时间服务器使用

```bash
net time /domain
```

**域基本信息查询**

```bash
net view /domain            #查询所有域
net view /domain:WINTRYSEC  #查询域内所有主机
net group /domain           #查询域内所有用户组
net group "domain computers" /domain  #查询域成员计算机列表
net accounts /domain        #获取域密码策略
nltest /domain_trusts       #获取域信任信息
```

**获取域内用户和管理员信息**

```bash
net user /domain                     #查询域内用户列表（需要使用域账户查询）
net group "domain admins" /domain    #查询域管理员用户（需要使用域账户查询）
```

**定位域管理员**

获取域内一个支点后需要获取域管理员权限。

域管理员有其它域成员主机的本地系统管理员权限，具备完全控制权。

推荐使用**`Empire`**的**`user_hunter`**模块

```bash
usemodule situational_awareness/network/powerview/user_hunterexecute
#可以清楚的看到哪个用户登录了哪个主机
```
