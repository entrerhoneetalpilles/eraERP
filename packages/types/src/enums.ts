export enum UserRole {
  ADMIN = "ADMIN",
  DIRECTION = "DIRECTION",
  GESTIONNAIRE = "GESTIONNAIRE",
  COMPTABLE = "COMPTABLE",
  SERVICES = "SERVICES",
  TRAVAUX = "TRAVAUX",
}

export enum OwnerType {
  INDIVIDUAL = "INDIVIDUAL",
  SCI = "SCI",
  INDIVISION = "INDIVISION",
}

export enum PropertyType {
  APPARTEMENT = "APPARTEMENT",
  VILLA = "VILLA",
  LOFT = "LOFT",
  CHALET = "CHALET",
  AUTRE = "AUTRE",
}

export enum PropertyStatus {
  ACTIF = "ACTIF",
  INACTIF = "INACTIF",
  TRAVAUX = "TRAVAUX",
}

export enum Platform {
  AIRBNB = "AIRBNB",
  DIRECT = "DIRECT",
  MANUAL = "MANUAL",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CHECKEDIN = "CHECKEDIN",
  CHECKEDOUT = "CHECKEDOUT",
  CANCELLED = "CANCELLED",
}

export enum MandateStatus {
  ACTIF = "ACTIF",
  SUSPENDU = "SUSPENDU",
  RESILIE = "RESILIE",
}

export enum TransactionType {
  REVENU_SEJOUR = "REVENU_SEJOUR",
  HONORAIRES = "HONORAIRES",
  TRAVAUX = "TRAVAUX",
  REVERSEMENT = "REVERSEMENT",
  CHARGE = "CHARGE",
  AUTRE = "AUTRE",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  VALIDATED = "VALIDATED",
  RECONCILED = "RECONCILED",
}

export enum DocumentType {
  MANDAT = "MANDAT",
  AVENANT = "AVENANT",
  DEVIS = "DEVIS",
  FACTURE = "FACTURE",
  CRG = "CRG",
  ETAT_LIEUX = "ETAT_LIEUX",
  ATTESTATION_FISCALE = "ATTESTATION_FISCALE",
  PHOTO = "PHOTO",
  DIAGNOSTIC = "DIAGNOSTIC",
  AUTRE = "AUTRE",
}

export enum SignatureStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  SIGNED = "SIGNED",
  REFUSED = "REFUSED",
}

export enum Urgency {
  NORMALE = "NORMALE",
  URGENTE = "URGENTE",
  CRITIQUE = "CRITIQUE",
}

export enum InvoiceStatus {
  BROUILLON = "BROUILLON",
  EMISE = "EMISE",
  PAYEE = "PAYEE",
  AVOIR = "AVOIR",
}

export enum ServiceUnit {
  ACTE = "ACTE",
  HEURE = "HEURE",
  NUIT = "NUIT",
  MOIS = "MOIS",
}

export enum TaskStatus {
  PLANIFIEE = "PLANIFIEE",
  EN_COURS = "EN_COURS",
  TERMINEE = "TERMINEE",
  PROBLEME = "PROBLEME",
}

export enum Imputation {
  PROPRIETAIRE = "PROPRIETAIRE",
  SOCIETE = "SOCIETE",
}

export enum BlockedReason {
  PROPRIETAIRE = "PROPRIETAIRE",
  TRAVAUX = "TRAVAUX",
  MAINTENANCE = "MAINTENANCE",
}

export enum AccessType {
  BOITE_CLES = "BOITE_CLES",
  CODE = "CODE",
  AGENT = "AGENT",
  SERRURE_CONNECTEE = "SERRURE_CONNECTEE",
}

export enum LegalDocType {
  DPE = "DPE",
  ELECTRICITE = "ELECTRICITE",
  GAZ = "GAZ",
  PLOMB = "PLOMB",
  AMIANTE = "AMIANTE",
  PNO = "PNO",
  AUTRE = "AUTRE",
}

export enum DocStatus {
  VALIDE = "VALIDE",
  EXPIRE = "EXPIRE",
  MANQUANT = "MANQUANT",
}

export enum SyncStatus {
  OK = "OK",
  ERROR = "ERROR",
  PENDING = "PENDING",
}

export enum PriceRuleType {
  DEFAUT = "DEFAUT",
  SAISON = "SAISON",
  WEEKEND = "WEEKEND",
  EVENEMENT = "EVENEMENT",
}

export enum InventoryType {
  ENTREE = "ENTREE",
  SORTIE = "SORTIE",
}

export enum AuthorType {
  USER = "USER",
  OWNER = "OWNER",
}

export enum BankFormat {
  CFONB = "CFONB",
  OFX = "OFX",
  CSV = "CSV",
}

export enum LineStatus {
  NON_LETTREE = "NON_LETTREE",
  LETTREE = "LETTREE",
  IGNOREE = "IGNOREE",
}

export enum WorkOrderStatus {
  OUVERT = "OUVERT",
  EN_COURS = "EN_COURS",
  EN_ATTENTE_DEVIS = "EN_ATTENTE_DEVIS",
  EN_ATTENTE_VALIDATION = "EN_ATTENTE_VALIDATION",
  VALIDE = "VALIDE",
  TERMINE = "TERMINE",
  ANNULE = "ANNULE",
}

export enum CompanyTxType {
  REVENU_HONORAIRES = "REVENU_HONORAIRES",
  CHARGE = "CHARGE",
  TVA_COLLECTEE = "TVA_COLLECTEE",
  TVA_DEDUCTIBLE = "TVA_DEDUCTIBLE",
  AUTRE = "AUTRE",
}

export enum Journal {
  VENTES = "VENTES",
  ACHATS = "ACHATS",
  BANQUE = "BANQUE",
  OD = "OD",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}
