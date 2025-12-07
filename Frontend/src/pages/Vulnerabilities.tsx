import { useState, useMemo } from "react";
import { Info, MoreVertical } from "lucide-react";

interface Vulnerability {
  cve: string;
  name: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  category: string;
  asset: string;
  status: "Open" | "In Progress" | "Patched";
}

const severityColors: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-600 dark:text-white dark:border-red-600",
  High: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-500 dark:text-white dark:border-orange-500",
  Medium: "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-500 dark:text-white dark:border-yellow-500",
  Low: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500 dark:text-white dark:border-blue-500",
};

const statusColors: Record<string, string> = {
  Open: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  "In Progress": "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30",
  Patched: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30",
};

// Realistic mock data
const mockVulnerabilities: Vulnerability[] = [
  {
    cve: "CVE-2024-3094",
    name: "Log4Shell Remote Code Execution",
    severity: "Critical",
    category: "Application",
    asset: "Production-Server",
    status: "Open",
  },
  {
    cve: "CVE-2023-4502",
    name: "Weak SSH Key Exchange Algorithms",
    severity: "High",
    category: "Network",
    asset: "Gateway-01",
    status: "In Progress",
  },
  {
    cve: "CVE-2024-1234",
    name: "Missing HttpOnly Flag in Cookies",
    severity: "Medium",
    category: "Web",
    asset: "App-Portal",
    status: "Open",
  },
  {
    cve: "CVE-2023-5678",
    name: "TLS 1.0 and 1.1 Enabled",
    severity: "Low",
    category: "Encryption",
    asset: "Load-Balancer",
    status: "Patched",
  },
  {
    cve: "CVE-2024-7890",
    name: "SQL Injection in Login Form",
    severity: "Critical",
    category: "Database",
    asset: "Web-Server-02",
    status: "Open",
  },
  {
    cve: "CVE-2023-9012",
    name: "Cross-Site Scripting (XSS) in Comments",
    severity: "High",
    category: "Web",
    asset: "CMS-Platform",
    status: "In Progress",
  },
  {
    cve: "CVE-2024-3456",
    name: "Outdated Apache Version",
    severity: "Medium",
    category: "Network",
    asset: "API-Gateway",
    status: "Open",
  },
  {
    cve: "CVE-2023-6789",
    name: "Exposed AWS S3 Bucket",
    severity: "High",
    category: "Cloud",
    asset: "S3-Storage",
    status: "Patched",
  },
  {
    cve: "CVE-2024-2345",
    name: "Weak Password Policy",
    severity: "Low",
    category: "Authentication",
    asset: "AD-Domain",
    status: "Open",
  },
  {
    cve: "CVE-2023-4567",
    name: "Privilege Escalation in Docker",
    severity: "Critical",
    category: "Container",
    asset: "K8s-Node-01",
    status: "In Progress",
  },
];

