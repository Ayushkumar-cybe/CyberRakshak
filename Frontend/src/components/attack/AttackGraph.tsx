import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState
} from "reactflow";
import type { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import AttackNodeDrawer from "./AttackNodeDrawer";
import { getScanGraph } from "../../services/api";

// Demo Data (Only shown if NO job ID is provided)
const demoNodes: Node[] = [
  { id: "internet", position: { x: 300, y: 20 }, data: { label: "Internet" }, style: { background: "#fff", border: "1px solid #777", padding: 10 } },
  { id: "demo-web", position: { x: 300, y: 150 }, data: { label: "Demo Web Server" }, style: { background: "#fff", border: "1px solid #777", padding: 10 } }
];
const demoEdges: Edge[] = [{ id: "e1-demo", source: "internet", target: "demo-web", animated: true }];

interface Props {
  initialJobId?: string;
}

const AttackGraph = ({ initialJobId }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  
  // Use React Flow hooks for better state management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string>(initialJobId || "");
  const [error, setError] = useState<string | null>(null);

  const fetchGraphData = async (id: string) => {
    if (!id) return;
    
    console.log(`Fetching graph for Job ID: ${id}`);
    setLoading(true);
    setError(null);
    
    try {
      const graphData = await getScanGraph(id);
      console.log("Graph Data Received:", graphData);

      if (graphData && Array.isArray(graphData.nodes) && Array.isArray(graphData.edges)) {
        if (graphData.nodes.length === 0) {
          setError("No attack path data found for this scan.");
          setNodes([]);
          setEdges([]);
        } else {
          setNodes(graphData.nodes);
          setEdges(graphData.edges);
        }
      } else {
        console.error("Invalid graph format:", graphData);
        setError("Received invalid graph data format from server.");
      }
    } catch (err) {
      console.error("Failed to fetch graph:", err);
      setError("Failed to load graph data.");
    } finally {
      setLoading(false);
    }
  };

  // Load on mount or ID change
  useEffect(() => {
    if (initialJobId) {
      setJobId(initialJobId);
      fetchGraphData(initialJobId);
    } else {
      // Show demo data only if no ID provided
      setNodes(demoNodes);
      setEdges(demoEdges);
    }
  }, [initialJobId]);

  const handleJobIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobId(e.target.value);
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
            onClick={() => fetchGraphData(jobId)}
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
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          onNodeClick={(_, node) => {
            setSelectedNode(node);
            setDrawerOpen(true);
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
        
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10">
            <p className="font-bold text-lg">Generating Attack Graph...</p>
          </div>
        )}
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
