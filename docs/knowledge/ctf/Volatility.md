---
title: 【MISC】Volatility取证分析工具
---
# Volatility取证分析工具

## 关于工具

### 简单描述

Volatility是一款开源内存取证框架，能够对导出的内存镜像进行分析，通过获取内核数据结构，使用插件获取内存的详细情况以及系统的运行状态。

特点：

- 开源：Python编写，易于和基于python的主机防御框架集成。
- 支持多平台：Windows，Mac，Linux全支持
- 易于扩展：通过插件来扩展Volatility的分析能力

### 项目地址

https://github.com/volatilityfoundation/volatility

### Kali安装

```
sudo apt-get install volatility
volatility -h
# 部分报错可能kali版本过低
```



### 流程图

![](http://peiqi.tech/wgpsec-ctf/ctfwiki/wgp-misc-1-1.png)

### 常用模块

| **插件名称**        | **功能**                                                     |
| ------------------- | ------------------------------------------------------------ |
| amcache             | 查看AmCache应用程序痕迹信息                                  |
| apihooks            | 检测内核及进程的内存空间中的API hook                         |
| atoms               | 列出会话及窗口站atom表                                       |
| atomscan            | Atom表的池扫描(Pool scanner)                                 |
| auditpol            | 列出注册表HKLMSECURITYPolicyPolAdtEv的审计策略信息           |
| bigpools            | 使用BigPagePoolScanner转储大分页池(big page pools)           |
| bioskbd             | 从实时模式内存中读取键盘缓冲数据(早期电脑可以读取出BIOS开机密码) |
| cachedump           | 获取内存中缓存的域帐号的密码哈希                             |
| callbacks           | 打印全系统通知例程                                           |
| clipboard           | 提取Windows剪贴板中的内容                                    |
| cmdline             | 显示进程命令行参数                                           |
| cmdscan             | 提取执行的命令行历史记录（扫描_COMMAND_HISTORY信息）         |
| connections         | 打印系统打开的网络连接(仅支持Windows XP 和2003)              |
| connscan            | 打印TCP连接信息                                              |
| consoles            | 提取执行的命令行历史记录（扫描_CONSOLE_INFORMATION信息）     |
| crashinfo           | 提取崩溃转储信息                                             |
| deskscan            | tagDESKTOP池扫描(Poolscaner)                                 |
| devicetree          | 显示设备树信息                                               |
| dlldump             | 从进程地址空间转储动态链接库                                 |
| dlllist             | 打印每个进程加载的动态链接库列表                             |
| driverirp           | IRP hook驱动检测                                             |
| drivermodule        | 关联驱动对象至内核模块                                       |
| driverscan          | 驱动对象池扫描                                               |
| dumpcerts           | 提取RAS私钥及SSL公钥                                         |
| dumpfiles           | 提取内存中映射或缓存的文件                                   |
| dumpregistry        | 转储内存中注册表信息至磁盘                                   |
| editbox             | 查看Edit编辑控件信息 (Listbox正在实验中)                     |
| envars              | 显示进程的环境变量                                           |
| eventhooks          | 打印Windows事件hook详细信息                                  |
| evtlogs             | 提取Windows事件日志（仅支持XP/2003)                          |
| filescan            | 提取文件对象（file objects）池信息                           |
| gahti               | 转储用户句柄（handle）类型信息                               |
| gditimers           | 打印已安装的GDI计时器(timers)及回调(callbacks)               |
| gdt                 | 显示全局描述符表(Global Deor Table)                          |
| getservicesids      | 获取注册表中的服务名称并返回SID信息                          |
| getsids             | 打印每个进程的SID信息                                        |
| handles             | 打印每个进程打开的句柄的列表                                 |
| hashdump            | 转储内存中的Windows帐户密码哈希(LM/NTLM)                     |
| hibinfo             | 转储休眠文件信息                                             |
| hivedump            | 打印注册表配置单元信息                                       |
| hivelist            | 打印注册表配置单元列表                                       |
| hivescan            | 注册表配置单元池扫描                                         |
| hpakextract         | 从HPAK文件（Fast Dump格式）提取物理内存数据                  |
| hpakinfo            | 查看HPAK文件属性及相关信息                                   |
| idt                 | 显示中断描述符表(Interrupt Deor Table)                       |
| iehistory           | 重建IE缓存及访问历史记录                                     |
| imagecopy           | 将物理地址空间导出原生DD镜像文件                             |
| imageinfo           | 查看/识别镜像信息                                            |
| impscan             | 扫描对导入函数的调用                                         |
| joblinks            | 打印进程任务链接信息                                         |
| kdbgscan            | 搜索和转储潜在KDBG值                                         |
| kpcrscan            | 搜索和转储潜在KPCR值                                         |
| ldrmodules          | 检测未链接的动态链接DLL                                      |
| lsadump             | 从注册表中提取LSA密钥信息（已解密）                          |
| machoinfo           | 转储Mach-O 文件格式信息                                      |
| malfind             | 查找隐藏的和插入的代码                                       |
| mbrparser           | 扫描并解析潜在的主引导记录(MBR)                              |
| memdump             | 转储进程的可寻址内存                                         |
| memmap              | 打印内存映射                                                 |
| messagehooks        | 桌面和窗口消息钩子的线程列表                                 |
| mftparser           | 扫描并解析潜在的MFT条目                                      |
| moddump             | 转储内核驱动程序到可执行文件的示例                           |
| modscan             | 内核模块池扫描                                               |
| modules             | 打印加载模块的列表                                           |
| multiscan           | 批量扫描各种对象                                             |
| mutantscan          | 对互斥对象池扫描                                             |
| notepad             | 查看记事本当前显示的文本                                     |
| objtypescan         | 扫描窗口对象类型对象                                         |
| patcher             | 基于页面扫描的补丁程序内存                                   |
| poolpeek            | 可配置的池扫描器插件                                         |
| printkey            | 打印注册表项及其子项和值                                     |
| privs               | 显示进程权限                                                 |
| procdump            | 进程转储到一个可执行文件示例                                 |
| pslist              | 按照EPROCESS列表打印所有正在运行的进程                       |
| psscan              | 进程对象池扫描                                               |
| pstree              | 以树型方式打印进程列表                                       |
| psxview             | 查找带有隐藏进程的所有进程列表                               |
| qemuinfo            | 转储Qemu 信息                                                |
| raw2dmp             | 将物理内存原生数据转换为windbg崩溃转储格式                   |
| screenshot          | 基于GDI Windows的虚拟屏幕截图保存                            |
| servicediff         | Windows服务列表(ala Plugx)                                   |
| sessions            | _MM_SESSION_SPACE的详细信息列表(用户登录会话)                |
| shellbags           | 打印Shellbags信息                                            |
| shimcache           | 解析应用程序兼容性Shim缓存注册表项                           |
| shutdowntime        | 从内存中的注册表信息获取机器关机时间                         |
| sockets             | 打印已打开套接字列表                                         |
| sockscan            | TCP套接字对象池扫描                                          |
| ssdt                | 显示SSDT条目                                                 |
| strings             | 物理到虚拟地址的偏移匹配(需要一些时间，带详细信息)           |
| svcscan             | Windows服务列表扫描                                          |
| symlinkscan         | 符号链接对象池扫描                                           |
| thrdscan            | 线程对象池扫描                                               |
| threads             | 调查_ETHREAD 和_KTHREADs                                     |
| timeliner           | 创建内存中的各种痕迹信息的时间线                             |
| timers              | 打印内核计时器及关联模块的DPC                                |
| truecryptmaster     | 恢复TrueCrypt 7.1a主密钥                                     |
| truecryptpassphrase | 查找并提取TrueCrypt密码                                      |
| truecryptsummary    | TrueCrypt摘要信息                                            |
| unloadedmodules     | 打印卸载的模块信息列表                                       |
| userassist          | 打印注册表中UserAssist相关信息                               |
| userhandles         | 转储用户句柄表                                               |
| vaddump             | 转储VAD数据为文件                                            |
| vadinfo             | 转储VAD信息                                                  |
| vadtree             | 以树形方式显示VAD树信息                                      |
| vadwalk             | 显示遍历VAD树                                                |
| vboxinfo            | 转储Virtualbox信息（虚拟机）                                 |
| verinfo             | 打印PE镜像中的版本信息                                       |
| vmwareinfo          | 转储VMware VMSS/VMSN 信息                                    |
| volshell            | 内存镜像中的shell                                            |
| windows             | 打印桌面窗口(详细信息)                                       |
| wintree             | Z顺序打印桌面窗口树                                          |
| wndscan             | 池扫描窗口站                                                 |
| yarascan            | 以Yara签名扫描进程或内核内存                                 |

