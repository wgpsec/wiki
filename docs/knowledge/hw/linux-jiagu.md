---
title: 【蓝队】Linux安全加固
---
# Linux安全加固
# 账号和口令

## 1.1 禁用或删除无用账号

减少系统无用账号，降低安全风险。

**操作步骤**

- 使用命令 `userdel <用户名>` 删除不必要的账号。
- 使用命令 `passwd -l <用户名>` 锁定不必要的账号。
- 使用命令 `passwd -u <用户名>` 解锁必要的账号。

## 1.2 检查特殊账号

检查是否存在空口令和root权限的账号。

**操作步骤**

1. 查看空口令和root权限账号，确认是否存在异常账号：
   - 使用命令 `awk -F: '($2=="")' /etc/shadow` 查看空口令账号。
   - 使用命令 `awk -F: '($3==0)' /etc/passwd` 查看UID为零的账号。
2. 加固空口令账号：
   - 使用命令 `passwd <用户名>` 为空口令账号设定密码。
   - 确认UID为零的账号只有root账号。

## 1.3 添加口令策略

加强口令的复杂度等，降低被猜解的可能性。

**操作步骤**

1. 使用命令

   ```bash
   vi /etc/login.defs
   ```

   修改配置文件。

   - `PASS_MAX_DAYS 90 #新建用户的密码最长使用天数`
   - `PASS_MIN_DAYS 0 #新建用户的密码最短使用天数`
   - `PASS_WARN_AGE 7 #新建用户的密码到期提前提醒天数`

2. 使用chage命令修改用户设置。
   例如，`chage -m 0 -M 30 -E 2000-01-01 -W 7 <用户名>`表示将此用户的密码最长使用天数设为30，最短使用天数设为0，密码2000年1月1日过期，过期前七天警告用户。

3. 设置连续输错三次密码，账号锁定五分钟。使用命令 `vi /etc/pam.d/common-auth`修改配置文件，在配置文件中添加 `auth required pam_tally.so onerr=fail deny=3 unlock_time=300`。

## 1.4 限制用户su

限制能su到root的用户。

**操作步骤**

使用命令 `vi /etc/pam.d/su`修改配置文件，在配置文件中添加行。例如，只允许test组用户su到root，则添加 `auth required pam_wheel.so group=test`。

## 1.4 禁止root用户直接登录

限制root用户直接登录。

**操作步骤**

1. 创建普通权限账号并配置密码,防止无法远程登录;
2. 使用命令 `vi /etc/ssh/sshd_config`修改配置文件将PermitRootLogin的值改成no，并保存，然后使用`service sshd restart`重启服务。

# 服务

## 2.1 关闭不必要的服务

关闭不必要的服务（如普通服务和xinetd服务），降低风险。

**操作步骤**

使用命令`systemctl disable <服务名>`设置服务在开机时不自动启动。

**说明**： 

对于部分老版本的Linux操作系统（如CentOS 6），可以使用命令`chkconfig --level  <服务名> off`

设置服务在指定init级别下开机时不自动启动。

## 2.2 SSH服务安全

对SSH服务进行安全加固，防止暴力破解成功。

**操作步骤**

使用命令 `vim /etc/ssh/sshd_config` 编辑配置文件。

- 不允许root账号直接登录系统。
  设置 PermitRootLogin 的值为 no。
- 修改SSH使用的协议版本。
  设置 Protocol 的版本为 2。
- 修改允许密码错误次数（默认6次）。
  设置 MaxAuthTries 的值为 3。

配置文件修改完成后，重启sshd服务生效。

# 文件系统

## Linux文件系统文件格式分类

```bash
df -T	#查看已经挂载的分区和文件系统类型
```

#### **常见的文件系统有：**

> **ext4**：4级扩展文件系统，启动快，文件易恢复；
>
> **ReiserFS**：日志型文件系统，效率高；
>
> **NTF**：网络文件系统，一种分布式文件系统，不同机器能共享文件
>
> **tmpfs**：临时文件系统，是一种基于内存的文件系统 
>
> **xfs**：一种高性能日志系统

#### **常见文件格式有：**

```bash
file *	#查看文件详细信息，格式类型
```

>  **ASCII text**	  纯文本文件
>
> **binary(ELF)**	二进制文件
>
> **data**	数据文件
>
> **directory**	目录文件
>
> **symbolic link**	链接文件
>
> **block special**	块设备文件( 硬盘 )
>
> **character special**	字符设备文件（即串行端口的接口设备，例如键盘、鼠标 ）
>
> **socket**	套接字文件（ 通常用在网络数据连接 ）

**检查系统中存在的 SUID 和 SGID 程序**

```bash
find / -perm +6000
```

## 3.1 设置umask值

设置默认的umask值，增强安全性。

**操作步骤**

使用命令 `vi /etc/profile` 修改配置文件，添加行 `umask 027`， 即新创建的文件属主拥有读写执行权限；

同组用户拥有读和执行权限，其他用户无权限。

## 3.2 设置登录超时

设置系统登录后，连接超时时间，增强安全性。

**操作步骤**

使用命令 `vi /etc/profile` 修改配置文件，将以 `TMOUT=` 开头的行注释，设置为`TMOUT=180`，即超时时间为三分钟。

# 日志

## 4.1 syslogd日志

启用日志功能，并配置日志记录。

**操作步骤**

Linux系统默认启用以下类型日志：

- 系统日志（默认）/var/log/messages
- cron日志（默认）/var/log/cron
- 安全日志（默认）/var/log/secure

**注意**：

> 部分系统可能使用syslog-ng日志，配置文件为：/etc/syslog-ng/syslog-ng.conf，可以根据需求配置详细日志。
>

