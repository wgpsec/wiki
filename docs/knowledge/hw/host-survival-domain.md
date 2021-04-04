---
title: 域内主机存活探测
---

# 前言

> 注：本文中的工具均来源自互联网，后门自查。工具可在pan.wgpsec.org 下载

在进入目标域后，对域内主机进行存活探测是不可或缺的一步。


## 1、ping

使用 ping 进行检测的优点是不容易触发检测规则，缺点是速度较慢，如果目标开启了禁止 ping 的策略，那这个方法就 gg 了。

### Windows

```
for /l %i in (1,1,255) do @ping 192.168.7.%i -w 1 -n 1|find /i "ttl="
```

```
C:\Users\daniel10>for /l %i in (1,1,255) do @ping 192.168.7.%i -w 1 -n 1|find /i "ttl="
来自 192.168.7.7 的回复: 字节=32 时间<1ms TTL=128
来自 192.168.7.107 的回复: 字节=32 时间=1ms TTL=64
来自 192.168.7.110 的回复: 字节=32 时间<1ms TTL=128
```

### Linux

```
for k in $( seq 1 255);do ping -c 1 192.168.7.$k|grep "ttl"|awk -F "[ :]+" '{print $4}'; done
```

```
teamssix@localhost:~#  for k in $( seq 1 255);do ping -c 1 192.168.7.$k|grep "ttl"|awk -F "[ :]+" '{print $4}'; done
192.168.7.7
192.168.7.107
192.168.7.110
```

### VBS

```
strSubNet = "192.168.7."  
Set objFSO= CreateObject("Scripting.FileSystemObject")  
Set objTS = objfso.CreateTextFile("C:\Result.txt")   
For i = 1 To 254  
strComputer = strSubNet & i  
blnResult = Ping(strComputer)  
If blnResult = True Then  
objTS.WriteLine strComputer & " is alived ! :) "  
End If  
Next   
objTS.Close  
WScript.Echo "All Ping Scan , All Done ! :) "    
Function Ping(strComputer)  
Set objWMIService = GetObject("winmgmts:\\.\root\cimv2") 
Set colItems = objWMIService.ExecQuery("Select * From Win32_PingStatus Where Address='" & strComputer & "'") 
For Each objItem In colItems  
Select case objItem.StatusCode  
Case 0  
Ping = True  
Case Else  
Ping = False  
End select  
Exit For  
Next  
End Function
```

## 2、PowerShell

### TSPingSweep

PowerShell TSPingSweep 扫描脚本下载地址：

