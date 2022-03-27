---
title: 【PWN】堆基础
---

## 堆基础知识

### 堆概述

堆（Heap）是虚拟地址空间的一块连续的线性区域，提供动态分配的内存，允许程序申请大小未知的内存，它在用户与操作系统之间，作为动态内存管理的中间人。同时堆响应用户的申请内存请求，向操作系统申请内存，然后将其返回给用户程序，管理用户所释放的内存，并在合适的时候还给操作系统。

简单来说，堆主要是指用户动态申请的内存（如调用malloc、alloc、alloca、new等函数）。

目前有以下几种内存分配器：

- Dlmalloc-General purpose allocator

-  **ptmalloc2-glibc** (重点)

- Jemalloc-Firefox

- Tcmalloc-chrome

- ...

本来linux默认的是dlmalloc，但是由于其不支持多线程堆管理，所以后来被支持多线程的ptmalloc2代替了。

CTF比赛中有关堆的PWN题大多是基于Linux的ptmalloc2-glibc堆块管理机制的。因此，在整个系列实验中，我们只会研究glibc malloc内存管理器。

![](/images/heap/1.png)

堆管理器并非由操作系统实现，而是由libc.so.6链接库实现。封装了一些系统调用，为用户提供方便的动态内存分配接口的同时，力求高效地管理由系统调用申请来的内存，申请内存的系统调用有brk和mmap两种。

1. brk是将数据段(.data)的最高地址指针_edata往高地址推。（_edata指向数据段的最高地址）

2. mmap是在进程的虚拟地址空间中（堆和栈中间，称为文件映射区域的地方）找一块空闲的虚拟内存。

这两种方式分配的都是虚拟内存，没有分配物理内存。在第一次访问已分配的虚拟地址空间的时候，发生缺页中断，操作系统负责分配物理内存，然后建立虚拟内存和物理内存之间的映射关系。malloc小于128k的内存时，glibc使用brk分配内存；大于128k时，使用mmap分配内存，在堆和栈之间找一块空闲内存分配。第一次执行malloc可能出现的系统调用如下。

![](/images/heap/2.png)

### Arena

​    一个线程申请的1个或多个堆包含很多的信息：二进制位信息，多个malloc_chunk信息等这些堆需要东西来进行管理，那么Arena就是来管理线程中的这些堆的，也可以理解为堆管理器所持有的内存池。

操作系统-->堆管理器-->用户

物理内存--> arena -> 可用内存

堆管理器与用户的内存交易发生于arena中，可以理解为堆管理器向操作系统批发来的有冗余的内存库存。

一个线程只有一个arnea，并且这些线程的arnea都是独立的不是相同的

主线程的arnea称为“main_arena”。子线程的arnea称为“thread_arena”。

主线程无论一开始malloc多少空间，只要size<128KB，kernel都会给132KB的heap segment(rw)。这部分称为main arena。 main_arena 并不在申请的 heap 中，而是一个全局变量，在 libc.so 的数据段。

![](/images/heap/3.png)

![](/images/heap/4.png)后续的申请的内存会一直从这个arena中获取，直到空间不足。当arena空间不足时，它可以通过增加brk的方式来增加堆的空间。类似地，arena也可以通过减小brk来缩小自己的空间。

即使将所有main arena所分配出去的内存块free完，也不会立即还给kernel，而是交由glibc来管理。当后面程序再次申请内存时，在glibc中管理的内存充足的情况下，glibc就会根据堆分配的算法来给程序分配相应的内存。

### malloc_chunk

​    glibc malloc源码中有三种最基本的堆块数据结构，分别为heap_info、malloc_state、malloc_chunk，为了使问题简单化，这里着重介绍单线程的malloc_chunk。

在程序的执行过程中，我们称由 malloc 申请的内存为 chunk 。这块内存在 ptmalloc 内部用 malloc_chunk 结构体来表示。当程序申请的 chunk 被 free 后，会被加入到相应的空闲管理列表中。

无论一个 chunk 的大小如何，处于分配状态还是释放状态，它们都使用一个统一的结构。

​    malloc_chunk 的结构如下：

