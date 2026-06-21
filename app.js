import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.OPEN_MOSQUE_CONFIG || {};
const queryCampaignSlug = new URLSearchParams(window.location.search).get("campaign");
const defaultCampaignSlug = config.campaignSlug || "";
const campaignSlug = queryCampaignSlug || defaultCampaignSlug;
const isDirectoryMode = !queryCampaignSlug;
const isConfigured = Boolean(
  config.supabaseUrl &&
    config.supabasePublishableKey &&
    !config.supabaseUrl.includes("YOUR_PROJECT"),
);
const supabase = isConfigured
  ? createClient(config.supabaseUrl, config.supabasePublishableKey)
  : null;
const invitationClient = isConfigured
  ? createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: "open-mosque-invitations",
      },
    })
  : null;
const fallbackCampaignImage = "assets/open-mosque-logo.jpg";
const mosquePresets = Array.isArray(window.OPEN_MOSQUE_PRESETS)
  ? window.OPEN_MOSQUE_PRESETS
  : [];

const defaults = {
  id: null,
  slug: campaignSlug || "open-mosque",
  name: "Open Mosque",
  goal: 100,
  eventDate: "2026-09-20",
  deadline: "2026-08-31",
  foodInfo: "Un repas convivial sera offert. Les détails suivront.",
  photoUrl: "",
  address: "",
  city: "",
  websiteUrl: "",
  active: true,
  adminEmail: "",
  pledgeCount: 0,
  guestTotal: 0,
};

