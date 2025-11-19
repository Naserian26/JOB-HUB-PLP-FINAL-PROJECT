import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const webhook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const reqBody = req.body;

    if (!reqBody) {
      return res.status(400).json({ error: "Missing request body" });
    }

    const { data, type } = reqBody;
    if (!data || !type) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Verify webhook signature
    await webhook.verify(JSON.stringify(reqBody), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,        // Use Clerk ID as MongoDB _id
          clerkId: data.id,    // Store Clerk ID separately
          email: data.email_addresses[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url,
          resume: "",
        };
        await User.create(userData);
        res.json({ success: true, message: "User created locally" });
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses[0]?.email_address || "",
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url,
        };
        await User.findOneAndUpdate({ clerkId: data.id }, userData);
        res.json({ success: true, message: "User updated locally" });
        break;
      }

      case "user.deleted": {
        await User.findOneAndDelete({ clerkId: data.id });
        res.json({ success: true, message: "User deleted locally" });
        break;
      }

      default:
        res.status(400).json({ error: "Unhandled event type" });
        break;
    }
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ success: false, message: "Webhooks Error" });
  }
};
