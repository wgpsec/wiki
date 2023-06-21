<h1 align="center"> 狼组安全团队公开知识库 🚀 </h1>

# 使用方式

本地搭建预览环境

## 安装依赖

```bash
yarn install
```

## 运行

```bash
yarn run dev
```

## 打包构建

```bash
yarn run build
```

# 编写规范
 - 知识库相关文件命名全小写，如果有多个单词请使用 `-` 进行拼接。e.g：`sql-injection`

# 提交方式

> 公开WiKi 基于Github Actions 实现了自动化构建，仅需上传源文件即可自动化构建

# 文章插入

完成md文档放置完成后，编辑 `sidebar_contents`

例：CTF 分类，添加仅需在 `children` 数字内添加md路径

```
{
		title: "CTF",
		collapsable: true,
		children:[
            "/knowledge/ctf/",
            "/knowledge/ctf/ctf",
            "/knowledge/ctf/RSA",
            "/knowledge/ctf/Volatility",
            "/knowledge/ctf/deserialize-byte-escape",
            "/knowledge/ctf/js-prototype-chain-pollution",
            "/knowledge/ctf/ssrf-gopher",
            "/knowledge/ctf/xxe-bypass-payload"
		]
	},
```

更新日志：`guide/changelog.md`



**提示** 

含有 HTML标签、以及模板标签字符如`{1+1}` 务必使用 "`"（键盘左上角数字1旁）包裹，否则页面会显示不正常 


## 图片

若图片非外链格式，需要将图片放置到 `docs\.vuepress\public\images\` 建立文章为名称（英文）的文件夹并放置

图片引用方式

```
![ssrf](/images/ssrf-gopher/2.png)
```

