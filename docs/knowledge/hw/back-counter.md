---
title: 【蓝队】溯源反制
---
# 提高攻击成本，减少攻击意愿

## 部署蜜罐

如果客户购买了带有攻击者画像功能的现在蜜罐设备，那就爽歪歪了，等着上钩就行；

如果没有的话，可以自己学习一下蜜罐的知识，下边是推荐资源

[最优秀的蜜罐列表](https://github.com/paralax/awesome-honeypots/blob/master/README_CN.md)

[蜜罐技术研究小组](https://ipot.sec-wiki.com/)

请欣赏奇安信`归零Null`师傅的[MySQL蜜罐获取攻击者微信ID](https://mp.weixin.qq.com/s/m4I_YDn98K_A2yGAhv67Gg)

## 废掉攻击者的手段

**本地密码抓取的防御方法**

> 1、2012 R2之后的版本，把用户放入 ->  "受保护的用户" 的用户组，就不能抓取明文密码和散列值了。
>
> 2、安装`KB2871997`，并禁用`Administrator`账号（SID为500的账户，防止哈希传递攻击）

Windows Server 2012 之后的版本默认关闭`Wdigest`，无法从内存中获取明文密码。

2012之前的版本安装了`KB2871997`，同样无法获取明文密码。

**开启和关闭`Wdigest`的命令**

```bash
#开启，值为1
reg add HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest /v UseLogonCredential /t REG_DWORD /d 1 /f

#关闭，值为0
reg add HKLM\SYSTEM\CurrentControlSet\Control\SecurityProviders\WDigest /v UseLogonCredential /t REG_DWORD /d 0 /f
```

**Webshell管理工具（冰蝎、蚁剑、哥斯拉等）**

分析工具的流量特征，在WAF等防护设备上添加自定义规则

```bash
(uri_path * rco \.(jsp|jspx|php)$)&&(method * belong POST)&&(request_body * req ^[\w+/]{1000,}=?=?$)
```

**防御mimikatz攻击**

`mimikatz`在抓取明文密码或散列值时，需要Debug权限。

因为`mimikatz`需要和`lsass`进程进行交互，没有`Debug`权限的话`mimikatz`将不能读取`lsass`进程。

因此，将拥有Debug权限的本地管理员从`Administrators`组中删除即可。

**其它内网渗透工具**

> CobaltStrike、Metasploit等c2工具
>
> frp、nps、reGeorg、ew、Termite、lcx等通道构建工具
>
> impacket工具包
>
> **具体做法：**分析工具流量特征，在WAF等防护设备上自定义相关规则
>
> **可参考：** [加密Webshell“冰蝎” 流量 100%识别](https://xz.aliyun.com/t/7606) 

# 溯源攻击者

> 1、通过威胁情报分析，溯源IP	（微步、QAX威胁情报中心等）
>
> 2、反向渗透攻击者VPS
>
> 3、社工攻击者虚拟身份、真实身份（通过攻击者的常用shell特征、VPS地址信息、常用ID等入手）
>
> 如果能确认攻击者的邮箱或QQ等信息，社工库机器人走一波就差不多了

详细过程建议参考以下文章：

[如何通过一封恶意邮件追踪幕后黑客组织](https://paper.seebug.org/945/#357-philipbeekoohk)