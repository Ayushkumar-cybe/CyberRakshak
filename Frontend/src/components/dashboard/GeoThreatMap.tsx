import React from "react";
import CardHeader from "./CardHeader";

const GeoThreatMap = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <CardHeader
        title="Geographic Threat Map"
        tooltip="Real-time visualization of threat activity and attack origins mapped by geographic location."
      />

      <div className="relative w-full flex-grow rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 min-h-[280px]">
        {/* SIMPLE STATIC MAP FOR NOW */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2000px-World_map_-_low_resolution.svg.png"
          alt="world-map"
          className="w-full h-full object-cover opacity-70 dark:opacity-50"
          style={{ transform: 'scale(1.2)' }}
        />

        {/* ATTACK MARKERS */}
        <div className="absolute inset-0">
          <span className="absolute bg-red-500 w-3 h-3 rounded-full top-[40%] left-[60%] animate-ping"></span>
          <span className="absolute bg-orange-500 w-2 h-2 rounded-full top-[70%] left-[30%] animate-pulse"></span>
          <span className="absolute bg-yellow-400 w-2 h-2 rounded-full top-[25%] left-[20%] animate-ping"></span>
        </div>
      </div>
    </div>
  );
};

export default GeoThreatMap;