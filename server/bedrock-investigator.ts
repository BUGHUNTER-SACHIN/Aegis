import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { EvidenceEvent } from "./ledger.js";

const region = process.env.AWS_REGION || "us-east-1";
const bedrockClient = new BedrockRuntimeClient({ region });

export interface InvestigationResult {
  status: "success" | "failed" | "pending";
  analysis?: string;
  error?: string;
}

let lastInvestigationResult: InvestigationResult | null = null;

export function getLastInvestigationResult() {
  return lastInvestigationResult;
}

/**
 * Post-Hoc Bedrock Investigation
 * Analyzes the recorded evidence envelope for security insights.
 * Never executes in the authorization path.
 */
export async function analyzeEvidence(event: EvidenceEvent): Promise<InvestigationResult> {
  try {
    const prompt = `You are a security investigator for the Aegis system. 
Analyze the following evidence event and determine the risk level, intent, and whether the agent's action appears malicious.

Evidence Envelope:
${JSON.stringify(event, null, 2)}

Provide a brief risk assessment. Do not execute any commands.`;

    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        { role: "user", content: prompt }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    lastInvestigationResult = {
      status: "success",
      analysis: responseBody.content?.[0]?.text || "No analysis returned"
    };
    return lastInvestigationResult;
  } catch (e: any) {
    lastInvestigationResult = {
      status: "failed",
      error: e.message
    };
    return lastInvestigationResult;
  }
}
