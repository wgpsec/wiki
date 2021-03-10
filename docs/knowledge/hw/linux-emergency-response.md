---
title: 【防守方】Linux应急响应
---

## 账号安全

先查看基础用户信息文件(/etc/passwd，/etc/shadow，/etc/group)

```bash
1、查询特权用户特权用户(uid 为0)
awk -F: '$3==0{print $1}' /etc/passwd

2、查询可以远程登录的帐号信息
awk '/\$1|\$6/{print $1}' /etc/shadow

3、除root帐号外，其他帐号是否存在sudo权限。如非管理需要，普通帐号应删除sudo权限
more /etc/sudoers | grep -v "^#\|^$" | grep "ALL=(ALL)"

4、禁用或删除多余及可疑的帐号
usermod -L user    #禁用帐号，帐号无法登录，/etc/shadow第二栏为!开头
userdel -r user    #将删除user用户，并且将/home目录下的user目录一并删除
```

## 查看历史命令

```bash
cat ~/bash_history >> history.txt
```

## 检查网络连接

```bash
netstat -antlp|more

#查看 PID 所对应的进程文件路径
file /proc/$PID/exe
```

## 检查异常进程

```bash
ps aux | grep pid
```

## 检查开机启动项

系统运行级别示意图：

| 运行级别 |                           含义                            |
| :------: | :-------------------------------------------------------: |
|    0     |                           关机                            |
|    1     | 单用户模式，可以想象为windows的安全模式，主要用于系统修复 |
|    2     |              不完全的命令行模式，不含NFS服务              |
|    3     |            完全的命令行模式，就是标准字符界面             |
|    4     |                         系统保留                          |
|    5     |                         图形模式                          |
|    6     |                          重启动                           |

```bash
#系统默认允许级别
vi  /etc/inittab
id=3：initdefault  #系统开机后直接进入哪个运行级别
```

当我们需要开机启动自己的脚本时，只需要将可执行脚本丢在`/etc/init.d`目录下，然后在`/etc/rc.d/rc*.d`中建立软链接即可 

```bash
ln -s /etc/init.d/sshd /etc/rc.d/rc3.d/S100ssh	
#S开头代表加载时自启动
```

## 检查定时任务

```bash
ls -al /var/spool/cron/* 
cat /etc/crontab
/etc/cron.d/*
/etc/cron.daily/* 
/etc/cron.hourly/* 
/etc/cron.monthly/*
/etc/cron.weekly/

#查看目录下所有文件
more /etc/cron.d/*

/etc/anacrontab
/var/spool/anacron/*
```

[anacrontab是啥](http://blog.lujun9972.win/blog/2018/04/19/%E4%BD%BF%E7%94%A8anacron%E5%AE%9A%E6%9C%9F%E6%89%A7%E8%A1%8C%E4%BB%BB%E5%8A%A1/index.html)

## 检查服务

```bash
chkconfig  --list  #查看服务自启动状态，可以看到所有的RPM包安装的服务

#源码包安装的服务位置
/user/local/
```

## 检查异常文件

> 1、查看敏感目录，如/tmp目录下的文件，同时注意隐藏文件夹，以“..”为名的文件夹具有隐藏属性
>
> 2、针对可疑文件可以使用`stat`查看创建修改时间
>
> 3、发现WebShell、远控木马的创建时间
>
> **如何找出同一时间范围内创建的文件？**
>
> ```bash
> find ./ -iname "*" -atime 1 -type f 
> #找出 ./ 下一天前访问过的文件
> ```

## 检查系统日志

日志默认存放位置：/var/log/

查看日志配置情况：more /etc/rsyslog.conf

|      日志文件      |                             说明                             |
| :----------------: | :----------------------------------------------------------: |
|   /var/log/cron    |                  记录系统定时任务相关的日志                  |
|  /var/log/message  |   记录Linux操作系统常见的系统和服务错误信息(首要检查对象)    |
|  `/var/log/btmp`   |   记录**错误登录（登陆失败）**日志；使用**lastb**命令查看    |
| `/var/log/lastlog` | 记录系统中所有用户最后一次成功登录时间，使用**lastlog**命令查看 |
|  `/var/log/wtmp`   | 永久记录所有用户的登录、注销信息，同时记录系统的启动、重启、关机事件；用**last**命令来查看 |
|   /var/log/utmp    | 只记录**当前登录用户**的信息；使用**w,who,users**等命令来查询 |
|  /var/log/secure   | 记录验证和授权方面的信息，如SSH登录，su切换用户，sudo授权，甚至添加用户和修改用户密码 |

```bash
#查询ssh登录记录
more /var/log/secure

#安装软件的日志-> Centos
/var/log/yum.log
#安装软件的日志-> Ubuntu
/var/log/apt/
```

**/var/log/syslog**：只记录警告信息，常常是系统出问题的信息；

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