```c
struct malloc_chunk {
  
INTERNAL_SIZE_T   prev_size; /* Size of previous chunk (if free). */
INTERNAL_SIZE_T   size;    /* Size in bytes, including overhead. */
  
struct malloc_chunk* fd;     /* double links -- used only if free. */
struct malloc_chunk* bk;
  
  /* Only used for large blocks: pointer to next larger size. */
  struct malloc_chunk* fd_nextsize; /* double links -- used only if free. */
  struct malloc_chunk* bk_nextsize;
};
```

 一般来说，size_t 在 64 位中是 64 位无符号整数，32 位中是 32 位无符号整数。

 每个字段的具体的解释如下：

**prev_size**, 如果该 chunk 的物理相邻的前一地址 chunk是空闲的话，那该字段记录的是前一个 chunk 的大小 (包括 chunk 头)。否则，该字段可以用来存储物理相邻的前一个 chunk 的数据。这里的前一 chunk 指的是较低地址的 chunk 。

**size**，该 chunk 的大小，大小必须是 2 * SIZE_SZ 的整数倍。如果申请的内存大小不是 2 * SIZE_SZ 的整数倍，会被转换满足大小的最小的 2 * SIZE_SZ 的倍数。

其中，32 位系统中，SIZE_SZ 是 4；64 位系统中，SIZE_SZ 是 8。 该字段的低三个比特位对 chunk 的大小没有影响，它们从高到低分别表示。

NON_MAIN_ARENA，记录当前 chunk 是否不属于主线程，1 表示不属于，0 表示属于。

IS_MAPPED，记录当前 chunk 是否是由 mmap 分配的。

PREV_INUSE，记录前一个 chunk 块是否被分配。一般来说，堆中第一个被分配的内存块的 size 字段的 P 位都会被设置为 1，以便于防止访问前面的非法内存。当一个 chunk 的 size 的 P 位为 0 时，我们能通过 prev_size 字段来获取上一个 chunk 的大小以及地址。这也方便进行空闲 chunk 之间的合并。

![](/images/heap/5.png)

Chunk总结构示意图

**fd**，**bk**。 chunk 处于分配状态时，从 fd 字段开始是用户的数据。chunk 空闲时，会被添加到对应的空闲管理链表中，其字段的含义如下：

fd 指向下一个（非物理相邻）空闲的 chunk。

bk 指向上一个（非物理相邻）空闲的 chunk。

通过 fd 和 bk 可以将空闲的 chunk 块加入到空闲的 chunk 块链表进行统一管理。

**fd_nextsize**， **bk_nextsize**，也是只有 chunk 空闲的时候才使用，不过其用于较大的 chunk（large chunk）。

fd_nextsize 指向前一个与当前 chunk 大小不同的第一个空闲块，不包含 bin 的头指针。

bk_nextsize 指向后一个与当前 chunk 大小不同的第一个空闲块，不包含 bin 的头指针。

一般空闲的 large chunk 在 fd 的遍历顺序中，按照由大到小的顺序排列。这样做可以避免在寻找合适 chunk 时挨个遍历。

### Chunk

chunk是用户申请内存的单位，也是堆管理器管理内存的基本单位。malloc()返回的指针指向一个chunk的数据区域。

![](/images/heap/6.png)

chunk最小为（size_t * 4），size_t = unsigned long int。Chunk由两部分组成，头部header（pre_size+size）和数据部分user data。如果该chunk被free，就会将chunk加入到名为bin的linked list。

按使用状态通常可分为allocated chunk、free chunk、 top chunk 和last remainder chunk四种。按大小可分为fast、small、large和tcache chunk。

#### Allocated chunk

Allocated chunk，如果上一块的chunk是free的状态，则pre_size为连续内存块的上一块chunk的大小，否则用于存储前一个chunk的数据。Size位记录着当前chunk的大小（包括header），其中有三个flag。下图为malloced chunk。

N flag，NON_MAIN_ARENA，记录当前 chunk是否不属于主线程，1 表示不属于，0 表示属于。

M flag，IS_MAPPED，记录当前 chunk 是否是由 mmap 分配的。