const Vulnerabilities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Filter vulnerabilities based on search and filters
  const filteredVulnerabilities = useMemo(() => {
    return mockVulnerabilities.filter((vuln) => {
      const matchesSearch =
        vuln.cve.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vuln.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vuln.asset.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity = severityFilter === "All" || vuln.severity === severityFilter;
      const matchesCategory = categoryFilter === "All" || vuln.category === categoryFilter;

      return matchesSearch && matchesSeverity && matchesCategory;
    });
  }, [searchQuery, severityFilter, categoryFilter]);

  const exportCSV = () => {
    const csv = [
      ["CVE ID", "Vulnerability Name", "Severity", "Category", "Asset", "Status"].join(","),
      ...filteredVulnerabilities.map((v) =>
        [v.cve, v.name, v.severity, v.category, v.asset, v.status].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vulnerabilities.csv";
    a.click();
  };

  const handleAssetClick = (asset: string) => {
    console.log("Navigating to asset:", asset);
    // TODO: Navigate to asset details
  };

  const handleFixClick = (cve: string) => {
    console.log("Opening fix options for:", cve);
    // TODO: Open fix/remediation dialog
  };

  return (
    <div className="space-y-6 bg-slate-50 dark:bg-[#0b1120] min-h-screen p-6">
      {/* Vulnerability Intelligence Overview */}
      <div className="space-y-6 mb-8">
        {/* Row 1: Strategic Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Widget A: Severity by Source (Left) */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Severity Statistics by Source
                </h3>
                <div 
                  className="relative"
                  onMouseEnter={() => setActiveTooltip('severity')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <Info className="w-3 h-3 text-slate-400 dark:text-slate-500 cursor-help" />
                  {activeTooltip === 'severity' && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 dark:bg-slate-800 text-white text-xs p-3 rounded shadow-xl z-50">
                      Breakdown of vulnerabilities discovered by different scanning sources including network scanners, agents, and agentless discovery.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-pointer" />
            </div>
            <div className="flex items-center gap-8">
              {/* Left: Big Number */}
              <div className="flex flex-col">
                <span className="text-5xl font-bold text-slate-900 dark:text-white">68K</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 mt-1">Discovered by Scanners</span>
              </div>
              {/* Divider */}
              <div className="h-16 w-px bg-slate-200 dark:bg-slate-700"></div>
              {/* Right: Breakdown List */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Critical <span className="text-slate-500 dark:text-slate-400">(11.3k)</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">High <span className="text-slate-500 dark:text-slate-400">(38.3k)</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">Medium <span className="text-slate-500 dark:text-slate-400">(18.4k)</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Widget C: VPR Distribution (Right) */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Vulnerability Priority Rating (VPR)
                </h3>
                <div 
                  className="relative"
                  onMouseEnter={() => setActiveTooltip('vpr')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <Info className="w-3 h-3 text-slate-400 dark:text-slate-500 cursor-help" />
                  {activeTooltip === 'vpr' && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 dark:bg-slate-800 text-white text-xs p-3 rounded shadow-xl z-50">
                      Vulnerability Priority Rating (VPR) prioritizes vulnerabilities based on risk, not just CVSS scores. Higher ratings indicate more critical threats.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-pointer" />
            </div>
            <div className="flex items-end justify-between h-32 px-4">
              {/* Critical Bar - Thin */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">5.4k</div>
                <div className="w-6 bg-gradient-to-t from-red-600 to-red-400 rounded-t-[4px] h-20"></div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Crit</div>
              </div>
              {/* High Bar - Thin */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">9k</div>
                <div className="w-6 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-[4px] h-24"></div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">High</div>
              </div>
              {/* Medium Bar - Thin */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">42k</div>
                <div className="w-6 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-[4px] h-28"></div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Med</div>
              </div>
              {/* Low Bar - Thin */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">11k</div>
                <div className="w-6 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-[4px] h-16"></div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Low</div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Exploitability Chart (Left) */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Critical & High Exploitable Vulnerabilities
                </h3>
                <div 
                  className="relative"
                  onMouseEnter={() => setActiveTooltip('exploitable')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-help" />
                  {activeTooltip === 'exploitable' && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 dark:bg-slate-800 text-white text-xs p-3 rounded shadow-xl z-50">
                      Breakdown of critical and high-severity vulnerabilities by exploitability type. Shows how attackers can leverage these vulnerabilities.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-pointer" />
            </div>
            
            <div className="w-full h-64 relative pb-4">
              <svg viewBox="0 0 500 220" className="w-full h-full">
                {/* Grid Lines - Horizontal */}
                <defs>
                  <pattern id="grid-h" width="500" height="40" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" className="dark:stroke-slate-700" />
                  </pattern>
                </defs>
                <rect width="500" height="200" fill="url(#grid-h)" />
                
                {/* Y-Axis Labels */}
                <text x="15" y="30" fill="#64748b" fontSize="11" className="dark:fill-slate-400">8K</text>
                <text x="15" y="70" fill="#64748b" fontSize="11" className="dark:fill-slate-400">6K</text>
                <text x="15" y="110" fill="#64748b" fontSize="11" className="dark:fill-slate-400">4K</text>
                <text x="15" y="150" fill="#64748b" fontSize="11" className="dark:fill-slate-400">2K</text>
                <text x="15" y="195" fill="#64748b" fontSize="11" className="dark:fill-slate-400">0</text>
                
                {/* X-Axis Line */}
                <line x1="40" y1="180" x2="480" y2="180" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-slate-600" />
                
                {/* Bars - Thin, fixed width (20px) with rounded tops */}
                {/* Exploited by Malware - 80% height (6.5K) */}
                <rect x="70" y="72" width="20" height="108" fill="#4299e1" rx="4" />
                <text x="80" y="62" fill="#1e293b" fontSize="10" textAnchor="middle" fontWeight="bold" className="dark:fill-white">6.5K</text>
                <text x="80" y="195" fill="#64748b" fontSize="9" textAnchor="middle" className="dark:fill-slate-400">Exploited</text>
                <text x="80" y="207" fill="#64748b" fontSize="9" textAnchor="middle" className="dark:fill-slate-400">by Malware</text>
                
                {/* Remotely Exploitable - 100% height (7.5K) */}
                <rect x="140" y="30" width="20" height="150" fill="#2b6cb0" rx="4" />
                <text x="150" y="20" fill="#1e293b" fontSize="10" textAnchor="middle" fontWeight="bold" className="dark:fill-white">7.5K</text>
                <text x="150" y="195" fill="#64748b" fontSize="9" textAnchor="middle" className="dark:fill-slate-400">Remotely</text>
                <text x="150" y="207" fill="#64748b" fontSize="9" textAnchor="middle" className="dark:fill-slate-400">Exploitable</text>
                
                {/* Locally Exploitable - 40% height (3K) */}
                <rect x="220" y="138" width="20" height="42" fill="#38b2ac" rx="4" />
                <text x="230" y="128" fill="#1e293b" fontSize="10" textAnchor="middle" fontWeight="bold" className="dark:fill-white">3K</text>
                <text x="230" y="195" fill="#64748b" fontSize="9" textAnchor="middle" className="dark:fill-slate-400">Locally</text>
                <text x="230" y="207" fill="#64748b" fontSize="9" textAnchor="middle" className="dark:fill-slate-400">Exploitable</text>
                
                {/* Exploited by Frameworks - 35% height (2.8K) */}
                <rect x="300" y="147" width="20" height="33" fill="#2f855a" rx="4" />
                <text x="310" y="137" fill="#1e293b" fontSize="10" textAnchor="middle" fontWeight="bold" className="dark:fill-white">2.8K</text>
                <text x="310" y="195" fill="#64748b" fontSize="9" textAnchor="middle" className="dark:fill-slate-400">Exploited by</text>
                <text x="310" y="207" fill="#64748b" fontSize="9" textAnchor="middle" className="dark:fill-slate-400">Frameworks</text>
                
                {/* Remotely Exploitable (High Complexity) - 15% height (1.2K) */}
                <rect x="380" y="171" width="20" height="9" fill="#f97316" rx="4" />
                <text x="390" y="161" fill="#1e293b" fontSize="10" textAnchor="middle" fontWeight="bold" className="dark:fill-white">1.2K</text>
                <text x="390" y="195" fill="#64748b" fontSize="9" textAnchor="middle" className="dark:fill-slate-400">High</text>
                <text x="390" y="207" fill="#64748b" fontSize="9" textAnchor="middle" className="dark:fill-slate-400">Complexity</text>
              </svg>
            </div>
          </div>

          {/* Widget B: Patch Intelligence (Right) */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  Patch Intelligence
                </h3>
                <div 
                  className="relative"
                  onMouseEnter={() => setActiveTooltip('patch')}
                  onMouseLeave={() => setActiveTooltip(null)}
                >
                  <Info className="w-3 h-3 text-slate-400 dark:text-slate-500 cursor-help" />
                  {activeTooltip === 'patch' && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 dark:bg-slate-800 text-white text-xs p-3 rounded shadow-xl z-50">
                      Track missing and applied security patches across your infrastructure. Missing patches represent potential vulnerabilities that need attention.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-slate-900 dark:bg-slate-800 rotate-45"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-pointer" />
            </div>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30">
                <span className="text-sm text-slate-600 dark:text-slate-400">Missing Patches</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">2,104</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                <span className="text-sm text-slate-600 dark:text-slate-400">Applied Patches</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">856</span>
              </div>
            </div>
            
            {/* SLA Status Table */}
            <div className="mt-6">
              <h4 className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold mb-3">
                SLA Status
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                  <span className="text-slate-600 dark:text-slate-400">Critical</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">5.4K Not Met</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                  <span className="text-slate-600 dark:text-slate-400">High</span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">9K Not Met</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded">
                  <span className="text-slate-600 dark:text-slate-400">Medium</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">40.3K Not Met</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar - Glassmorphism */}
      <div className="bg-white dark:bg-[#1e293b]/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm dark:shadow-lg p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left Side - Filters */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search CVE ID or Asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-slate-50 dark:bg-black/20 border-gray-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 flex-1 min-w-[250px]"
            />

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-slate-50 dark:bg-black/20 border-gray-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="All" className="bg-slate-800">All Severities</option>
              <option value="Critical" className="bg-slate-800">Critical</option>
              <option value="High" className="bg-slate-800">High</option>
              <option value="Medium" className="bg-slate-800">Medium</option>
              <option value="Low" className="bg-slate-800">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-slate-50 dark:bg-black/20 border-gray-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="All" className="bg-slate-800">All Categories</option>
              <option value="Network" className="bg-slate-800">Network</option>
              <option value="Application" className="bg-slate-800">Application</option>
              <option value="Web" className="bg-slate-800">Web</option>
              <option value="Database" className="bg-slate-800">Database</option>
              <option value="Cloud" className="bg-slate-800">Cloud</option>
              <option value="Encryption" className="bg-slate-800">Encryption</option>
              <option value="Authentication" className="bg-slate-800">Authentication</option>
              <option value="Container" className="bg-slate-800">Container</option>
            </select>
          </div>

          {/* Right Side - Export Button */}
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg bg-white dark:bg-transparent text-slate-700 dark:text-cyan-400 border border-slate-300 dark:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-cyan-500/10 shadow-sm transition-colors font-medium whitespace-nowrap"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Data Table - Cyber Grid */}
      <div className="bg-white dark:bg-[#1e293b] backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl shadow-md dark:shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-left text-slate-500 dark:text-slate-300 font-semibold">CVE ID</th>
                <th className="p-4 text-left text-slate-500 dark:text-slate-300 font-semibold">Vulnerability Name</th>
                <th className="p-4 text-left text-slate-500 dark:text-slate-300 font-semibold">Severity</th>
                <th className="p-4 text-left text-slate-500 dark:text-slate-300 font-semibold">Category</th>
                <th className="p-4 text-left text-slate-500 dark:text-slate-300 font-semibold">Asset</th>
                <th className="p-4 text-left text-slate-500 dark:text-slate-300 font-semibold">Status</th>
                <th className="p-4 text-left text-slate-500 dark:text-slate-300 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVulnerabilities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No vulnerabilities found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                filteredVulnerabilities.map((vuln, index) => (
                  <tr
                    key={index}
                    className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    {/* CVE ID - Mono font */}
                    <td className="p-4 font-mono text-slate-700 dark:text-white">{vuln.cve}</td>

                    {/* Vulnerability Name - Truncate if long */}
                    <td className="p-4 text-slate-700 dark:text-white max-w-[300px] truncate" title={vuln.name}>
                      {vuln.name}
                    </td>

                    {/* Severity - Neon Badge */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          severityColors[vuln.severity] || "bg-gray-500"
                        }`}
                      >
                        {vuln.severity}
                      </span>
                    </td>

                    {/* Category - Small gray pill */}
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {vuln.category}
                      </span>
                    </td>

                    {/* Asset - Clickable/Blue */}
                    <td className="p-4">
                      <button
                        onClick={() => handleAssetClick(vuln.asset)}
                        className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline cursor-pointer font-medium transition-colors"
                      >
                        {vuln.asset}
                      </button>
                    </td>

                    {/* Status - Badge */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[vuln.status] || "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {vuln.status}
                      </span>
                    </td>

                    {/* Action - Fix button (Cyan text) */}
                    <td className="p-4">
                      <button
                        onClick={() => handleFixClick(vuln.cve)}
                        className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline font-medium transition-colors"
                      >
                        Fix
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vulnerabilities;