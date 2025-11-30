import networkx as nx
from typing import Dict, Any

def build_attack_graph(report: Dict[str, Any]) -> Dict[str, Any]:
    """
    Converts a normalized scan report into a NetworkX graph JSON.
    Calculates layout positions for React Flow.
    """
    G = nx.DiGraph()
    
    # 1. Root Node: The Target Host
    host_info = report.get("host_info", {})
    ip = host_info.get("ip", "Target")
    hostnames = host_info.get("hostnames", [])
    label = hostnames[0] if hostnames else ip
    
    root_id = "root"
    G.add_node(root_id, label=label, type="input", style={"background": "#2563eb", "color": "white"})

    # 2. Level 1: Ports
    for port in report.get("ports", []):
        port_id = f"port_{port['port']}"
        label = f"{port['port']}/{port['protocol']}"
        service = port.get('service', 'unknown')
        
        G.add_node(port_id, label=label, type="default", style={"background": "#16a34a", "color": "white"})
        G.add_edge(root_id, port_id)
        
        if service and service != "unknown":
            service_id = f"service_{port['port']}"
            G.add_node(service_id, label=service, type="default", style={"background": "#0891b2", "color": "white"})
            G.add_edge(port_id, service_id)

    # 3. Level 2: Technologies (Robust Check)
    for tech in report.get("technologies", []):
        tech_name = tech.get('name')
        if not tech_name: continue # Skip if name is missing (prevents KeyError)
        
        tech_id = f"tech_{tech_name}"
        version = tech.get('version')
        label = f"{tech_name} {version}" if version else tech_name
        
        G.add_node(tech_id, label=label, type="default", style={"background": "#9333ea", "color": "white"})
        G.add_edge(root_id, tech_id)

    # 4. Level 3: Vulnerabilities (Robust Check)
    for vuln in report.get("vulnerabilities", []):
        title = vuln.get('title', 'Unknown Finding')
        tool = vuln.get('tool', 'unk')
        
        # Ensure ID generation is safe from NoneType errors
        vuln_id = f"vuln_{tool}_{title[:10].replace(' ', '_')}"
        severity = vuln.get('severity', 'info').lower()
        
        bg_color = "#94a3b8"
        if severity == "low": bg_color = "#facc15"
        if severity == "medium": bg_color = "#f97316"
        if severity == "high": bg_color = "#ef4444"
        if severity == "critical": bg_color = "#991b1b"

        G.add_node(vuln_id, label=title, type="output", style={"background": bg_color, "color": "white"})
        
        # Link logic
        v_port = vuln.get('port')
        linked = False
        if v_port:
            try:
                clean_port = str(v_port).split("/")[0]
                port_node_id = f"port_{clean_port}"
                if G.has_node(port_node_id):
                    G.add_edge(port_node_id, vuln_id)
                    linked = True
            except: pass

        if not linked:
            G.add_edge(root_id, vuln_id)

    # --- LAYOUT CALCULATION ---
    pos = nx.spring_layout(G, scale=400, seed=42)
    
    output = {"nodes": [], "edges": []}
    
    for node_id in G.nodes:
        node_attrs = G.nodes[node_id]
        x, y = pos[node_id]
        output["nodes"].append({
            "id": node_id,
            "data": { "label": node_attrs.get("label", node_id) },
            "position": { "x": x, "y": y },
            "type": node_attrs.get("type", "default"),
            "style": node_attrs.get("style", {})
        })
        
    for u, v in G.edges:
        output["edges"].append({
            "id": f"e_{u}_{v}",
            "source": u,
            "target": v,
            "animated": True,
            "style": { "stroke": "#b1b1b7" }
        })

    return output