P flag，PREV_INUSE，记录前一个 chunk 块是否被分配。

![](/images/heap/7.png)

#### Freed chunk

Freed chunk，如果chunk被free，glibc则会将该chunk加入名为bin的linked list中。下面为freed chunk的图示。其中，fd：point to next chunk（包含bin），bk：point to last chunk（包含bin），这里指的是linked list中的（next/last chunk），而非连续内存块的chunk。fd_nextsize：point to next large chunk，bk_nextsize：point to last large chunk（不包含bin的头指针）。一般空闲的 large chunk 在 fd 的遍历顺序中，按照由大到小的顺序排列。这样做可以避免在寻找合适 chunk 时挨个遍历。

![](/images/heap/8.png)

#### Top chunk

Top chunk，在第一次malloc的时候，glibc就会将堆切成两块chunk，第一块chunk就是分配出去的chunk，剩下的空间视为top chunk，之后要是分配空间不足时将会由top chunk分配出去，它的size为表示top chunk还剩多少空间。假设 Top chunk 当前大小为 N 字节，用户申请了 K 字节的内存，那么 Top chunk 将被切割为：

- 一个 K 字节的 chunk，分配给用户

- 一个 N-K 字节的 chunk，称为 Last Remainder chunk

后者成为新的 Top chunk。如果连 Top chunk 都不够用了，那么：

- 在 main_arena 中，用 brk() 扩张 Top chunk

- 在 non_main_arena 中，用 mmap() 分配新的堆

> 注：top chunk的prev_inuse位总是1，否则其前面的 chunk 就会被合并到 top chunk 中。

### Bins

Bins为一个单向或者双向链表，存放着空闲的chunk（freed chunk）。glibc为了让malloc可以更快找到合适大小的chunk，因此在free掉一个chunk时，会把该chunk根据大小加入合适的bin中。

Bins一共可分为fast bin、small bin、large bin、unsorted bin和tcache bin。可分为：10个fast bins，存储在fastbinsY中；1个unsorted bin，存储在bins[1]；62个small bins，存储在bins[2]至bins[63]；63个large bins，存储在bins[64]至bins[126]。其中虽然定义了NBINS=128，但是bins[0]和bins[127]其实是不存在的。

1. 第一个为 unsorted bin，字如其面，这里面的 chunk 没有进行排序，存储的 chunk 比较杂。

2. 索引从 2 到 63 的 bin 称为 small bin，同一个 small bin 链表中的 chunk 的大小相同。两个相邻索引的 small bin 链表中的 chunk 大小相差的字节数为 2 个机器字长，即 32 位相差 8 字节，64 位相差 16 字节。

3. small bins 后面的 bin 被称作 large bins。large bins 中的每一个 bin 都包含一定范围内的 chunk，其中的 chunk 按 fd 指针的顺序从大到小排列。相同大小的 chunk 同样按照最近使用顺序排列。

​    整个数组大概如下图所示。

![](/images/heap/9.png)

#### fastbin

Fast bins非常像高速缓存cache，主要用于提高小内存分配效率。相邻空闲chunk不会被合并，这会导致内存碎片增多但是free效率提升。注意：fast bins时10个LIFO的单链表，最后三个链表保留未使用。

默认情况下，对于 SIZE_SZ 为 4B 的平台， 小于 64B 的 chunk 分配请求，对于 SIZE_SZ 为 8B 的平台，小于 128B 的 chunk 分配请求，首先会查找fast bins中是否有所需大小的chunk存在（精确匹配），如果存在，就直接返回。

Fast bin的chunk 大小（含 chunk 头部）：0x10-0x40（64 位 0x20-0x80）B，相邻 bin 存放的大小相差 0x8（0x10）B。总结以下特点。

- fastbinsY[]，fast bin存放在此数组中 

- 单向链表 

- LIFO（last in first out，当下次malloc大小与这次free大小相同时，会从相同的bin取出，也就是会取到相同位置的chunk） 

- 管理 16、24、32、40、48、56、64 Bytes 的 free chunks（32位下默认） 

- 其中的chunk的in_use位（下一个物理相邻的chunk的P位）总为1。也就是说，释放到fastbin的chunk不会被清除in_use标志位。

