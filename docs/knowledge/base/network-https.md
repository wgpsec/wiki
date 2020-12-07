---
title: 【网络基础】SSL双向认证
---

# Https单向认证和双向认证

**SSL/TLS是同一个东西的不同阶段**

> SSL 是英文 “Secure Sockets Layer” 的缩写，中文叫做“安全套接层”。
>
> 它是在上世纪90年代中期，由网景公司设计的。
>
> 到了1999年，`SSL` 因为应用广泛，已经成为互联网上的事实标准。
>
> IETF 就在那年把 `SSL` 标准化，标准化之后的名称改为 TLS；
>
> 是“Transport Layer Security”的缩写，中文叫做 “传输层安全协议”。 

## `HTTPS`利用对称与非对称加密算法结合的方式

> **对称加密**：
>
> 就是通信双方使用一个密钥；该密钥既用于数据加密（发送方），也用于数据解密（接收方）
>
> 速度高，可加密内容较大，用来加密会话过程中的消息 
>
> **非对称加密**：
>
> 使用两个密钥；发送方使用公钥（公开密钥）对数据进行加密，数据接收方使用私钥对数据进行解密
>
> 速度慢，但能提供更好的身份认证技术，用来加密对称加密的密钥 

## `HTTPS`连接建立过程：

> 1、客户端发送支持的加密协议及版本，`SSL`、`TLS`（传输层安全性协议：`SSL`是`TLS`的前身）
>
> 2、服务器从中筛选合适的加密协议
>
> 3、服务器端返回证书，证书中有公钥
>
> 4、客户端使用根证书验证证书合法性
>
> 5、客户端生成对称密钥，通过证书中的公钥加密，发送到服务端
>
> 6、服务端使用私钥解密，获取对称密钥，使用对称密钥加密数据
>
> 7、客户端解密数据，`SSL`加密通信建立，开始通信......

`HTTPS`使用携带公钥信息的数字证书来保证公钥的安全性和完整性，并非直接传输公钥信息 

## 单向认证：

> 1、客户端发送SSL协议版本等信息
>
> 2、服务端返回SSL版本、随机数信息、以及服务器公钥(在ca证书中)
>
> 3、客户端使用根证书校验服务端证书合法性，合法继续，否则警告
>
> 4、客户端发送自己可支持的对称加密方案给服务端，供其选择
>
> 5、服务端选择加密程度高的方案
>
> 6、服务端将选择好的加密方案，明文发送给客户端
>
> 7、客户端收到加密方案，产生随机码，作为对称加密密钥，用服务端公钥加密，发给服务端
>
> 8、服务端使用私钥解密，获得对称加密密钥
>
> 9、对称加密通信数据，开始通信

## 双向认证：

双向认证和单向认证原理差不多，只是除了客户端需要认证服务端以外，增加了服务端对客户端的认证。

> 1、客户端发送SSL协议版本等信息
>
> 2、服务端返回SSL版本、随机数信息、以及服务器公钥(在ca证书中)
>
> 3、客户端使用根证书校验服务端证书合法性，合法继续，否则警告
>
> **4、客户端通过校验后，将自己的证书和公钥发给服务端**
>
> **5、服务端校验证书，获得客户端公钥**
>
> 6、客户端发送自己可支持的对称加密方案给服务端，供其选择
>
> 7、服务端选择加密程度高的方案
>
> 8、服务端将选择好的加密方案，**使用客户端公钥加密后**，发送给客户端
>
> 9、客户端收到加密方案，产生随机码，作为对称加密密钥，用服务端公钥加密，发给服务端
>
> 10、服务端使用私钥解密，获得对称加密密钥
>
> 11、对称加密通信数据，开始通信

# 实验使用Golang模拟单向认证和双向认证

Go语言中有标准库`crypto/x509软件包`， 用于分析 `X.509` 编码的密钥和证书 

安装golang：https://studygolang.com/articles/6165

Go手册：https://cloud.tencent.com/developer/doc/1101

入门教程：https://github.com/jackhu1990/golangman

## 单向认证，对服务端证书进行校验

**自签发证书，生成根证书**

根证书是CA认证中心给自己颁发的证书,是信任链的起始点.

这里我们自己做CA使用`openssl`命令来生成根证书. 

首先建立我们自己的CA，需要生成一个CA私钥和一个CA的数字证书 

**生成CA私钥和CA证书**

```bash
openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -subj "/CN=wintrysec_com" -days 5000 -out ca.crt
```

**然后生成server端的私钥，生成数字证书请求，并用我们的ca私钥签发server的数字证书** 

开始生成`X509`格式的自签名证书,会要求输入各项信息（国家，省份，城市，组织，姓名，email等 )

```bash
openssl genrsa -out server.key 2048
openssl req -new -key server.key -subj "/CN=localhost" -out server.csr
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 5000
```

