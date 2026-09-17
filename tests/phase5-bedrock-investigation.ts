async function testPhase5() {
  console.log("=== PHASE 5: POST-HOC BEDROCK INVESTIGATION TEST ===");

  async function invoke(tool: string, action: string, resource: string, trust: string) {
    const res = await fetch("http://localhost:3000/api/agent/invoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "sess_bedrock_test_" + Date.now(),
        agentId: "DevFix_Test",
        tool,
        resource,
        action,
        context: { trust }
      })
    });
    return res.json();
  }

  console.log("\n1. Generating an UNAUTHORIZED event (.env) to test Bedrock boundary...");
  const resB = await invoke("fs", "fs:read", ".env", "UNTRUSTED_EXTERNAL");
  
  console.log("\n2. Analyzing Authorization Decision...");
  console.log(`Original Decision: ${resB.decision?.decision}`);
  if (resB.decision?.decision !== "DENY") {
    throw new Error(`❌ Boundary violation: Expected DENY but got ${resB.decision?.decision}`);
  }
  console.log("✅ Authorization remained DENY (Immutable).");

  console.log("\n3. Analyzing Bedrock Out-Of-Band Investigation...");
  const investigationStatus = resB.decision?.investigationStatus;
  console.log(JSON.stringify(investigationStatus, null, 2));

  if (investigationStatus?.status === "success") {
    console.warn("⚠️ Unexpected Success: Bedrock succeeded without credentials?");
  } else if (investigationStatus?.status === "failed") {
    console.log("✅ Bedrock graceful degradation (no credentials) verified.");
    console.log(`Error Reason: ${investigationStatus.error}`);
  } else {
    throw new Error("Missing investigation status");
  }

  console.log("\n4. Verifying Evidence Envelope recorded correctly...");
  const ledgerRes = await fetch("http://localhost:3000/api/agent/ledger");
  const ledger = await ledgerRes.json();
  
  const latestEvent = ledger.find((e: any) => e.eventId === resB.decision?.eventId);
  if (!latestEvent) {
    throw new Error("Could not find the generated event in the ledger");
  }
  
  console.log(`✅ Evidence Event securely hashed and preserved:\n${JSON.stringify({
      eventId: latestEvent.eventId,
      action: latestEvent.action,
      resource: latestEvent.resource,
      decision: latestEvent.decision,
      hash: latestEvent.hash
  }, null, 2)}`);

  console.log("\n=== PHASE 5 TEST COMPLETE ===");
}

testPhase5().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
