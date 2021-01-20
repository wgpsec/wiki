module.exports = [
    '/knowledge/',
      {
		title: "基础知识",
		collapsable: true,
		children:[
            "/knowledge/base/safety",
            "/knowledge/base/modern-crypt",
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
            "/knowledge/web/sql-injection",
            "/knowledge/web/xss",
            "/knowledge/web/expression-language-injection",
            "/knowledge/web/xxe",
            "/knowledge/web/source-leaked",
            "/knowledge/web/code-injection",
            "/knowledge/web/csrf-ssrf",
            "/knowledge/web/file-download",
            "/knowledge/web/file-includes",
            "/knowledge/web/file-upload",
            "/knowledge/web/jwt-cookie",
            "/knowledge/web/logical-vulns",
            "/knowledge/web/phpsec",
            "/knowledge/web/same-origin-policy",
            "/knowledge/web/session-sec"
		]
	},
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
            "/knowledge/ctf/SSTI",
			"/knowledge/ctf/CBC",
			"/knowledge/ctf/Hash-Leng-Extension",
            "/knowledge/ctf/RSA",
            "/knowledge/ctf/Volatility",
            "/knowledge/ctf/ret2text",
            "/knowledge/ctf/ret2shellcode",
            "/knowledge/ctf/ret2syscall",
			"/knowledge/ctf/re2libc",
			"/knowledge/ctf/ret2csu"
		]
	},
	{
		title: "渗透测试",
		collapsable: true,
		children:[
            "/knowledge/hw/",
            "/knowledge/hw/wan-info",
            "/knowledge/hw/seek-lan-entry",
            "/knowledge/hw/tunnel",
            "/knowledge/hw/trans-file",
            "/knowledge/hw/reverse-shell",
            "/knowledge/hw/privilege",
            "/knowledge/hw/webshell",
            "/knowledge/hw/os-backdoor",
            "/knowledge/hw/dns-c2",
            "/knowledge/hw/lan-info",
            "/knowledge/hw/get-os-passwd",
            "/knowledge/hw/hash-pass",
            "/knowledge/hw/ticket-pass",
            "/knowledge/hw/Gold-and-silver-notes",
            "/knowledge/hw/host-online",
            "/knowledge/hw/remove-os-log",
            "/knowledge/hw/defend-plan",
            "/knowledge/hw/linux-jiagu",
            "/knowledge/hw/win-jiagu",
            "/knowledge/hw/emergency-response",
            "/knowledge/hw/linux-emergency-response",
            "/knowledge/hw/win-emergency-response",
            "/knowledge/hw/remove-webshell"
		]
    },
	{
		title: "代码审计",
		collapsable: true,
		children:[
            "/knowledge/code-audit/",
            "/knowledge/code-audit/php-code-audit",
		]
    },
];