[https://raw.githubusercontent.com/dwj7738/My-Powershell-Repository/master/Scripts/Invoke-TSPingSweep.ps1](https://raw.githubusercontent.com/dwj7738/My-Powershell-Repository/master/Scripts/Invoke-TSPingSweep.ps1)

[狼盘下载 Invoke-TSPingSweep.ps1](https://pan.wgpsec.org/d/public/4-后渗透 & 域渗透/主机发现/Invoke-TSPingSweep.ps1)

```
powershell.exe -exec bypass -Command "Import-Module ./Invoke-TSPingSweep.ps1; Invoke-TSPingSweep -StartAddress 192.168.7.1 -EndAddress 192.168.7.254 -ResolveHost -ScanPort -Port 445,135"
```

![](https://teamssix.oss-cn-hangzhou.aliyuncs.com/Snipaste_2021-02-23_21-02-52.png)

```
C:\Users\daniel10>powershell.exe -exec bypass -Command "Import-Module ./Invoke-TSPingSweep.ps1; Invoke-TSPingSweep -StartAddress 192.168.7.1 -EndAddress 192.168.7.254 -ResolveHost -ScanPort -Port 445,135"
IPAddress     HostName             Ports
---------     --------             -----
192.168.7.7   dc.teamssix.com      {445, 135}
192.168.7.107 DANIEL7.teamssix.com {445, 135}
192.168.7.110 daniel10.teamssix... {445, 135}
```

### ARPScan

PowerShell ARPScan 扫描脚本下载地址：[https://raw.githubusercontent.com/EmpireProject/Empire/master/data/module_source/situational_awareness/network/Invoke-ARPScan.ps1](https://raw.githubusercontent.com/EmpireProject/Empire/master/data/module_source/situational_awareness/network/Invoke-ARPScan.ps1)

[狼盘下载 Invoke-ARPScan.ps1](https://pan.wgpsec.org/d/public/4-后渗透 & 域渗透/主机发现/Invoke-ARPScan.ps1)

```
powershell.exe -exec bypass -Command "Import-Module ./Invoke-ARPScan.ps1; Invoke-ARPScan -CIDR 192.168.7.0/24"
```

```
C:\Users\daniel10>powershell.exe -exec bypass -Command "Import-Module ./Invoke-ARPScan.ps1; Invoke-ARPScan -CIDR 192.168.7.0/24"
MAC               Address
---               -------
16:7D:DA:D7:8F:64 192.168.7.1
00:0C:29:1D:82:CF 192.168.7.7
00:0C:29:A9:62:98 192.168.7.107
00:0C:29:DC:01:0D 192.168.7.110
00:0C:29:DC:01:0D 192.168.7.255
```

## 3、arp-scan

arp-scan 使用 ARP 协议进行探测。arp-scan Windows 下载地址：[https://github.com/QbsuranAlang/arp-scan-windows-](https://github.com/QbsuranAlang/arp-scan-windows-)

[狼盘下载](https://pan.wgpsec.org/public/4-%E5%90%8E%E6%B8%97%E9%80%8F%20&%20%E5%9F%9F%E6%B8%97%E9%80%8F/%E4%B8%BB%E6%9C%BA%E5%8F%91%E7%8E%B0/arp-scan)

```
C:\Users\daniel10>arp-scan.exe -t 192.168.7.0/24
Reply that 16:7D:DA:D7:8F:64 is 192.168.7.1 in 11.278300
Reply that 00:0C:29:1D:82:CF is 192.168.7.7 in 16.140500
Reply that 00:0C:29:A9:62:98 is 192.168.7.107 in 15.233500
Reply that 00:0C:29:DC:01:0D is 192.168.7.110 in 0.080700
Reply that 00:0C:29:DC:01:0D is 192.168.7.255 in 0.071500
```

## 4、arp-ping

Arp-ping 基于 arp 协议，它可以 “ping” 受防火墙保护的主机，下载地址：[https://www.elifulkerson.com/projects/arp-ping.php](https://www.elifulkerson.com/projects/arp-ping.php)

[狼盘下载](https://pan.wgpsec.org/d/public/4-后渗透 & 域渗透/主机发现/arp-ping.exe)

由于 arp-ping 只能一次 ping 一台主机，但在测试过程中肯定不能一台一台的 ping ，所以这里参考上面的 ping 脚本写了一个 arp-ping 循环 ping 主机的脚本。

```
for /l %i in (1,1,255) do @arp-ping.exe 192.168.7.%i -w 1 -n 1|find /i "Reply"
```

```
C:\Users\daniel10>for /l %i in (1,1,255) do @arp-ping.exe 192.168.7.%i -w 1 -n 1|find /i "Reply"
Reply that 16:7D:DA:D7:8F:64 is 192.168.7.1 in 2.233ms
Reply that 00:0C:29:A9:62:98 is 192.168.7.107 in 16.857ms
Reply that 00:0C:29:DC:01:0D is 192.168.7.110 in 0.205ms
Reply that 00:0C:29:DC:01:0D is 192.168.7.255 in 0.200ms
```

## 5、Empire

Empire 内置了arpscan 模块，该模块可利用 arp 协议对内网主机进行探测。将目标主机上线 Empire 后，使用 powershell/situational_awareness/network/arpscan 模块，设置扫描范围即可，具体如下：

```
(Empire: listeners) > agents
[*] Active agents:
 Name     La Internal IP     Machine Name      Username                Process            PID    Delay    Last Seen
 ----     -- -----------     ------------      --------                -------            ---    -----    ---------
 APDGSW9X ps 192.168.7.7     DC                *TEAMSSIX\administrator powershell         3648   5/0.0    2021-02-23 20:43:27
(Empire: agents) > usemodule powershell/situational_awareness/network/arpscan
(Empire: powershell/situational_awareness/network/arpscan) > set Agent APDGSW9X
(Empire: powershell/situational_awareness/network/arpscan) > set CIDR 192.168.7.0/24
(Empire: powershell/situational_awareness/network/arpscan) > execute
MAC               Address      
---               -------      
16:7D:DA:D7:8F:64 192.168.7.1  
00:0C:29:1D:82:CF 192.168.7.7  
00:0C:29:A9:62:98 192.168.7.107
00:0C:29:DC:01:0D 192.168.7.110
00:0C:29:1D:82:CF 192.168.7.255
```

## 6、nbtscan

nbtscan 有 Windows 和 Linux 两个版本，使用 netbios 协议扫描本地或远程 TCP/IP 网络上的开放 NetBIOS 名称服务器。

nbtscan 下载地址：[http://www.unixwiz.net/tools/nbtscan.html](http://www.unixwiz.net/tools/nbtscan.html)

[狼盘下载](https://pan.wgpsec.org/public/4-%E5%90%8E%E6%B8%97%E9%80%8F%20&%20%E5%9F%9F%E6%B8%97%E9%80%8F/%E4%B8%BB%E6%9C%BA%E5%8F%91%E7%8E%B0/nbtscan)

```
C:\Users\daniel10>nbtscan.exe 192.168.7.0/24
192.168.7.1     \DP
192.168.7.7     TEAMSSIX\DC                     SHARING DC
192.168.7.107   TEAMSSIX\DANIEL7                SHARING
*timeout (normal end of scan)
```

## 7、unicornscan

unicornscan 使用 UDP 协议，在 kali 下可以直接 apt-get 进行安装，这个使用起来感觉有点慢。

```
teamssix@localhost:~# unicornscan -mU 192.168.7.7
UDP open	          domain[   53]		from 192.168.7.7  ttl 127

teamssix@localhost:~# for k in $( seq 1 255);do unicornscan -mU 192.168.7.$k|grep "open"|awk -F "[ :]+" '{print $5}'; done
192.168.7.1
192.168.7.7
192.168.7.107
```

## 8、scanline

McAfee 出品，推荐 win 下使用（管理员执行），scanline 项目地址：[www.mcafee.com/us/downloads/free-tools/termsofuse.aspx](www.mcafee.com/us/downloads/free-tools/termsofuse.aspx)

但是项目地址的下载按钮貌似失效，其他的下载地址：[狼盘下载](https://pan.wgpsec.org/d/public/4-后渗透 & 域渗透/信息收集/端口探测/ScanLine.exe)

```
C:\Users\daniel10>scanline.exe -n 192.168.7.0-255
ScanLine (TM) 1.01
Copyright (c) Foundstone, Inc. 2002
http://www.foundstone.com
Scan of 256 IPs started at Tue Feb 23 22:07:40 2021
-------------------------------------------------------------------------------
192.168.7.7
Responded in 0 ms.
0 hops away
Responds with ICMP unreachable: No
-------------------------------------------------------------------------------
192.168.7.107
Responded in 0 ms.
0 hops away
Responds with ICMP unreachable: No
-------------------------------------------------------------------------------
192.168.7.110
Responded in 0 ms.
0 hops away
Responds with ICMP unreachable: No
-------------------------------------------------------------------------------
Scan finished at Tue Feb 23 22:07:49 2021
3 IPs and 0 ports scanned in 0 hours 0 mins 9.16 secs
```

## 9、telnet

通过 telnet 探测 445 端口或者其他端口判断主机存活。

```
for /l %a in (1,1,254) do start /min /low telnet 192.168.7.%a 445
```



## 10、tcping

tcping.exe 是一个命令行程序，其操作类似于“ping”，但它通过 TCP 工作，下载地址：[https://elifulkerson.com/projects/tcping.php](https://elifulkerson.com/projects/tcping.php)

[狼盘下载](https://pan.wgpsec.org/public/4-%E5%90%8E%E6%B8%97%E9%80%8F%20&%20%E5%9F%9F%E6%B8%97%E9%80%8F/%E4%B8%BB%E6%9C%BA%E5%8F%91%E7%8E%B0/tcping)

```
C:\Users\daniel10>tcping.exe -n 1 192.168.7.7 445

Probing 192.168.7.7:445/tcp - Port is open - time=1.719ms
Ping statistics for 192.168.7.7:445
     1 probes sent.
     1 successful, 0 failed.  (0.00% fail)
Approximate trip times in milli-seconds:
     Minimum = 1.719ms, Maximum = 1.719ms, Average = 1.719ms
```

## 11、cping

k8 团队出品，下载地址：[狼盘下载](https://pan.wgpsec.org/public/4-%E5%90%8E%E6%B8%97%E9%80%8F%20&%20%E5%9F%9F%E6%B8%97%E9%80%8F/%E4%B8%BB%E6%9C%BA%E5%8F%91%E7%8E%B0/cping3.0)

下载解压后可以看到很多个 exe 文件，其分别代表了.net 编译版本，编译版本对应系统如下：

```
XP/2003(已淘汰,用户少,使用的大部分也会装.net,因为好多app需要连驱动都要.net,具体看安装版本一般2.0)

Vista       2.0(基本上也没多少用户)
Win7/2008   2.0 3.0 3.5
Win8/2012   4.0
Win8.1      4.0 4.5
Win10/2016  4.0 4.6 (4.5未测应该也行)
```

```
C:\Users\daniel10>cping40.exe scan osver 192.168.7.1 192.168.7.255
Scan OS version
192.168.7.1---192.168.7.255

Segment: 192.168.7.0
=============================================
IP              MAC               HostName        OSver
192.168.7.7     00-0C-29-1D-82-CF dc.teamssix.com [Win 2008 R2 Datacenter 7601 SP 1]
192.168.7.110   00-0C-29-DC-01-0D daniel10.teamssix.com []
192.168.7.107   00-0C-29-A9-62-98 daniel7.teamssix.com [Win 7 Professional 7601 SP 1]
=============================================
Count:3
```

## 12、fscan

影舞者大佬写的一款工具，使用起来感觉很是方便，工具下载地址：[https://github.com/shadow1ng/fscan](https://github.com/shadow1ng/fscan)

[狼盘下载](https://pan.wgpsec.org/public/4-%E5%90%8E%E6%B8%97%E9%80%8F%20&%20%E5%9F%9F%E6%B8%97%E9%80%8F/%E4%BF%A1%E6%81%AF%E6%94%B6%E9%9B%86/%E7%AB%AF%E5%8F%A3%E6%8E%A2%E6%B5%8B/fscan)

```
C:\Users\daniel10>fscan.exe -h 192.168.7.1-255 -p 22,445
   ___                              _
  / _ \     ___  ___ _ __ __ _  ___| | __
 / /_\/____/ __|/ __| '__/ _` |/ __| |/ /
/ /_\\_____\__ \ (__| | | (_| | (__|   <
\____/     |___/\___|_|  \__,_|\___|_|\_\
                     fscan version: 1.5.1
scan start
(icmp) Target '192.168.7.7' is alive
(icmp) Target '192.168.7.110' is alive
(icmp) Target '192.168.7.107' is alive
icmp alive hosts len is: 3
192.168.7.110:445 open
192.168.7.7:445 open
192.168.7.107:445 open
192.168.7.110 CVE-2020-0796 SmbGhost Vulnerable
192.168.7.110  (Windows 10 Pro 18363)
[+] 192.168.7.7 MS17-010        (Windows Server 2008 R2 Datacenter 7601 Service Pack 1)
[+] 192.168.7.107       MS17-010        (Windows 7 Professional 7601 Service Pack 1)
scan end

```

## 13、Nmap

提到扫描自然不能少了 nmap，nmap 支持多种协议的扫描，具体如下：

```
ARP 扫描：			nmap -PR -sn 192.168.7.0/24
ICMP 扫描：		nmap ‐sP ‐PI 192.168.7.0/24 ‐T4
ICMP 扫描：		nmap ‐sn ‐PE ‐T4 192.168.7.0/24
SNMP 扫描：		nmap -sU --script snmp-brute 192.168.7.0/24 -T4
UDP 扫描：			nmap -sU -T5 -sV --max-retries 1 192.168.7.7 -p 500
NetBIOS 扫描：	nmap --script nbstat.nse -sU -p137 192.168.7.0/24 -T4
SMB 扫描：			nmap ‐sU ‐sS ‐‐script smb‐enum‐shares.nse ‐p 445 192.168.7.0/24
……
```

## 14、MSF

除了 Nmap 之外，万能的 MSF 自然也不能少，MSF 能够进行主机存活探测的模块如下：

```
auxiliary/scanner/discovery/udp_probe
auxiliary/scanner/discovery/udp_sweep
auxiliary/scanner/discovery/arp_sweep
auxiliary/scanner/netbios/nbname
auxiliary/scanner/snmp/snmp_enum
auxiliary/scanner/smb/smb_version
……
```

除了上述工具外，还有 netdiscover、snscan 等工具可用于内网主机存活探测，在这其中有些工具因为使用起来感觉探测的不是很理想等原因，在此就不记录了，如果读者感兴趣的话可自行尝试玩玩。

参考文章：

> [https://soapffz.com/sec/21.html](https://soapffz.com/sec/21.html)
>
> [https://micro8.gitbook.io/micro8/contents-1](https://micro8.gitbook.io/micro8/contents-1)
>
> [https://www.cnblogs.com/xiaozi/p/13722474.html](https://www.cnblogs.com/xiaozi/p/13722474.html)
>
> [https://www.cnblogs.com/-mo-/p/11908260.html](https://www.cnblogs.com/-mo-/p/11908260.html)
>
> [https://blog.csdn.net/weixin_42918771/article/details/108798729](https://blog.csdn.net/weixin_42918771/article/details/108798729)
>
> [https://blog.csdn.net/qq_45366449/article/details/113650656](https://blog.csdn.net/qq_45366449/article/details/113650656)
>
> [https://pingmaoer.github.io/2020/03/30/%E5%86%85%E7%BD%91%E4%BF%A1%E6%81%AF%E6%94%B6%E9%9B%86%E4%B8%80/](https://pingmaoer.github.io/2020/03/30/%E5%86%85%E7%BD%91%E4%BF%A1%E6%81%AF%E6%94%B6%E9%9B%86%E4%B8%80/)