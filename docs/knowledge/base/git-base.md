---
title: Git基本用法
---
# Git
## 版本控制
### 什么是版本控制？
版本控制（Revision control）是一种在开发的过程中用于管理我们对文件、目录或工程等内容的修改历史，方便查看更改历史记录，备份以便恢复以前的版本的软件工程技术。

- 实现跨区域多人协同开发
- 追踪和记载一个或者多个文件的历史记录
- 组织和保护你的源代码和文档
- 统计工作量
- 并行开发、提高开发效率
- 跟踪记录整个软件的开发过程
- 减轻开发人员的负担，节省时间，同时降低人为错误

简单说就是用于管理多人协同开发项目的技术。

没有进行版本控制或者版本控制本身缺乏正确的流程管理，在软件开发过程中将会引入很多问题，如软件代码的一致性、软件内容的冗余、软件过程的事物性、软件开发过程中的并发性、软件源代码的安全性，以及软件的整合等问题。

无论是工作还是学习，或者是自己做笔记，都经历过这样一个阶段！我们就迫切需要一个版本控制工具！
### 版本控制分类
**分布式版本控制 Git**

每个人都拥有全部的代码！安全隐患！

所有版本信息仓库全部同步到本地的每个用户，这样就可以在本地查看所有版本历史，可以离线在本地提交，只需在连网时push到相应的服务器或其他用户那里。由于每个用户那里保存的都是所有的版本数据，只要有一个用户的设备没有问题就可以恢复所有的数据，但这增加了本地存储空间的占用。

不会因为服务器损坏或者网络问题，造成不能工作的情况！
## 启动Git
安装成功后在开始菜单中会有Git项，菜单下有3个程序：任意文件夹下右键也可以看到对应的程序！

**Git Bash**：Unix与Linux风格的命令行，使用最多，推荐最多

**Git CMD**：Windows风格的命令行

**Git GUI**：图形界面的Git，不建议初学者使用，尽量先熟悉常用命令
### Git配置
所有的配置文件，其实都保存在本地！

查看不同级别的配置文件：

```bash
#查看系统config
git config --system --list

#查看当前用户（global）配置
git config --global  --list
## 基本设置
```
**Git相关的配置文件：**

1）、Git\etc\gitconfig ：Git 安装目录下的 gitconfig --system 系统级

2）、C:\Users\Administrator\ .gitconfig 只适用于当前登录用户的配置 --global 全局
![img](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9tbWJpei5xcGljLmNuL21tYml6X3BuZy91SkRBVUtyR0M3S3N1OFVsSVR3TWxiWDNrTUd0WjlwMGhjSlMwcnhqM3FvQ1Z2ZkRLaDNXeHdRSmxTVjNQMTVFSVp1ZWpyYU93WExkaWM2TkNCOFg4b1EvNjQw?x-oss-process=image/format,png)
如图所示，.gitconfig可以直接编辑配置文件，通过命令设置后会响应到这里。
```bash
#查看配置信息
git config --lsit
git config -l    #缩写
```

**配置用户信息**
此节设置用户名与邮箱（用户标识，必要）。
当你安装Git后首先要做的事情是设置你的用户名称和e-mail地址。这是非常重要的，因为每次Git提交都会使用该信息。它被永远的嵌入到了你的提交中：
```bash
git config --global user.name "wintrysec"
git config --global user.email "xksec@foxmail.com"
```
只需要做一次这个设置，如果你传递了--global 选项，因为Git将总是会使用该信息来处理你在系统中所做的一切操作。如果你希望在一个特定的项目中使用不同的名称或e-mail地址，你可以在该项目中运行该命令而不要--global选项。总之--global为全局配置，不加为某个项目的特定配置。
**代理**
1.设置 Git 全局代理
您可以使用以下命令设置 Git 的全局代理：
```bash
$ git config --global http.proxy http://proxy.example.com:8080
$ git config --global https.proxy https://proxy.example.com:8080
```
如果您需要取消全局代理，可以使用以下命令：
```bash
$ git config --global --unset http.proxy
$ git config --global --unset https.proxy

```
2.设置 Git 单个仓库代理
如果您只需要为单个 Git 仓库设置代理，可以在该仓库的根目录中运行以下命令：
```bash
$ git config http.proxy http://proxy.example.com:8080
$ git config https.proxy https://proxy.example.com:8080
```
### 4个区域
Git本地有4个工作区域：

