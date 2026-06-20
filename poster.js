import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.OPEN_MOSQUE_CONFIG || {};
const params = new URLSearchParams(window.location.search);
const campaignSlug = params.get("campaign") || config.campaignSlug || "laval";
const publicUrl = new URL("index.html", window.location.href);
publicUrl.search = "";
publicUrl.searchParams.set("campaign", campaignSlug);

const isConfigured = Boolean(
  config.supabaseUrl &&
    config.supabasePublishableKey &&
    !config.supabaseUrl.includes("YOUR_PROJECT"),
);

const fallback = {
  slug: campaignSlug,
  name: "Centre communautaire de Laval",
  goal: 100,
  eventDate: "2026-09-20",
  foodInfo: "Un repas convivial sera offert. Les détails suivront.",
  photoUrl: "",
};

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);
  return new Intl.DateTimeFormat("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function render(campaign) {
  document.getElementById("posterCampaignName").textContent = campaign.name;
  document.querySelector(".poster-logo").src = campaign.photoUrl || "assets/open-mosque-logo.jpg";
  document.querySelector(".poster-logo").alt = campaign.photoUrl ? campaign.name : "Open Mosque";
  document.getElementById("posterEventDate").textContent = formatDate(campaign.eventDate);
  document.getElementById("posterGoal").textContent = campaign.goal;
  document.getElementById("posterHost").textContent = window.location.host || "Open Mosque";
  document.getElementById("posterSlug").textContent = campaign.slug.toUpperCase();
  document.getElementById("posterFoodInfo").textContent = campaign.foodInfo || "";
  document.getElementById("backToCampaign").href = publicUrl.toString();

  if (window.QRCode) {
    document.getElementById("posterQr").replaceChildren();
    new QRCode(document.getElementById("posterQr"), {
      text: publicUrl.toString(),
      width: 240,
      height: 240,
      colorDark: "#17382f",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  }
}

async function loadCampaign() {
  if (!isConfigured) {
    render(fallback);
    return;
  }

  const supabase = createClient(config.supabaseUrl, config.supabasePublishableKey);
  const { data, error } = await supabase.rpc("get_public_campaign", {
    p_slug: campaignSlug,
  });
  const row = Array.isArray(data) ? data[0] : data;

  if (error || !row) {
    render({
      ...fallback,
      name: "Campagne indisponible",
      foodInfo: "Vérifiez le lien de la campagne ou contactez l’équipe Open Mosque.",
    });
    return;
  }

  render({
    slug: row.slug,
    name: row.name,
    goal: Number(row.goal),
    eventDate: row.event_date,
    foodInfo: row.food_info || "",
    photoUrl: row.photo_url || "",
  });
}

await loadCampaign();
