import React, { useState } from "react";
import { Search } from "lucide-react";

const IntelSearchBar = () => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", query);
  };

  return (
    <div className="flex items-center gap-3 w-full">

      {/* Search Input */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl px-4 py-2 w-full shadow-inner border border-slate-300 dark:border-slate-600 transition focus-within:ring-2 ring-blue-400">
        <Search className="w-5 h-5 opacity-60 mr-3" />

        <input
          type="text"
          placeholder="Search CVEs, threat actors, malware, IOCs..."
          className="bg-transparent w-full outline-none text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
      >
        Search
      </button>

    </div>
  );
};

export default IntelSearchBar;