关于fastbin最大大小参见宏DEFAULT_MXFAST:

![](/images/heap/10.png)

在初始化时，这个值会被复制给全局变量global_max_fast。申请fast chunk时遵循first fit原则。释放一个fast chunk时，首先检查它的大小以及对应fastbin此时的第一个chunk的大小是否合法，随后它会被插入到对应fastbin的链表头，此时其fd指向上一个被free的chunk。

Fast bin示意图如下。

![](/images/heap/11.png)

#### Unsorted bin

Unsorted bin非常像缓冲区buffer，大小超过fast bins阈值的chunk被释放时会加入到这里，这使得ptmalloc2可以复用最近释放的chunk，从而提升效率。

所有的大小超过fast bins阈值的 chunk 在回收时都要先放到 unsorted bin中，分配时，如果在 unsorted bin 中没有合适的 chunk，就会把 unsorted bin 中的所有 chunk分别加入到所属的 bin 中，然后再在 bin 中分配合适的 chunk。Bins 数组中的元素 bin[1]用于存储 unsorted bin 的 chunk 链表头。

它是一个双向循环链表，chunk大小大于global_max_fast。

当程序申请大于global_max_fast内存时，glibc会遍历unsorted bin，每次取最后的一个unsorted bin。

1. 如果 unsorted chunk 满足以下四个条件，它就会被切割为一块满足申请大小的 chunk 和另一块剩下的 chunk，前者返回给程序，后者重新回到 unsorted bin。

   - 申请大小属于 small bin 范围

   - unosrted bin 中只有该 chunk

   - 这个 chunk 同样也是 last remainder chunk

   - 切割之后的大小依然可以作为一个 chunk

2. 否则，从 unsorted bin 中删除 unsorted chunk。

   - 若 unsorted chunk 恰好和申请大小相同，则直接返回这个 chunk

   - 若 unsorted chunk 属于 small bin 范围，插入到相应 small bin

   - 若 unsorted chunk 属于 large bin 范围，则跳转到 3。

3. 此时 unsorted chunk 属于 large bin 范围。

   - 若对应 large bin 为空，直接插入 unsorted chunk，其 fd_nextsize 与 bk_nextsize 指向自身。

   - 否则，跳转到 4。

4. 到这一步，我们需按大小降序插入对应 large bin。

   - 若对应 large bin 最后一个 chunk 大于 unsorted chunk，则插入到最后

   - 否则，从对应 large bin 第一个 chunk 开始，沿 fd_nextsize（即变小）方向遍历，直到找到一个 chunk 命名为c，其大小小于等于 unsorted chunk 的大小

   - 若c大小等于unsorted chunk大小，则插入到c后面

   - 否则，插入到c前面

直到找到满足要求的unsorted chunk，或无法找到，去top chunk切割为止。总结以下特点。

- 双向循环链表

- 当free的chunk大小大于等于144字节时，为了效率，glibc并不会马上将chunk放到相对应的bin中，而会先放到unsorted bin

- 而下次mallocs时将会先找找看unsorted bin中是否有合适的chunk，找不到才会去对应的bin中寻找，此时会顺便把unsorted bin的chunk放到对应的bin中，但small bin除外，为了效率，反⽽而先从small bin找

Unsorted bin的示意图如下。

![](/images/heap/12.png)

#### Small bins

Small bins，chunk size小于0x200（64位下0x400）字节的chunk叫做small chunk，而small bins存放的就是这些small chunk。Chunk大小同样是从16字节开始每次+8字节。

small bins 是 62 个双向循环链表，并且是 FIFO 的，这点和 fast bins 相反。同样相反的是相邻的空闲 chunk 会被合并。chunk大小：0x10-0x1f0字节（64位下0x20-0x3f0），相邻bin存放的大小相差0x8（0x10）字节。

ptmalloc 维护了 62 个双向环形链表（每个链表都具有链表头节点，加头节点的最大作用就是便于对链表内节点的统一处理，即简化编程），每一个链表内的各空闲 chunk 的大小一致，因此当应用程序需要分配某个字节大小的内存空间时直接在对应的链表内取就可以了，这样既可以很好的满足应用程序的内存空间申请请求而又不会出现太多的内存碎片。

