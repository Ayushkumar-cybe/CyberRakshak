import React, { useState, useEffect } from "react";
import ReactFlow, { Background, BackgroundVariant, useNodesState, useEdgesState, ReactFlowProvider } from "reactflow";
import { useParams } from "react-router-dom";
import { getScanGraph } from "../services/api";
import "reactflow/dist/style.css";

const GraphSnapshotInner = () => {
  const { jobId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (!jobId) return;
    const fetchData = async () => {
      try {
        const data = await getScanGraph(jobId);
        if (data?.nodes) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      } catch (e) {
        console.error("Graph load failed", e);
      }
    };
    fetchData();
  }, [jobId]);

  return (
    <div style={{ width: "800px", height: "600px", background: "white" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

const GraphSnapshot = () => (
  <ReactFlowProvider>
    <GraphSnapshotInner />
  </ReactFlowProvider>
);

export default GraphSnapshot;
