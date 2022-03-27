module.exports = [
    
    '/knowledge/',
    {
		title: "CTF",
		collapsable: true,
		children:[
            "/knowledge/ctf/",
            "/knowledge/ctf/ctf",
            "/knowledge/ctf/xxe",
			"/knowledge/ctf/ssrf-gopher",
            "/knowledge/ctf/exec",
			"/knowledge/ctf/PRF",
            "/knowledge/ctf/php-serialize",    
			"/knowledge/ctf/uploadfile",
            "/knowledge/ctf/deserialize-byte-escape",
            "/knowledge/ctf/bypass-disable-function",
			"/knowledge/ctf/JWT",
            "/knowledge/ctf/js-prototype-chain-pollution",
            "/knowledge/ctf/JDBC-Unserialize",
            "/knowledge/ctf/SSTI",
			"/knowledge/ctf/CBC",
			"/knowledge/ctf/Hash-Leng-Extension",
            "/knowledge/ctf/RSA",
            "/knowledge/ctf/Volatility",
            "/knowledge/ctf/ret2text",
            "/knowledge/ctf/ret2shellcode",
            "/knowledge/ctf/ret2syscall",
			"/knowledge/ctf/re2libc",
			"/knowledge/ctf/ret2csu",
			"/knowledge/ctf/UPX",
			"/knowledge/ctf/basicheap",
			"/knowledge/ctf/how2heap",
			"/knowledge/ctf/iofile",
			"/knowledge/ctf/32264",
			"/knowledge/ctf/z3"
		]
	},
      {
		title: "基础知识",
		collapsable: true,
		children:[
            "/knowledge/base/",
            "/knowledge/base/safety",
            "/knowledge/base/network-web",
            "/knowledge/base/network-tcp-ip",
            "/knowledge/base/network-http",
            "/knowledge/base/network-https",
            "/knowledge/base/network-route",
            "/knowledge/base/linux-cmd",
            "/knowledge/base/linux-awk",
            "/knowledge/base/git-base",
            "/knowledge/base/docker-base"
		]
      },
      {
		title: "工具手册",
		collapsable: true,
		children:[
            "/knowledge/tools/nmap",
            "/knowledge/tools/sqlmap",
            "/knowledge/tools/metasploit",
            "/knowledge/tools/burpsuite",
            "/knowledge/intranet/Cobalt-Strike",
			"/knowledge/intranet/Aggressor-script"
		]
	},
	{
		title: "Web安全",
		collapsable: true,
		children:[
            "/knowledge/web/",
            "/knowledge/web/unauthorized",
            "/knowledge/web/infoleak",
            "/knowledge/web/fileuploads",
            "/knowledge/web/fileincludes",
            "/knowledge/web/cmd_injection",
            "/knowledge/web/logical",
            "/knowledge/web/csrf-ssrf",
            "/knowledge/web/same-origin-policy",
            "/knowledge/web/xss",
            "/knowledge/web/xxe",
            "/knowledge/web/sql_injection",
            "/knowledge/web/mysql-write-shell",
            "/knowledge/web/websocket-sec"
		]
	},
	
	{
		title: "攻防对抗",
		collapsable: true,
		children:[
            "/knowledge/hw/",
            "/knowledge/hw/border-info",
            "/knowledge/hw/agent",
            "/knowledge/hw/host-survival-domain",
            "/knowledge/hw/intradomain-port",
            "/knowledge/hw/to-root",
            "/knowledge/hw/hold-root",
            "/knowledge/hw/transverse",
            "/knowledge/hw/log-action",
            "/knowledge/hw/2020-defend-tips",
            "/knowledge/hw/windows-emergency-response",
            "/knowledge/hw/linux-emergency-response",
            "/knowledge/hw/kill-webshell",
            "/knowledge/hw/purple-team",
		]
    },
	{
		title: "代码审计",
		collapsable: true,
		children:[
            "/knowledge/code-audit/",
            "/knowledge/code-audit/php-code-audit",
			"/knowledge/code-audit/java-code-base",
		]
    },
];