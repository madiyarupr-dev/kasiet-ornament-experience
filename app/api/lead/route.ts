import { NextResponse } from "next/server";
import { LeadPayload } from "@/lib/types";
import { sendToCrm } from "@/config/crm";

export const runtime = "nodejs";

function isValidPayload(body: unknown): body is LeadPayload {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.name === "string" &&
    typeof b.city === "string" &&
    typeof b.whatsapp === "string" &&
    typeof b.result === "string" &&
    Array.isArray(b.answers)
    );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!isValidPayload(body)) {
    return NextResponse.json({ ok: false, error: "Заполните имя, город и WhatsApp" }, { status: 422 });
  }
  const payload: LeadPayload = {
    ...body,
    createdAt: body.createdAt || new Date().toISOString(),
    source: body.source || "kasiet-quiz-web",
  };
  console.log("[KASIET LEAD]", JSON.stringify(payload));
  const crm = await sendToCrm(payload);
  if (!crm.ok) {
    console.warn("[KASIET CRM WARN]", crm.provider, crm.detail);
  }
  return NextResponse.json({ ok: true, crm: crm.provider });
}
