---
title: GitLab
---

## 应用简介

GitLab 是一个用于仓库管理系统的开源项目，使用Git作为代码管理工具，并在此基础上搭建起来的web服务。

GitLab是由GitLabInc.开发，使用MIT许可证的基于网络的Git仓库管理工具，且具有wiki和issue跟踪功能

## [CVE-2020-10977]-任意文件读取

**漏洞概述**
```http
#影响范围
GitLab EE >=8.5，<=12.9
GitLab CE >=8.5，<=12.9
```

**漏洞利用**

POC：https://github.com/thewhiteh4t/cve-2020-10977

需要登录

**修复建议**

1、检查版本

```bash
cat /opt/gitlab/embedded/service/gitlab-rails/VERSION
```

2、下载最新版本

## [CVE-2018-14364]-远程代码执行漏洞

**漏洞概述**
```http
#影响范围
Gitlab >= 8.9.0
GitLab < 10.7.7
GitLab < 10.8.6
GitLab < 11.0.4
```

**漏洞分析和利用**

https://xz.aliyun.com/t/2661#toc-2



