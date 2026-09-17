import React, { useState } from 'react';
import { Server, Database, Shield, Zap, Sparkles, Cloud, Lock, Cpu, ArrowRight, CheckCircle, Radio } from 'lucide-react';

interface AwsNode {
  id: string;
  name: string;
  service: string;
  category: 'Edge & Ingress' | 'Authorization Core' | 'Event Bus & Storage' | 'AI Intelligence';
  roleInAegis: string;
  hackathonJustification: string;
  awsApisUsed: string[];
  latencyProfile: string;
  executionTruth: 'Live AWS Resource' | 'Configured SDK Path' | 'Target Architecture' | 'Local Runtime';
}

const AWS_NODES: AwsNode[] = [
  {
    id: 'apigw',
    name: 'Amazon API Gateway',
    service: 'Edge & Ingress',
    category: 'Edge & Ingress',
    roleInAegis: 'Target topology component. The current repository uses a local Express PEP instead of API Gateway.',
    hackathonJustification: 'Useful for production hardening, but not implemented or live in this repository.',
    awsApisUsed: ['Not implemented in current repo'],
    latencyProfile: 'Not measured here',
    executionTruth: 'Target Architecture'
  },
  {
    id: 'lambda',
    name: 'AWS Lambda (Aegis Core)',
    service: 'Serverless Compute',
    category: 'Authorization Core',
    roleInAegis: 'Target topology component. The current repository does not deploy Lambda.',
    hackathonJustification: 'Production option only; the live Phase 4A integration keeps the existing Express backend.',
    awsApisUsed: ['Not implemented in current repo'],
    latencyProfile: 'Not measured here',
    executionTruth: 'Target Architecture'
  },
  {
    id: 'cedar',
    name: 'Amazon Verified Permissions (Cedar)',
    service: 'Authorization as Policy',
    category: 'Authorization Core',
    roleInAegis: 'Live policy store used by the optional remote authorization comparison path. Local Cedar remains the fallback/reference policy.',
    hackathonJustification: 'Directly fulfills the Build It / Ship It Cedar track. Decouples security boundaries from the non-deterministic LLM context window.',
    awsApisUsed: ['verifiedpermissions:IsAuthorized', 'policyStoreId: 4VKzAMGEYyBg3ZkcpULube'],
    latencyProfile: 'Live resource; app credentials required locally',
    executionTruth: 'Live AWS Resource'
  },
  {
    id: 'eventbridge',
    name: 'Amazon EventBridge',
    service: 'Serverless Event Bus',
    category: 'Event Bus & Storage',
    roleInAegis: 'Publisher path only. The current implementation calls PutEvents on the default bus and does not implement a consumer.',
    hackathonJustification: 'Phase 4A proves PutEvents only; DynamoDB and S3 are direct SDK archival calls, not EventBridge targets.',
    awsApisUsed: ['events:PutEvents', 'event bus: default'],
    latencyProfile: 'PutEvents success observed via AWS MCP',
    executionTruth: 'Live AWS Resource'
  },
  {
    id: 'dynamodb',
    name: 'Amazon DynamoDB',
    service: 'NoSQL Audit Database',
    category: 'Event Bus & Storage',
    roleInAegis: 'Direct evidence PutItem target for the current archival function. The current UI does not replay from DynamoDB.',
    hackathonJustification: 'Provides single-digit millisecond query speed for the flight recorder and instant timeline lookups by session ID.',
    awsApisUsed: ['dynamodb:PutItem', 'table: AegisEvidence'],
    latencyProfile: 'Read-back verified via AWS MCP',
    executionTruth: 'Live AWS Resource'
  },
  {
    id: 's3',
    name: 'Amazon S3 (Evidence Lake)',
    service: 'Object Storage with Object Lock',
    category: 'Event Bus & Storage',
    roleInAegis: 'Archives recorded evidence events with Object Lock headers. It does not store raw .env contents or full model buffers.',
    hackathonJustification: 'Tamper-resistant evidence archival using Object Lock Compliance Mode retention for configured evidence object versions.',
    awsApisUsed: ['s3:PutObject', 'bucket: aegis-evidence-643220021031-ap-southeast-2'],
    latencyProfile: 'Durable cold archival',
    executionTruth: 'Live AWS Resource'
  },
  {
    id: 'bedrock',
    name: 'Amazon Bedrock (configured model)',
    service: 'Generative AI Foundation Models',
    category: 'AI Intelligence',
    roleInAegis: 'Post-hoc investigator only. Uses BEDROCK_MODEL_ID and never participates in runtime authorization.',
    hackathonJustification: 'Used exclusively for high-value explanation and synthesis AFTER deterministic Cedar enforcement, maintaining strict reliability standards.',
    awsApisUsed: ['bedrock-runtime:InvokeModel', 'env: BEDROCK_MODEL_ID'],
    latencyProfile: 'Model access pending in this account',
    executionTruth: 'Configured SDK Path'
  },
];

export const ArchitectureViewer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<AwsNode>(AWS_NODES[2]); // default to Cedar

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
              AWS Bharat Build Tour
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400 font-mono">Ship It Track Production Topology</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">AWS Cloud Architecture & Enforcement Pipeline</h2>
          <p className="text-xs text-slate-400">
            Engineered to show zero fluff: every single AWS service plays an indispensable, non-redundant operational role.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Live Resource Region: ap-southeast-2</span>
        </div>
      </div>

      {/* Interactive Topology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {AWS_NODES.map((node) => {
          const isSelected = selectedNode.id === node.id;
          return (
            <button
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{node.category}</span>
                  {node.id === 'cedar' ? (
                    <Lock className="w-4 h-4 text-purple-400" />
                  ) : node.id === 'bedrock' ? (
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  ) : node.id === 'dynamodb' || node.id === 's3' ? (
                    <Database className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Server className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-white">{node.name}</h4>
                <div className="text-[11px] font-mono text-cyan-400 mt-0.5">{node.service}</div>
                <div className="mt-2">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    node.executionTruth === 'Live AWS Resource'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : node.executionTruth === 'Configured SDK Path'
                      ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                  }`}>
                    {node.executionTruth}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{node.latencyProfile.split(' ')[0]} {node.latencyProfile.split(' ')[1]}</span>
                <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">Inspect →</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Service Deep Dive Inspector */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-slate-500 font-semibold">{selectedNode.category}</span>
              <h3 className="text-base font-bold text-white">{selectedNode.name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono px-2.5 py-1 rounded border ${
              selectedNode.executionTruth === 'Live AWS Resource'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : selectedNode.executionTruth === 'Configured SDK Path'
                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
            }`}>
              {selectedNode.executionTruth}
            </span>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 text-cyan-300 border border-slate-800">
              {selectedNode.latencyProfile}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left: Role and justification */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 font-bold mb-1">Role in Aegis Architecture:</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedNode.roleInAegis}</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
              <h4 className="text-xs font-mono uppercase text-emerald-400 font-bold mb-1 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> What to Say to AWS Judges:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedNode.hackathonJustification}</p>
            </div>
          </div>

          {/* Right: API calls & integration code */}
          <div className="space-y-3 font-mono">
            <h4 className="text-xs uppercase text-slate-400 font-bold">AWS SDK API Operations:</h4>
            <div className="space-y-1.5">
              {selectedNode.awsApisUsed.map((api, idx) => (
                <div key={idx} className="text-xs bg-slate-900 px-3 py-2 rounded border border-slate-800 text-purple-300 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{api}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-cyan-400 font-bold">Resilience Strategy:</span> If downstream AI or archival storage fails, the current local Express PEP still blocks unauthorized filesystem reads through deterministic Cedar.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
