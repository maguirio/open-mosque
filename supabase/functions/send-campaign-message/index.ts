const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RequestBody = {
  campaignId?: string;
  subject?: string;
  body?: string;
  language?: "fr" | "en" | "bilingual";
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderEmailHtml(params: {
  campaignName: string;
  subject: string;
  body: string;
  publicUrl: string;
  logoUrl: string;
}) {
  const paragraphs = escapeHtml(params.body)
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f8f1e6;color:#17382f;font-family:Inter,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f1e6;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fffdf8;border:1px solid #eadfca;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;text-align:center;background:linear-gradient(135deg,#fff8df,#e7f5ef);">
                <img src="${escapeHtml(params.logoUrl)}" alt="Open Mosque" width="86" style="border-radius:18px;display:block;margin:0 auto 14px;" />
                <p style="margin:0 0 8px;color:#a87328;font-size:12px;letter-spacing:.16em;text-transform:uppercase;">Open Mosque</p>
                <h1 style="margin:0;color:#0d4f3f;font-size:28px;line-height:1.2;">${escapeHtml(params.subject)}</h1>
                <p style="margin:12px 0 0;color:#45685d;font-size:15px;">${escapeHtml(params.campaignName)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;font-size:16px;line-height:1.65;">
                ${paragraphs}
                <p style="margin:28px 0 0;">
                  <a href="${escapeHtml(params.publicUrl)}" style="display:inline-block;background:#0d4f3f;color:#fff;text-decoration:none;padding:13px 18px;border-radius:999px;font-weight:700;">
                    Ouvrir la page Open Mosque
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 26px;color:#6b7f78;font-size:12px;border-top:1px solid #eadfca;">
                Vous recevez ce message parce que vous avez demande les nouvelles de cette initiative.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function supabaseRest<T>(
  supabaseUrl: string,
  serviceRoleKey: string,
  path: string,
  init: RequestInit = {},
) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export default {
  async fetch(request: Request) {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("OPEN_MOSQUE_FROM_EMAIL");
  const replyTo = Deno.env.get("OPEN_MOSQUE_REPLY_TO") || undefined;
  const publicBaseUrl = Deno.env.get("OPEN_MOSQUE_PUBLIC_URL") || "https://maguirio.github.io/open-mosque/";
  const logoUrl = Deno.env.get("OPEN_MOSQUE_LOGO_URL") || "https://maguirio.github.io/open-mosque/assets/open-mosque-logo.jpg";

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "supabase_not_configured" }, 500);
  }
  if (!resendApiKey || !fromEmail) {
    return jsonResponse({ error: "email_provider_not_configured" }, 500);
  }

  const authorization = request.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return jsonResponse({ error: "missing_auth" }, 401);
  }

  let payload: RequestBody;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const campaignId = payload.campaignId?.trim();
  const subject = payload.subject?.trim() || "";
  const body = payload.body?.trim() || "";
  const language = payload.language || "bilingual";
  if (!campaignId || subject.length < 3 || subject.length > 180 || body.length < 10 || body.length > 6000) {
    return jsonResponse({ error: "invalid_message" }, 400);
  }
  if (!["fr", "en", "bilingual"].includes(language)) {
    return jsonResponse({ error: "invalid_language" }, 400);
  }

  const jwt = authorization.replace(/^Bearer\s+/i, "");
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (!userResponse.ok) {
    return jsonResponse({ error: "invalid_auth" }, 401);
  }
  const user = await userResponse.json();

  let superAdminRows: Array<{ user_id: string }>;
  let campaignRows: Array<{ id: string; slug: string; name: string; admin_user_id: string | null }>;
  try {
    superAdminRows = await supabaseRest(
      supabaseUrl,
      serviceRoleKey,
      `super_admins?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`,
    );
    campaignRows = await supabaseRest(
      supabaseUrl,
      serviceRoleKey,
      `campaigns?id=eq.${encodeURIComponent(campaignId)}&select=id,slug,name,admin_user_id`,
    );
  } catch {
    return jsonResponse({ error: "authorization_check_failed" }, 500);
  }
  const isSuperAdmin = superAdminRows.length > 0;
  const campaign = campaignRows[0];
  if (!campaign) {
    return jsonResponse({ error: "campaign_not_found" }, 404);
  }
  if (!isSuperAdmin && campaign.admin_user_id !== user.id) {
    return jsonResponse({ error: "not_authorized" }, 403);
  }

  let pledges: Array<{ email: string; full_name: string }>;
  try {
    pledges = await supabaseRest(
      supabaseUrl,
      serviceRoleKey,
      `pledges?campaign_id=eq.${encodeURIComponent(campaignId)}&wants_updates=eq.true&select=email,full_name`,
    );
  } catch {
    return jsonResponse({ error: "pledges_lookup_failed" }, 500);
  }
  const recipients = Array.from(new Map((pledges || []).map((pledge) => [pledge.email, pledge])).values());
  if (!recipients.length) {
    return jsonResponse({ error: "no_recipients" }, 400);
  }
  if (recipients.length > 300) {
    return jsonResponse({ error: "too_many_recipients" }, 400);
  }

  const publicUrl = new URL(publicBaseUrl);
  publicUrl.searchParams.set("campaign", campaign.slug);
  const html = renderEmailHtml({
    campaignName: campaign.name,
    subject,
    body,
    publicUrl: publicUrl.toString(),
    logoUrl,
  });

  let sent = 0;
  let failure = "";
  for (const recipient of recipients) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipient.email],
        reply_to: replyTo,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      failure = await response.text();
      break;
    }
    sent += 1;
  }

  await supabaseRest(supabaseUrl, serviceRoleKey, "campaign_messages", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      campaign_id: campaignId,
      sent_by: user.id,
      subject,
      body,
      language,
      recipient_count: sent,
      provider: "resend",
      status: failure ? "failed" : "sent",
      error_message: failure || null,
    }),
  });

  if (failure) {
    return jsonResponse({ error: "resend_failed", sent, detail: failure }, 502);
  }

  return jsonResponse({ sent });
  },
};
