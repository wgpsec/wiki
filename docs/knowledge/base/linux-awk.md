---
title: 【操作系统】Linux三剑客
---

# Linux三剑客
# 文本分析AWK

> `awk`是一种编程语言，是一个文本处理工具，是一个强大的命令行解释器，用于在`linux/unix`下对文本和数据进行处理 ；`awk` 可以执行一系列的操作，包括从文件或管道中读取文本数据、解析文本中的字段和行、过滤和转换数据、执行计算和打印结果等。它是一种灵活的工具，可以通过编写脚本来控制其行为和操作。
>
> `awk` 的名称来自于它的创建者 Alfred Aho、Peter Weinberger 和 Brian Kernighan 的姓氏的首字母。
> 
> 数据可以来自标准输入(stdin)、一个或多个文件，或其它命令的输出； 
>
> 它支持用户自定义函数和动态正则表达式；
>
> awk有很多内建的功能，比如数组、函数等，这是它和C语言的相同之处，灵活性是awk最大的优势 

#### 基本语法：

```bash
awk [options] 'Pattern{Action}' filename
command [选项 参数] '模式{动作}'   文件
```
其中：
*   `pattern`：是一个正则表达式，用于匹配文本中的特定行或数据。
*   `action`：是在匹配到 `pattern` 时要执行的一组命令。
*   `file`：是要处理的文本文件的名称或从标准输入读取的数据。
#### 常用命令选项：

```bash
-F fs	#fs指定命令分隔符，如 -F:  如果没有指定分割符，默认使用空格作为分隔符（或使用-v FS,FS是内置变量）
-v var=value	#赋值一个用户定义变量，将外部变量传递给awk，比如使用-v OFS="+",指定输出分隔符
-f script		#从脚本文件中读取awk命令
```

#### 最简单的用法：只用action

```bash
$ echo "hello world" > test
$ awk '{print}' test
hello world
$ awk '{print $0}' test		#$0表示所有域(默认用空格当作分隔符)
hello world
$ awk '{print $1}' test		#$1表示第一个域,两个域用逗号隔开$1,$2，去掉逗号或换为空格输出时会没有分隔符显示在一列
hello
##############################
df -h | awk '{print $5}'	#df显示磁盘使用情况，这里使用awk只打印每行的第五列，$NF可以只输出每行的最后一列
```

#### 特殊模式的用法：

> BEGIN 模式指定了处理文本之前需要执行的操作：（BEGIN开始）；不指定文件也能输出（但是后边指定操作也会卡住）
>
> END 模式指定了处理完所有行之后所需要执行的操作：（END结束）；不指定文件会卡住

```bash
$ awk 'BEGIN{print "wintrysec"} {print $0} END{print "1080"}' test
wintrysec
hello world
1080
```

#### AWK变量：

**常用内置变量：**

```bash
FS		#输入字段分隔符， 默认为空白字符
OFS		#输出字段分隔符， 默认为空白字符
RS		#输入记录分隔符(默认输入是换行符)， 指定输入时的换行符
ORS		#输出记录分隔符（输出换行符），输出时用指定符号代替换行符
NF		#number of Field，当前行的字段的个数(即当前行被分割成了几列)，字段数量
NR		#行号，当前处理的文本行的行号。
FNR		#各文件分别计数的行号，另一个文件从1开始计行数
ARGC	#命令行参数的个数
ARGV	#数组，保存的是命令行所给定的各参数，AGRV[0]是awk
FILENAME#当前文件名
```

**自定义变量的两种用法：**

```bash
$ awk -v name="wintrysec",age=19 'BEGIN{print name}'	#第一种方法用-v选项，多个参数用逗号分隔   不加BENGIN会卡住
wintrysec
$ awk 'BEGIN{name="wintrysec";age=18;print name,age}'	#第二种方法，直接在程序中定义，多个参数用分号分隔 
wintrysec 18
```
#### 举例
例如，如果你想要从一个名为 `example.txt` 的文件中提取第二列（使用空格作为分隔符），可以使用以下命令：

```bash
awk '{print $2}' example.txt
```

如果您想要计算文件中第一列的总和，则可以使用以下命令：
```bash
awk '{sum += $1} END {print sum}' example.txt
```
这将把第一列的值相加，并在处理完整个文件后输出总和。


# 文本批量处理sed
sed -- Stream EDitor
> 主要用来自动编辑一个或多个文件；简化对文件的反复操作； 

#### 命令格式：

```bash
sed [options] 'command' file(s)
sed [options] -f scriptfile file(s)
```

#### 常用选项：

```bash
-e<script>			#以选项中的指定的script来处理输入的文本文件；
-f<script文件>	 #以选项中指定的script文件来处理输入的文本文件；
-n					#仅显示script处理后的结果；
```

#### 替换标记：

```bash
g	#表示行内全面替换；即替换每一行中的所有匹配
p	#表示打印行。  
w	#表示把行写入一个文件。  
x	#表示互换模板块中的文本和缓冲区中的文本。  
y	#表示把一个字符翻译为另外的字符（但是不用于正则表达式）
\1	#子串匹配标记
&	#已匹配字符串标记
```

#### 常用命令：

> d 	删除，删除选择的行。
> s 	替换指定字符
> p 	打印模板块的行。
> P	(大写) 打印模板块的第一行。

#### 常见用法：

**替换文本中的字符串 (如linux日志处理，伪造IP)**

```bash
sed -i 's/192.168.1.3/192.168.1.4/g' xxx.log	#-i选项表示直接编辑文件
```

**定界符：**

以上命令中字符 / 在sed中作为定界符使用，也可以使用任意的定界符：

```bash
sed 's|test|TEXT|g'
```

定界符出现在样式内部时，需要进行转义： 

```bash
sed 's/\/bin/\/usr\/local\/bin/g'
```

**删除操作(d命令)：**

```bash
sed '/^$/d' file	#删除空白行
sed '2d' file		#删除文件的第二行
sed '2,$d' file		#删除文件的第2行到末尾所有行
sed '$d' file 		#删除文件最后一行
sed '/^test/'d file	#删除文件中所有开头是test的行
```

#### 常见面试题

把/oldboy目录以及子目录下所有以扩展名为.sh结尾的文件包含oldboy的字符串全部替换为oldgirl

```bash
find /oldboy -type f -name "*.sh"|xargs sed "s#oldboy#oldgirl#g"
```



# grep文本正则匹配
grep	#正则匹配，搜索文本."Global Regular Expression Print"这是一个用于在文本中查找和过滤匹配字符串或正则表达式的命令.帮助用户快速定位关键信息。
**常见用法：**

```bash
grep "text" file_name		#返回一个包含text的文本行
grep "text" file1 file2		#在多个文件中查找
grep -v "text" file_name	#-v选项，输出排除text之外的所有行
grep -E "[1-9]+"			#-e选项，使用正则表达式
grep -c "text" file_name	#统计文件中匹配字符串的行数
```