### 常用命令

| **功能**              | **命令行及参数**                                             |
| --------------------- | ------------------------------------------------------------ |
| 查看进程列表          | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 pslist      |
| 查看进程列表（树形）  | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 pstree      |
| 查看进程列表(psx视图) | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 psxview     |
| 查看网络通讯连接      | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 netscan     |
| 查看加载的动态链接库  | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 dlllist     |
| 查看SSDT表            | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 ssdt        |
| 查看UserAssist痕迹    | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 userassist  |
| 查看ShimCache痕迹     | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 shimcache   |
| 查看ShellBags         | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 shellbags   |
| 查看服务列表          | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 svcscan     |
| 查看Windows帐户hash   | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 hashdump    |
| 查看最后关机时间      | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 shutdowntime |
| 查看IE历史记录        | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 iehistory   |
| 提取注册表数据        | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 dumpregistry |
| 解析MFT记录           | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 mftparser   |
| 导出MFT记录,恢复文件  | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 mftparser –output-file=mftverbose.txt -D mftoutput |
| 获取TrueCrypt密钥信息 | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 truecryptmaster |
| 获取TrueCrypt密码信息 | Vol.exe -f Win7_SP1_x86.vmem –profile=Win7SP1x86 truecryptpassphras |

## 参考文章

[DumpIt.exe 进程](http://www.secist.com/archives/2076.html)

[Volatility基本介绍](https://www.freebuf.com/articles/system/26763.html)

[基本命令](https://www.cnblogs.com/sesefadou/p/11804566.html)

[组合命令](https://blog.csdn.net/Kevinhanser/article/details/80013033?utm_source=blogxgwz5)

[进阶命令](https://www.cnblogs.com/0x4D75/p/11161822.html)

[基础题型和基本取证](https://cloud.tencent.com/developer/article/1378638)

[利用Volatility进行Windows内存取证分析](https://www.freebuf.com/sectool/124690.html)

[windows取证](https://www.sohu.com/a/350272484_100124117)

[内存取证](https://blog.csdn.net/cqupt_chen/article/details/7771417)

## 从题目学习Volatility取证

### 四川省高校CTF大赛[安恒杯] - Play with Cookie

文件描述：得到了master key file 的和靶机镜像文件，需要找到里面的flag

#### 了解基本架构

```shell
sudo volatility -f Cookie.raw imageinfo
```

![](http://peiqi.tech/ctfbisai/sichun-ctf/sichun-ctf-1.jpg)

得到的关键信息 

```
Win7SP1x86
mage date and time : 2020-02-11 12:11:51 UTC+0000
```

关键看Suggested Profile(s)项，这里是工具判断该镜像的架构，同时也会提供相应架构的命令用于分析该镜像，本题中可能性最大的架构是Win7SP1x86，然后在调用命令时加上--profile=Win7SP1x86就可以了

#### 敏感信息获取

`获取所有使用的进程号的信息`

```shell
sudo volatility -f Cookie.raw --profile=Win7SP1x86 pslist　> pslist.txt　
```

![](http://peiqi.tech/ctfbisai/sichun-ctf/sichun-ctf-2.jpg)

`查看一下是否含有flag文件`

```
volatility -f Cookie.raw --profile=Win7SP1x86 filescan | grep "doc|docx|rtf"
```

```
volatility -f Cookie.raw --profile=Win7SP1x86 filescan | grep "jpg|jpeg|png|tif|gif|bmp"
```

```
volatility -f Cookie.raw --profile=Win7SP1x86 filescan | grep 'flag|ctf'
```

```
volatility -f Cookie.raw --profile=Win7SP1x86 filescan | grep "Desktop"
```

```shell
C:\home\kali\桌面> volatility -f Cookie.raw --profile=Win7SP1x86 filescan | grep "Desktop"
Volatility Foundation Volatility Framework 2.6
0x000000003e423038      1      0 R--rwd \Device\HarddiskVolume1\Users\Cookie\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Accessories\Accessibility\Desktop.ini
0x000000003e486038      1      0 R--rwd \Device\HarddiskVolume1\Users\Cookie\Desktop\desktop.ini
0x000000003e4ebb08      1      0 R--rwd \Device\HarddiskVolume1\Users\Public\Desktop\desktop.ini
0x000000003e51c3a0      1      0 R--rwd \Device\HarddiskVolume1\ProgramData\Microsoft\Windows\Start Menu\Programs\Accessories\System Tools\Desktop.ini
0x000000003e5789e0      1      1 R--rw- \Device\HarddiskVolume1\Users\Cookie\Desktop
0x000000003e5f1668      2      1 R--rwd \Device\HarddiskVolume1\Users\Cookie\Desktop
0x000000003e628400      1      0 R--rwd \Device\HarddiskVolume1\Users\root\AppData\Roaming\Microsoft\Windows\SendTo\Desktop.ini
0x000000003e663160      1      0 R--rwd \Device\HarddiskVolume1\Windows\assembly\Desktop.ini
0x000000003e66a228      1      1 RW-rw- \Device\HarddiskVolume1\Users\Cookie\Desktop\WIN-I0396FOVLRF-20200211-121148.raw
0x000000003e671d28      8      0 R--r-d \Device\HarddiskVolume1\Users\Cookie\Desktop\DumpIt.exe
0x000000003e69ef80      1      0 R--rwd \Device\HarddiskVolume1\ProgramData\Microsoft\Windows\Start Menu\Programs\Accessories\Accessibility\Desktop.ini
0x000000003e6a9d28      2      1 R--rwd \Device\HarddiskVolume1\Users\Public\Desktop
0x000000003e6aacb8      1      0 R--rwd \Device\HarddiskVolume1\ProgramData\Microsoft\Windows\Start Menu\Programs\Accessories\Desktop.ini
0x000000003e6ff950      8      0 R--r-d \Device\HarddiskVolume1\Users\Cookie\Desktop\DumpIt.exe
0x000000003e70d308      1      0 R--rwd \Device\HarddiskVolume1\Windows\Media\Desktop.ini
0x000000003e73af80      1      0 R--rwd \Device\HarddiskVolume1\Users\Cookie\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Maintenance\Desktop.ini
0x000000003e90e718      1      0 R--rwd \Device\HarddiskVolume1\Users\Cookie\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Accessories\System Tools\Desktop.ini
0x000000003e919910      1      0 R--rwd \Device\HarddiskVolume1\Users\Cookie\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Accessories\Desktop.ini
0x000000003e93f578      1      0 R--rwd \Device\HarddiskVolume1\ProgramData\Microsoft\Windows\Start Menu\Programs\Accessories\Tablet PC\Desktop.ini
0x000000003e95bc98      1      0 R--rwd \Device\HarddiskVolume1\ProgramData\Microsoft\Windows\Start Menu\Programs\Maintenance\Desktop.ini
0x000000003eb33bc8      2      1 R--rwd \Device\HarddiskVolume1\Users\Cookie\Desktop
0x000000003f3f55c0      2      1 R--rwd \Device\HarddiskVolume1\Users\Public\Desktop
0x000000003f9871d8      1      0 R--rwd \Device\HarddiskVolume1\Users\root\Desktop\desktop.ini
0x000000003fca7630      1      0 R--rwd \Device\HarddiskVolume1\Users\Cookie\AppData\Roaming\Microsoft\Windows\SendTo\Desktop.ini
```

这是查看raw文件中的桌面文件，没有得到有用的信息，只得知了是Cookie用户

`查看一下他的电脑截图`

```shell
volatility -f Cookie.rwa --profile=Win7SP1x86 screenshot --dump-dir=./
```

![](http://peiqi.tech/ctfbisai/sichun-ctf/sichun-ctf-3.jpg)

只得到了一个页面信息，提示正在使用的进程是DUMpit.exe

`看一下用户信息`

```shell
volatility -f Cookie.raw --profile=Win7SP1x86 printkey -K "SAM\Domains\Account\Users\Names"
```

![](http://peiqi.tech/ctfbisai/sichun-ctf/sichun-ctf-4.jpg)

只有基本的几个用户

`看一下他的命令行输出了什么`

```shell
volatility -f Cookie.raw --profile=Win7SP1x86 cmdline
```

![](http://peiqi.tech/ctfbisai/sichun-ctf/sichun-ctf-5.jpg)

可以看到一些cmd信息和进程号

```
Volatility Foundation Volatility Framework 2.6
************************************************************************
System pid:      4
************************************************************************
smss.exe pid:    272
Command line : \SystemRoot\System32\smss.exe
************************************************************************
csrss.exe pid:    360
Command line : %SystemRoot%\system32\csrss.exe ObjectDirectory=\Windows SharedSection=1024,12288,512 Windows=On SubSystemType=Windows ServerDll=basesrv,1 ServerDll=winsrv:UserServerDllInitialization,3 ServerDll=winsrv:ConServerDllInitialization,2 ServerDll=sxssrv,4 ProfileControl=Off MaxRequestThreads=16
************************************************************************
wininit.exe pid:    412
Command line : wininit.exe
************************************************************************
csrss.exe pid:    420
Command line : %SystemRoot%\system32\csrss.exe ObjectDirectory=\Windows SharedSection=1024,12288,512 Windows=On SubSystemType=Windows ServerDll=basesrv,1 ServerDll=winsrv:UserServerDllInitialization,3 ServerDll=winsrv:ConServerDllInitialization,2 ServerDll=sxssrv,4 ProfileControl=Off MaxRequestThreads=16
************************************************************************
winlogon.exe pid:    480
Command line : winlogon.exe
************************************************************************
services.exe pid:    520
Command line : C:\Windows\system32\services.exe
************************************************************************
lsass.exe pid:    528
Command line : C:\Windows\system32\lsass.exe
************************************************************************
lsm.exe pid:    536
Command line : C:\Windows\system32\lsm.exe
************************************************************************
svchost.exe pid:    636
Command line : C:\Windows\system32\svchost.exe -k DcomLaunch
************************************************************************
svchost.exe pid:    716
Command line : C:\Windows\system32\svchost.exe -k RPCSS
************************************************************************
svchost.exe pid:    808
Command line : C:\Windows\System32\svchost.exe -k LocalServiceNetworkRestricted
************************************************************************
svchost.exe pid:    844
Command line : C:\Windows\System32\svchost.exe -k LocalSystemNetworkRestricted
************************************************************************
svchost.exe pid:    876
Command line : C:\Windows\system32\svchost.exe -k netsvcs
************************************************************************
audiodg.exe pid:    956
Command line : C:\Windows\system32\AUDIODG.EXE 0x2e8
************************************************************************
svchost.exe pid:   1036
Command line : C:\Windows\system32\svchost.exe -k LocalService
************************************************************************
svchost.exe pid:   1132
Command line : C:\Windows\system32\svchost.exe -k NetworkService
************************************************************************
spoolsv.exe pid:   1280
Command line : C:\Windows\System32\spoolsv.exe
************************************************************************
svchost.exe pid:   1376
Command line : C:\Windows\system32\svchost.exe -k LocalServiceNoNetwork
************************************************************************
VGAuthService. pid:   1560
Command line : "C:\Program Files\VMware\VMware Tools\VMware VGAuth\VGAuthService.exe"
************************************************************************
vmtoolsd.exe pid:   1584
Command line : "C:\Program Files\VMware\VMware Tools\vmtoolsd.exe"
************************************************************************
svchost.exe pid:   1824
Command line : C:\Windows\system32\svchost.exe -k bthsvcs
************************************************************************
dllhost.exe pid:    128
Command line : C:\Windows\system32\dllhost.exe /Processid:{02D4B3F1-FD88-11D1-960D-00805FC79235}
************************************************************************
msdtc.exe pid:    596
Command line : C:\Windows\System32\msdtc.exe
************************************************************************
WmiPrvSE.exe pid:    920
Command line : C:\Windows\system32\wbem\wmiprvse.exe
************************************************************************
taskhost.exe pid:   2096
Command line : "taskhost.exe"
************************************************************************
dwm.exe pid:   2188
Command line : "C:\Windows\system32\Dwm.exe"
************************************************************************
explorer.exe pid:   2216
Command line : C:\Windows\Explorer.EXE
************************************************************************
vm3dservice.ex pid:   2404
Command line : "C:\Windows\System32\vm3dservice.exe" -u
************************************************************************
vmtoolsd.exe pid:   2412
Command line : "C:\Program Files\VMware\VMware Tools\vmtoolsd.exe" -n vmusr
************************************************************************
SearchIndexer. pid:   2584
Command line : C:\Windows\system32\SearchIndexer.exe /Embedding
************************************************************************
WmiPrvSE.exe pid:   2764
Command line : C:\Windows\system32\wbem\wmiprvse.exe
************************************************************************
svchost.exe pid:   3224
Command line : C:\Windows\system32\svchost.exe -k LocalServiceAndNoImpersonation
************************************************************************
sppsvc.exe pid:   3272
Command line : C:\Windows\system32\sppsvc.exe
************************************************************************
svchost.exe pid:   3344
Command line : C:\Windows\System32\svchost.exe -k secsvcs
************************************************************************
taskhost.exe pid:   2924
Command line : taskhost.exe $(Arg0)
************************************************************************
SearchProtocol pid:   3520
Command line : "C:\Windows\system32\SearchProtocolHost.exe" Global\UsGthrFltPipeMssGthrPipe5_ Global\UsGthrCtrlFltPipeMssGthrPipe5 1 -2147483646 "Software\Microsoft\Windows Search" "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT; MS Search 4.0 Robot)" "C:\ProgramData\Microsoft\Search\Data\Temp\usgthrsvc" "DownLevelDaemon" 
************************************************************************
SearchFilterHo pid:   2692
Command line : "C:\Windows\system32\SearchFilterHost.exe" 0 532 536 544 65536 540 
************************************************************************
DumpIt.exe pid:   3632
Command line : "C:\Users\Cookie\Desktop\DumpIt.exe" 
************************************************************************
conhost.exe pid:   1684
Command line : \??\C:\Windows\system32\conhost.exe
************************************************************************
dllhost.exe pid:   3552
```

也没有得到关键的信息

`看一下连接过的网络`

```shell
volatility -f Cookie.raw --profile=Win7SP1x86 netscan
```

![](http://peiqi.tech/ctfbisai/sichun-ctf/sichun-ctf-7.jpg)

看到在3分钟之后是未知的，回到进程查看一下他干了什么

```shell
sudo volatility -f Cookie.raw --profile=Win7SP1x86 pslist
```

![](http://peiqi.tech/ctfbisai/sichun-ctf/sichun-ctf-8.jpg)

```
0x87da3d40 sppsvc.exe             3272    520      4      159      0      0 2020-02-11 12:03:00 UTC+0000                                 
0x87cdbd40 svchost.exe            3344    520      9      310      0      0 2020-02-11 12:03:00 UTC+0000                                 
0x87d65030 taskhost.exe           2924    520      8      181      0      0 2020-02-11 12:09:55 UTC+0000                                 
0x87f2a550 SearchProtocol         3520   2584      7      320      0      0 2020-02-11 12:10:35 UTC+0000           
```

这一段3~9分钟之间发生了一些事情让出题人等待了一下，上网查一下这些进程的含义以及使用的用途

![](http://peiqi.tech/ctfbisai/sichun-ctf/sichun-ctf-9.jpg)

把这个位置的进程dump出来加以分析一下

```
volatility -f Cookie.raw --profile=Win7SP1x86 memdump -p 2924 --dump-dir=./
```

```
C:\home\kali\桌面> volatility -f Cookie.raw --profile=Win7SP1x86 memdump -p 2924 --dump-dir=./
Volatility Foundation Volatility Framework 2.6
************************************************************************
Writing taskhost.exe [  2924] to 2924.dmp

```

得到一个2924.dmp文件

`关键字文件查找`

```
strings 2924.dmp | grep flag{ ;strings 2924.dmp | grep DASCTF{ ;strings 2924.dmp | grep ctf{
```

```
C:\home\kali\桌面> strings 2924.dmp | grep flag{ ;strings 2924.dmp | grep DASCTF{ ;strings 2924.dmp | grep ctf{
$value = "flag{528c8870778d2336fdf512652b74a8aa}";

```

得到flag

看一下文件里面是什么

![](http://peiqi.tech/ctfbisai/sichun-ctf/sichun-ctf-10.jpg)

### [V&N2020 公开赛]内存取证

#### 查看基本文件架构

![](http://peiqi.tech/buuctf/misc/buuctf-misc-51-1.png)

#### 获取有利信息

扫描 记事本文件

```shell
kali@kali:~/桌面$ volatility -f mem.raw --profile=Win7SP0x86 filescan | grep not                                                                                                                                                           
Volatility Foundation Volatility Framework 2.6                                                                                                                                                                                             
0x000000001de89cb8      6      0 R--r-d \Device\HarddiskVolume2\Windows\System32\notepad.exe

```

dump进程查看文件，发现文件可能被删除

![](http://peiqi.tech/buuctf/misc/buuctf-misc-51-2.png)

#### 删除数据恢复

使用命令恢复数据

![](http://peiqi.tech/buuctf/misc/buuctf-misc-51-3.png)

得到百度网盘链接和提取码，下载下来一个加密文件

寻找加密进程

![](http://peiqi.tech/buuctf/misc/buuctf-misc-51-4.png)

dump进程下来 使用EFDD解密vol文件

`得到密码:uOjFdKu1jsbWI8N51jsbWI8N5`

再使用得到的密码TrueCrypt挂载上去解密

![](http://peiqi.tech/buuctf/misc/buuctf-misc-51-6.png)

得到一个加密的flag压缩包

#### GIMP还原

把 mspaint.exe (pid 2648) dump下来，使用GIMP还原

![](http://peiqi.tech/buuctf/misc/buuctf-misc-51-5.png)

`得到密码 :1YxfCQ6goYBD6Q`

打开加密zip文件得到flag

`RoarCTF{wm_D0uB1e_TC-cRypt}`