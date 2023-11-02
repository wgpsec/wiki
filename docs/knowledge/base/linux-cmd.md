---
title: 【操作系统】Linux基础命令
---

# Linux基础命令
```bash
pwd、cd 、ls -al、touch、mkdir
cp、mv、rm、find / -name xx* 、du(计算目录容量)
cat、more (逐页阅读,空格下一页，b返回上一页)
head -n 2 xx.txt	#查看前两行
tail -n 3 ca.*		#查看ca开头的文件的后3行
echo	#用于在shell中打印shell变量的值，或者直接输出指定的字符串
ln -s 源文件 目标文件		#(-s软链接、不可删除源文件；硬链接时，源文件只能为文件不能是目录)

wc #显示文件的行、单词、字节统计信息（-l、-w、-c）

Vim工作模式：普通模式、插入模式(i)、命令模式(:)
Vim查找替换：普通模式下-> /向下查找 ?向上查找 n跳到下一个匹配处
```

# 账户管理

```bash
id		#打印用户的UID和GID，root组的GID号是：0，bin组GID号是：1，daemon组GID号是：2，sys组GID号是：3
passwd	#后单跟用户名跟改密码
-l	#锁定用户不能跟改密码
-d	#清除用户密码
-S	#查询用户密码状态

useradd		#添加用户，-d指定家目录，-g指定主要组，-G指定次要组，-s指定缺省shell
groupadd	#添加组，-g指定组ID
usermod		#修改用户信息，-e有效期，-f宽限天数，-l账户名称，-L锁定用户，-u修改用户ID
userdel		#删除用户，-f强制删除 即使用户已登录，-r同时删除用户相关所有文件
groupdel	#删除工作组

#账户信息文件：/etc/passwd
root:x:0:0:root:/root:/bin/bash
用户名：密码：用户ID：组ID：用户说明(描述)：用户主(家)目录：缺省shell(登陆后的shell)
注意：无密码只允许本机登陆，远程不允许登陆

#账户密码文件：/etc/shadow
root:$Gs1qhL2p3ZetrE4.kMHx6qgbTcjQSt.Ft7ql1WpkopY/:16809:0:99999:7:::
用户名：加密密码：密码最后一次修改日期：两次密码的修改时间间隔：
密码有效期：密码到期的警告天数：密码过期宽限天数：账号失效时间：保留

#组账户信息文件：/etc/group
root:x:0:
组名：口令：组标识号：组内用户列表

who		#查看当前登录用户（tty本地登陆  pts远程登录）
w		#查看系统信息，想知道某一时刻用户的行为
uptime	#查看登陆多久、多少用户，负载
```



# 文件和目录权限管理

```bash
drwx-rwx-rwx #d代表目录、读、写、执行（4、2、1） -> user、group、other -> 所有者用户、组、其他用户的权限
chmod #改变文件和目录权限
chown #改变文件和目录所有者和组
chmod +x Test.sh    #增加执行权限
chmod -x Test.sh    #去除执行权限
```

# 计划任务

都是以当前用户的权限去执行计划任务的

## at一次性计划任务

需要开启`atd`服务(需要root权限)

```bash
sudo /etc/init.d/atd restart
```

**at的运行方式**

事实上我们仅使用at命令来生成所要运行的工作，并将这个工作以文本文件的方式写入/var/spool/at目录内

该工作就可以被`atd`服务取用并执行，at的实际工作情况是这样的： 

> 1：先查找`/etc/at.allow`文件，写在这个文件中的用户才可以使用at，没有在`at.allow`文件中的用户就不可以使用，即使`at.deny`中也没有
>
> 2：如果`at.allow`不存在，就查找`/etc/at.deny`，写在这个文件中的用户都不能使用at，而其他用户都可以使用at
>
> 3：如果两个文件都不存在，那么就只有root用户可以执行at

**选项参数：**

```bash
-l		#相当于atq，列出系统上该用户的所有at调度
-d		#相当于atrm，取消一个在at中调度的工作
-v		#使用较明显的时间格式列出at调度中的任务列表
-c		#查看at计划任务的具体内容，后接job名

$ at 18:00
at>sh cmd.sh
at>(输入ctrl+d)
```

## crontab 周期性计划任务

(user权限不能查看`www-data`权限的任务)

```bash
-u	#只有root用户可以执行这个任务，也即帮其他用户新建、删除任务
-e	#edit user's crontab
-l	#list user's crontab
-r	#delete user's crontab
-i	#prompt before deleting user's crontab

#================#
#======例子======#
#================#

0 12 * * * sh shell.sh
#上边这条任务代表每天12点执行一次 sh shell.sh
```

前面5个字段分别表示**分钟**，**小时**，**日期**，**月份**，**周**，后面接的是命令

| 代表意义 | 分钟 | 小时 | 日期 | 月份 | 周   | 命令         |
| -------- | ---- | ---- | ---- | ---- | ---- | ------------ |
| 数字范围 | 0-59 | 0-23 | 0-31 | 0-12 | 0-7  | 要执行的命令 |

