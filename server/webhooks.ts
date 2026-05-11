import { Router } from "express";
import { createHmac } from "crypto";

const webhookRouter = Router();

// Slack webhook handler
webhookRouter.post("/slack", async (req, res) => {
  const { type, challenge, event } = req.body;

  // Slack URL verification challenge
  if (type === "url_verification") {
    return res.json({ challenge });
  }

  // Handle Slack events
  if (type === "event_callback") {
    const { type: eventType, user, text, channel } = event;

    console.log(`[Slack Webhook] Event: ${eventType} from ${user} in ${channel}`);
    console.log(`[Slack Webhook] Message: ${text}`);

    // Process different Slack event types
    switch (eventType) {
      case "app_mention":
        // Handle mentions of the app
        console.log(`App mentioned by ${user}`);
        break;
      case "message":
        // Handle messages
        console.log(`Message from ${user}: ${text}`);
        break;
      case "reaction_added":
        // Handle reactions
        console.log(`Reaction added by ${user}`);
        break;
    }

    res.json({ ok: true });
  }
});

// Slack slash command handler
webhookRouter.post("/slack/commands", async (req, res) => {
  const { command, text, user_id, team_id, response_url } = req.body;

  console.log(`[Slack Command] ${command} from ${user_id}: ${text}`);

  // Handle different slash commands
  switch (command) {
    case "/timesheet":
      res.json({
        text: "Timesheet command received",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Timesheet Status*\nCurrent week: 32.5 hours\nBillability: 86%",
            },
          },
        ],
      });
      break;

    case "/billable":
      res.json({
        text: "Billable hours for this week: 28 hours",
      });
      break;

    default:
      res.json({ text: "Unknown command" });
  }
});

// Salesforce webhook handler
webhookRouter.post("/salesforce", async (req, res) => {
  const signature = req.headers["x-salesforce-signature"] as string;
  const body = JSON.stringify(req.body);

  // Verify Salesforce signature
  const hmac = createHmac("sha256", process.env.SALESFORCE_WEBHOOK_SECRET || "");
  hmac.update(body);
  const computedSignature = hmac.digest("base64");

  if (signature !== computedSignature) {
    console.error("[Salesforce Webhook] Invalid signature");
    return res.status(401).json({ error: "Invalid signature" });
  }

  const { action, sobject, records } = req.body;

  console.log(`[Salesforce Webhook] Action: ${action}, Object: ${sobject}`);
  console.log(`[Salesforce Webhook] Records: ${records.length}`);

  // Process Salesforce events
  if (sobject === "Opportunity") {
    records.forEach((record: any) => {
      console.log(`Opportunity ${record.Id}: ${record.Name} - ${record.StageName}`);
      // Sync opportunity to Legal OS
    });
  } else if (sobject === "Account") {
    records.forEach((record: any) => {
      console.log(`Account ${record.Id}: ${record.Name}`);
      // Sync account to Legal OS
    });
  }

  res.json({ success: true });
});

// DocuSign webhook handler
webhookRouter.post("/docusign", async (req, res) => {
  const { eventNotification } = req.body;

  if (!eventNotification) {
    return res.status(400).json({ error: "Missing eventNotification" });
  }

  const { envelopeStatus, envelopeId, status } = eventNotification;

  console.log(`[DocuSign Webhook] Envelope ${envelopeId}: ${status}`);

  // Process DocuSign events
  switch (status) {
    case "sent":
      console.log(`Document sent for signature: ${envelopeId}`);
      // Update signature status in database
      break;

    case "completed":
      console.log(`Document signed: ${envelopeId}`);
      // Mark signature as complete
      break;

    case "declined":
      console.log(`Document declined: ${envelopeId}`);
      // Handle declined signature
      break;

    case "voided":
      console.log(`Document voided: ${envelopeId}`);
      // Handle voided signature
      break;
  }

  res.json({ success: true });
});

// Microsoft Teams webhook handler
webhookRouter.post("/teams", async (req, res) => {
  const { type, value, from, body: messageBody } = req.body;

  console.log(`[Teams Webhook] Type: ${type} from ${from}`);

  if (type === "message") {
    console.log(`Message: ${messageBody}`);
    // Process Teams message
  }

  res.json({ success: true });
});

// Generic webhook handler for testing
webhookRouter.post("/test", async (req, res) => {
  console.log("[Test Webhook] Received:", req.body);
  res.json({ received: true, timestamp: new Date() });
});

// Webhook health check
webhookRouter.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

export default webhookRouter;