释放非 fast chunk 时，按以下步骤执行：

1. 若前一个相邻chunk空闲，则合并，触发对前一个相邻 chunk的unlink操作

2. 若下一个相邻chunk是top chunk，则合并并结束；否则继续执行 3

3. 若下一个相邻 chunk 空闲，则合并，触发对下一个相邻chunk的unlink 操作；否则，设置下一个相邻 chunk 的 PREV_INUSE 为 0

4. 将现在的chunk插入unsorted bin。

5. 若size超过了FASTBIN_CONSOLIDATION_THRESHOLD，则尽可能地合并 fastbin中的chunk，放入unsorted bin。若top chunk大小超过了 mp_.trim_threshold，则归还部分内存给 OS。

![](/images/heap/13.png)

​    总结有以下特点。

- 双向循环链表

- Chunk size < 0x400 byte（64位）

- FIFO

- 根据大小再分成62个大小不同的bin
  - 0x20,0x30…0x60,0x70…

Small bins图示如下。

![](/images/heap/14.png)

#### Large bins

Large bins存放的是大于等于0x200（64位下0x400）字节的chunk，它是63个双向循环链表，插入和删除可以发生在任意位置，相邻空闲chunk也会被合并。Chunk大小就比较复杂了：

- 前32个bins：从0x400字节开始每次+0x40字节

- 接下来的16个bins：每次+0x200字节

- 接下来的8个bins：每次+0x1000字节

- 接下来的4个bins：每次+0x8000字节

- 接下来的2个bins：每次+0x40000字节

- 最后的1个bin：只有一个chunk，大小和large bins剩余的大小相同

同一个bin中的chunks不是相同大小的，按大小降序排列。这和上面的几种 bins都不一样。而在取出chunk时，也遵循best fit原则，取出满足大小的最小 chunk。总结以下特点。

- 双向循环链表（排好序了）

- Chunk size > 0x400

- Freed chunk多两个指针fd_nextsize、bk_nextsize指向前一块和后一块large chunk

- 根据大小再分成63个bin但大小不再是固定大小增加

  - 前32个bin为0x400+0x40*i

  - 32~48bin为0x1380+0x200*i

  - …以此类推

- 不再是每个bin中的chunk大小都固定，每个bin中存着该范围内不同大小的bin并在过程中进行排序用来加快寻找的速度，大的chunk会放在前面，小的chunk会放在后面

- FIFO

Large bins示意图如下。

![](/images/heap/15.png)

#### Tcache

Tcache是libc2.26之后引进的一种新机制，类似于fastbin一样的东西，每条链上最多可以有7个chunk，free的时候当tcache满了才放入fastbin或unsorted bin，malloc的时候优先去tcache找。

基本工作方式：

- malloc 时，会先 malloc 一块内存用来存放 tcache_perthread_struct 。

- free 内存，且 size 小于 small bin size 时

  - 先放到对应的 tcache 中，直到 tcache 被填满（默认是 7 个）

  - tcache 被填满之后，再次 free 的内存和之前一样被放到 fastbin 或者 unsorted bin 中

  - tcache 中的 chunk 不会合并（不取消 inuse bit）

- malloc 内存，且 size 在 tcache 范围内

  - 先从 tcache 取 chunk，直到 tcache 为空
  - tcache 为空后，从 bin 中找
  - tcache 为空时，如果 fastbin/smallbin/unsorted bin 中有 size 符合的 chunk，会先把 fastbin/smallbin/unsorted bin 中的 chunk 放到 tcache 中，直到填满。之后再从 tcache 中取；因此 chunk 在 bin 中和 tcache 中的顺序会反过来。

### 堆分配策略

在第一次访问已分配的虚拟地址空间的时候，发生缺页中断，操作系统负责分配物理内存，然后建立虚拟内存和物理内存之间的映射关系。malloc小于128k的内存时，glibc使用brk分配内存；大于128k时，使用mmap分配内存，在堆和栈之间找一块空闲内存分配。第一次执行malloc可能出现的系统调用如下。