其中周里面的0和7都代表周日，注意周与日月不可并存

**特殊字符：**

| 特殊字符  | 代表意义                                                     |
| --------- | ------------------------------------------------------------ |
| *（星号） | 任意时刻，如0 12 * * * sh `shell.sh`的*代表每个月的每个周中的每一天 |
| ,（逗号） | 代表分割时段，例如0 3,6 * * * command，表示在3点和6点时执行任务，**注意不要有空格符** |
| -（减号） | 代表时间段范围，例如在凌晨1点到6点的30分的时候执行command命令则应该是 30 1-6 * * * command |
| /n        | 表示每隔n个单位间隔执行一次的意思，*/11-23 * * * command表示凌晨1到晚上23点时间段内每隔1分钟执行一次 |

# 网络监控netstat

```bash
netstat	#打印网络连接、路由表、网络接口统计信息
-a		#显示所有socket，包括正在监听的
-n 		#使用数字形式的IP
-t 		#查看tcp连接信息
-p 		#显示进程及对应ID号

-l 		#显示正在监听的sockets接口信息
-u 		#查看udp连接信息
-s 		#显示各种协议统计信息
```

**查看当前端口连接**

```bash
netstat -antp
ss -l
```

ss的优势在于它能够显示更多更详细的有关TCP和连接状态的信息，而且比netstat更快速更高效。

# Windows平台netstat详解

> netstat 用于显示与IP 、TCP 、UDP 和ICMP 协议相关的统计数据，一般用于检验本机各端口的网络连接情况.

```bash
-a  显示所有连接和监听端口
-n  以数字形式显示地址和端口号，显示所有已建立的有效连接
-o  显示进程 PID

-p  proto ,指定协议TCP、UDP
-r  打印路由表，通route print
```

**状态列表**

```bash
LISTEN		#在监听状态中
ESTABLISHED	#已建立联机的联机情况
TIME_WAIT	#该联机在目前已经是等待的状态
CLOSE_WAIT	#被动关闭的一方，收到FIN包后，协议层回复ACK（阻塞住了）
FIN_WAIT_2	#主动关闭的一方等待对方关闭
```

**对外发包还是被连接？**
高端口连接低端口

# 进程监控 PS

```bash
#grep表示在这些里搜索，而ps aux是显示所有进程和其状态
ps aux | grep amoeba		#查到amoeba的进程
kill -s 9 pid				#杀死进程


a 	#显示现行终端机下的所有程序，包括其他用户的程序
u 　#以用户为主的格式来显示程序状况。 
x 　#显示所有程序，不以终端机来区分
```

**Linux上进程有5种状态:** 

> 1. **运行**          (正在运行或在运行队列中等待)
>
> 2. **中断**          (休眠中, 受阻, 在等待某个条件的形成或接受到信号)
>
> 3. **不可中断**   (收到信号不唤醒和不可运行, 进程必须等待直到有中断发生)
>
> 4. **僵死**          (进程已终止, 但进程描述符存在, 直到父进程调用wait4()系统调用后释放)
>
> 5. **停止**          (进程收到SIGSTOP, SIGSTP, SIGTIN, SIGTOU信号后停止运行运行)

**`ps aux`输出格式：**

```http
USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
```

**格式说明：**

> `USER`: 行程拥有者
>
> `PID: pid`
>
> `%CPU`: 占用的 CPU 使用率
>
> `%MEM`: 占用的记忆体使用率
>
> `VSZ`: 占用的虚拟记忆体大小
>
> `RSS`: 占用的记忆体大小
>
> `TTY`: 终端的次要装置号码 (minor device number of tty)
>
> `STAT`: 该行程的状态，`linux`的进程有5种状态：
>
> - D 不可中断 `uninterruptible` sleep (usually IO)
> - R 运行 runnable (on run queue)
> - S 中断 sleeping
> - T 停止 traced or stopped
> - Z 僵死 a defunct (”zombie”) process
>
> ​     注: 其它状态还包括W(无驻留页), <(高优先级进程), N(低优先级进程), L(内存锁页)
>
> START: 行程开始时间
>
> TIME: 执行的时间
>
> COMMAND:所执行的指令

# wget和curl命令

**wget**

```bash
wget命令用来从指定URL下载文件，稳定、支持断点续传。

-O  #重命名下载的文件
-c  #断点续传
```

**curl**

```bash
curl命令是一个利用URL规则在命令行下工作的文件传输工具

-O  #把服务器响应输出到指定文件
-L  #自动跳转到重定向链接
-i  #输出包含响应头的信息
-I  #仅输出响应头
-v  #显示http通信过程，包括端口连接和http request头信息
-X  #指定请求方式（GET|POST|PUT）
-H  #添加请求头（'key:value'）
-d  #指定POST请求体
```

# Linux后台执行命令

