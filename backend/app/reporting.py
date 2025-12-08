from fpdf import FPDF
from datetime import datetime
import json

class PDFReport(FPDF):
    def header(self):
        # Professional Header
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'CyberRakshak Vulnerability Assessment Report', 0, 1, 'C')
        self.set_font('Arial', 'I', 10)
        self.cell(0, 5, 'Confidential Security Assessment', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def clean_text(text: str) -> str:
    """Sanitizes text for FPDF (Latin-1 encoding)"""
    if not text: return ""
    text = str(text)
    replacements = {
        '\u2013': '-', '\u2014': '-', '\u2018': "'", '\u2019': "'",
        '\u201c': '"', '\u201d': '"', '\u2026': '...'
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    # Remove simple HTML tags for cleaner PDF output
    text = text.replace('<p>', '').replace('</p>', '\n').replace('<b>', '').replace('</b>', '')
    
    return text.encode('latin-1', 'ignore').decode('latin-1')

def draw_table_header(pdf, headers, widths):
    pdf.set_font("Arial", "B", 10)
    pdf.set_fill_color(240, 240, 240)
    for i, header in enumerate(headers):
        pdf.cell(widths[i], 8, header, 1, 0, 'C', True)
    pdf.ln()

def generate_pdf_report(job_data: dict, filename: str):
    pdf = PDFReport()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # --- 1. Header Information ---
    target = clean_text(job_data.get('target', 'Unknown Target'))
    date_str = str(job_data.get('created_at', datetime.now()))[:19]
    job_id = str(job_data.get('job_id', 'N/A'))
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(40, 8, "Target System:", 0)
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 8, target, 0, 1)
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(40, 8, "Scan Date:", 0)
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 8, date_str, 0, 1)
    
    pdf.set_font("Arial", "B", 12)
    pdf.cell(40, 8, "Job ID:", 0)
    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 8, job_id, 0, 1)
    
    # Extract Results
    results = job_data.get("results", {})
    ports = results.get("ports", [])
    vulns = results.get("vulnerabilities", [])
    techs = results.get("technologies", [])
    host_info = results.get("host_info", {})

    # --- 2. Executive Summary ---
    pdf.ln(5)
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "2. Executive Summary", 0, 1)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(2)

    # Counts
    crit_count = len([v for v in vulns if v.get('severity', '').lower() == 'critical'])
    high_count = len([v for v in vulns if v.get('severity', '').lower() == 'high'])
    med_count = len([v for v in vulns if v.get('severity', '').lower() == 'medium'])
    low_count = len([v for v in vulns if v.get('severity', '').lower() == 'low'])
    info_count = len([v for v in vulns if v.get('severity', '').lower() in ['info', 'unknown']])
    total_vulns = len(vulns)

    # Risk Rating
    overall_risk = "Low"
    if crit_count > 0: overall_risk = "Critical"
    elif high_count > 0: overall_risk = "High"
    elif med_count > 0: overall_risk = "Medium"

    pdf.set_font("Arial", "", 11)
    pdf.cell(0, 7, f"Total Open Ports: {len(ports)}", 0, 1)
    pdf.cell(0, 7, f"Total Technologies: {len(techs)}", 0, 1)
    pdf.cell(0, 7, f"Total Vulnerabilities: {total_vulns}", 0, 1)
    
    # Summary Table
    pdf.ln(3)
    pdf.set_font("Arial", "B", 10)
    pdf.cell(30, 8, "Critical", 1, 0, 'C')
    pdf.cell(30, 8, "High", 1, 0, 'C')
    pdf.cell(30, 8, "Medium", 1, 0, 'C')
    pdf.cell(30, 8, "Low", 1, 0, 'C')
    pdf.cell(30, 8, "Info", 1, 1, 'C')
    
    pdf.set_font("Arial", "", 10)
    pdf.cell(30, 8, str(crit_count), 1, 0, 'C')
    pdf.cell(30, 8, str(high_count), 1, 0, 'C')
    pdf.cell(30, 8, str(med_count), 1, 0, 'C')
    pdf.cell(30, 8, str(low_count), 1, 0, 'C')
    pdf.cell(30, 8, str(info_count), 1, 1, 'C')
    
    pdf.ln(5)
    pdf.set_font("Arial", "B", 12)
    pdf.cell(40, 8, "Overall Risk:", 0)
    
    risk_color = (0, 0, 0)
    if overall_risk == "Critical": risk_color = (200, 0, 0)
    elif overall_risk == "High": risk_color = (255, 140, 0)
    elif overall_risk == "Medium": risk_color = (255, 200, 0)
    
    pdf.set_text_color(*risk_color)
    pdf.cell(0, 8, overall_risk.upper(), 0, 1)
    pdf.set_text_color(0, 0, 0)

    # --- 3. Asset & Environment ---
    pdf.ln(5)
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "3. Asset & Environment Information", 0, 1)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(2)
    
    pdf.set_font("Arial", "", 11)
    ip_addr = host_info.get('ip', target)
    os_guess = "Unknown"
    if "linux" in str(job_data).lower(): os_guess = "Linux/Unix"
    elif "windows" in str(job_data).lower(): os_guess = "Windows"
    
    pdf.cell(0, 7, f"IP Address: {ip_addr}", 0, 1)
    pdf.cell(0, 7, f"OS / Environment: {os_guess}", 0, 1)
    
    if techs:
        pdf.ln(2)
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 7, "Technologies Detected:", 0, 1)
        pdf.set_font("Arial", "", 10)
        tech_list = ", ".join([t.get('name') for t in techs])
        pdf.multi_cell(0, 6, clean_text(tech_list))

    # --- 4. Open Ports Table ---
    if ports:
        pdf.ln(5)
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "4. Open Ports & Services", 0, 1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        
        headers = ["Port", "Protocol", "Service", "Version"]
        widths = [25, 25, 50, 90]
        draw_table_header(pdf, headers, widths)
        
        pdf.set_font("Arial", "", 9)
        for p in ports:
            port = str(p.get('port'))
            proto = str(p.get('protocol')).upper()
            service = clean_text(p.get('service', 'unknown'))
            version = clean_text(f"{p.get('product', '')} {p.get('version', '')}".strip())
            
            pdf.cell(widths[0], 7, port, 1)
            pdf.cell(widths[1], 7, proto, 1)
            pdf.cell(widths[2], 7, service[:25], 1)
            pdf.cell(widths[3], 7, version[:50], 1)
            pdf.ln()

    # --- 5. Findings Grouped by Tool ---
    
    # Categorize Vulnerabilities
    groups = {
        "OpenVAS": [],
        "Nuclei": [],
        "Nikto": [],
        "ZAP": [],
        "Metasploit": [],
        "Others": []
    }
    
    for v in vulns:
        tool = v.get('tool', 'unknown').lower()
        if 'openvas' in tool: groups['OpenVAS'].append(v)
        elif 'nuclei' in tool: groups['Nuclei'].append(v)
        elif 'nikto' in tool: groups['Nikto'].append(v)
        elif 'zap' in tool: groups['ZAP'].append(v)
        elif 'metasploit' in tool: groups['Metasploit'].append(v)
        else: groups['Others'].append(v)

    # --- GROUP 1: OpenVAS ---
    if groups['OpenVAS']:
        pdf.add_page()
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Group 1: OpenVAS Findings", 0, 1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        
        headers = ["Severity", "Title", "CVSS", "Port"]
        widths = [25, 110, 15, 30]
        
        # FIX: Header is drawn ONCE here
        draw_table_header(pdf, headers, widths)
        
        for v in groups['OpenVAS']:
            pdf.set_font("Arial", "", 9)
            
            sev = v.get('severity', 'Info').title()
            title = clean_text(v.get('title'))
            cvss = str(v.get('cvss_score') or 'N/A')
            port = str(v.get('port') or 'N/A')
            
            pdf.cell(widths[0], 7, sev, 1)
            pdf.cell(widths[1], 7, title[:65], 1)
            pdf.cell(widths[2], 7, cvss, 1)
            pdf.cell(widths[3], 7, port, 1)
            pdf.ln()
            
            # Details Block
            pdf.set_font("Arial", "", 9)
            desc = clean_text(v.get('description', 'No description.'))
            rem = clean_text(v.get('solution') or v.get('remediation') or 'See vendor updates.')
            
            # Use multi_cell for long text with a slight indent or block
            pdf.ln(1)
            pdf.multi_cell(0, 5, f"Description: {desc[:600]}") # Increased limit
            if rem:
                pdf.set_font("Arial", "I", 9)
                pdf.multi_cell(0, 5, f"Remediation: {rem[:400]}")
            pdf.ln(3)
            # Dashed line separator
            pdf.cell(0, 0, "", "B") # Bottom border
            pdf.ln(2)

    # --- GROUP 2: Nuclei ---
    if groups['Nuclei']:
        pdf.add_page()
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Group 2: Nuclei Findings", 0, 1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        
        headers = ["Severity", "Vulnerability", "CVE", "CVSS"]
        widths = [25, 90, 40, 25]
        draw_table_header(pdf, headers, widths)
        
        pdf.set_font("Arial", "", 9)
        for v in groups['Nuclei']:
            sev = v.get('severity', 'Info').title()
            title = clean_text(v.get('title'))
            cve = clean_text(v.get('cve') or 'N/A')
            cvss = str(v.get('cvss_score') or 'N/A')
            
            pdf.cell(widths[0], 7, sev, 1)
            pdf.cell(widths[1], 7, title[:50], 1)
            pdf.cell(widths[2], 7, cve, 1)
            pdf.cell(widths[3], 7, cvss, 1)
            pdf.ln()
            
            if sev in ['Critical', 'High']:
                pdf.set_font("Arial", "I", 8)
                pdf.cell(10, 5, "", 0)
                pdf.multi_cell(0, 5, f"Remediation: {clean_text(v.get('solution', 'Update software'))}")

    # --- GROUP 3: Nikto (With Aggregation) ---
    if groups['Nikto']:
        pdf.add_page()
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Group 3: Nikto Findings (Server Config)", 0, 1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        
        headers = ["Severity", "Issue", "Description"]
        widths = [25, 70, 95]
        draw_table_header(pdf, headers, widths)
        
        pdf.set_font("Arial", "", 9)
        
        headers_missing_count = 0
        other_issues = []
        
        for v in groups['Nikto']:
            title = v.get('title', '').lower()
            if "missing" in title and "header" in title:
                headers_missing_count += 1
            else:
                other_issues.append(v)
        
        if headers_missing_count > 0:
            pdf.cell(widths[0], 7, "Low", 1)
            pdf.cell(widths[1], 7, "Missing Security Headers", 1)
            pdf.cell(widths[2], 7, f"Multiple missing security headers ({headers_missing_count} issues)", 1)
            pdf.ln()
            
        for v in other_issues:
            sev = "Low"
            title = clean_text(v.get('title'))
            desc = clean_text(v.get('description') or v.get('title'))
            pdf.cell(widths[0], 7, sev, 1)
            pdf.cell(widths[1], 7, title[:35], 1)
            pdf.cell(widths[2], 7, desc[:60], 1)
            pdf.ln()

    # --- GROUP 4: OWASP ZAP ---
    if groups['ZAP']:
        pdf.ln(5)
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Group 4: OWASP ZAP Findings", 0, 1)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(2)
        
        headers = ["Severity", "Issue", "Risk/Impact"]
        widths = [25, 80, 85]
        draw_table_header(pdf, headers, widths)
        
        pdf.set_font("Arial", "", 9)
        for v in groups['ZAP']:
            sev = v.get('severity', 'Info').title()
            title = clean_text(v.get('title'))
            desc = clean_text(v.get('description', ''))
            pdf.cell(widths[0], 7, sev, 1)
            pdf.cell(widths[1], 7, title[:45], 1)
            pdf.cell(widths[2], 7, desc[:50] + "...", 1)
            pdf.ln()

    pdf.output(filename)
    return filename