![](/images/heap/2.png)

#### malloc

malloc的规则可以对照malloc的源码中的_int_malloc函数来查看，这里主要介绍最基本的情况。最开始glibc所管理的内存空间是用brk系统调用产生的内存空间，如果malloc申请的空间太大，超过了现有的空闲内存，则会调用brk或mmap继续产生内存空间。

malloc根据用户申请的内存块大小以及相应大小chunk通常使用的频度（fastbin chunk, small chunk, large chunk），依次实现了不同的分配方法。它由小到大依次检查不同的bin中是否有相应的空闲块可以满足用户请求的内存。当所有的空闲chunk都无法满足时，它会考虑top chunk。当 top chunk 也无法满足时，堆分配器才会进行内存块申请。

​    对于malloc申请一般大小（不超过现有空闲内存大小）的内存，其简化版流程如下。

![](/images/heap/16.png)

​     首先将size按照一定规则对齐，得到最终要分配的大小size_real，具体如下。

- .x86：size+4按照0x10字节对齐。

- .x64：size+8按照0x20字节对齐。

1. 检查size_real是否符合fast bin的大小，若是则查看fast bin中对应size_real的那条链表中是否存在堆块，若是则分配返回，否则进入第2步。

2. 检查size_real是否符合small bin的大小，若是则查看small bin中对应size_real的那条链表中是否存在堆块，若是则分配返回，否则进入第3步。

3. 检查size_real是否符合large bin的大小，若是则调用malloc_consolidate函数对fast bin中所有的堆块进行合并，其过程为将fast bin中的堆块取出，清除下一块的p标志位并进行堆块合并，将最终的堆块放入unsorted bin。然后在small bin和large bin中找到适合size_real大小的块。若找到则分配，并将多余的部分放入unsorted bin，否则进入第4步。

4. 检查top chunk的大小是否符合size_real的大小，若是则分配前面一部分，并重新设置top chunk，否则调用malloc_consolidate函数对fast bin中的所有堆块进行合并，若依然不够，则借助系统调用来开辟新空间进行分配，若还是无法满足，则在最后返回失败。

这里面值得注意的点如下。

1. fast bin的分配规则是LIFO。

2. malloc_consolidate函数调用的时机：它在合并时会检查前后的块是否已经释放，并触发unlink。

在 glibc 的 malloc.c 中，malloc 的说明如下：

```c
/*
  malloc(size_t n)
  Returns a pointer to a newly allocated chunk of at least n bytes, or null
  if no space is available. Additionally, on failure, errno is
  set to ENOMEM on ANSI C systems.
  If n is zero, malloc returns a minumum-sized chunk. (The minimum
  size is 16 bytes on most 32bit systems, and 24 or 32 bytes on 64bit
  systems.)  On most systems, size_t is an unsigned type, so calls
  with negative arguments are interpreted as requests for huge amounts
  of space, which will often fail. The maximum supported value of n
  differs across systems, but is in all cases less than the maximum
  representable value of a size_t.
*/
```



可以看出，malloc 函数返回对应大小字节的内存块的指针。此外，该函数还对一些异常情况进行了处理：

- 当 n=0 时，返回当前系统允许的堆的最小内存块。

- 当 n 为负数时，由于在大多数系统上，size_t 是无符号数（这一点非常重要），所以程序就会申请很大的内存空间，但通常来说都会失败，因为系统没有那么多的内存可以分配。

#### free

free函数将用户暂且不用的chunk回收给堆管理器，适当的时候还会归还给操作系统。它依据chunk大小来优先试图将free chunk链入tcache或者是fast bin。不满足则链入usorted bin中。在条件满足时free函数遍历usorted bin并将其中的物理相邻的free chunk合并，将相应大小的chunk分类放入small bin或large bin中。除了tcache chunk与fast bin chunk，其它chunk在free时会与其物理相邻的free chunk合并。

一个简易的内存释放流程如下。

![](/images/heap/17.png)

相关宏如下。

![](/images/heap/18.png)

​     堆块在释放时会有一系列的检查，可以与源码进行对照。在这里，将对一些关键的地方进行说明。