- Workspace：工作区，就是你平时存放项目代码的地方
- Index / Stage：暂存区，用于临时存放你的改动，事实上它只是一个文件，保存即将提交到文件列表信息
- Repository：仓库区（或本地仓库）**，就是安全存放数据的位置，这里面有你提交到所有版本的数据。其中HEAD指向最新放入仓库的版本
- Remote：远程仓库，托管代码的服务器**，可以简单的认为是你项目组中的一台电脑用于远程数据交换
![](/images/git-base/Transformational-Relation.jpg)
- Directory：使用Git管理的一个目录，也就是一个仓库，包含我们的工作空间和Git的管理空间。
- WorkSpace：需要通过Git进行版本控制的目录和文件，这些目录和文件组成了工作空间。
- .git：存放Git管理信息的目录，初始化仓库的时候自动创建。
- Index/Stage：暂存区，或者叫待提交更新区，在提交进入repo之前，我们可以把所有的更新放在暂存区。
- Local Repo：本地仓库，一个存放在本地的版本库；HEAD会只是当前的开发分支（branch）。
- Stash：隐藏，是一个工作状态保存栈，用于保存/恢复WorkSpace中的临时状态。
### 工作流程
git的工作流程一般是这样的：
１、在工作目录中添加、修改文件；
２、将需要进行版本管理的文件放入暂存区域；
３、将暂存区域的文件提交到git仓库。

因此，git管理的文件有三种状态：
已修改（modified）,
已暂存（staged）,
已提交(committed)
### 工作目录
工作目录（WorkSpace)一般就是你希望Git帮助你管理的文件夹，可以是你项目的目录，也可以是一个空目录，建议不要有中文。
## 本地仓库搭建
接下来，创建仓库。创建本地仓库的方法有两种：一种是创建全新的仓库，另一种是克隆远程仓库。
### 初始化版本控制
创建全新的仓库,需要用GIT管理的项目的根目录执行：
```bash
git init #每个项目只一次
```
执行后可以看到，仅仅在项目目录多出了一个.git目录，关于版本等的所有信息都在这个目录里面。
### 克隆远程仓库
另一种方式是克隆远程目录，由于是将远程服务器上的仓库完全镜像一份至本地！

> 克隆一个项目和它的整个代码历史(版本信息)
>
> $ git clone  https://gitee.com/kuangstudy/openclass.git
## Git文件操作
### 文件的四种状态

**版本控制就是对文件的版本控制，要对文件进行修改、提交等操作**，首先要知道文件当前在什么状态，不然可能会提交了现在还不想提交的文件，或者要提交的文件没提交上。

- **Untracked**: 未跟踪, 此文件在文件夹中, 但并没有加入到git库, 不参与版本控制. 通过git add 状态变为Staged.
- **Unmodify**: 文件已经入库, 未修改, 即版本库中的文件快照内容与文件夹中完全一致. 这种类型的文件有两种去处, 如果它被修改, 而变为Modified. 如果使用git rm移出版本库, 则成为Untracked文件
- **Modified**: 文件已修改, 仅仅是修改, 并没有进行其他的操作. 这个文件也有两个去处, 通过git add可进入暂存staged状态, 使用git checkout 则丢弃修改过, 返回到unmodify状态, 这个git checkout即从库中取出文件, 覆盖当前修改 !
- **Staged**: 暂存状态. 执行git commit则将修改同步到库中, 这时库中的文件和本地文件又变为一致, 文件为Unmodify状态. 执行git reset HEAD filename取消暂存, 文件状态为Modified
### 文件状态
上面说文件有4种状态，通过如下命令可以查看到文件的状态：
```bash
git checkout -- [file]	#将Modified的文件回滚至Unmodify的状态。
#例如：
git checkout -- ReadMe.md
```
**添加文件追踪**

