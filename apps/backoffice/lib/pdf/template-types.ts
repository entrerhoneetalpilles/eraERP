export type PdfTemplateType = "FACTURE" | "DEVIS" | "MANDAT" | "CONTRAT" | "QUITTANCE"

export interface TemplateConfig {
  branding: {
    fontFamily: string
    primaryColor: string
    accentColor: string
    companyName: string
    companyTagline?: string
    companyAddress?: string
    companyEmail?: string
    companySiret?: string
  }
  header: {
    showCompanyInfo: boolean
    showLogo: boolean
    titleOverride?: string
    showDocumentRef: boolean
    showDate: boolean
    showRecipientBlock: boolean
  }
  body: {
    introText?: string
    showLineItems: boolean
    showTotals: boolean
    outroText?: string
    showNotes: boolean
    showSignatureBlock: boolean
    signatureLabel?: string
  }
  table: {
    style: "striped" | "bordered" | "minimal"
    headerBg: string
    headerTextColor: string
    borderColor: string
    stripeBg: string
  }
  footer: {
    legalText?: string
    showBankInfo: boolean
    bankInfo?: string
    showPageNumbers: boolean
  }
}

export const DEFAULT_CONFIG: TemplateConfig = {
  branding: {
    fontFamily: "Helvetica",
    primaryColor: "#1e3a5f",
    accentColor: "#c9a96e",
    companyName: "Entre Rhône et Alpilles",
    companyTagline: "Conciergerie haut de gamme",
    companyAddress: "Saint-Rémy-de-Provence",
    companyEmail: "contact@entre-rhone-alpilles.fr",
    companySiret: "",
  },
  header: {
    showCompanyInfo: true,
    showLogo: false,
    showDocumentRef: true,
    showDate: true,
    showRecipientBlock: true,
  },
  body: {
    showLineItems: true,
    showTotals: true,
    showNotes: true,
    showSignatureBlock: false,
  },
  table: {
    style: "striped",
    headerBg: "#1e3a5f",
    headerTextColor: "#ffffff",
    borderColor: "#e5e7eb",
    stripeBg: "#f9fafb",
  },
  footer: {
    showBankInfo: false,
    showPageNumbers: true,
  },
}
