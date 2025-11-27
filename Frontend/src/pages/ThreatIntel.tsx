import React, { useState } from "react";
import IntelSearchBar from "../components/intel/IntelSearchBar";
import IntelCards from "../components/intel/IntelCards";
import IntelDrawer from "../components/intel/IntelDrawer";
import IntelFilters from "../components/intel/IntelFilters";

const ThreatIntel = () => {
  const [selectedIntel, setSelectedIntel] = useState(null);
  const [filters, setFilters] = useState({});

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Threat Intelligence</h1>
        <p className="opacity-70 text-sm">
          Search and explore global vulnerabilities, threat actors, exploits, and indicators.
        </p>
      </div>

      {/* Search Bar + Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-5 space-y-4">
        <IntelSearchBar />
        <IntelFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* Intel Cards Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 min-h-[400px]">
        <IntelCards onSelect={setSelectedIntel} />
      </div>

      <IntelDrawer
        open={selectedIntel !== null}
        onClose={() => setSelectedIntel(null)}
        intel={selectedIntel}
      />

    </div>
  );
};

export default ThreatIntel;