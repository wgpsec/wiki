---
title: 现代密码学常识
---
# 现代密码学常识
# 密码学分类

**现代密码学主要包含以下几个方面：**

> - **对称加密**（Symmetric Cryptography），以 DES，AES，RC4 为代表。
> - **非对称加密**（Asymmetric Cryptography），以 RSA，ElGamal，椭圆曲线加密为代表。
> - **哈希函数**（Hash Function），以 MD5，SHA-1，SHA-512 等为代表。
> - **数字签名**（Digital Signature），以 RSA 签名，ElGamal 签名，DSA 签名为代表。
>

**其中，对称加密体制主要分为两种方式：**

> - **分组密码**（Block Cipher），又称为块密码。
> - **序列密码**（Stream Cipher），又称为流密码。
>

**一般来说，密码设计者的根本目标是保障信息及信息系统的**

> - 机密性（Confidentiality）
> - 完整性（Integrity）
> - 可用性（Availability）
> - 认证性（Authentication）
> - 不可否认性（Non-repudiation）
>

其中，前三者被称为信息安全的 CIA 三要素 。

而对于密码破解者来说，一般是要想办法识别出密码算法，然后进行暴力破解，或者利用密码体制的漏洞进行破解。

当然，也有可能通过构造虚假的哈希值或者数字签名来绕过相应的检测。

一般来说，我们都会假设攻击者已知待破解的密码体制，而攻击类型通常分为以下四种：

| 攻击类型     | 说明                                       |
| ------------ | ------------------------------------------ |
| 唯密文攻击   | 只拥有密文                                 |
| 已知明文攻击 | 拥有密文与对应的明文                       |
| 选择明文攻击 | 拥有加密权限，能够对明文加密后获得相应密文 |
| 选择密文攻击 | 拥有解密权限，能够对密文解密后获得相应明文 |

# DES加密原理

DES (Data Encryption Standard)，是目前最为流行的 (分组密码) 加密算法之一。

**强加密使用的基本操作-混淆与扩散**

> **混淆：**
>
> 是一种使密钥与密文之间的关系尽可能的模糊的加密操作。
> 常用的一个元素就是->替换;  
>
> 在DES和AES中都有使用
>
> **扩散：**
>
> 是一种为了隐藏明文的统计属性而将一个明文符号的影响扩散到多个密文符号的加密操作。
> 最简单的扩散元素就是->位置换;
>
> 它常用于DES中，AES用更高级的Mixcolumn操作

DES是一种使用56位密钥对64位长分组进行加密的密码 ；

56+8奇偶校验位（第8,16,24,32,40,48,56,64）= 64位的密钥对以64位为单位的块数据进行加解密 。

与所有的现代分组加密一样，DES也是一种迭代算法；
DES对明文中每个分组的加密过程都包含16轮(每轮操作相同)；
每轮都会使用不同的字密钥，所有子密钥都是从主密钥中推导而来 。

[DES加密算法详解](https://blog.csdn.net/m0_37962600/article/details/79912654)

# AES加密原理

> 高级加密标准（AES）是一个对称分组密码算法，旨在取代DES成为广泛使用的标准。
>
> 根据使用的密码长度，AES最常见的有3种方案，用以适应不同的场景要求；
>
> 分别是AES-128、AES-192和AES-256，3种的思路基本一样，只是轮数会适当增加。

**AES加密过程涉及到4种操作：**

> 字节替代（SubBytes）
>
> 行移位（ShiftRows）
>
> 列混淆（MixColumns）
>
> 轮密钥加（AddRoundKey）

解密过程分别为对应的逆操作

# RSA加密原理

> RSA算法一直是最广为使用的 "非对称加密算法"；
> 毫不夸张地说，只要有计算机网络的地方，就有RSA算法；
> 这种算法非常可靠，密钥越长，它就越难破解。

[RSA加密算法详解](http://www.ruanyifeng.com/blog/2013/07/rsa_algorithm_part_two.html)

# 加密算法实现

[python实现AES算法](https://blog.zhangkunzhi.com/2019/07/11/AES%E5%8A%A0%E5%AF%86%E4%BB%8B%E7%BB%8D/index.html)

[Python实现RSA加密算法](https://www.zhangshengrong.com/p/2Y1kJ3pXZe/)

# MD5(hash)爆破

## hashcat工具参数

```bash
-a 指定要破解的攻击模式
-m 指定要破解的hash类型，默认MD5
--force 忽略破解过程中的警告信息(单条用)
--show 显示已经破解的hash及对应明文
--help 查看帮助(更多参数自行查看)
--increment  启用增量破解模式,利用此模式让hashcat在指定的密码长度范围内执行破解过程
--increment-min  密码最小长度
--increment-max  密码最大长度
```

## 攻击模式

>  0 | Straight（字典破解）
>
>  1 | Combination（组合破解）
>
>  3 | Brute-force（掩码暴力破解）
>
>  6 | Hybrid Wordlist + Mask（字典+掩码破解）
>
>  7 | Hybrid Mask + Wordlist（掩码+字典破解）

## 掩码设置-字符集

```
?l ：表示小写字母
?u ：表示大写字母
?d ：表示数字
?s ：表示特殊字符
?a ：表示上面四种的并集，键盘上所有可见字符
?h ：常见小写字母和数字
?H ：常见大写字母和数字
?b ：用来匹配像空格这种密码
```

## MD5爆破--例子

```bash
#7位数字破解
hashcat -a 3 -m 0 --force 25c3e88f81b4853f2a8faacad4c871b6 ?d?d?d?d?d?d?d

#8位小写字母
hashcat -a 3 -m 0 --force 7a47c6db227df60a6d67245d7d8063f3 ?l?l?l?l?l?l?l?l

#6-8位小写字母+数字
hashcat -a 3 --force ab65d749cba1656ca11dfa1cc2383102 --increment --increment-min 6 --increment-max 8 ?h?h?h?h?h?h?h?h

#特定字符集
hashcat -a 3 -1 123456abcdf!@+- 8b78ba5089b11326290bc15cf0b9a07d ?1?1?1?1?1
注意一下：这里的-1和?1是数字1，不是字母l

#字典+掩码破解
hashcat -a 6 9dc9d5ed5031367d42543763423c24ee password.txt ?l?l?l?l?l
```

# CBC翻转攻击

精髓：通过损坏密文字节来改变明文字节

借助CBC内部的模式可以绕过过滤器，或者改变用户权限提升至管理员

# HASH长度扩展攻击

```bash
#可以使用工具hashpump
第一行输入得到的hash值
第二行输入已知数据
第三行输入总长度
第四行输入要添加的数据(随意添加)
```