from fpdf import FPDF
from datetime import datetime
import json

class PDFReport(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'CyberRakshak Vulnerability Report', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def clean_text(text: str) -> str:
    """Sanitizes text for FPDF (Latin-1 encoding)"""
    if not text: return ""
    replacements = {
        '\u2013': '-',  # En dash
        '\u2014': '-',  # Em dash
        '\u2018': "'",  # Left single quote
        '\u2019': "'",  # Right single quote
        '\u201c': '"',  # Left double quote
        '\u201d': '"',  # Right double quote
        '\u2026': '...', # Ellipsis
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    # Encode to latin-1, ignoring errors to prevent crash
    return text.encode('latin-1', 'ignore').decode('latin-1')

def generate_pdf_report(job_data: dict, filename: str):
    pdf = PDFReport()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # --- Title Section ---
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, f"Target: {clean_text(job_data.get('target'))}", 0, 1)
    pdf.set_font("Arial", "", 10)
    pdf.cell(0, 10, f"Scan Date: {str(job_data.get('created_at'))[:19]}", 0, 1)
    pdf.cell(0, 10, f"Job ID: {str(job_data.get('job_id'))}", 0, 1)
    pdf.ln(10)

    # --- Summary Section ---
    results = job_data.get("results", {})
    ports = results.get("ports", [])
    vulns = results.get("vulnerabilities", [])
    techs = results.get("technologies", [])

    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Executive Summary", 0, 1)
    pdf.set_font("Arial", "", 11)
    
    pdf.cell(0, 8, f"Open Ports Found: {len(ports)}", 0, 1)
    pdf.cell(0, 8, f"Technologies Detected: {len(techs)}", 0, 1)
    pdf.cell(0, 8, f"Vulnerabilities Found: {len(vulns)}", 0, 1)
    
    high = len([v for v in vulns if v.get('severity') in ['high', 'critical']])
    medium = len([v for v in vulns if v.get('severity') == 'medium'])
    low = len([v for v in vulns if v.get('severity') in ['low', 'info', 'unknown']])
    
    pdf.ln(5)
    pdf.set_text_color(180, 0, 0)
    pdf.cell(50, 8, f"High/Critical: {high}", 0, 1)
    pdf.set_text_color(200, 100, 0)
    pdf.cell(50, 8, f"Medium: {medium}", 0, 1)
    pdf.set_text_color(0, 100, 0)
    pdf.cell(50, 8, f"Low/Info: {low}", 0, 1)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(10)

    # --- Open Ports Table ---
    if ports:
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Open Ports", 0, 1)
        pdf.set_font("Arial", "B", 10)
        
        pdf.cell(30, 8, "Port", 1)
        pdf.cell(30, 8, "Protocol", 1)
        pdf.cell(60, 8, "Service", 1)
        pdf.cell(70, 8, "Version", 1)
        pdf.ln()
        
        pdf.set_font("Arial", "", 10)
        for p in ports:
            pdf.cell(30, 8, str(p.get('port')), 1)
            pdf.cell(30, 8, str(p.get('protocol')), 1)
            pdf.cell(60, 8, clean_text(str(p.get('service'))[:25]), 1)
            pdf.cell(70, 8, clean_text(str(p.get('product', '') + ' ' + p.get('version', ''))[:35]), 1)
            pdf.ln()
        pdf.ln(10)

    # --- Vulnerabilities Details ---
    if vulns:
        pdf.set_font("Arial", "B", 14)
        pdf.cell(0, 10, "Vulnerability Details", 0, 1)
        
        for v in vulns:
            title = clean_text(v.get('title', 'Unknown'))
            severity = clean_text(v.get('severity', 'info')).upper()
            tool = clean_text(v.get('tool', 'Unknown'))
            
            pdf.set_font("Arial", "B", 11)
            if severity in ['HIGH', 'CRITICAL']:
                pdf.set_text_color(180, 0, 0)
            elif severity == 'MEDIUM':
                pdf.set_text_color(200, 100, 0)
            else:
                pdf.set_text_color(0, 0, 0)
                
            pdf.cell(0, 8, f"[{severity}] {title} ({tool})", 0, 1)
            pdf.set_text_color(0, 0, 0)
            
            pdf.set_font("Arial", "", 10)
            desc = clean_text(v.get('description', 'No description provided.'))
            desc = desc.replace('<p>', '').replace('</p>', '\n').strip()
            pdf.multi_cell(0, 5, desc)
            pdf.ln(5)

    pdf.output(filename)
    return filename
