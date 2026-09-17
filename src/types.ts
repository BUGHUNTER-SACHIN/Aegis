export type DriftType = 'intent_drift' | 'authority_drift' | 'context_drift';

export type DecisionOutcome = 
  | 'ALLOWED' 
  | 'BLOCKED' 
  | 'ESCALATED' 
  | 'HUMAN_APPROVED' 
  | 'HUMAN_DENIED';

export interface CausalNode {
  id: string;
  type: 'intent' | 'context' | 'decision' | 'policy' | 'action' | 'outcome';
  title: string;
  description: string;
  trustLevel: 'TRUSTED' | 'UNTRUSTED' | 'EVALUATED' | 'INTERNAL';
  meta?: Record<string, string>;
}

export interface CausalLink {
  from: string;
  to: string;
  label?: string;
  isDrift?: boolean;
}

export interface ReplayStep {
  id: string;
  timeOffset: string; // e.g. "00:02"
  timestamp: string;  // e.g. "10:42:01"
  phase: string;
  actor: string;
  action: string;
  resource?: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'BLOCKED';
  detail: string;
  provenanceSource?: string;
  trustScore: number; // 0 to 100
  driftDetected?: DriftType[];
  rawPayload?: string;
}

export interface CedarRule {
  id: string;
  effect: 'permit' | 'forbid';
  principal: string;
  action: string;
  resource: string;
  condition?: string;
  active: boolean;
  description: string;
}

export interface Scenario {
  id: string;
  sessionCode: string;
  agentName: string;
  agentRole: string;
  taskTitle: string;
  originalIntent: string;
  declaredAuthority: {
    allowedResources: string[];
    allowedActions: string[];
    forbiddenResources: string[];
    networkWhitelists: string[];
  };
  attackVector: string;
  summaryStatus: 'BLOCKED' | 'ALLOWED' | 'ESCALATED';
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  steps: ReplayStep[];
  causalGraph: {
    nodes: CausalNode[];
    links: CausalLink[];
  };
  forensics: {
    summary: string;
    triggerSource: string;
    trustStatus: string;
    attackClassification: string;
    mitreRef: string;
    cedarViolations: string[];
    recommendedControls: string[];
    bedrockAnalysis: string;
  };
  cedarPolicies: CedarRule[];
}

export interface JudgeQuestion {
  id: string;
  category: 'architecture' | 'provenance' | 'security' | 'aws' | 'business' | 'demo';
  difficulty: 'TOUGH' | 'LETHAL' | 'PRACTICAL';
  question: string;
  whyJudgesAskThis: string;
  weakAnswerTrap: string;
  aegisWinningResponse: string;
  keyKeywords: string[];
}

export interface TaskContract {
  sessionId: string;
  contractHash: string; // SHA-256 digest of initial task parameters
  originator: string;
  declaredIntent: string;
  resourceAllowList: string[];
  resourceBlockList: string[];
  toolAllowList: string[];
  networkAllowList: string[];
  maxHops: number;
  sessionExpiryUtc: string;
}

export interface RedTeamAttack {
  id: string;
  number: number;
  title: string;
  category: 'Prompt Injection' | 'Agent Compromise' | 'Tool / MCP Poisoning' | 'Confused Deputy' | 'Audit Tampering' | 'Privilege Escalation' | 'Provenance Laundering';
  threatLevel: 'CRITICAL' | 'HIGH';
  mitreMapping: string;
  attackerGoal: string;
  exploitMechanism: string;
  naiveAegisVulnerability: string;
  hardenedAwsDefense: string;
  verdict: 'SURVIVES (HARDENED)' | 'MITIGATED AT GATEWAY';
}

export interface LatencyMetric {
  component: string;
  latencyMs: number;
  criticalPath: boolean;
  notes: string;
}

export interface PitchSection {
  id: string;
  timeRange: string;
  title: string;
  talkingPoints: string[];
  visualCue: string;
  durationSeconds: number;
}

export interface HallwayOneLiner {
  promptQuestion: string;
  verbatimAnswer: string;
  keyDistinction: string;
}


