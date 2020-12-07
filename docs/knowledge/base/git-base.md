---
title: Git基本用法
---
# Git基本用法
# 基本设置

```bash
git config --lsit #查看配置信息
```

**配置用户信息**

```bash
git config --global user.name "wintrysec"
git config --global user.email "xksec@foxmail.com"
```

**初始化版本控制**

```bash
git init #每个项目只一次
```

**添加文件追踪**

```bash
git add .   #更新提交的时候写单个文件或目录名
```

**提交文件 （-m 后表示说明内容，需要加引号）**

```bash
git commit -m “这里是说明消息”
```

**查看当前修改状态**

常在执行 add 后，执行 commit 之前使用，也可以在 commit之后使用

```bash
git status
```

**其它常用参数**

```bash
#以下命令，在.git根目录工作区使用

#查看历史记录
git log

#对比两次提交的不同
git diff commit_id	
git diff HEAD^

#切换到历史版本
git reset commit_id
git reset --hard HEAD^

#查看stash列表，保存到git栈的git 工作状态
git stash list
git stash pop	#从git栈中弹出内容

#git stash list看不到的话
cat .git/refs/stash		#会有一个hash
git diff hash值		#即可看到内容差异
```

# 远程仓库

**1.登陆github账号**

**2.创建 SSH Key**

【C盘—->用户/user—->Administrator（自己的用户名）】

看看有没有 .ssh 目录，如果有，再看看这个目录下有没有 id_rsa 和 id_rsa.pub

如果已经有了，可直接跳到下一步。

如果没有，打开 Shell（Windows下打开Git Bash），创建 SSH Key：

```bash
ssh-keygen -t rsa -C "xksec@foxmail.com"
```

**3.登陆 GitHub，打开 “Settings”**

“SSH Keys” 页面，“New SSH key”，“粘贴公钥”

**4.创建项目，并复制项目地址，添加远程仓库**

```bash
git remote add origin https://github.com/wintrysec/wintrysec.github.io.git
```

**5.把所有推送到远端仓库**

```bash
git push -u origin master
```

# 更新远程仓库

```bash
git pull	#拉取更新，每次必做防止团队合作干掉别人上传的代码
git add .   #更新文件后添加追踪
git commit -m “这里是说明消息”
git status	#查看当前修改状态
git branch	#查看当前分支
git push	#推送向远程仓库
```

**分支管理**

```bash
git branch			#查看当前分支
git chechout aaa 	#切换分支aaa
git branck aaa 		#创建aaa分支

git chechout -b aaa 
#本地创建 aaa分支，同时切换到aaa分支
#只有提交的时候才会在服务端上创建一个分支
```

