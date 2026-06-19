import { LeadPayload } from "@/lib/types";

export type CrmProvider =
  | "none"
| "webhook"
| "make"
| "zapier"
| "googleSheets"
| "amocrm"
| "bitrix24";

export interface CrmConfig {
  provider: CrmProvider;
  webhookUrl?: string;
  amocrm?: {
  baseUrl?: string;
  accessToken?: string;
  pipelineId?: string;
  statusId?: string;
  };
  bitrix24?: {
  webhookUrl?: string;
  };
}

export const crmConfig: CrmConfig = {
  provider: (process.env.CRM_PROVIDER as CrmProvider) || "none",
  webhookUrl: process.env.CRM_WEBHOOK_URL,
  amocrm: {
    baseUrl: process.env.AMOCRM_BASE_URL,
    accessToken: process.env.AMOCRM_ACCESS_TOKEN,
    pipelineId: process.env.AMOCRM_PIPELINE_ID,
    statusId: process.env.AMOCRM_STATUS_ID,
  },
  bitrix24: {
    webhookUrl: process.env.BITRIX24_WEBHOOK_URL,
  },
};

export async function sendToCrm(
  payload: LeadPayload
  ): Promise<{ ok: boolean; provider: CrmProvider; detail?: string }> {
  const { provider } = crmConfig;
  try {
    switch (provider) {
      case "none":
        return { ok: true, provider };
      case "webhook":
      case "make":
      case "zapier":
      case "googleSheets": {
        if (!crmConfig.webhookUrl) {
          return { ok: false, provider, detail: "CRM_WEBHOOK_URL is not set" };
        }
        const res = await fetch(crmConfig.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return { ok: res.ok, provider, detail: "HTTP " + res.status };
      }
      case "bitrix24": {
        const url = crmConfig.bitrix24?.webhookUrl;
        if (!url) {
          return { ok: false, provider, detail: "BITRIX24_WEBHOOK_URL is not set" };
        }
        const res = await fetch(url + "crm.lead.add.json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fields: { TITLE: "Kasiet — " + payload.resultLabel, NAME: payload.name, ADDRESS_CITY: payload.city, PHONE: [{ VALUE: payload.whatsapp, VALUE_TYPE: "WORK" }], COMMENTS: JSON.stringify(payload.answers), SOURCE_DESCRIPTION: payload.source } }),
        });
        return { ok: res.ok, provider, detail: "HTTP " + res.status };
      }
      case "amocrm": {
        const baseUrl = crmConfig.amocrm?.baseUrl;
        const accessToken = crmConfig.amocrm?.accessToken;
        if (!baseUrl || !accessToken) {
          return { ok: false, provider, detail: "AmoCRM credentials are not set" };
        }
        const res = await fetch(baseUrl + "/api/v4/leads/complex", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + accessToken },
          body: JSON.stringify([{ name: "Kasiet — " + payload.resultLabel, _embedded: { contacts: [{ name: payload.name, custom_fields_values: [{ field_code: "PHONE", values: [{ value: payload.whatsapp }] }] }] } }]),
        });
        return { ok: res.ok, provider, detail: "HTTP " + res.status };
      }
      default:
        return { ok: true, provider: "none" };
    }
  } catch (err) {
    return { ok: false, provider, detail: err instanceof Error ? err.message : "unknown error" };
  }
}
