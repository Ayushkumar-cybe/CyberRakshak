import networkx as nx
from typing import Dict, Any

def build_attack_graph(report: Dict[str, Any]) -> Dict[str, Any]:
    """
    Converts a normalized scan report into a NetworkX graph JSON.
    Structure: Host -> Ports -> Technologies -> Vulnerabilities
    """
    G = nx.DiGraph()
    
    # 1. Root Node: The Target Host
    host_info = report.get("host_info", {})
    ip = host_info.get("ip", "Target")
    hostnames = host_info.get("hostnames", [])
    label = hostnames[0] if hostnames else ip
    
    root_id = "root"
    G.add_node(root_id, label=label, type="host", color="#2563eb") # Blue

    # 2. Level 1: Ports
    for port in report.get("ports", []):
        port_id = f"port_{port['port']}"
        label = f"{port['port']}/{port['protocol']}"
        service = port.get('service', 'unknown')
        
        G.add_node(port_id, label=label, type="port", color="#16a34a") # Green
        G.add_edge(root_id, port_id)
        
        # Add Service details as a sub-note if available
        if service and service != "unknown":
            service_id = f"service_{port['port']}"
            G.add_node(service_id, label=service, type="service", color="#0891b2") # Cyan
            G.add_edge(port_id, service_id)

    # 3. Level 2: Technologies (Wappalyzer)
    # Tech doesn't always map to a specific port, so we link to Root for now
    # unless we can infer it (e.g., Apache -> Port 80).
    for tech in report.get("technologies", []):
        tech_name = tech['name']
        tech_id = f"tech_{tech_name}"
        version = tech.get('version')
        label = f"{tech_name} {version}" if version else tech_name
        
        G.add_node(tech_id, label=label, type="technology", color="#9333ea") # Purple
        G.add_edge(root_id, tech_id)

    # 4. Level 3: Vulnerabilities
    # We try to link vulns to specific ports if the data exists
    for vuln in report.get("vulnerabilities", []):
        vuln_id = f"vuln_{vuln.get('tool')}_{vuln.get('title')[:10]}" # Short hash ID
        title = vuln.get('title')
        severity = vuln.get('severity', 'info').lower()
        
        # Color code by severity
        color = "#94a3b8" # Gray (Info)
        if severity == "low": color = "#facc15" # Yellow
        if severity == "medium": color = "#f97316" # Orange
        if severity == "high": color = "#ef4444" # Red
        if severity == "critical": color = "#991b1b" # Dark Red

        G.add_node(vuln_id, label=title, type="vulnerability", severity=severity, color=color)
        
        # Link logic
        linked = False
        
        # If vuln has a specific port (e.g. from Nmap/OpenVAS), link to that port
        v_port = vuln.get('port')
        if v_port:
            # Try to find the matching port node
            # The report stores ports as ints, vuln might be string "80" or "80/tcp"
            try:
                clean_port = str(v_port).split("/")[0]
                port_node_id = f"port_{clean_port}"
                if G.has_node(port_node_id):
                    G.add_edge(port_node_id, vuln_id)
                    linked = True
            except:
                pass

        # If not linked to a port, link to root
        if not linked:
            G.add_edge(root_id, vuln_id)

    # Convert to frontend-friendly JSON (Node-Link data)
    return nx.node_link_data(G)