const translations = {
  fr: {
    admin: "Espace responsable",
    homeEyebrow: "Open Mosque",
    homeTitle: "Choisissez votre mosquée, puis annoncez votre intention.",
    homeLead:
      "Trouvez la mosquée concernée, ouvrez sa page, puis indiquez simplement combien de personnes vous aimeriez inviter.",
    homeCta: "Trouver ma mosquée",
    homeStepOne: "1. Recherchez la mosquée",
    homeStepTwo: "2. Cliquez sur Participer",
    homeStepThree: "3. Entrez votre intention",
    searchLabel: "Rechercher une mosquée",
    searchPlaceholder: "Nom, ville ou quartier...",
    directoryTitle: "Mosquées participantes",
    directoryHint: "Chaque carte mène directement à la bonne page d’inscription.",
    emptyMosques: "Aucune mosquée ne correspond à cette recherche.",
    noActiveCampaigns:
      "Aucune campagne active pour l'instant. Revenez bientôt, ou ouvrez l'espace responsable pour préparer une mosquée.",
    chooseMosque: "Participer",
    directoryLoadError: "Impossible de charger les mosquées pour le moment.",
    mobileContext: "Page de mosquée",
    eyebrow: "Journée portes ouvertes",
    heroTitle: "Une invitation peut ouvrir bien plus qu’une porte.",
    heroLead:
      "Invitez un ami, un collègue ou un voisin non musulman à découvrir la mosquée dans un cadre simple, chaleureux et accueillant.",
    cta: "Je participe",
    privacy:
      "Vos coordonnées restent privées et servent seulement à organiser cette journée.",
    active: "Campagne active",
    unavailable: "Campagne indisponible",
    eventDate: "Événement",
    of: "sur",
    guests: "invités",
    deadline: "Engagements ouverts jusqu’au",
    noDeadline: "Inscriptions ouvertes",
    howEyebrow: "Comment ça marche",
    progressHelp:
      "Chaque intention aide la mosquée à savoir quand préparer l’événement.",
    howTitle: "Simple, rapide, utile pour organiser.",
    step1Title: "Inscrivez votre intention",
    step1Body:
      "Ajoutez votre nom et le nombre de personnes que vous pensez inviter.",
    step2Title: "Partagez à la communauté",
    step2Body:
      "Envoyez le lien ou le QR à des frères et sœurs qui peuvent aussi inviter.",
    step3Title: "Préparez l’Open Mosque",
    step3Body:
      "Quand l’objectif approche, la mosquée peut préparer l’accueil, les échanges et le repas.",
    formEyebrow: "Participer",
    formTitle: "Ajoutez votre intention",
    formLead:
      "Cette inscription nous aide à savoir quand la communauté est prête à organiser l’événement. Vous pourrez modifier votre réponse plus tard.",
    quote: "« Le meilleur accueil commence souvent par une invitation personnelle. »",
    nameLabel: "Votre prénom et nom",
    emailLabel: "Votre courriel",
    countLabel: "Combien de personnes pensez-vous inviter?",
    countHelp: "Maximum 5 invités par intention.",
    updatesLabel: "Je souhaite recevoir les détails et les nouvelles de l’événement.",
    submit: "Ajouter mon intention",
    formNote: "Ceci est une intention, pas une réservation définitive.",
    retentionNotice:
      "Votre nom et votre courriel sont accessibles uniquement au responsable de la campagne et supprimés automatiquement 30 jours après l’événement.",
    closedMessage: "Les inscriptions à cette campagne sont maintenant fermées.",
    shareEyebrow: "Faire grandir l’initiative",
    shareTitle: "Partagez cette campagne à la mosquée.",
    shareLead:
      "Le code QR mène directement à cette page. Il peut être placé sur une affiche, dans une infolettre ou dans un groupe communautaire.",
    copyLink: "Copier le lien",
    shareWhatsApp: "WhatsApp",
    shareMiniTitle: "Partager cette page",
    shareMiniLead: "Invitez d’autres frères et sœurs à participer.",
    showQr: "Afficher le QR",
    hideQr: "Masquer le QR",
    posterLink: "Affiche imprimable",
    footer: "Une initiative locale pour mieux se connaître.",
    thankEyebrow: "Merci",
    thankTitle: "Votre intention est enregistrée.",
    thankBody:
      "Nous vous écrirons lorsque les détails de la journée portes ouvertes seront confirmés.",
    close: "Fermer",
    adminEyebrow: "Espace responsable",
    adminLoginTitle: "Gérer la campagne",
    adminLoginLead: "Connectez-vous avec le compte responsable de votre mosquée.",
    adminEmail: "Courriel",
    adminPassword: "Mot de passe",
    invalidCode: "Connexion impossible. Vérifiez vos informations.",
    connect: "Se connecter",
    dashboard: "Tableau de bord",
    campaignSettings: "Gestion des mosquées",
    selectCampaign: "Mosquée / round en cours",
    selectCampaignHelp: "Choisis la mosquée ou le round que tu veux modifier.",
    newCampaign: "Créer une mosquée vide",
    duplicateRound: "Créer le prochain round",
    presetEyebrow: "Ajouter une mosquée",
    presetTitle: "Pars d’une mosquée déjà trouvée",
    presetLead:
      "Elle sera ajoutée en brouillon privé. Elle ne sera visible publiquement que lorsque tu l’actives.",
    presetSearch: "Rechercher dans les presets",
    presetAdd: "Ajouter en brouillon",
    presetAdded: "Déjà ajoutée",
    presetSource: "Source",
    presetCreated: "Mosquée ajoutée comme campagne inactive.",
    mosqueCity: "Ville",
    mosqueAddress: "Adresse",
    mosqueWebsite: "Site web",
    openPublicPage: "Ouvrir la page publique",
    deleteCampaign: "Supprimer la mosquée",
    localOrganizer: "Responsable local",
    localOrganizerHelp: "Donnez à une personne l’accès à cette mosquée seulement.",
    assignOrganizer: "Donner l’accès",
    removeOrganizer: "Retirer l’accès",
    organizerNone: "Aucun responsable local n’est assigné.",
    organizerCurrent: "Responsable actuel :",
    organizerAssigned: "L’accès à cette mosquée a été accordé.",
    organizerInvited: "Invitation envoyée. L’accès sera activé après la connexion.",
    organizerRemoved: "L’accès du responsable local a été retiré.",
    organizerRemoveConfirm: "Retirer l’accès de ce responsable à cette mosquée?",
    organizerEmailInvalid: "Entrez une adresse courriel valide.",
    organizerInviteError: "L’invitation n’a pas pu être envoyée. Réessayez.",
    mosquePhoto: "Photo de la mosquée",
    mosquePhotoHelp:
      "Ajoutez une photo qui apparaîtra sur la page publique et dans la recherche.",
    choosePhoto: "Choisir une photo",
    removePhoto: "Retirer la photo",
    photoUploading: "Téléversement de la photo...",
    photoUploaded: "Photo ajoutée. Enregistrez les changements pour confirmer.",
    photoRemoved: "Photo retirée. Enregistrez les changements pour confirmer.",
    photoUploadError: "La photo n’a pas pu être envoyée. Vérifiez que le stockage Supabase est configuré.",
    settingsEyebrow: "Réglages",
    settingsTitle: "Informations de cette mosquée",
    settingsLead:
      "Ces informations servent à identifier la mosquée. Décoche “Visible publiquement” tant que tu n’as pas l’accord.",
    campaignSlug: "Lien public",
    campaignSlugHelp: "Exemple: laval donne une page ?campaign=laval.",
    campaignStatus: "Visibilité",
    campaignActive: "Visible publiquement",
    intentions: "intentions",
    expectedGuests: "invités prévus",
    remaining: "avant l’objectif",
    mosqueName: "Nom de la mosquée",
    goal: "Objectif d’invités",
    eventDateLabel: "Date de l’événement",
    deadlineLabel: "Date limite d’inscription",
    hasDeadline: "Mettre une date limite",
    deadlineHelp: "Si décoché, les inscriptions restent ouvertes tant que la campagne est visible.",
    foodInfo: "Informations sur le repas ou les contributions",
    save: "Enregistrer les changements",
    signOut: "Se déconnecter",
    copied: "Lien copié.",
    saved: "Paramètres enregistrés.",
    registrations: "Inscriptions",
    registrationsTitle: "Personnes engagées",
    privateData: "Données confidentielles",
    participant: "Participant",
    guestCountAdmin: "Invités",
    updatesAdmin: "Nouvelles",
    registeredAt: "Inscription",
    emptyPledges: "Aucune intention enregistrée pour le moment.",
    yes: "Oui",
    no: "Non",
    purgeNotice: "Suppression automatique des coordonnées le",
    unauthorized: "Ce compte n’est pas autorisé à gérer cette campagne.",
    invalidDates: "La date limite doit être antérieure ou égale à la date de l’événement.",
    slugInvalid: "Le lien public doit contenir uniquement des minuscules, chiffres et tirets.",
    campaignCreated: "La mosquée vide a été créée en brouillon.",
    roundCreated:
      "Nouveau round créé en brouillon. Le compteur repart à zéro et les anciens courriels peuvent se réinscrire.",
    campaignDeleted: "La mosquée et ses engagements ont été supprimés.",
    deleteConfirm:
      "Supprimer définitivement cette mosquée et tous ses engagements? Cette action est irréversible.",
    cannotDeleteLast: "Il faut conserver au moins une campagne.",
    preview: "Mode aperçu",
    setupRequired: "La base Supabase doit être configurée avant cette action.",
    loadError: "Impossible de charger la campagne pour le moment.",
    submitError: "L’inscription n’a pas pu être enregistrée. Réessayez.",
    rateLimited: "Trop de tentatives en peu de temps. Réessayez dans quelques minutes.",
    invalidGuestCount: "Choisissez entre 1 et 5 invités.",
    duplicate:
      "Ce courriel est déjà inscrit. Utilisez le même appareil pour modifier l’intention.",
  },
  en: {
    admin: "Organizer area",
    homeEyebrow: "Open Mosque",
    homeTitle: "Choose your mosque, then record your intention.",
    homeLead:
      "Find the right mosque, open its page, then simply say how many people you would like to invite.",
    homeCta: "Find my mosque",
    homeStepOne: "1. Search for the mosque",
    homeStepTwo: "2. Click Take part",
    homeStepThree: "3. Enter your intention",
    searchLabel: "Search for a mosque",
    searchPlaceholder: "Name, city or neighbourhood...",
    directoryTitle: "Participating mosques",
    directoryHint: "Each card takes you directly to the right registration page.",
    emptyMosques: "No mosque matches this search.",
    noActiveCampaigns:
      "No active campaign yet. Check back soon, or open the organizer area to prepare a mosque.",
    chooseMosque: "Take part",
    directoryLoadError: "The mosque list could not be loaded right now.",
    mobileContext: "Mosque page",
    eyebrow: "Open mosque day",
    heroTitle: "One invitation can open much more than a door.",
    heroLead:
      "Invite a non-Muslim friend, colleague or neighbour to discover the mosque in a simple, warm and welcoming setting.",
    cta: "Take part",
    privacy:
      "Your contact details stay private and are used only to organize this day.",
    active: "Active campaign",
    unavailable: "Campaign unavailable",
    eventDate: "Event",
    of: "of",
    guests: "guests",
    deadline: "Pledges open until",
    noDeadline: "Registrations open",
    howEyebrow: "How it works",
    progressHelp:
      "Each intention helps the mosque know when to prepare the event.",
    howTitle: "Simple, quick, and useful for organizing.",
    step1Title: "Record your intention",
    step1Body:
      "Add your name and the number of people you plan to invite.",
    step2Title: "Share with the community",
    step2Body:
      "Send the link or QR code to brothers and sisters who can also invite.",
    step3Title: "Prepare the Open Mosque",
    step3Body:
      "As the goal approaches, the mosque can prepare the welcome, conversations and meal.",
    formEyebrow: "Take part",
    formTitle: "Add your intention",
    formLead:
      "This registration helps us know when the community is ready to organize the event. You can update your answer later.",
    quote: "“The warmest welcome often begins with a personal invitation.”",
    nameLabel: "Your full name",
    emailLabel: "Your email",
    countLabel: "How many people do you plan to invite?",
    countHelp: "Maximum 5 guests per intention.",
    updatesLabel: "I would like to receive event details and updates.",
    submit: "Add my intention",
    formNote: "This is an intention, not a final reservation.",
    retentionNotice:
      "Your name and email are visible only to the campaign organizer and are automatically deleted 30 days after the event.",
    closedMessage: "Registration for this campaign is now closed.",
    shareEyebrow: "Grow the initiative",
    shareTitle: "Share this campaign at the mosque.",
    shareLead:
      "The QR code leads directly to this page. Place it on a poster, in a newsletter or in a community group.",
    copyLink: "Copy link",
    shareWhatsApp: "WhatsApp",
    shareMiniTitle: "Share this page",
    shareMiniLead: "Invite other brothers and sisters to take part.",
    showQr: "Show QR",
    hideQr: "Hide QR",
    posterLink: "Printable poster",
    footer: "A local initiative to get to know one another.",
    thankEyebrow: "Thank you",
    thankTitle: "Your intention has been recorded.",
    thankBody: "We will email you when the open mosque day details are confirmed.",
    close: "Close",
    adminEyebrow: "Organizer area",
    adminLoginTitle: "Manage the campaign",
    adminLoginLead: "Sign in with your mosque organizer account.",
    adminEmail: "Email",
    adminPassword: "Password",
    invalidCode: "Sign-in failed. Check your information.",
    connect: "Sign in",
    dashboard: "Dashboard",
    campaignSettings: "Mosque management",
    selectCampaign: "Current mosque / round",
    selectCampaignHelp: "Choose the mosque or round you want to edit.",
    newCampaign: "Create blank mosque",
    duplicateRound: "Create next round",
    presetEyebrow: "Add a mosque",
    presetTitle: "Start from a mosque already found",
    presetLead:
      "It will be added as a private draft. It becomes public only when you activate it.",
    presetSearch: "Search presets",
    presetAdd: "Add as draft",
    presetAdded: "Already added",
    presetSource: "Source",
    presetCreated: "Mosque added as an inactive campaign.",
    mosqueCity: "City",
    mosqueAddress: "Address",
    mosqueWebsite: "Website",
    openPublicPage: "Open public page",
    deleteCampaign: "Delete mosque",
    localOrganizer: "Local organizer",
    localOrganizerHelp: "Give one person access to this mosque only.",
    assignOrganizer: "Grant access",
    removeOrganizer: "Remove access",
    organizerNone: "No local organizer is assigned.",
    organizerCurrent: "Current organizer:",
    organizerAssigned: "Access to this mosque was granted.",
    organizerInvited: "Invitation sent. Access will activate after sign-in.",
    organizerRemoved: "The local organizer's access was removed.",
    organizerRemoveConfirm: "Remove this organizer's access to this mosque?",
    organizerEmailInvalid: "Enter a valid email address.",
    organizerInviteError: "The invitation could not be sent. Please try again.",
    mosquePhoto: "Mosque photo",
    mosquePhotoHelp: "Add a photo that will appear on the public page and in search.",
    choosePhoto: "Choose photo",
    removePhoto: "Remove photo",
    photoUploading: "Uploading photo...",
    photoUploaded: "Photo added. Save changes to confirm.",
    photoRemoved: "Photo removed. Save changes to confirm.",
    photoUploadError:
      "The photo could not be uploaded. Check that Supabase Storage is configured.",
    settingsEyebrow: "Settings",
    settingsTitle: "This mosque’s information",
    settingsLead:
      "These details identify the mosque. Keep “Publicly visible” unchecked until you have approval.",
    campaignSlug: "Public link",
    campaignSlugHelp: "Example: laval gives a ?campaign=laval page.",
    campaignStatus: "Visibility",
    campaignActive: "Publicly visible",
    intentions: "pledges",
    expectedGuests: "expected guests",
    remaining: "before the goal",
    mosqueName: "Mosque name",
    goal: "Guest goal",
    eventDateLabel: "Event date",
    deadlineLabel: "Registration deadline",
    hasDeadline: "Set a deadline",
    deadlineHelp: "If unchecked, registrations stay open while the campaign is public.",
    foodInfo: "Food or contribution information",
    save: "Save changes",
    signOut: "Sign out",
    copied: "Link copied.",
    saved: "Settings saved.",
    registrations: "Registrations",
    registrationsTitle: "Committed participants",
    privateData: "Confidential data",
    participant: "Participant",
    guestCountAdmin: "Guests",
    updatesAdmin: "Updates",
    registeredAt: "Registered",
    emptyPledges: "No pledges have been recorded yet.",
    yes: "Yes",
    no: "No",
    purgeNotice: "Contact details will be automatically deleted on",
    unauthorized: "This account is not authorized to manage this campaign.",
    invalidDates: "The registration deadline must be on or before the event date.",
    slugInvalid: "The public link may contain only lowercase letters, numbers and hyphens.",
    campaignCreated: "The blank mosque was created as a draft.",
    roundCreated:
      "New round created as a draft. The counter starts from zero and previous emails can register again.",
    campaignDeleted: "The mosque and all its pledges were deleted.",
    deleteConfirm:
      "Permanently delete this mosque and all its pledges? This action cannot be undone.",
    cannotDeleteLast: "At least one campaign must remain.",
    preview: "Preview mode",
    setupRequired: "Supabase must be configured before this action.",
    loadError: "The campaign could not be loaded right now.",
    submitError: "The pledge could not be saved. Please try again.",
    rateLimited: "Too many attempts in a short time. Please try again in a few minutes.",
    invalidGuestCount: "Choose between 1 and 5 guests.",
    duplicate:
      "This email is already registered. Use the same device to update the pledge.",
  },
};