```bash
1、ctrl + z     #将一个正在前台执行的命令放到后台，并且处于暂停状态
2、bg           #将一个在后台暂停的命令，变成在后台继续执行 （配合上边的1在后台运行）
3、&            #命令后加个&符号
4、nohup ./task 
#命令前添加nohup，让程序始终在后台执行，即使关闭当前的终端也执行（用exit退出账户）
#ps查看此进程，jobs无法查看

5、jobs         #查看后台运行的命令
6、fg           #将后台中的命令调至前台继续运行
```

# 获取/proc目录信息

```bash
ls /proc	#系统信息，硬件信息，内核版本，加载的模块，进程；可以用来提升权限
```

其中的部分文件分别对应正在运行的进程，可用于访问当前进程的地址空间。

它是一个非常特殊的虚拟文件系统，其中并不包含“实际的”文件，而是可用以引用当前运行系统的系统信息，

如CPU、内存、运行时间、软件配置以及硬件配置的信息，这些信息是在内存中由系统自己产生的。

`/proc/net`   其中的文件分别表示各种网络协议（如TCP、UDP以及ARP等）的状态与统计信息。
`/proc/sys`  这个目录不仅存有各种系统信息，而且也包含系统内核与TCP/IP网络的可调参数。

其中的kernel子目录含有共享内存和消息队列的可调参数，net子目录中含有TCP/IP的各种可调参数。 

# Centos系统设置

```bash
#Centos最小化安装时没有ifconfig等命令
yum provides ifconfig 	#查看那个组件包,包含了 ifconfig 命令
yum -y install net-tools	#安装组件包

#配置静态 IP 地址并访问互联网
vi /etc/sysconfig/network-scripts/ifcfg-ens33

BOOTPROTO=dhcp/static #静态 IP
IPADDR=192.168.1.11 #本机地址
NETMASK=255.255.255.0 #子网掩码
GATEWAY=192.168.1.255 #默认网关

vi /etc/resolv.conf
nameserver 114.114.114.114	#配置DNS

service network restart 	#重启网络
```
### 防火墙 FireWall 和 SELinux 打开和关闭

```bash
firewall-cmd --state				#查看防火墙状态
systemctl start firewall.service	#开启防火墙
systemctl stop firewall.service		#停止防火墙
systemctl disable firewall.service	#禁止开机启动
```

SELinux是「Security-Enhanced Linux」的简称，是Linux的一个扩张强制访问控制安全模块

```bash
#临时关闭SELinux，1启用
setenforce 0

#永久关闭
vim /etc/selinux/config/  --> SELINUX=disabled

# SELINUX参数enforcing代表打开，disabled代表关闭
# 查看selinux状态： getenforce
```

### systemctl 命令使用详解

```bash
#列出当前系统服务的状态
systemctl list-units

#列出服务的开机状态
systemctl list-units-files

#列出指定服务的状态
systemctl status sshd

#重启服务
systemctl restart sshd

#设定指定服务开机开启
systemctl enable sshd

systemctl set-default multi-user.target		#开机不开启图形
systemctl set-default graphical.target		#开机启动图形
```

### 配置防火墙

```bash
#查询端口是否开放
firewall-cmd --query-port=80/tcp

#开放80端口
firewall-cmd --permanent --add-port=80/tcp

#移除端口
firewall-cmd --permanent --remove-port=80/tcp

#重启防火墙(修改配置后要重启防火墙)
firewall-cmd --reload

#参数解释
1、firwall-cmd：是Linux提供的操作firewall的一个工具；
2、--permanent：表示设置为持久；
3、--add-port：标识添加的端口；

#针对某个 IP开放端口
firewall-cmd --permanent --add-rich-rule="rule family="ipv4" source address="192.168.189.128" port protocol="tcp" port="80" accept"

#删除某个IP
firewall-cmd --permanent --remove-rich-rule="rule family="ipv4" source address="192.168.189.128" accept"

#针对一个ip段允许访问
firewall-cmd --permanent --add-rich-rule="rule family="ipv4" source address="192.168.0.0/16" accept"
firewall-cmd --permanent --add-rich-rule="rule family="ipv4" source address="192.168.1.0/24" port protocol="tcp" port="9200" accept"

#重启防火墙(修改配置后要重启防火墙)
firewall-cmd --reload
```

### iptables工作在TCPIP模型中的第七层，应用层

> 目前市面上比较常见的有3、4层的防火墙，叫网络层的防火墙，还有7层的防火墙，其实是代理层的网关。
>
> 
>
> 对于TCP/IP的七层模型来讲，我们知道第三层是网络层，三层的防火墙会在这层对源地址和目标地址进行检测。
>
> 但是对于七层的防火墙，不管你源端口或者目标端口，源地址或者目标地址是什么，都将对你所有的东西进行检查。
>
> 
>
> 所以，对于设计原理来讲，七层防火墙更加安全，但是这却带来了效率更低。
>
> 所以市面上通常的防火墙方案，都是两者结合的。
>
> 
>
> 而又由于我们都需要从防火墙所控制的这个口来访问
>
> 所以防火墙的工作效率就成了用户能够访问数据多少的一个最重要的控制
>
> 配置的不好甚至有可能成为流量的瓶颈。

附：[Linux命令手册](https://www.linuxcool.com/)