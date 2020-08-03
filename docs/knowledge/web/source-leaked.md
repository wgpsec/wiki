# 源码泄露

# .git源码泄漏

在运行git init初始化代码库的时候，会在当前目录下面产生一个.git的隐藏文件，用来记录代码的变更记录

在发布代码的时候，.git目录没有删除，使用这个文件，可以恢复源代码。

**文件夹分析**

> **index：**文件保存暂存区信息；
>
> **hook：**存放一些sheel的地方。
> **info：**存放仓库的信息
> **object：**存放所有git对象的地方
> **refs：**存放提交hash的地方
> **config：**github的配置信息
> **description：**仓库的描述信息，主要给gitweb等git托管系统使用
> **HEAD：**映射到ref引用，能够找到下一次commit的前一次哈希值

git是一套内容寻址文件系统

**1.寻址方式**
git采用HashTable的方式进行寻址
这里使用的key就是文件（头+内容）的哈希值，value就是经过压缩后的文件内容

**2.git对象的类型**

> **Blob：**blob对象可以存储所有的文件类型。
> **tree：**tree对象是用来组织Blob对象的一种数据类型。树节点
> **commit：**父节点

**3.Git对象的存储方式**

```bash
Key = sha1(file_header + file_content)
Value = zlib(file_content)
```

> 40位的sha-1校验和，将该校验和的前2位作为object目录中的子目录的名称，后38位作为子目录中的文件名

利用Githack脚本，下载全部源码

```bash
python2 GitHack.py http://xxx.com/.git/
```

# .hg源码泄漏

hg init的时候会生成.hg

工具：dvcs-ripper

```bash
rip-hg.pl -v -u http://www.example.com/.hg/

cat .hg/store/fncache
```

# .SVN源码泄漏

代码放到生产坏境中后，没有清理 svn 的一些信息，导致 svn 残留

工具：dvcs-ripper

```bash
rip-svn.pl -v -u http://www.localhost.test/.svn/

从 xxx.db 中找到 flag 的文件的文件名,然后访问
cat xxx.db | grep flag

或找cat .svn/pristine/ 中的文件
```

# Bazaar/bzr

工具：

[dvcs-ripper](https://github.com/kost/dvcs-ripper)

```bash
rip-bzr.pl -v -u http://www.example.com/.bzr/
```

# .DS_Store文件泄漏

在发布代码时未删除文件夹中隐藏的.DS_store，被发现后，获取了敏感的文件名等信息

工具：[dsstoreexp](https://github.com/lijiejie/ds_store_exp)

```bash
python ds_store_exp.py http://www.example.com/.DS_Store
```

# 网站备份文件

当备份文件或者修改过程中的缓存文件因为各种原因而被留在网站 web 目录下

而该目录又没有设置访问权限时，便有可能导致备份文件或者编辑器的缓存文件被下载，导致敏感信息泄露

```
.rar   .zip  .7z   .tar.gz   .bak    .swp   .txt
```

# WEB-INF/web.xml 泄露

WEB-INF 是 Java 的 WEB 应用的安全目录。

该目录原则上来说是客户端无法访问，只有服务端才可以可以访问。

如果想在页面中直接访问其中的文件，必须通过 web.xml 文件对要访问的文件进行相应映射才能访问。

**WEB-INF 主要包含以下文件或目录：**

> /WEB-INF/web.xml：Web 应用程序配置文件，描述了 servlet 和其他的应用组件配置及命名规则；
>
> /WEB-INF/classes/：含了站点所有用的 class 文件，包括 servlet class 和非 servlet class，他们不能包含在 .jar 文件中；
>
> /WEB-INF/lib/：存放 web 应用需要的各种 JAR 文件，放置仅在这个应用中要求使用的 jar 文件 , 如数据库驱动 jar 文件；
>
> /WEB-INF/src/：源码目录，按照包名结构放置各个 java 文件；
>
> /WEB-INF/database.properties：数据库配置文件。

------

```
例如
http://example.com/dir/WEB-INF/web.xml
```

# CVS泄漏

测试的目录

```
http://url/CVS/Root 返回根信息
http://url/CVS/Entries 返回所有文件的结构
```

取回源码的命令

```bash
bk clone http://url/name dir
bk clone http://url/name ./
#把远端一个名为name的repo clone到本地当前目录下
```

查看所有的改变的命令，转到download的目录

```bash
bk changes
```