现在我们的工作目录下，有以下私钥和证书文件：

> CA:
>
> ​	私钥文件 `ca.key`
>
> ​	数字证书`ca.crt`
>
> Server:
>
> ​	私钥文件 `server.key`
>
> ​	数字证书 `server.crt`

**服务端程序，`server.go`:**

```go
// server.go
package main

import (
    "fmt"
    "net/http"
)

//定义Web服务器
func handler(w http.ResponseWriter, r *http.Request) 
{
    fmt.Fprintf(w,"这是HTTPS服务器页面，单向认证完成，我们可以通信了！")
}

func main() {
    http.HandleFunc("/", handler)
    http.ListenAndServeTLS(":8081",
        "server.crt", "server.key", nil)
        //ListenAndServeTLS需要HTTPS连接，必须提供包含服务器证书和匹配私钥的文件
}
```

**客户端程序，`client.go`:**

```go
//client.go
package main

import (
    "crypto/tls"
    "crypto/x509"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    pool := x509.NewCertPool()
    caCertPath := "ca.crt"

    caCrt, err := ioutil.ReadFile(caCertPath)
    if err != nil {
        fmt.Println("ReadFile err:", err)
        return
    }
    pool.AppendCertsFromPEM(caCrt)

    tr := &http.Transport{
        TLSClientConfig: &tls.Config{RootCAs: pool},
    }
    client := &http.Client{Transport: tr}
    resp, err := client.Get("https://localhost:8081")
    if err != nil {
        fmt.Println("Get error:", err)
        return
    }
    defer resp.Body.Close()
    body, err := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```

## 双向认证，对客户端证书进行校验

服务端可以要求对客户端的证书进行校验，以更严格识别客户端的身份，限制客户端的访问。

要对客户端数字证书进行校验，首先客户端需要先有自己的证书。

`golang`的`tls`要校验`ExtKeyUsage`，可以在生成时指定`extKeyUsage` 

创建`client.ext`，内容： `extendedKeyUsage=clientAuth` 

**生成客户端的私钥与证书**

```bash
openssl genrsa -out client.key 2048
openssl req -new -key client.key -subj "/CN=wintrysec_com" -out client.csr
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial -extfile client.ext -out client.crt -days 5000
```

**服务端程序，`server.go`:**

server端要校验client端的数字证书，并且加载用于校验数字证书的`ca.crt`

```go
//server.go
package main

import (
    "crypto/tls"
    "crypto/x509"
    "fmt"
    "io/ioutil"
    "net/http"
)

type myhandler struct {
}

func (h *myhandler) ServeHTTP(w http.ResponseWriter,r *http.Request) 
{
    fmt.Fprintf(w,
        "这是HTTPS页面，双向认证完成，我们可以通信了!\n")
}

func main() {
    pool := x509.NewCertPool()
    caCertPath := "ca.crt"

    caCrt, err := ioutil.ReadFile(caCertPath)
    if err != nil {
        fmt.Println("ReadFile err:", err)
        return
    }
    pool.AppendCertsFromPEM(caCrt)//加载用于校验数字证书的ca.crt

    s := &http.Server{
        Addr:    ":8081",
        Handler: &myhandler{},
        TLSConfig: &tls.Config{
            ClientCAs:  pool,//用于校验客户端证书
            ClientAuth: tls.RequireAndVerifyClientCert,
            //通过将tls.Config.ClientAuth赋值为tls.RequireAndVerifyClientCert来实现Server强制校验client端证书
        },
    }

    err = s.ListenAndServeTLS("server.crt", "server.key")
    if err != nil {
        fmt.Println("ListenAndServeTLS err:", err)
    }
}
```

**客户端程序，`client.go`:**

```go
//client.go

package main
import (
    "crypto/tls"
    "crypto/x509"
    "fmt"
    "io/ioutil"
    "net/http"
)

func main() {
    pool := x509.NewCertPool()
    caCertPath := "ca.crt"

    caCrt, err := ioutil.ReadFile(caCertPath)
    if err != nil {
        fmt.Println("ReadFile err:", err)
        return
    }
    pool.AppendCertsFromPEM(caCrt)

    cliCrt, err := tls.LoadX509KeyPair("client.crt", "client.key")//需要加载client.key和client.crt用于server端连接时的证书校验 
    if err != nil {
        fmt.Println("Loadx509keypair err:", err)
        return
    }

    tr := &http.Transport{
        TLSClientConfig: &tls.Config{
            RootCAs:      pool,
            Certificates: []tls.Certificate{cliCrt},
        },
    }
    client := &http.Client{Transport: tr}
    resp, err := client.Get("https://localhost:8081")
    if err != nil {
        fmt.Println("Get error:", err)
        return
    }
    defer resp.Body.Close()
    body, err := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}
```
