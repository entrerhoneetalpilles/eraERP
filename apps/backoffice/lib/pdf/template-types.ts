export type PdfTemplateType = "FACTURE" | "DEVIS" | "MANDAT" | "CONTRAT" | "QUITTANCE"

export interface TemplateConfig {
  branding: {
    primaryColor: string
    accentColor: string
    fontFamily: "Helvetica" | "Times-Roman" | "Courier"
    companyName: string
    companyTagline: string
    companyAddress: string
    companySiret: string
    companyPhone: string
    companyEmail: string
    companyWebsite: string
  }
  header: {
    showCompanyInfo: boolean
    showDocumentRef: boolean
    showDate: boolean
    showRecipientBlock: boolean
    titleOverride: string
  }
  body: {
    introText: string
    showLineItems: boolean
    showTotals: boolean
    showNotes: boolean
    outroText: string
    showSignatureBlock: boolean
    signatureLabel: string
  }
  table: {
    style: "minimal" | "striped" | "bordered"
    headerBg: string
    headerTextColor: string
    borderColor: string
    stripeBg: string
  }
  footer: {
    showPageNumbers: boolean
    legalText: string
    showBankInfo: boolean
    bankInfo: string
  }
}

export const DEFAULT_CONFIG: TemplateConfig = {
  branding: {
    primaryColor: "#1a2744",
    accentColor: "#c9a84c",
    fontFamily: "Helvetica",
    companyName: "Entre Rhône et Alpilles",
    companyTagline: "Gestion locative haut de gamme",
    companyAddress: "Saint-Rémy-de-Provence (13210) — France",
    companySiret: "",
    companyPhone: "",
    companyEmail: "",
    companyWebsite: "",
  },
  header: {
    showCompanyInfo: true,
    showDocumentRef: true,
    showDate: true,
    showRecipientBlock: true,
    titleOverride: "",
  },
  body: {
    introText: "",
    showLineItems: true,
    showTotals: true,
    showNotes: true,
    outroText: "",
    showSignatureBlock: false,
    signatureLabel: "Signature autorisée",
  },
  table: {
    style: "striped",
    headerBg: "#1a2744",
    headerTextColor: "#ffffff",
    borderColor: "#e5e7eb",
    stripeBg: "#f3f4f6",
  },
  footer: {
    showPageNumbers: true,
    legalText: "TVA non applicable, art. 293 B CGI",
    showBankInfo: false,
    bankInfo: "",
  },
}

export const TYPE_LABELS: Record<PdfTemplateType, string> = {
  FACTURE: "Facture",
  DEVIS: "Devis",
  MANDAT: "Mandat de gestion",
  CONTRAT: "Contrat",
  QUITTANCE: "Quittance",
}

export const TYPE_DESCRIPTIONS: Record<PdfTemplateType, string> = {
  FACTURE: "Factures d'honoraires envoyées aux propriétaires",
  DEVIS: "Devis pour travaux et interventions",
  MANDAT: "Mandats de gestion locative",
  CONTRAT: "Contrats de location saisonnière",
  QUITTANCE: "Quittances de loyer",
}

export const TYPE_COLORS: Record<PdfTemplateType, string> = {
  FACTURE: "bg-blue-100 text-blue-700",
  DEVIS: "bg-amber-100 text-amber-700",
  MANDAT: "bg-purple-100 text-purple-700",
  CONTRAT: "bg-emerald-100 text-emerald-700",
  QUITTANCE: "bg-rose-100 text-rose-700",
}

export const VARIABLES_BY_TYPE: Record<PdfTemplateType, { label: string; value: string }[]> = {
  FACTURE: [
    { label: "N° facture", value: "{{numero_facture}}" },
    { label: "Propriétaire", value: "{{owner.nom}}" },
    { label: "Email propriétaire", value: "{{owner.email}}" },
    { label: "Période début", value: "{{periode_debut}}" },
    { label: "Période fin", value: "{{periode_fin}}" },
    { label: "Montant HT", value: "{{montant_ht}}" },
    { label: "Montant TTC", value: "{{montant_ttc}}" },
    { label: "Date d'échéance", value: "{{date_echeance}}" },
  ],
  DEVIS: [
    { label: "Titre", value: "{{titre}}" },
    { label: "Bien", value: "{{property.nom}}" },
    { label: "Propriétaire", value: "{{owner.nom}}" },
    { label: "Montant HT", value: "{{montant_devis}}" },
    { label: "Validité", value: "{{date_validite}}" },
    { label: "Prestataire", value: "{{contractor.nom}}" },
  ],
  MANDAT: [
    { label: "N° mandat", value: "{{numero_mandat}}" },
    { label: "Propriétaire", value: "{{owner.nom}}" },
    { label: "Bien", value: "{{property.nom}}" },
    { label: "Adresse bien", value: "{{property.adresse}}" },
    { label: "Date début", value: "{{date_debut}}" },
    { label: "Taux honoraires", value: "{{taux_honoraires}}" },
  ],
  CONTRAT: [
    { label: "Locataire", value: "{{tenant.nom}}" },
    { label: "Bien", value: "{{property.nom}}" },
    { label: "Date entrée", value: "{{date_entree}}" },
    { label: "Date sortie", value: "{{date_sortie}}" },
    { label: "Loyer", value: "{{loyer}}" },
  ],
  QUITTANCE: [
    { label: "N° quittance", value: "{{numero_quittance}}" },
    { label: "Locataire", value: "{{tenant.nom}}" },
    { label: "Bien", value: "{{property.nom}}" },
    { label: "Mois", value: "{{mois}}" },
    { label: "Montant", value: "{{montant}}" },
  ],
}
