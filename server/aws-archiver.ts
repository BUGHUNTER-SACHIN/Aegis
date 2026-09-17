import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { EvidenceEvent } from "./ledger.js";

const region = process.env.AWS_REGION || "us-east-1";

// We instantiate these lazily or outside, but they will fail gracefully if no credentials exist
const ebClient = new EventBridgeClient({ region });
const ddbClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true }
});
const s3Client = new S3Client({ region });

export interface ArchivalResults {
  eventBridge: { status: "success" | "failed" | "pending"; error?: string };
  dynamoDb: { status: "success" | "failed" | "pending"; error?: string };
  s3: { status: "success" | "failed" | "pending"; error?: string };
}

export async function archiveToAWS(event: EvidenceEvent): Promise<ArchivalResults> {
  const results: ArchivalResults = {
    eventBridge: { status: "pending" },
    dynamoDb: { status: "pending" },
    s3: { status: "pending" }
  };

  // 1. EventBridge (Telemetry)
  try {
    await ebClient.send(new PutEventsCommand({
      Entries: [{
        Source: "aegis.pep",
        DetailType: "EvidenceEvent",
        Detail: JSON.stringify(event),
        EventBusName: process.env.AEGIS_EVENT_BUS || "default"
      }]
    }));
    results.eventBridge.status = "success";
  } catch (e: any) {
    results.eventBridge.status = "failed";
    results.eventBridge.error = e.message;
  }

  // 2. DynamoDB (Persistence)
  try {
    await docClient.send(new PutCommand({
      TableName: process.env.AEGIS_DYNAMODB_TABLE || "AegisEvidence",
      Item: event
    }));
    results.dynamoDb.status = "success";
  } catch (e: any) {
    results.dynamoDb.status = "failed";
    results.dynamoDb.error = e.message;
  }

  // 3. S3 Object Lock (Immutable Archival in Compliance Mode)
  try {
    // Retain for 1 year
    const retainUntil = new Date();
    retainUntil.setFullYear(retainUntil.getFullYear() + 1);
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AEGIS_S3_BUCKET || "aegis-evidence-archive",
      Key: `evidence/${event.eventId}.json`,
      Body: JSON.stringify(event, null, 2),
      ContentType: "application/json",
      ObjectLockMode: "COMPLIANCE",
      ObjectLockRetainUntilDate: retainUntil
    }));
    results.s3.status = "success";
  } catch (e: any) {
    results.s3.status = "failed";
    results.s3.error = e.message;
  }

  return results;
}
