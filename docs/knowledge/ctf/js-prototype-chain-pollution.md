---
title: 【WEB】nodejs原型链污染
---
# nodejs原型链污染

js 是由对象组成的，对象与对象之间存在着继承关系

每个对象都有一个指向它的原型的内部链接，而这个原型对象又有他自己的原型，直到 null 为止

整体看来就是多个对象层层继承，实例对象的原型链接形成了一条链，也就是 js 的原型链

在 js 中每个函数都有一个 prototype 属性，而每个对象中也有一个 **proto** 属性用来指向实例对象的原型

而每个原型也都有一个 constructor 属性执行相关联的构造函数，我们就是通过构造函数生成实例化的对象

![3.png](/images/js-prototype-chain-pollution/3.png)

由于对象之间存在继承关系，所以当我们要使用或者输出一个变量就会通过原型链向上搜索，当上层没有就会再向上上层搜索，直到指向 null，若此时还未找到就会返回 undefined

这幅图的原型链是 cat->Cat.protype->Object.prototype->null

而如果修改了一个对象的原型，那么会影响所有来自于这个原型的对象，这就是原型链污染

原型链污染通常出现在对象，数组的键名或者属性名可控，同时是赋值语句的情况下 ( 通常使用 json 传值 )

可以使用 npm audit 检查漏洞，（npm audit 是 npm 6新增的一个命令，可以允许开发人员分析复杂的代码并查明特定的漏洞）

![2.png](/images/js-prototype-chain-pollution/2.png)

其中常见的危险函数有

merge()

clone()

以及一些插件，例如比赛中出现的

Ciscn2020 初赛	set-value

网鼎杯2020 青龙组	undefsafe  版本<2.0.3

以下用比赛中的一个环境举例

目标是修改预设好的 Admin[key] 使它等于我们传入的 password

```
router.post("/DeveloperControlPanel", function (req, res, next) {
    // not implement
    if (req.body.key === undefined || req.body.password === undefined){
        res.send("What's your problem?");
    }else {
        let key = req.body.key.toString();
        let password = req.body.password.toString();
        if(Admin[key] === password){
            res.send("You get flag !");
        }else {
            res.send("Wrong password!Are you Admin?");
        }
    }
});
```

以下为可利用的关键代码，稍微改改源码后本地起一个服务

```
const setFn = require('set-value');
router.get('/SpawnPoint', function (req, res, next) {
    req.session.knight = {
        "HP": 1000,
        "Gold": 10,
        "Firepower": 10
    }
    res.send("Let's begin!");
});

router.post("/Privilege", function (req, res, next) {
    // Why not ask witch for help?
    if(req.session.knight === undefined){
        res.redirect('/SpawnPoint');
    }else{
        if (req.body.NewAttributeKey === undefined || req.body.NewAttributeValue === undefined) {
            res.send("What's your problem?");
        }else {
            let key = req.body.NewAttributeKey.toString();
            let value = req.body.NewAttributeValue.toString();
            setFn(req.session.knight, key, value);
            res.send("OK");
			console.dir(req.session.knight.__proto__)
        }
    }
});
```

可以看到此处存在一个赋值操作，同时键名和键值都可控

![4.png](/images/js-prototype-chain-pollution/4.png)

req.session.knight 添加了新的属性

![5.png](/images/js-prototype-chain-pollution/5.png)

结合上面所说，我们可以直接利用这里给原链赋值，从而给之后的所有原型都加上一个新的属性，然后验证新添加的键名，并传入键值即可达成目标

req.session.knight 的上上层是 null ，给它的原链加一个新属性

![7.png](/images/js-prototype-chain-pollution/7.png)

添加成功

![6](/images/js-prototype-chain-pollution/6.png)

由于 Admin 没有这个变量就会通过原型链向上搜索，从而找到我们刚添加的 newpsw

![8.png](/images/js-prototype-chain-pollution/8.png)

可以发现我们成功污染了原型链，并通过了验证