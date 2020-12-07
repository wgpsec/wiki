---
title: 【权限维持】DNS上线CS
---
## DNS上线CS
使用场景：拿了Webshell但TCP、HTTP不出网的机器，DNS可出网

## 操作步骤

1、c2服务器关闭53端口的服务

如果开着防火墙要放行53端口

```bash
lsof -i :53
systemctl stop systemd-resolved.service
```

2、在域名解析记录中，配一条A记录指向teamserver的IP

3、再配1条或多条NS记录用来做隧道，域名指向A记录（域名）

4、listener 选择Beacon DNS，DNS-Host都填NS记录

4、需要在beacon里面输入checkin命令，不然DNS服务器是不会返回激活指令的

5、破解版CS4有BUG，checkin命令无效

6、beacon出现后输入mode dns，就可以成功checkin

7、后续如果嫌A记录通信缓慢，可以再用mode dns-txt切换回来

------------

[踩坑记录-DNS Beacon](https://www.freebuf.com/articles/web/256032.html)