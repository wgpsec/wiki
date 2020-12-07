---
title: Docker微服务构建指南
---
# Docker微服务构建指南
> Docker可以轻松的为任何应用创建一个轻量级的、可移植的、自给自足的容器。
>
> 通常用于Web应用的自动化打包和发布。
>

**Docker与虚拟机的区别**

> 与虚拟机相比，它以一种轻量级的方式实现了运行空间的隔离。
>
> 如果物理机是一幢住宅楼，虚拟机就是大楼中的一户户套房，而容器技术就是套房里的一个个隔断。 

# 安装Docker

以`Centos`为例

```bash
yum install -y yum-utils	# yum-config-manager需要用这个包
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo   #安装docker官方源
yum makecache
yum -y install docker-ce
systemctl start docker
```

**镜像下载加速，使用国内源**

```bash
#这个用的是中科大的源，最好还是用阿里的源更稳定
sudo vim /etc/docker/daemon.json
{"registry-mirrors": ["https://docker.mirrors.ustc.edu.cn"]}
systemctl restart docker
```

阿里云的镜像最快，但是要登陆阿里云才能用 (淘宝账号我不信你没有)

([阿里云Docker仓库地址](https://cr.console.aliyun.com/cn-beijing/instances/namespaces)，[使用帮助](https://help.aliyun.com/document_detail/60743.html?spm=a2c4g.11186623.6.550.4b6c378bVmbEfb))

# Docker镜像命令

> Docker 镜像是一个特殊的文件系统，除了提供容器运行时所需的程序、库、资源、配置等文件外
>
> 还包含了一些为运行时准备的一些配置参数（如匿名卷、环境变量、用户等）
>
> 镜像不包含任何动态数据，其内容在构建之后也不会被改变 

```bash
docker search ubuntu	#查找镜像
docker pull ubuntu		#拉取镜像(就是下载)
docker images			#查看所有Docker镜像
docker history			#查看镜像历史（有哪些层）
docker system df		#查看镜像、容器、数据卷所占用的空间
docker rmi -f id		#删除镜像
docker rmi -f `docker images -q`	#删除全部镜像
```

# Docker容器命令

> 镜像（`Image`）和容器（`Container`）的关系，就像是面向对象程序设计中的 `类` 和 `实例` 一样
>
> 镜像是静态的定义，容器是镜像运行时的实体，容器可以被创建、启动、停止、删除、暂停等
>
> 容器的实质是进程，但与直接在宿主执行的进程不同，容器进程运行于属于自己的独立的 [命名空间]
>
> 因此容器可以拥有自己的 `root` 文件系统、自己的网络配置、自己的进程空间，甚至自己的用户 ID 空间
>
> 容器内的进程是运行在一个隔离的环境里，使用起来，就好像是在一个独立于宿主的系统下操作一样

```bash
docker ps			#查看所有启动的容器（若查看所有的容器包括已经关闭,添加-a参数即可）
docker inspect ID	#查看容器信息（数据卷等 -> "Mounts"）
docker stats ID		#查看Docker状态
docker logs ID		#查看容器日志（报错和命令）

docker run -it -d --name ubuntu_wintrysec -p 8088:80 ubuntu	
#运行Docker镜像
#-d	守护态运行，不直接把执行命令的结果输出在当前宿主机下
#--name参数为自定义容器名
#-p参数为指定端口映射、后者为容器的端口(我们访问Docker的宿主机8080端口)
#成功后台运行后会返回一个容器的id，只需要记住前两位即可

docker exec -it ID bash	
#进入一个正在运行的容器的shell，容器id前4位就行,或者容器名也行

exit				#退出容器
docker stop ID		#停止容器运行，写容器名也行，start是开启
docker rm ID		#删除容器
docker rm `docker ps -a -q`		#删除所有已经关闭的容器，-f能把正在运行的也关闭
```



# Dockerfile定制镜像

> `Dockerfile`用来创建一个自定义的镜像,包含了用户指定的软件依赖等，用于从无到有的构建镜像
>
> 把每一层修改、安装、构建、操作的命令都写入一个脚本，用这个脚本来构建、定制镜像 
>
> 可以解决镜像无法重复的问题、镜像构建透明性的问题、体积的问题。
>

### FROM指定基础镜像

```bash
FROM ubuntu		#指定基础镜像
```

除了选择现有镜像为基础镜像外，Docker 还存在一个特殊的镜像，名为 `scratch`；

这个镜像是虚拟的概念，并不实际存在，它表示一个空白的镜像；

如果以 `scratch` 为基础镜像的话，意味着你不以任何镜像为基础，接下来所写的指令将作为镜像第一层开始存在；

对于 Linux 下静态编译的程序来说，并不需要有操作系统提供运行时支持，所需的一切库都已经在可执行文件里了；

因此直接 `FROM scratch` 会让镜像体积更加小巧，使用 Go 语言开发的应用很多会使用这种方式来制作镜像。

### RUN执行命令

Dockerfile 每一个 `RUN` 的行为，都会新建立一层构成新的镜像，这样会使镜像非常臃肿。

**正确的写法应该这样：**  

```bash
RUN buildDeps='gcc libc6-dev make wget' \
    && apt-get update \
    && apt-get install -y $buildDeps \
    && wget -O redis.tar.gz "http://download.redis.io/releases/redis-5.0.3.tar.gz" \
    && mkdir -p /usr/src/redis \
    && tar -xzf redis.tar.gz -C /usr/src/redis --strip-components=1 \
    && make -C /usr/src/redis \
    && make -C /usr/src/redis install \
    && rm -rf /var/lib/apt/lists/* \
    && rm redis.tar.gz \
    && rm -r /usr/src/redis \
    && apt-get purge -y --auto-remove $buildDeps
```

首先这些命令只有一个目的，就是编译、安装 redis 可执行文件；因此没有必要建立很多层，这是一层能解决的事情

使用 `&&` 将各个所需命令串联起来，Dockerfile支持行尾添加 `\` 的命令换行方式，以及行首 `#` 进行注释的格式

最后添加了清理工作的命令，删除了为了编译构建所需要的软件，清理了所有下载、展开的文件，并且还清理了 `apt` 缓存文件

这是很重要的一步，镜像是多层存储，每一层的东西并不会在下一层被删除，会一直跟随着镜像

因此镜像构建时，一定要确保每一层只添加真正需要添加的东西，任何无关的东西都应该清理掉

### 构建镜像

```bash
docker build -t ubuntu:v1 .
docker build [选项] <上下文路径/URL/->
```

### 指令详解

```bash
COPY package.json /usr/src/
#从构建上下文目录中复制文件到新的一层的镜像内的 <目标路径> 位置

CMD	["nginx", "-g", "daemon off;"]	
#容器启动命令
#直接执行 nginx 可执行文件，并且要求以前台形式运行，不能用service nginx start

ENV VERSION=1.0 NAME="Vuln Range"
#ENV用来定义环境变量，用双引号把包含空格的引起来

VOLUME /data
#匿名卷，运行时如果用户忘记了指定数据卷挂载位置，会自动挂载数据到/data目录

USER redis
#切换到指定用户，接下来会以这个用户权限执行RUN、CMD等命令
```

如果以 `root` 执行的脚本，在执行期间希望改变身份，比如希望以某个已经建立好的用户来运行某个服务进程

不要使用 `su` 或者 `sudo`，这些都需要比较麻烦的配置，而且在 TTY 缺失的环境下经常出错，建议使用 `gosu`。

```bash
# 建立 redis 用户，并使用 gosu 换另一个用户执行命令
RUN groupadd -r redis && useradd -r -g redis redis

# 下载 gosu
RUN wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/1.12/gosu-amd64" \
    && chmod +x /usr/local/bin/gosu \
    && gosu nobody true
    
# 设置 CMD，并以另外的用户执行
CMD [ "exec", "gosu", "redis", "redis-server" ]
```

# 数据管理

数据卷是被设计用来持久化数据的，它的生命周期独立于容器，不会在容器被删除后自动删除 

> `数据卷` 可以在容器之间共享和重用
>
> 对 `数据卷` 的修改会立马生效
>
> 对 `数据卷` 的更新，不会影响镜像
>
> `数据卷` 默认会一直存在，即使容器被删除

```bash
#创建数据卷
docker volume create my-vol

#查看所有数据卷
docker volume ls

#挂载主机目录到Docker容器中
--mount type=bind,source=/src/webapp,target=/usr/share/nginx/html

#查看指定 数据卷 的信息
docker volume inspect my-vol

#清除无主数据卷
docker volume prune
```

# 网络管理

```bash
docker network ls		#列出已有docker网络
docker network prune -f	#删除所有未使用的网络（即对应容器已经删除的网络）
docker network inspect bridge	#显示一个或多个网络的详细信息
```

**外部访问容器**

```bash
#映射指到定地址的任意端口 (随机分配一个外部访问用的端口)
docker run -d -p 127.0.0.1::80 nginx

#查看端口映射配置
docker port ID
```

**容器互联**

```bash
#1、创建一个Docker网络
docker network create -d bridge my-net

#2、运行一个容器并连接到新建的 my-net 网络
docker run -it --rm --name busybox1 --network my-net busybox sh

#3、打开新的终端，再运行一个容器并加入到 my-net 网络
docker run -it --rm --name busybox2 --network my-net busybox sh

#4、证明容器互通，用其中一个容器，ping另外一个容器
```

**容器访问控制**

容器要想访问外部网络，需要本地系统的转发支持

```bash
sysctl -w net.ipv4.ip_forward=1		#开启转发
```

# Docker compose(启动服务)

`docker compose` 是一个整合发布应用的利器([官方安装手册](https://docs.docker.com/compose/install/))

多个容器相互配合来完成某项任务，比如**Web服务容器+数据库容器** 

> - 服务 (`service`)：一个应用容器，实际上可以运行多个相同镜像的实例。
> - 项目 (`project`)：由一组关联的应用容器组成的一个完整业务单元。

可见，一个项目可以由多个服务（容器）关联而成，`Compose` 面向项目进行管理。

默认的模板文件是 `docker-compose.yml`

----

其中定义的每个服务都必须通过 image 指令指定镜像或 build 指令（需要 `Dockerfile`，除非有registry）来自动构建

不想部署`私有registry`又不想让`Dockerfile`存在的话，可以使用官方的`Docker Hub`, 然后使用国内源加速访问。

**`Centos` 安装docker-compose**

首先确认已经安装好了python和pip

```bash
pip install docker-compose -i https://pypi.mirrors.ustc.edu.cn/simple/
```

**简单的`docker-compose.yml`示例讲解**

```bash
version: '3'
services:
  db: 	#数据库服务
    image: mysql:8.0	#使用的镜像
    command:
      --default_authentication_plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
    volumes: 
      - db_data:/var/lib/mysql	#用数据卷名称，设置数据卷所挂载路径
    restart: always
    environment: 
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: web-bug
  web-bug: #Web服务
   depends_on:
    - db
   image: wintrysec/web-bug	#使用的镜像
   ports:
    - "80:80"
   restart: always
   environment: 
    DB_HOST: db:3306
    DB_USER: root
    DB_PASSWORD: root
  volumes:	#如果上边挂载数据卷的路径为数据卷名称，必须在文件中配置数据卷
   db_data:
    - "web-bug.sql"
```

**注意事项：**

YAML 语言基本语法规则如下 

> - 大小写敏感
> - 使用缩进表示层级关系
> - 缩进时不允许使用Tab键，只允许使用空格。
> - 缩进的空格数目不重要，只要相同层级的元素左侧对齐即可
> - 每个散列项**冒号**和**值**之间至少有一个空格！ 

[在线书写YAML(自动检测语法)](http://nodeca.github.io/js-yaml/)

# 上传到Docker Hub

**1、注册[Docker Hub](https://hub.docker.com/repository/docker/wintrysec/wintrysec-lab)账户**

2、使用Docker hub账号在验证**本地登录**  (如果用阿里云的私有仓库的话按阿里云帮助来)

```bash
docker login
#登录信息信息,保存在~/.docker/config.json文件里
```

**3、注意事项**

```bash
docker images
#查看本地镜像，如果 Docker ID/仓库名 不是属于你的账户是上传不了的

#当然可以更改，命令如下
docker tag 镜像ID 用户名称/Ubuntu:新的标签名(tag)

docker commit -a '新镜像' 容器ID 用户名称/镜像名:标签
#用这种方式，把使用这个ID的"容器"保存成型个新镜像
```

**4、将镜像推送到远程仓库**

```bash
docker push 用户名/仓库名:tagname
docker push wintrysec/wintrysec-lab:tagname
#这是Docker Hub官方仓库的命令，阿里云的私有仓库请看阿里云帮助
```