```bash
git add .   #此命令为添加所有文件到暂存区.或者也可以更新提交的时候写单个文件或目录名。
```

**提交文件 （-m 后表示说明内容，需要加引号）**

```bash
git commit -m “这里是说明消息”    # 提交暂存区中的内容到本地仓库 -m 提交信息
# Aborting commit:按住shift，同时敲击2下z键.Aborting commit会导致Commit失败。
```
若git push 报错Everything up to date, 检查是不是忘记git commit -m 了。
**查看当前修改状态**

常在执行 add 后，执行 commit 之前使用，也可以在 commit之后使用

```bash
#查看指定文件状态
git status [filename]

#查看所有文件状态
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

### 忽略文件
有些时候我们不想把某些文件纳入版本控制中，比如数据库文件，临时文件，设计文件等

在主目录下建立".gitignore"文件，此文件有如下规则：

- 忽略文件中的空行或以井号（#）开始的行将会被忽略。
- 可以使用Linux通配符。例如：星号（*）代表任意多个字符，问号（？）代表一个字符，方括号（[abc]）代表可选字符范围，大括号（{string1,string2,...}）代表可选的字符串等。
- 如果名称的最前面有一个感叹号（!），表示例外规则，将不被忽略。
- 如果名称的最前面是一个路径分隔符（/），表示要忽略的文件在此目录下，而子目录中的文件不忽略。
- 如果名称的最后面是一个路径分隔符（/），表示要忽略的是此目录下该名称的子目录，而非文件（默认文件或目录都忽略）。

```cmd
#为注释
*.txt        #忽略所有 .txt结尾的文件,这样的话上传就不会被选中！
!lib.txt     #但lib.txt除外
/temp        #仅忽略项目根目录下的TODO文件,不包括其它目录temp。/ 在前面代表忽略上面。
build/       #忽略build/目录下的所有文件。 / 在后面代表忽略下面。
doc/*.txt    #会忽略 doc/notes.txt 但不包括 doc/server/arch.txt
```

### 将远端文件下载到本地
本地已建立仓库:pull即可
本地无仓库:用不了pull。应使用clone，将远端仓库直接clone来。

### 恢复本地被删文件
当误删本地文件，可以使用命令
```bash
git restore <file name>
```
请注意当文件名带有中文时，不要用git显示的转码文件名，应该直接用本来的中文名，否则恢复失败。
## 远程仓库

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
origin：指定要推送到的远程仓库的名称。origin 是默认的远程仓库名称，如果您没有为当前分支配置其他远程仓库，那么 origin 就是默认值。
**5.把所有推送到远端仓库**

```bash
git push -u origin master
```
### 将Workspace文件传送到Remote
```bash
#初始化
git init

#创建仓库。此步也可GUI完成。
$ git remote add origin https://gitee.com/用户个性地址/HelloGitee.git

#在新建仓库时，如果在 Gitee 平台仓库上已经存在 readme 或其他文件，在提交时可能会存在冲突，这时用户需要选择的是保留线上的文件或者舍弃线上的文件，如果您舍弃线上的文件，则在推送时选择强制推送，-f代表force，强制推送需要执行下面的命令(默认不推荐该行为)：
$ git push origin master -f

#如果您选择保留线上的 readme 文件,则需要先执行：
$ git pull origin master

```
```bash
#若出现以下报错
error: src refspec master does not match any

#请使用
git status #以检查文件状态是否都是commited
```
### 给开源项目提交pr
从 GitHub 上下载的 ZIP 文件不包含 Git 的版本控制信息。若想提交pr，不能直接下载zip，必须按照以下流程。
#### 1.fork
您需要先在 GitHub 上对该项目进行 "Fork"。Fork 会在您的 GitHub 账户下创建该项目的一个副本。然后，您可以克隆这个副本并在其基础上进行修改。以下是详细步骤：
转到项目的 GitHub 页面，点击右上角的 "Fork" 按钮。这将在您的 GitHub 账户下创建一个该项目的副本。
#### 2.clone
将项目克隆到本地，然后在新分支上进行修改。以下是详细的操作步骤：

1.  首先，找到项目的 GitHub 页面，点击 "Code" 按钮，复制仓库的 HTTPS 或 SSH 地址。
    
2.  在本地计算机上克隆仓库：
    
    bash
    
    ```bash
    git clone https://github.com/username/project.git
    ```
    
    或使用 SSH：
    
    bash
    
    ```bash
    git clone git@github.com:username/project.git
    ```
#### 3.创建一个新的分支
 创建一个新的分支，以便在其上进行更改。将 `<new_branch>` 替换为您的分支名称：
    ```css
    git checkout -b <new_branch>
    ```
#### 4.修改代码
#### 5.文件操作
    ```bash
    git add .
    git commit -m "Your commit message"
    git push origin <new_branch>
    ```

##### 5.1  使用Github访问令牌（可选）
 push至Github上，可能会要求输入访问令牌（Personal Access Token, 简称PAT）。若跳过输入访问令牌，则会要求输入Github账号密码，但即使输入正确，也会提示账号密码访问方式已被弃用，还是会提示输入访问令牌。这是因为 GitHub 在2021年8月13日已经移除了对密码认证的支持。
1.  登录到您的 GitHub 账户。
2.  点击右上角的个人头像，选择“Settings”（设置）。
3.  在左侧菜单栏中，选择“Developer settings”（开发者设置）。
4.  点击“Personal access tokens”（个人访问令牌）。
5.  在您创建的访问令牌列表中找到相应的令牌，检查其权限范围。确保至少勾选了 "repo" 权限。
#### 6.PR
转到项目的 GitHub 页面，您应该会看到一个提示，询问是否要创建新的 Pull Request。点击 "Compare & pull request"。在打开的页面上填写 PR 的标题和描述，确保您详细说明了您所做的更改。完成后，点击 "Create pull request"。
此时，您已成功提交了一个 PR。项目的维护者将收到通知，他们可以查看、讨论和合并您的更改。如果他们要求进行任何修改，只需在本地继续修改您的分支，然后再次推送，PR 将自动更新。
## 更新远程仓库

```bash
git pull	#拉取更新，每次必做防止团队合作干掉别人上传的代码
git add .   #更新文件后添加追踪
git commit -m “这里是说明消息”
git status	#查看当前修改状态
git branch	#查看当前分支
git push	#推送向远程仓库
```

**分支管理**
**分支在GIT中相对较难，分支就是科幻电影里面的平行宇宙**，如果两个平行宇宙互不干扰，那对现在的你也没啥影响。不过，在某个时间点，两个平行宇宙合并了，我们就需要处理一些问题了！
```bash
git branch			#查看当前所有本地分支
git branch -r        # 列出所有远程分支。-r代表remote。
git branch -a       #列出所有分支，包含本地和remote，-a代表all 
git branch -d [branch-name]    # 删除分支
git branch [branch-name]    # 新建一个分支，但依然停留在当前分支

git chechout aaa 	#切换分支aaa
git chechout -b aaa #本地创建 aaa分支，同时切换到aaa分支
#只有提交的时候才会在服务端上创建一个分支

git merge [branch]    # 合并指定分支到当前分支

# 删除远程分支
git push origin --delete [branch-name]
git branch -dr [remote/branch]
```
如果同一个文件在合并分支时都被修改了则会引起冲突：解决的办法是我们可以修改冲突文件后重新提交！选择要保留他的代码还是你的代码！

master主分支应该非常稳定，用来发布新版本，一般情况下不允许在上面工作，工作一般情况下在新建的dev分支上工作，工作完后，比如上要发布，或者说dev分支代码稳定后可以合并到主分支master上来。