日志默认存放位置：/var/log/

查看日志配置情况：more /etc/rsyslog.conf

|     日志文件      |                             说明                             |
| :---------------: | :----------------------------------------------------------: |
|   /var/log/cron   |                  记录系统定时任务相关的日志                  |
| /var/log/messages |   记录Linux操作系统常见的系统和服务错误信息(首要检查对象)    |
|   /var/log/btmp   |   记录**错误登录（登陆失败）**日志；使用**lastb**命令查看    |
| /var/log/lastlog  | 记录系统中所有用户最后一次成功登录时间，使用**lastlog**命令查看 |
|   /var/log/wtmp   | 永久记录所有用户的登录、注销信息，同时记录系统的启动、重启、关机事件；用**last**命令来查看 |
|   /var/log/utmp   | 只记录**当前登录用户**的信息；使用**w,who,users**等命令来查询 |
|  /var/log/secure  | 记录验证和授权方面的信息，如SSH登录，su切换用户，sudo授权，甚至添加用户和修改用户密码 |

### var/log/syslog：

**只记录警告信息，常常是系统出问题的信息；**

> syslog是Linux系统默认的日志守护进程
>
> 默认的syslog配置文件是/etc/sysctl.conf文件
>
> **syslog不可以使用vi等工具直接查看，它是二进制文件，使用 lastlog 查看**

默认Centos，Fedora不生成该日志文件，但可以配置让系统生成该日志文件

`/etc/rsyslog.conf`文件中加上：`*.warning /var/log/syslog` 

该日志文件能记录当用户登录时login记录下的错误口令、Sendmail的问题、su命令执行失败等信息 

**正确清空syslog日志的方式**

```bash
cat /dev/null > /etc/init.d/syslog
```

## 4.2 记录所有用户的登录和操作日志

通过脚本代码实现记录所有用户的登录操作日志，防止出现安全事件后无据可查。

**操作步骤**

1. 运行 `[root@xxx /]# vim /etc/profile`打开配置文件。

2. 在配置文件中输入以下内容：

   ```bash
    history
    USER=`whoami`
    USER_IP=`who -u am i 2>/dev/null| awk '{print $NF}'|sed -e 's/[()]//g'`
    if [ "$USER_IP" = "" ]; then
    USER_IP=`hostname`
    fi
    if [ ! -d /var/log/history ]; then
    mkdir /var/log/history
    chmod 777 /var/log/history
    fi
    if [ ! -d /var/log/history/${LOGNAME} ]; then
    mkdir /var/log/history/${LOGNAME}
    chmod 300 /var/log/history/${LOGNAME}
    fi
    export HISTSIZE=4096
    DT=`date +"%Y%m%d_%H:%M:%S"`
    export HISTFILE="/var/log/history/${LOGNAME}/${USER}@${USER_IP}_$DT"
    chmod 600 /var/log/history/${LOGNAME}/*history* 2>/dev/null
   ```

3. 运行 `[root@xxx /]# source /etc/profile` 加载配置生效。
   **注意**： /var/log/history 是记录日志的存放位置，可以自定义。



> 通过上述步骤，可以在 /var/log/history 目录下以每个用户为名新建一个文件夹；
>
> 每次用户退出后都会产生以用户名、登录IP、时间的日志文件，包含此用户本次的所有操作（root用户除外）
>
> 同时，建议使用OSS服务收集存储日志。

## 4.3日志审计方法

```bash
#查询ssh登录记录
more /var/log/secure

#安装软件的日志-> Centos
more /var/log/yum.log
#安装软件的日志-> Ubuntu
more /var/log/apt/
```

# IP协议安全要求

> - 远程登录取消telnet采用ssh
> - 设置/etc/hosts.allow和deny
> - 禁止ICMP重定向
> - 禁止源路由转发
> - 防ssh破解，iptables(对已经建立的所有链接都放行，限制每分钟连接ssh的次数)+denyhost(添加ip拒绝访问)
>

# Linux密码错误锁定

设置Linux用户连续5次输入错误密码进行登陆时，自动锁定10分钟

>  Linux有一个pam_tally2.so的PAM模块，来限定用户的登录失败次数，如果次数达到设置的阈值，则锁定用户 

```bash
vim /etc/pam.d/login

#%PAM-1.0 
auth	required pam_tally2.so deny=5 ulock_time=600 even_deny_root root_unlock_time=600	#在顶部写入，否则就算锁定也能登录

#参数解释
even_deny_root	#也限制root用户；
deny			#设置普通用户和root用户连续错误登陆的最大次数，超过最大次数，则锁定该用户
unlock_time		#设定普通用户锁定后，多少时间后解锁，单位是秒；
root_unlock_time#设定root用户锁定后，多少时间后解锁，单位是秒；
```

>  此处使用的是 pam_tally2 模块，如果不支持 pam_tally2 模块可以使用 pam_tally 模块 
>
>  不同的pam版本，设置可能有所不同，具体使用方法，可以参照相关模块的使用规则 

**限制远程登录**

上边的方法只是限制了用户从tty登录，而没有限制远程登录，如果想限制远程登录，需要改SSHD文件 

```bash
 vim /etc/pam.d/sshd
 
 #%PAM-1.0
 auth	required pam_tally2.so deny=5 ulock_time=600 even_deny_root root_unlock_time=600	#同样是添加在顶部第二行
```

**查看用户登录失败次数**

```bash
cd /etc/pam.d/
pam_tally2 --user root
```

**解锁指定用户**

```bash
cd /etc/pam.d/
pam_tally2 -r -u root

#清空某一用户错误登陆次数：
pam_tally --user username --reset
```
