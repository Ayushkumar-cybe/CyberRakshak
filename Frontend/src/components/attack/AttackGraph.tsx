import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant
} from "reactflow";
import type { Node, Edge } from "reactflow"; // <--- Imported as Types
import "reactflow/dist/style.css";
import AttackNodeDrawer from "./AttackNodeDrawer";
// Import the API service
import { getScanGraph } from "../../services/api";

const initialNodes: Node[] = [
  {
    id: "internet",
    position: { x: 300, y: 20 },
    data: { label: "Internet" },
    style: {
      padding: 12,
      borderRadius: 8,
      border: "2px solid #0ea5e9",
      background: "white",
    },
  },
  {
    id: "web",
    position: { x: 300, y: 140 },
    data: { label: "Web Server" },
    style: {
      padding: 12,
      borderRadius: 8,
      border: "2px solid #f97316",
      background: "white",
    },
  },
  {
    id: "app",
    position: { x: 300, y: 260 },
    data: { label: "Application Server" },
    style: {
      padding: 12,
      borderRadius: 8,
      border: "2px solid #3b82f6",
      background: "white",
    },
  },
  {
    id: "db",
    position: { x: 300, y: 380 },
    data: { label: "Database" },
    style: {
      padding: 12,
      borderRadius: 8,
      border: "2px solid #10b981",
      background: "white",
    },
  },
  {
    id: "workstation",
    position: { x: 50, y: 260 },
    data: { label: "Internal Workstation" },
    style: {
      padding: 12,
      borderRadius: 8,
      border: "2px solid #8b5cf6",
      background: "white",
    },
  },
  {
    id: "dc",
    position: { x: 50, y: 380 },
    data: { label: "Domain Controller" },
    style: {
      padding: 12,
      borderRadius: 8,
      border: "2px solid #ef4444",
      background: "white",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1",
    source: "internet",
    target: "web",
    animated: true,
    className: "attack-edge",
    style: { strokeWidth: 2 },
  },
  {
    id: "e2",
    source: "web",
    target: "app",
    animated: true,
    className: "attack-edge",
    style: { strokeWidth: 2 },
  },
  {
    id: "e3",
    source: "app",
    target: "db",
    animated: true,
    className: "attack-edge",
    style: { strokeWidth: 2 },
  },

  // SIDE PATH
  {
    id: "e4",
    source: "web",
    target: "workstation",
    animated: false,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
  {
    id: "e5",
    source: "workstation",
    target: "dc",
    animated: false,
    style: { stroke: "#8b5cf6", strokeWidth: 2 },
  },
];

const AttackGraph = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string>("");

  const fetchGraphData = async (id: string) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const graphData = await getScanGraph(id);
      // Transform the data to match React Flow format
      if (graphData && graphData.nodes && graphData.edges) {
        setNodes(graphData.nodes);
        setEdges(graphData.edges);
      }
    } catch (error) {
      console.error("Failed to fetch graph data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobId(e.target.value);
  };

  const handleFetchGraph = () => {
    fetchGraphData(jobId);
  };

  return (
    <>
      {/* Job ID Input */}
      <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-xl shadow">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={jobId}
            onChange={handleJobIdChange}
            placeholder="Enter Job ID to visualize attack path"
            className="flex-1 p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
          />
          <button
            onClick={handleFetchGraph}
            disabled={loading || !jobId}
            className={`px-4 py-2 rounded-lg ${
              loading || !jobId
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Loading..." : "Visualize"}
          </button>
        </div>
      </div>

      <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeClick={(event, node) => {
            setSelectedNode(node);
            setDrawerOpen(true);
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      <AttackNodeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        node={selectedNode}
      />
    </>
  );
};

export default AttackGraph;
