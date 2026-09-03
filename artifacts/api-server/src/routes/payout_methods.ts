import { Router } from "express";
import { db, payoutMethodsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { getCurrentAppUser } from "../lib/current-user";

const router = Router();

const AVAILABLE_METHODS_BY_COUNTRY: Record<string, string[]> = {
  NG: ["paypal", "bank_transfer", "opay", "palmpay"],
};
const DEFAULT_METHODS = ["paypal"];

export function maskDetails(method: string, details: Record<string, string>) {
  const mask = (value: string | undefined) => (value ? `••••${value.slice(-4)}` : "");
  if (method === "paypal") return { email: details.email ?? "" };
  if (method === "bank_transfer")
    return {
      accountName: details.accountName ?? "",
      bankName: details.bankName ?? "",
      accountNumber: mask(details.accountNumber || details.iban),
    };
  return { accountIdentifier: mask(details.accountIdentifier || details.phone) };
}

const METHOD_DISPLAY_NAMES: Record<string, string> = {
  paypal: "PayPal",
  bank_transfer: "Bank transfer",
  opay: "Opay",
  palmpay: "PalmPay",
};

export function buildLabel(method: string, details: Record<string, string>) {
  const name = METHOD_DISPLAY_NAMES[method] ?? method;
  if (method === "paypal") return details.email ? `${name} — ${details.email}` : name;
  if (method === "bank_transfer") return details.bankName ? `${name} — ${details.bankName}` : name;
  const identifier = details.accountIdentifier || details.phone;
  return identifier ? `${name} — ${identifier}` : name;
}

export function maskedDetailsString(method: string, details: Record<string, string>) {
  const masked = maskDetails(method, details);
  return Object.values(masked).filter(Boolean).join(" · ");
}

function serialize(p: typeof payoutMethodsTable.$inferSelect) {
  const details = JSON.parse(p.details) as Record<string, string>;
  return {
    id: p.id,
    method: p.method,
    label: buildLabel(p.method, details),
    maskedDetails: maskedDetailsString(p.method, details),
    countryCode: p.countryCode,
    isDefault: p.isDefault,
    details: maskDetails(p.method, details),
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/payout-methods", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const country = (user.countryCode || "US").toUpperCase();
    const methods = AVAILABLE_METHODS_BY_COUNTRY[country] ?? DEFAULT_METHODS;

    const profiles = await db
      .select()
      .from(payoutMethodsTable)
      .where(eq(payoutMethodsTable.userId, user.id))
      .orderBy(desc(payoutMethodsTable.isDefault), desc(payoutMethodsTable.createdAt));

    return res.json({ methods, profiles: profiles.map(serialize) });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/payout-methods", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const { countryCode, method, details } = req.body as {
      countryCode?: string;
      method?: string;
      details?: Record<string, string>;
    };
    if (!method || !details) return res.status(400).json({ error: "method and details are required" });

    const [created] = await db
      .insert(payoutMethodsTable)
      .values({
        userId: user.id,
        countryCode: (countryCode || user.countryCode || "US").toUpperCase(),
        method,
        details: JSON.stringify(details),
        isDefault: false,
      })
      .returning();

    return res.status(201).json(serialize(created));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/payout-methods/:id", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const id = Number(req.params.id);
    const { countryCode, method, details } = req.body as {
      countryCode?: string;
      method?: string;
      details?: Record<string, string>;
    };

    const [existing] = await db
      .select()
      .from(payoutMethodsTable)
      .where(and(eq(payoutMethodsTable.id, id), eq(payoutMethodsTable.userId, user.id)));
    if (!existing) return res.status(404).json({ error: "Payout method not found" });

    const [updated] = await db
      .update(payoutMethodsTable)
      .set({
        ...(method ? { method } : {}),
        ...(countryCode ? { countryCode: countryCode.toUpperCase() } : {}),
        ...(details ? { details: JSON.stringify(details) } : {}),
      })
      .where(eq(payoutMethodsTable.id, id))
      .returning();

    return res.json(serialize(updated));
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/payout-methods/:id", async (req, res) => {
  try {
    const user = await getCurrentAppUser(req);
    if (!user) return res.status(401).json({ error: "Authentication required" });

    const id = Number(req.params.id);
    const [existing] = await db
      .select()
      .from(payoutMethodsTable)
      .where(and(eq(payoutMethodsTable.id, id), eq(payoutMethodsTable.userId, user.id)));
    if (!existing) return res.status(404).json({ error: "Payout method not found" });

    await db.delete(payoutMethodsTable).where(eq(payoutMethodsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