let campaign = { ...defaults };
let language = "fr";
let adminPledges = [];
let adminCampaigns = [];
let publicCampaigns = [];
let isSuperAdmin = false;
let publicCampaignAvailable = true;

function isCampaignOpen() {
  if (!campaign.deadline) return publicCampaignAvailable && campaign.active;
  const endOfDeadline = new Date(`${campaign.deadline}T23:59:59`);
  return publicCampaignAvailable && campaign.active && Date.now() <= endOfDeadline.getTime();
}

function formatDate(dateValue, short = false) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T12:00:00`);
  return new Intl.DateTimeFormat(language === "fr" ? "fr-CA" : "en-CA", {
    day: "numeric",
    month: short ? "short" : "long",
    year: short ? undefined : "numeric",
  }).format(date);
}

function campaignUrl(slug) {
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("campaign", slug);
  return url.toString();
}

function currentCampaignUrl() {
  return campaignUrl(campaign.slug || campaignSlug);
}

function renderQrCode() {
  const qrContainer = document.getElementById("qrCode");
  if (!qrContainer) return;

  const shareUrl = currentCampaignUrl();
  qrContainer.replaceChildren();
  if (window.QRCode) {
    new QRCode(qrContainer, {
      text: shareUrl,
      width: 180,
      height: 180,
      colorDark: "#17382f",
      colorLight: "#fffdf8",
      correctLevel: QRCode.CorrectLevel.H,
    });
  } else {
    qrContainer.textContent = shareUrl;
  }
}

function campaignImageUrl(item = campaign) {
  return item.photoUrl || fallbackCampaignImage;
}

function mosqueLocationText(item) {
  return [item.address, item.city].filter(Boolean).join(" · ");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function uniqueSlug(baseSlug) {
  const base = slugify(baseSlug) || `mosquee-${Date.now().toString().slice(-6)}`;
  const existing = new Set(adminCampaigns.map((item) => item.slug));
  if (!existing.has(base)) return base;
  let index = 2;
  while (existing.has(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

function nextRoundSlug(currentSlug) {
  const base = slugify(currentSlug).replace(/-round-\d+$/, "");
  const prefix = `${base}-round-`;
  const highestRound = adminCampaigns.reduce((highest, item) => {
    if (item.slug === base) return Math.max(highest, 1);
    if (!item.slug.startsWith(prefix)) return highest;
    const roundNumber = Number(item.slug.slice(prefix.length));
    return Number.isInteger(roundNumber) ? Math.max(highest, roundNumber) : highest;
  }, 1);
  return uniqueSlug(`${base}-round-${highestRound + 1}`);
}

async function insertCampaign(row) {
  let { data, error } = await supabase
    .from("campaigns")
    .insert(row)
    .select("id")
    .single();
  if (["photo_url", "address", "city", "website_url"].some((field) => error?.message?.includes(field))) {
    const fallbackRow = { ...row };
    delete fallbackRow.photo_url;
    delete fallbackRow.city;
    delete fallbackRow.address;
    delete fallbackRow.website_url;
    const fallback = await supabase
      .from("campaigns")
      .insert(fallbackRow)
      .select("id")
      .single();
    data = fallback.data;
    error = fallback.error;
  }
  if (error) throw error;
  return data.id;
}

function renderPresetLibrary() {
  const library = document.getElementById("presetLibrary");
  if (!library) return;
  library.hidden = !isSuperAdmin;
  if (!isSuperAdmin) return;

  const query = document.getElementById("presetSearch").value.trim().toLowerCase();
  const results = document.getElementById("presetResults");
  const existingSlugs = new Set(adminCampaigns.map((item) => item.slug));
  const existingNames = new Set(adminCampaigns.map((item) => item.name.toLowerCase()));
  const filtered = mosquePresets.filter((preset) => {
    const haystack = `${preset.name} ${preset.city} ${preset.address} ${preset.slug}`.toLowerCase();
    return haystack.includes(query);
  });

  results.replaceChildren();
  filtered.forEach((preset) => {
    const card = document.createElement("article");
    const content = document.createElement("div");
    const title = document.createElement("strong");
    const meta = document.createElement("span");
    const source = document.createElement("a");
    const button = document.createElement("button");
    const added = existingSlugs.has(preset.slug) || existingNames.has(preset.name.toLowerCase());

    card.className = "preset-card";
    card.classList.toggle("is-added", added);
    title.textContent = preset.name;
    meta.textContent = mosqueLocationText(preset) || preset.city || preset.slug;
    source.className = "preset-source";
    source.href = preset.sourceUrl || preset.websiteUrl || "#";
    source.target = "_blank";
    source.rel = "noreferrer";
    source.textContent = translations[language].presetSource;
    button.className = added ? "outline-button" : "primary-button";
    button.type = "button";
    button.disabled = added;
    button.dataset.presetSlug = preset.slug;
    button.textContent = added
      ? translations[language].presetAdded
      : translations[language].presetAdd;

    content.append(title, meta);
    if (preset.sourceUrl || preset.websiteUrl) content.append(source);
    card.append(content, button);
    results.append(card);
  });
}

function renderDirectory() {
  const query = document.getElementById("mosqueSearch").value.trim().toLowerCase();
  const results = document.getElementById("mosqueResults");
  const empty = document.getElementById("emptyMosques");
  const filtered = publicCampaigns.filter((item) => {
    const haystack = `${item.name} ${item.slug} ${item.city} ${item.address}`.toLowerCase();
    return haystack.includes(query);
  });

  results.replaceChildren();
  document.getElementById("directoryCount").textContent = String(filtered.length);
  empty.textContent = publicCampaigns.length
    ? translations[language].emptyMosques
    : translations[language].noActiveCampaigns;
  empty.hidden = filtered.length > 0;

  filtered.forEach((item) => {
    const link = document.createElement("a");
    const image = document.createElement("img");
    const details = document.createElement("span");
    const title = document.createElement("strong");
    const meta = document.createElement("span");
    const action = document.createElement("span");
    const percent = Math.min(100, Math.round((Number(item.guestTotal) / Number(item.goal)) * 100));

    link.className = "mosque-result";
    link.href = campaignUrl(item.slug);
    image.className = "mosque-result-thumb";
    image.src = campaignImageUrl(item);
    image.alt = "";
    title.textContent = item.name;
    meta.textContent = [
      mosqueLocationText(item),
      `${Number(item.guestTotal)} / ${Number(item.goal)} ${translations[language].guests}`,
      formatDate(item.eventDate, true),
    ].filter(Boolean).join(" · ");
    action.className = "result-action";
    action.textContent = `${translations[language].chooseMosque} →`;
    details.append(title, meta);
    link.append(image, details, action);
    link.setAttribute("aria-label", `${item.name}, ${percent}%`);
    results.append(link);
  });
}

function render() {
  const total = Number(campaign.guestTotal);
  const goal = Number(campaign.goal);
  const percent = Math.min(100, Math.round((total / goal) * 100));

  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = translations[language][element.dataset.i18n];
    if (value !== undefined) element.innerHTML = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const value = translations[language][element.dataset.i18nPlaceholder];
    if (value !== undefined) element.placeholder = value;
  });

  document.getElementById("homeSection").hidden = !isDirectoryMode;
  document.querySelectorAll(".campaign-surface").forEach((element) => {
    element.hidden = isDirectoryMode;
  });

  document.getElementById("languageToggle").textContent = language === "fr" ? "EN" : "FR";
  if (isDirectoryMode) {
    renderDirectory();
  }

  document.getElementById("campaignName").textContent = campaign.name;
  document.getElementById("mobileCampaignName").textContent = campaign.name;
  const campaignLocation = document.getElementById("campaignLocation");
  campaignLocation.textContent = mosqueLocationText(campaign);
  campaignLocation.hidden = !campaignLocation.textContent;
  const mobileCampaignLocation = document.getElementById("mobileCampaignLocation");
  mobileCampaignLocation.textContent = campaignLocation.textContent;
  mobileCampaignLocation.hidden = !mobileCampaignLocation.textContent;
  const campaignImage = document.querySelector(".mosque-visual img");
  const campaignVisual = document.querySelector(".mosque-visual");
  campaignImage.src = campaignImageUrl();
  campaignImage.alt = campaign.photoUrl ? campaign.name : "Open Mosque";
  campaignVisual.classList.toggle("has-photo", Boolean(campaign.photoUrl));
  document.getElementById("campaignStatusLabel").textContent =
    publicCampaignAvailable && campaign.active
      ? translations[language].active
      : translations[language].unavailable;
  document.getElementById("currentCount").textContent = total;
  document.getElementById("goalCount").textContent = goal;
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("progressFill").style.width = `${percent}%`;
  document.querySelector(".progress-track").setAttribute("aria-valuenow", String(percent));
  document.getElementById("eventDate").textContent = formatDate(
    campaign.eventDate,
    true,
  ).toUpperCase();
  document.getElementById("deadlineDate").textContent = campaign.deadline
    ? formatDate(campaign.deadline)
    : translations[language].noDeadline;

  document.getElementById("adminPledges").textContent = campaign.pledgeCount;
  document.getElementById("adminGuests").textContent = total;
  document.getElementById("adminRemaining").textContent = Math.max(0, goal - total);
  document.getElementById("settingName").value = campaign.name;
  document.getElementById("settingSlug").value = campaign.slug;
  document.getElementById("settingCity").value = campaign.city || "";
  document.getElementById("settingAddress").value = campaign.address || "";
  document.getElementById("settingWebsite").value = campaign.websiteUrl || "";
  document.getElementById("settingActive").checked = campaign.active;
  document.getElementById("settingGoal").value = campaign.goal;
  document.getElementById("settingEventDate").value = campaign.eventDate;
  document.getElementById("settingHasDeadline").checked = Boolean(campaign.deadline);
  document.getElementById("settingDeadline").disabled = !campaign.deadline;
  document.getElementById("settingDeadline").value = campaign.deadline || "";
  document.getElementById("settingFood").value = campaign.foodInfo;
  document.getElementById("settingPhotoUrl").value = campaign.photoUrl || "";
  document.getElementById("settingPhotoPreview").src = campaignImageUrl();
  document.getElementById("removePhotoButton").disabled = !campaign.photoUrl;
  document.getElementById("photoStatus").textContent = "";
  const organizerManager = document.getElementById("organizerManager");
  const organizerEmail = document.getElementById("organizerEmail");
  const removeOrganizerButton = document.getElementById("removeOrganizerButton");
  organizerManager.hidden = !isSuperAdmin;
  organizerEmail.value = campaign.adminEmail || "";
  removeOrganizerButton.disabled = !campaign.adminEmail;
  document.getElementById("organizerStatus").textContent = campaign.adminEmail
    ? `${translations[language].organizerCurrent} ${campaign.adminEmail}`
    : translations[language].organizerNone;

  const pledgeSubmit = document.querySelector('#pledgeForm button[type="submit"]');
  const closedMessage = document.getElementById("closedMessage");
  const open = isCampaignOpen();
  pledgeSubmit.disabled = !open;
  closedMessage.hidden = open;

  const status = document.getElementById("connectionStatus");
  status.hidden = isConfigured;
  status.textContent = translations[language].preview;
  document.getElementById("deleteCampaignButton").hidden = !isSuperAdmin;
  document.getElementById("newCampaignButton").hidden = !isSuperAdmin;
  document.getElementById("duplicateRoundButton").hidden = !isSuperAdmin || !campaign.id;
  renderPresetLibrary();
  const publicUrl = new URL(window.location.href);
  publicUrl.search = "";
  publicUrl.searchParams.set("campaign", campaign.slug);
  document.getElementById("publicCampaignLink").href = publicUrl.toString();
  const posterUrl = new URL("poster.html", window.location.href);
  posterUrl.searchParams.set("campaign", campaign.slug);
  document.getElementById("posterLink").href = posterUrl.toString();
  document.getElementById("qrLabel").textContent = `OPENMOSQUE · ${campaign.slug.toUpperCase()}`;
  const qrPanel = document.getElementById("qrPanel");
  document.getElementById("toggleQrButton").textContent = qrPanel.hidden
    ? translations[language].showQr
    : translations[language].hideQr;
  renderQrCode();
  renderAdminPledges();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 3000);
}

function normalizeCampaign(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    goal: Number(row.goal),
    eventDate: row.event_date,
    deadline: row.deadline,
    foodInfo: row.food_info || "",
    photoUrl: row.photo_url || "",
    address: row.address || "",
    city: row.city || "",
    websiteUrl: row.website_url || "",
    active: row.active !== false,
    adminEmail: row.admin_email || "",
    pledgeCount: Number(row.pledge_count || 0),
    guestTotal: Number(row.guest_total || 0),
  };
}

function normalizePublicCampaign(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    goal: Number(row.goal),
    eventDate: row.event_date,
    deadline: row.deadline,
    foodInfo: row.food_info || "",
    photoUrl: row.photo_url || "",
    address: row.address || "",
    city: row.city || "",
    websiteUrl: row.website_url || "",
    pledgeCount: Number(row.pledge_count || 0),
    guestTotal: Number(row.guest_total || 0),
  };
}

function renderAdminPledges() {
  const body = document.getElementById("pledgesTableBody");
  const empty = document.getElementById("emptyPledges");
  body.replaceChildren();
  empty.hidden = adminPledges.length > 0;

  adminPledges.forEach((pledge) => {
    const row = document.createElement("tr");
    const participant = document.createElement("td");
    const name = document.createElement("strong");
    const email = document.createElement("span");
    const guests = document.createElement("td");
    const updates = document.createElement("td");
    const registered = document.createElement("td");

    name.textContent = pledge.full_name;
    email.className = "participant-email";
    email.textContent = pledge.email;
    participant.append(name, email);
    guests.textContent = String(pledge.guest_count);
    updates.textContent = pledge.wants_updates
      ? translations[language].yes
      : translations[language].no;
    registered.textContent = new Intl.DateTimeFormat(language === "fr" ? "fr-CA" : "en-CA", {
      dateStyle: "medium",
    }).format(new Date(pledge.created_at));

    row.append(participant, guests, updates, registered);
    body.append(row);
  });

  const purgeDate = new Date(`${campaign.eventDate}T12:00:00`);
  purgeDate.setDate(purgeDate.getDate() + 30);
  document.getElementById("retentionWarning").textContent =
    `${translations[language].purgeNotice} ${new Intl.DateTimeFormat(
      language === "fr" ? "fr-CA" : "en-CA",
      { dateStyle: "long" },
    ).format(purgeDate)}.`;
}

async function loadPublicCampaign() {
  if (!campaignSlug) {
    publicCampaignAvailable = false;
    render();
    return;
  }

  if (!supabase) {
    render();
    return;
  }

  const { data, error } = await supabase.rpc("get_public_campaign", {
    p_slug: campaignSlug,
  });
  const row = Array.isArray(data) ? data[0] : data;

  if (error || !row) {
    console.error(error);
    publicCampaignAvailable = false;
    campaign = {
      ...defaults,
      slug: campaignSlug,
      name: translations[language].unavailable,
      active: false,
    };
    showToast(translations[language].loadError);
    render();
    return;
  }

  publicCampaignAvailable = true;
  campaign = normalizeCampaign(row);
  render();
}

async function loadPublicCampaignDirectory() {
  if (!supabase) {
    publicCampaigns = [normalizePublicCampaign({
      id: "preview",
      slug: defaults.slug,
      name: defaults.name,
      goal: defaults.goal,
      event_date: defaults.eventDate,
      deadline: defaults.deadline,
      food_info: defaults.foodInfo,
      photo_url: defaults.photoUrl,
      address: defaults.address,
      city: defaults.city,
      website_url: defaults.websiteUrl,
      pledge_count: defaults.pledgeCount,
      guest_total: defaults.guestTotal,
    })];
    render();
    return;
  }

  const { data, error } = await supabase.rpc("list_public_campaigns");

  if (!error && Array.isArray(data)) {
    publicCampaigns = data.map(normalizePublicCampaign);
    render();
    return;
  }

  console.warn(error);
  publicCampaigns = [];
  showToast(translations[language].directoryLoadError);
  render();
}

async function loadAdminCampaign() {
  const selectedId = document.getElementById("campaignSelect").value;
  const campaignRow = adminCampaigns.find((item) => item.id === selectedId);
  if (!campaignRow) throw new Error("campaign_not_found");

  const { data: pledges, error: pledgeError } = await supabase
    .from("pledges")
    .select("full_name, email, guest_count, wants_updates, created_at")
    .eq("campaign_id", campaignRow.id)
    .order("created_at", { ascending: false });

  if (pledgeError) throw pledgeError;

  adminPledges = pledges;
  publicCampaignAvailable = true;
  campaign = {
    ...normalizeCampaign(campaignRow),
    pledgeCount: pledges.length,
    guestTotal: pledges.reduce((sum, pledge) => sum + Number(pledge.guest_count), 0),
  };
  render();
}

async function loadAdminCampaigns(preferredId = null) {
  const { data: superAdminData, error: superAdminError } = await supabase.rpc(
    "is_super_admin",
  );
  if (superAdminError) throw superAdminError;
  isSuperAdmin = Boolean(superAdminData);

  let { data: campaignRows, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, slug, name, goal, event_date, deadline, food_info, photo_url, address, city, website_url, active, admin_email")
    .order("name", { ascending: true });

  if (["photo_url", "address", "city", "website_url"].some((field) => campaignError?.message?.includes(field))) {
    const fallback = await supabase
      .from("campaigns")
      .select("id, slug, name, goal, event_date, deadline, food_info, active, admin_email")
      .order("name", { ascending: true });
    campaignRows = fallback.data;
    campaignError = fallback.error;
  }

  if (campaignError) throw campaignError;
  if (!campaignRows.length) throw new Error("no_campaign_access");

  adminCampaigns = campaignRows;
  const select = document.getElementById("campaignSelect");
  const previousId = preferredId || select.value;
  select.replaceChildren();
  campaignRows.forEach((row) => {
    const option = document.createElement("option");
    option.value = row.id;
    option.textContent = `${row.name} (${row.slug})`;
    select.append(option);
  });

  const preferred = campaignRows.find((row) => row.id === previousId)
    || campaignRows.find((row) => row.slug === campaignSlug)
    || campaignRows[0];
  select.value = preferred.id;
  await loadAdminCampaign();
}

function showAdminPanel() {
  document.getElementById("adminLogin").hidden = true;
  document.getElementById("adminPanel").hidden = false;
}

function defaultCampaignDates() {
  const today = new Date();
  const eventDate = new Date(today);
  eventDate.setDate(eventDate.getDate() + 60);
  const deadline = new Date(today);
  deadline.setDate(deadline.getDate() + 45);
  return {
    eventDate: eventDate.toISOString().slice(0, 10),
    deadline: deadline.toISOString().slice(0, 10),
  };
}

document.getElementById("heroCta").addEventListener("click", () => {
  document.getElementById("invitationForm").scrollIntoView({ behavior: "smooth" });
  window.setTimeout(() => document.getElementById("fullName").focus(), 600);
});

document.getElementById("homeSearchCta").addEventListener("click", () => {
  document.getElementById("mosqueSearch").scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => document.getElementById("mosqueSearch").focus(), 500);
});

document.querySelectorAll(".count-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".count-button").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    document.getElementById("guestCount").value = button.dataset.count;
  });
});

document.getElementById("pledgeForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!supabase) {
    showToast(translations[language].setupRequired);
    return;
  }
  if (!isCampaignOpen()) {
    showToast(translations[language].closedMessage);
    render();
    return;
  }

  const formElement = event.currentTarget;
  const submitButton = formElement.querySelector('button[type="submit"]');
  const form = new FormData(formElement);
  const email = String(form.get("email")).trim().toLowerCase();
  const tokenKey = `openMosqueEditToken:${campaignSlug}:${email}`;
  const editToken = localStorage.getItem(tokenKey);

  submitButton.disabled = true;
  const { data, error } = await supabase.rpc("submit_pledge", {
    p_campaign_slug: campaignSlug,
    p_full_name: String(form.get("fullName")).trim(),
    p_email: email,
    p_guest_count: Number(form.get("guestCount")),
    p_wants_updates: form.get("updates") === "on",
    p_edit_token: editToken || null,
  });
  submitButton.disabled = false;

  if (error) {
    console.error(error);
    const message = error.message || "";
    let toastMessage = translations[language].submitError;
    if (message.includes("pledge_already_exists")) {
      toastMessage = translations[language].duplicate;
    } else if (message.includes("too_many_attempts")) {
      toastMessage = translations[language].rateLimited;
    } else if (message.includes("invalid_guest_count")) {
      toastMessage = translations[language].invalidGuestCount;
    }
    showToast(toastMessage);
    return;
  }

  localStorage.setItem(tokenKey, data);
  await loadPublicCampaign();
  formElement.reset();
  document.getElementById("guestCount").value = "2";
  document.querySelectorAll(".count-button").forEach((item) => {
    item.classList.toggle("selected", item.dataset.count === "2");
  });
  document.getElementById("successDialog").showModal();
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", async () => {
    document.getElementById(button.dataset.close).close();
    if (button.dataset.close === "adminDialog") {
      await loadPublicCampaign();
    }
  });
});

document.getElementById("languageToggle").addEventListener("click", () => {
  language = language === "fr" ? "en" : "fr";
  render();
});

document.getElementById("mosqueSearch").addEventListener("input", renderDirectory);
document.getElementById("presetSearch").addEventListener("input", renderPresetLibrary);
document.getElementById("settingHasDeadline").addEventListener("change", (event) => {
  const deadlineInput = document.getElementById("settingDeadline");
  deadlineInput.disabled = !event.currentTarget.checked;
  if (!event.currentTarget.checked) deadlineInput.value = "";
});

document.getElementById("adminOpenButton").addEventListener("click", async () => {
  if (!supabase) {
    showToast(translations[language].setupRequired);
    return;
  }

  document.getElementById("adminLogin").hidden = false;
  document.getElementById("adminPanel").hidden = true;
  document.getElementById("adminError").hidden = true;
  document.getElementById("adminError").textContent = translations[language].invalidCode;
  document.getElementById("adminDialog").showModal();

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    try {
      await loadAdminCampaigns();
      showAdminPanel();
    } catch (error) {
      console.error(error);
      await supabase.auth.signOut();
      document.getElementById("adminError").textContent = translations[language].unauthorized;
      document.getElementById("adminError").hidden = false;
    }
  }
});

document.getElementById("adminLoginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorElement = document.getElementById("adminError");
  errorElement.textContent = translations[language].invalidCode;
  const { error } = await supabase.auth.signInWithPassword({
    email: document.getElementById("adminEmail").value.trim(),
    password: document.getElementById("adminPassword").value,
  });

  errorElement.hidden = !error;
  if (error) return;

  try {
    await loadAdminCampaigns();
    showAdminPanel();
  } catch (loadError) {
    console.error(loadError);
    await supabase.auth.signOut();
    errorElement.textContent = translations[language].unauthorized;
    errorElement.hidden = false;
  }
});

document.getElementById("adminSignOut").addEventListener("click", async () => {
  await supabase.auth.signOut();
  adminPledges = [];
  document.getElementById("adminDialog").close();
});

document.getElementById("settingsForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const hasDeadline = document.getElementById("settingHasDeadline").checked;
  const deadline = hasDeadline ? document.getElementById("settingDeadline").value : "";
  const eventDate = document.getElementById("settingEventDate").value;
  if (hasDeadline && !deadline) {
    showToast(translations[language].invalidDates);
    return;
  }
  if (deadline && deadline > eventDate) {
    showToast(translations[language].invalidDates);
    return;
  }
  const slug = document.getElementById("settingSlug").value.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    showToast(translations[language].slugInvalid);
    return;
  }
  const updates = {
    slug,
    name: document.getElementById("settingName").value.trim(),
    city: document.getElementById("settingCity").value.trim() || null,
    address: document.getElementById("settingAddress").value.trim() || null,
    website_url: document.getElementById("settingWebsite").value.trim() || null,
    goal: Number(document.getElementById("settingGoal").value),
    event_date: eventDate,
    deadline: deadline || null,
    food_info: document.getElementById("settingFood").value.trim(),
    photo_url: document.getElementById("settingPhotoUrl").value.trim() || null,
    active: document.getElementById("settingActive").checked,
    updated_at: new Date().toISOString(),
  };

  let { error } = await supabase.from("campaigns").update(updates).eq("id", campaign.id);
  if (["photo_url", "address", "city", "website_url"].some((field) => error?.message?.includes(field))) {
    const fallbackUpdates = { ...updates };
    delete fallbackUpdates.photo_url;
    delete fallbackUpdates.address;
    delete fallbackUpdates.city;
    delete fallbackUpdates.website_url;
    const fallback = await supabase.from("campaigns").update(fallbackUpdates).eq("id", campaign.id);
    error = fallback.error;
  }
  if (error) {
    console.error(error);
    showToast(translations[language].submitError);
    return;
  }

  await loadAdminCampaigns(campaign.id);
  showToast(translations[language].saved);
});

document.getElementById("campaignSelect").addEventListener("change", async () => {
  try {
    await loadAdminCampaign();
  } catch (error) {
    console.error(error);
    showToast(translations[language].loadError);
  }
});

document.getElementById("settingPhotoFile").addEventListener("change", async (event) => {
  const file = event.currentTarget.files?.[0];
  if (!file || !campaign.id) return;

  const status = document.getElementById("photoStatus");
  status.textContent = translations[language].photoUploading;

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = ["jpg", "jpeg", "png", "webp"].includes(extension) ? extension : "jpg";
  const path = `${campaign.id}/${Date.now()}.${safeExtension}`;
  const { error } = await supabase.storage
    .from("campaign-photos")
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (error) {
    console.error(error);
    status.textContent = translations[language].photoUploadError;
    event.currentTarget.value = "";
    return;
  }

  const { data } = supabase.storage.from("campaign-photos").getPublicUrl(path);
  document.getElementById("settingPhotoUrl").value = data.publicUrl;
  document.getElementById("settingPhotoPreview").src = data.publicUrl;
  document.getElementById("removePhotoButton").disabled = false;
  status.textContent = translations[language].photoUploaded;
  event.currentTarget.value = "";
});

document.getElementById("removePhotoButton").addEventListener("click", () => {
  document.getElementById("settingPhotoUrl").value = "";
  document.getElementById("settingPhotoPreview").src = fallbackCampaignImage;
  document.getElementById("removePhotoButton").disabled = true;
  document.getElementById("photoStatus").textContent = translations[language].photoRemoved;
});

document.getElementById("assignOrganizerButton").addEventListener("click", async () => {
  const email = document.getElementById("organizerEmail").value.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    showToast(translations[language].organizerEmailInvalid);
    return;
  }

  const { data: result, error } = await supabase.rpc("assign_campaign_admin", {
    p_campaign_id: campaign.id,
    p_email: email,
  });
  if (error) {
    console.error(error);
    showToast(translations[language].submitError);
    return;
  }

  if (result === "invitation_required") {
    const redirectUrl = new URL(window.location.href);
    redirectUrl.search = "";
    redirectUrl.searchParams.set("campaign", campaign.slug);
    const { error: invitationError } = await invitationClient.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl.toString(),
      },
    });
    if (invitationError) {
      console.error(invitationError);
      showToast(translations[language].organizerInviteError);
      return;
    }
  }

  await loadAdminCampaigns(campaign.id);
  showToast(
    result === "invitation_required"
      ? translations[language].organizerInvited
      : translations[language].organizerAssigned,
  );
});

document.getElementById("removeOrganizerButton").addEventListener("click", async () => {
  if (!campaign.adminEmail || !window.confirm(translations[language].organizerRemoveConfirm)) {
    return;
  }

  const { error } = await supabase.rpc("remove_campaign_admin", {
    p_campaign_id: campaign.id,
  });
  if (error) {
    console.error(error);
    showToast(translations[language].submitError);
    return;
  }

  await loadAdminCampaigns(campaign.id);
  showToast(translations[language].organizerRemoved);
});

document.getElementById("presetResults").addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-preset-slug]");
  if (!button || button.disabled) return;
  const preset = mosquePresets.find((item) => item.slug === button.dataset.presetSlug);
  if (!preset) return;

  const dates = defaultCampaignDates();
  const row = {
    slug: uniqueSlug(preset.slug),
    name: preset.name,
    goal: 100,
    event_date: dates.eventDate,
    deadline: dates.deadline,
    food_info: "",
    photo_url: null,
    city: preset.city || "",
    address: preset.address || "",
    website_url: preset.websiteUrl || "",
    active: false,
  };

  let { data, error } = await supabase
    .from("campaigns")
    .insert(row)
    .select("id")
    .single();
  if (["photo_url", "address", "city", "website_url"].some((field) => error?.message?.includes(field))) {
    const fallbackRow = { ...row };
    delete fallbackRow.photo_url;
    delete fallbackRow.city;
    delete fallbackRow.address;
    delete fallbackRow.website_url;
    const fallback = await supabase
      .from("campaigns")
      .insert(fallbackRow)
      .select("id")
      .single();
    data = fallback.data;
    error = fallback.error;
  }
  if (error) {
    console.error(error);
    showToast(translations[language].submitError);
    return;
  }

  await loadAdminCampaigns(data.id);
  showToast(translations[language].presetCreated);
});

document.getElementById("duplicateRoundButton").addEventListener("click", async () => {
  if (!isSuperAdmin || !campaign.id) return;

  const dates = defaultCampaignDates();
  const row = {
    slug: nextRoundSlug(campaign.slug),
    name: campaign.name,
    goal: campaign.goal,
    event_date: dates.eventDate,
    deadline: dates.deadline,
    food_info: campaign.foodInfo || "",
    photo_url: campaign.photoUrl || null,
    city: campaign.city || "",
    address: campaign.address || "",
    website_url: campaign.websiteUrl || "",
    active: false,
  };

  try {
    const id = await insertCampaign(row);
    await loadAdminCampaigns(id);
    showToast(translations[language].roundCreated);
    document.getElementById("settingEventDate").focus();
  } catch (error) {
    console.error(error);
    showToast(translations[language].submitError);
  }
});

document.getElementById("newCampaignButton").addEventListener("click", async () => {
  const dates = defaultCampaignDates();
  const suffix = Date.now().toString().slice(-6);
  const row = {
    slug: `nouvelle-mosquee-${suffix}`,
    name: "Nouvelle mosquée",
    goal: 100,
    event_date: dates.eventDate,
    deadline: dates.deadline,
    food_info: "",
    photo_url: null,
    city: "",
    address: "",
    website_url: "",
    active: false,
  };

  let { data, error } = await supabase
    .from("campaigns")
    .insert(row)
    .select("id")
    .single();
  if (["photo_url", "address", "city", "website_url"].some((field) => error?.message?.includes(field))) {
    const fallbackRow = { ...row };
    delete fallbackRow.photo_url;
    delete fallbackRow.city;
    delete fallbackRow.address;
    delete fallbackRow.website_url;
    const fallback = await supabase
      .from("campaigns")
      .insert(fallbackRow)
      .select("id")
      .single();
    data = fallback.data;
    error = fallback.error;
  }
  if (error) {
    console.error(error);
    showToast(translations[language].submitError);
    return;
  }

  await loadAdminCampaigns(data.id);
  showToast(translations[language].campaignCreated);
  document.getElementById("settingName").focus();
});

document.getElementById("deleteCampaignButton").addEventListener("click", async () => {
  if (adminCampaigns.length <= 1) {
    showToast(translations[language].cannotDeleteLast);
    return;
  }
  if (!window.confirm(translations[language].deleteConfirm)) return;

  const deletedId = campaign.id;
  const { error } = await supabase.from("campaigns").delete().eq("id", deletedId);
  if (error) {
    console.error(error);
    showToast(translations[language].submitError);
    return;
  }

  await loadAdminCampaigns();
  showToast(translations[language].campaignDeleted);
});

document.getElementById("copyLinkButton").addEventListener("click", async () => {
  const shareUrl = currentCampaignUrl();
  try {
    await navigator.clipboard.writeText(shareUrl);
    showToast(translations[language].copied);
  } catch {
    showToast(shareUrl);
  }
});

document.getElementById("whatsappShareButton").addEventListener("click", () => {
  const shareText = `${campaign.name}\n${currentCampaignUrl()}`;
  window.open(
    `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    "_blank",
    "noopener,noreferrer",
  );
});

document.getElementById("toggleQrButton").addEventListener("click", () => {
  const qrPanel = document.getElementById("qrPanel");
  qrPanel.hidden = !qrPanel.hidden;
  document.getElementById("toggleQrButton").textContent = qrPanel.hidden
    ? translations[language].showQr
    : translations[language].hideQr;
  if (!qrPanel.hidden) renderQrCode();
});

render();
if (isDirectoryMode) {
  await loadPublicCampaignDirectory();
} else {
  await loadPublicCampaign();
}
