from typing import Dict, Any
import re

# Static Knowledge Base for common infrastructure issues
STATIC_REMEDIATION_DB = {
    # Ports
    "port_21": "FTP is insecure. Switch to SFTP (SSH) or FTPS. If required, ensure anonymous login is disabled.",
    "port_22": "Ensure SSH is configured with key-based authentication and root login is disabled.",
    "port_23": "Telnet transmits data in cleartext. Disable this service immediately and use SSH (Port 22).",
    "port_80": "Unencrypted Web Traffic. Configure an HTTP->HTTPS redirect and ensure a valid SSL certificate is installed.",
    "port_3389": "RDP detected. Ensure Network Level Authentication (NLA) is enabled. Restrict access via VPN or Firewall allow-lists.",
    "port_445": "SMB detected. Block access from the internet. Ensure SMBv1 is disabled to prevent WannaCry-style attacks.",
    
    # Common Headers
    "missing_csp": "Configure Content-Security-Policy (CSP) header to prevent XSS. Example: \"default-src 'self';\".",
    "missing_hsts": "Enable HTTP Strict Transport Security (HSTS) to force HTTPS connections.",
    "missing_xframe": "Set X-Frame-Options to 'DENY' or 'SAMEORIGIN' to prevent Clickjacking attacks.",
    "missing_nosniff": "Set X-Content-Type-Options to 'nosniff' to prevent MIME type confusion.",
    "missing_perm": "Configure Permissions-Policy header to restrict browser features (e.g., camera, mic).",
    "info_leak": "Configure your server to suppress version headers (e.g., 'Server: Apache/2.4'). Use 'ServerTokens Prod' in Apache or 'server_tokens off' in Nginx.",
    
    # Software
    "outdated_apache": "Update Apache HTTP Server to the latest stable version via your package manager.",
    "outdated_nginx": "Update Nginx to the latest stable version.",
    "ssl_weak_cipher": "Disable weak ciphers (RC4, 3DES) in your web server configuration."
}

def clean_html(raw_html: str) -> str:
    """Removes HTML tags (like <p>) from scanner output."""
    if not raw_html: return ""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return cleantext.strip()

def get_remediation(vuln: Dict[str, Any]) -> Dict[str, str]:
    """
    Determines the best remediation step for a vulnerability.
    Priority: Database/CISA -> Scanner Provided -> Static Rule -> Generic
    """
    # 1. Check if Enrichment already found a CISA solution
    if vuln.get("remediation"):
        return {"source": vuln.get("remediation_source", "Knowledge Base"), "action": vuln["remediation"]}

    title = vuln.get("title", "").lower()
    port = str(vuln.get("port", ""))
    
    # 2. Check Scanner's Own Solution
    scanner_sol = vuln.get("solution")
    if scanner_sol and len(scanner_sol) > 10 and "unknown" not in scanner_sol.lower():
        return {"source": f"{vuln.get('tool', 'Scanner').title()} Suggestion", "action": clean_html(scanner_sol)}

    # 3. Static Rules (Port/Title matching)
    if f"port_{port}" in STATIC_REMEDIATION_DB:
        return {"source": "Best Practice", "action": STATIC_REMEDIATION_DB[f"port_{port}"]}

    # Expanded Keywords
    if "content-security-policy" in title or "csp" in title:
        return {"source": "Best Practice", "action": STATIC_REMEDIATION_DB["missing_csp"]}
    if "strict-transport-security" in title or "hsts" in title:
        return {"source": "Best Practice", "action": STATIC_REMEDIATION_DB["missing_hsts"]}
    if "clickjacking" in title or "x-frame-options" in title:
        return {"source": "Best Practice", "action": STATIC_REMEDIATION_DB["missing_xframe"]}
    if "content-type-options" in title or "mime" in title:
        return {"source": "Best Practice", "action": STATIC_REMEDIATION_DB["missing_nosniff"]}
    if "permissions policy" in title or "permissions-policy" in title:
        return {"source": "Best Practice", "action": STATIC_REMEDIATION_DB["missing_perm"]}
    if "leak" in title or "disclosure" in title:
         return {"source": "Best Practice", "action": STATIC_REMEDIATION_DB["info_leak"]}
    
    # 4. Fallback
    return {
        "source": "General Advice", 
        "action": "Apply security patches from the vendor and verify configuration."
    }