1. 释放（free）时首先会检查地址是否对齐，并根据size找到下一块的位置，检查其p标志位是否置为1。

2. 检查释放块的size是否符合fast bin的大小区间，若是则直接放入fast bin，并保持下一堆块中的p标志位为1不变（这样可以避免在前后块释放时进行堆块合并，以方便快速分配小内存），否则进入第3步。

3. 若本堆块size域中的p标志位为0（前一堆块处于释放状态），则利用本块的pre_size找到前一堆块的开头，将其从bin链表中摘除（unlink），并合并这两个块，得到新的释放块。

4. 根据size找到下一堆块，如果是top chunk，则直接合并到top chunk中去，直接返回。否则检查后一堆块是否处于释放状态（通过检查下一堆块的下一堆块的p标志位是否为0）。将其从bin链表中摘除（unlink），并合并这两块，得到新的释放块。

5. 将上述合并得到的最终堆块放入unsorted bin中去。

 这里有以下几个值得注意的点：

1. 合并时无论向前向后都只合并相邻的堆块，不再往更前或者更后继续合并。

2. 释放检查时，p标志位很重要，大小属于fast bin的堆块在释放时不进行合并，会直接被放进fast bin中。在malloc_consolidate时会清除fast bin中所对应的堆块下一块的p标志位，方便对其进行合并。

在 glibc 的 malloc.c 中，free 的说明如下：

```c
/*
      free(void* p)
      Releases the chunk of memory pointed to by p, that had been previously
      allocated using malloc or a related routine such as realloc.
      It has no effect if p is null. It can have arbitrary (i.e., bad!)
      effects if p has already been freed.
      Unless disabled (using mallopt), freeing very large spaces will
      when possible, automatically trigger operations that give
      back unused memory to the system, thus reducing program footprint.
    */
```

可以看出，free 函数会释放由 p 所指向的内存块。这个内存块有可能是通过 malloc 函数得到的，也有可能是通过相关的函数 realloc 得到的。

此外，该函数也同样对异常情况进行了处理：

- 当 p 为空指针时，函数不执行任何操作。

- 当 p 已经被释放之后，再次释放会出现乱七八糟的效果，这其实就是 double free。

- 除了被禁用 (mallopt) 的情况下，当释放很大的内存空间时，程序会将这些内存空间还给系统，以便于减小程序所使用的内存空间。

####  brk

对于堆的操作，操作系统提供了 brk 函数，glibc 库提供了 sbrk 函数，我们可以通过增加 brk 的大小来向操作系统申请内存。

​    初始时，堆的起始地址 start_brk 以及堆的当前末尾 brk 指向同一地址。根据是否开启 ASLR，两者的具体位置会有所不同。

l 不开启 ASLR 保护时，start_brk 以及 brk 会指向 data/bss 段的结尾。

l 开启 ASLR 保护时，start_brk 以及 brk 也会指向同一位置，只是这个位置是在 data/bss 段结尾后的随机偏移处。

具体效果如下图。

![](/images/heap/19.png)

#### mmap

​    malloc 会使用 mmap 来创建独立的匿名映射段。匿名映射的目的主要是可以申请以 0 填充的内存，并且这块内存仅被调用进程所使用。

#### 多线程

​    在原来的 dlmalloc 实现中，当两个线程同时要申请内存时，只有一个线程可以进入临界区申请内存，而另外一个线程则必须等待直到临界区中不再有线程。这是因为所有的线程共享一个堆。在 glibc 的 ptmalloc 实现中，比较好的一点就是支持了多线程的快速访问。在新的实现中，所有的线程共享多个堆。

## 参考链接

https://ctf-wiki.org/pwn/linux/glibc-heap/heap_overview/

https://zhuanlan.zhihu.com/p/24790164

http://blog.leanote.com/post/3191220142@qq.com/Linux%E5%A0%86%E5%9F%BA%E7%A1%80%E7%9F%A5%E8%AF%86.md-2

https://lishiwen4.github.io/linux/linux-process-memory-location

https://blog.csdn.net/qq_41453285/article/details/97613588
