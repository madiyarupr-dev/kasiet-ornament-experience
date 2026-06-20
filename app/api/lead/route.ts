import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LeadPayload = {
  name?: string;
  phone?: string;
  contact?: string;
  result?: string;
  answers?: string[];
};

export async function POST(request: Request) {
  let data: LeadPayload = {};
  try {
    data = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  if (!data.name || !data.phone) {
    return NextResponse.json(
      { ok: false, error: "missing_fields" },
      { status: 422 }
    );
  }

  // NOTE: CRM/webhook integration (AmoCRM / Bitrix / Google Sheets)
  // will be connected later via environment variables. For now we just
  // log the lead on the server and acknowledge it. No secrets in code.
  console.log("New lead:", {
    name: data.name,
    phone: data.phone,
    contact: data.contact ?? null,
    result: data.result ?? null,
  });

  return NextResponse.json({ ok: true });
}
