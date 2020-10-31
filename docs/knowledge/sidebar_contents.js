module.exports = [
    '/knowledge/',
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
            "/knowledge/ctf/RSA",
            "/knowledge/ctf/Volatility",
            "/knowledge/ctf/deserialize-byte-escape",
            "/knowledge/ctf/js-prototype-chain-pollution",
            "/knowledge/ctf/ssrf-gopher",
            "/knowledge/ctf/xxe-bypass-payload"
		]
	},
	{
		title: "红蓝对抗",
		collapsable: true,
		children:[
            "/knowledge/hw/",
            "/knowledge/hw/boundary-info",
            "/knowledge/hw/checklist",
            "/knowledge/hw/net-proxy",
            "/knowledge/hw/webshell",
            "/knowledge/hw/cc",
            "/knowledge/hw/os-shell",
            "/knowledge/hw/to-root",
            "/knowledge/hw/lan-info",
            "/knowledge/hw/ntml-hash",
            "/knowledge/hw/domain-pentest",
            "/knowledge/hw/del-log",
            "/knowledge/hw/defense-assets",
            "/knowledge/hw/linux-baselinesec",
            "/knowledge/hw/windows-baselinesec",
            "/knowledge/hw/monitor-read",
            "/knowledge/hw/emergency-response",
            "/knowledge/hw/back-counter"
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
	{
		title: "内网系列",
		collapsable: true,
		children:[
            "/knowledge/intranet/",
            "/knowledge/intranet/Cobalt-Strike"
		]
	}
];