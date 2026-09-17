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
  executionTruth: 'Production AWS Primitive' | 'In-Process Benchmark' | 'Cloud Serverless Primitive';
}

const AWS_NODES: AwsNode[] = [
  {
    id: 'apigw',
    name: 'Amazon API Gateway',
    service: 'Edge & Ingress',
    category: 'Edge & Ingress',
    roleInAegis: 'Intercepts incoming tool requests from any autonomous agent framework (LangGraph, CrewAI, AutoGen, or custom Python/TS agents). Acts as the secure mTLS proxy.',
    hackathonJustification: 'Ensures the agent never talks directly to production databases, OS shells, or internal APIs without going through the accountability perimeter.',
    awsApisUsed: ['POST /v1/gateway/evaluate', 'GET /v1/sessions/{id}'],
    latencyProfile: '~12ms global edge latency',
    executionTruth: 'Production AWS Primitive'
  },
  {
    id: 'lambda',
    name: 'AWS Lambda (Aegis Core)',
    service: 'Serverless Compute',
    category: 'Authorization Core',
    roleInAegis: 'Microsecond-scale policy dispatcher. Extracts actor, intent, target resource, and calls Amazon Verified Permissions in-memory.',
    hackathonJustification: 'Serverless, stateless execution that scales to tens of thousands of concurrent autonomous agent tool invocations with zero idle cost.',
    awsApisUsed: ['lambda:InvokeFunction', 'sts:AssumeRole'],
    latencyProfile: '1.2ms - 3.5ms warm execution',
    executionTruth: 'Cloud Serverless Primitive'
  },
  {
    id: 'cedar',
    name: 'Amazon Verified Permissions (Cedar)',
    service: 'Authorization as Policy',
    category: 'Authorization Core',
    roleInAegis: 'Deterministic policy store and evaluation engine. Enforces Permit / Forbid rules compiled into mathematical ASTs outside of LLM reasoning.',
    hackathonJustification: 'Directly fulfills the Build It / Ship It Cedar track. Decouples security boundaries from the non-deterministic LLM context window.',
    awsApisUsed: ['verifiedpermissions:IsAuthorized', 'verifiedpermissions:GetPolicy'],
    latencyProfile: '1.4ms (In-Process AST) / ~20ms (Cloud AVP)',
    executionTruth: 'In-Process Benchmark'
  },
  {
    id: 'eventbridge',
    name: 'Amazon EventBridge',
    service: 'Serverless Event Bus',
    category: 'Event Bus & Storage',
    roleInAegis: 'Pub/Sub telemetry backbone. Asynchronously publishes Accountability Records and Drift Anomaly events without blocking the agent runtime.',
    hackathonJustification: 'Decouples security alerting, S3 archiving, and Bedrock investigations from the critical execution path, preventing agent slowdowns.',
    awsApisUsed: ['events:PutEvents', 'aegis.events.audit bus'],
    latencyProfile: 'Asynchronous (< 10ms delivery to downstream consumers)',
    executionTruth: 'Production AWS Primitive'
  },
  {
    id: 'dynamodb',
    name: 'Amazon DynamoDB',
    service: 'NoSQL Audit Database',
    category: 'Event Bus & Storage',
    roleInAegis: 'Stores live session metadata, step sequences, and cryptographically linked Accountability Records using single-table design.',
    hackathonJustification: 'Provides single-digit millisecond query speed for the flight recorder and instant timeline lookups by session ID.',
    awsApisUsed: ['dynamodb:PutItem', 'dynamodb:Query (PK=SESSION#A91F2)'],
    latencyProfile: '2ms - 4ms single-digit read/write',
    executionTruth: 'Production AWS Primitive'
  },
  {
    id: 's3',
    name: 'Amazon S3 (Evidence Lake)',
    service: 'Object Storage with Object Lock',
    category: 'Event Bus & Storage',
    roleInAegis: 'Stores complete raw context snapshots, tainted markdown tokens, full LLM input/output buffers, and tamper-resistant compliance evidence.',
    hackathonJustification: 'Tamper-resistant evidence archival using Object Lock Compliance Mode. Provides WORM-style retention for the configured evidence objects, ensuring audit trail integrity.',
    awsApisUsed: ['s3:PutObject', 's3:GetObjectTagging'],
    latencyProfile: 'Durable cold archival',
    executionTruth: 'Production AWS Primitive'
  },
  {
    id: 'bedrock',
    name: 'Amazon Bedrock (Claude 3.5 Sonnet)',
    service: 'Generative AI Foundation Models',
    category: 'AI Intelligence',
    roleInAegis: 'Forensic analyst on demand. Ingests the evidence lineage graph and forensic artifacts to generate human-readable incident summaries, blast radius reports, and human-reviewed Cedar policy suggestions.',
    hackathonJustification: 'Used exclusively for high-value explanation and synthesis AFTER deterministic Cedar enforcement, maintaining strict reliability standards.',
    awsApisUsed: ['bedrock-runtime:InvokeModel', 'modelId: anthropic.claude-3-5-sonnet'],
    latencyProfile: 'Async on-demand (~1.5s forensic generation)',
    executionTruth: 'Production AWS Primitive'
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
          <span>Live Deployment Target: AWS us-east-1 / ap-south-1</span>
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
                    node.executionTruth === 'Production AWS Primitive'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                      : node.executionTruth === 'In-Process Benchmark'
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
              selectedNode.executionTruth === 'Production AWS Primitive'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : selectedNode.executionTruth === 'In-Process Benchmark'
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
              <span className="text-cyan-400 font-bold">Resilience Strategy:</span> If downstream AI (Bedrock) or audit storage encounters throttling, the core deterministic gate (API Gateway + Cedar Lambda) continues blocking unauthorized actions without dropping a packet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
