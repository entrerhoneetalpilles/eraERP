## SOMMAIRE

1. [Présentation de l'entreprise](#1-présentation-de-lentreprise)
2. [Contexte et objectifs du projet](#2-contexte-et-objectifs-du-projet)
3. [Acteurs du système](#3-acteurs-du-système)
4. [Périmètre fonctionnel](#4-périmètre-fonctionnel)
5. [Espace Propriétaire — Portail Client](#5-espace-propriétaire--portail-client)
6. [Services Additionnels Locataires](#6-services-additionnels-locataires)
7. [Exigences techniques](#7-exigences-techniques)
8. [Sécurité et conformité](#8-sécurité-et-conformité)
9. [Intégrations externes](#9-intégrations-externes)
10. [Gestion des droits et profils](#10-gestion-des-droits-et-profils)
11. [Interface utilisateur et design](#11-interface-utilisateur-et-design)
12. [Migration des données](#12-migration-des-données)
13. [Plan de déploiement](#13-plan-de-déploiement)
14. [Formation et conduite du changement](#14-formation-et-conduite-du-changement)
15. [Maintenance et support](#15-maintenance-et-support)
16. [Conditions commerciales](#16-conditions-commerciales)
17. [Critères d'évaluation](#17-critères-dévaluation-des-prestataires)
18. [Livrables attendus](#18-livrables-attendus)
19. [Glossaire](#19-glossaire)

---

## 1. Présentation de l'entreprise

| Champ                   | Valeur                                      |
|-------------------------|---------------------------------------------|
| **Raison sociale**      | `[Nom de la société]`                       |
| **Forme juridique**     | `[SAS / SARL / SA…]`                        |
| **Secteur**             | Gestion locative immobilière haut de gamme  |
| **Carte professionnelle** | `[N° carte G — Gestion immobilière]`      |
| **Effectifs**           | `[X collaborateurs]`                        |
| **Portefeuille géré**   | `[X biens / X propriétaires]`               |
| **Zone géographique**   | `[Ex. : Paris, Côte d'Azur, région PACA…]`  |
| **Interlocuteur projet**| `[Nom, fonction, email, téléphone]`         |
| **Site web**            | `[URL]`                                     |

### 1.1 Positionnement métier

La société exerce une activité de **gestion locative premium** portant sur des biens immobiliers haut de gamme (appartements de standing, villas, lofts, résidences de prestige). Elle agit en qualité de **mandataire** pour le compte de propriétaires bailleurs, auxquels elle rend compte de sa gestion via des documents contractuels et comptables précis.

Le modèle économique repose sur :
- Des **honoraires de gestion** facturés aux propriétaires (pourcentage des loyers encaissés et/ou forfait mensuel)
- Des **prestations de services additionnels** proposées aux locataires (conciergerie, ménage, maintenance, etc.)

### 1.2 Système d'information actuel

| Outil actuel         | Usage                        | Limite identifiée                          |
|----------------------|------------------------------|--------------------------------------------|
| `[Ex. Excel]`        | Suivi des loyers             | Aucune automatisation, risques d'erreurs   |
| `[Ex. Word]`         | Rédaction contrats/mandats   | Pas de versioning, pertes de documents     |
| `[Ex. Logiciel X]`   | Comptabilité générale        | Pas de comptabilité mandant intégrée       |
| `[Ex. Email]`        | Relation propriétaires       | Aucune traçabilité centralisée             |

---

## 2. Contexte et objectifs du projet

### 2.1 Problématiques actuelles

- Absence de vue consolidée par propriétaire (biens, baux, loyers, charges, factures)
- Aucun espace client pour les propriétaires : ils reçoivent leurs documents par email sans accès autonome
- Comptabilité mandant non isolée de la comptabilité propre de la société
- Gestion des travaux et prestataires non intégrée (bon de commande, suivi, imputation)
- Pas de suivi structuré des services additionnels vendus aux locataires

### 2.2 Objectifs stratégiques du projet

| Objectif                                                                 | Priorité |
|--------------------------------------------------------------------------|----------|
| Centraliser la gestion de l'ensemble du portefeuille dans un seul outil  | P1       |
| Offrir un portail propriétaire moderne, sécurisé et autonome             | P1       |
| Automatiser le quittancement et les relances locataires                  | P1       |
| Séparer strictement comptabilité mandant et comptabilité propre          | P1       |
| Automatiser la facturation des honoraires de gestion                     | P1       |
| Piloter les travaux et prestataires depuis l'ERP                         | P2       |
| Gérer et facturer les services additionnels aux locataires               | P2       |
| Fournir des reportings personnalisés aux propriétaires                   | P2       |

### 2.3 KPIs cibles à 12 mois

| Indicateur                              | Avant      | Cible       |
|-----------------------------------------|------------|-------------|
| Temps de génération du compte rendu de gestion | `[X h]` | `< 15 min` |
| Taux de recouvrement des loyers à échéance | `[X%]`  | `> 98%`     |
| Délai de transmission des documents aux propriétaires | `[X j]` | `Temps réel (portail)` |
| Temps de traitement d'une entrée en location | `[X h]` | `< 2 h`  |

---

## 3. Acteurs du système

L'ERP implique **trois types d'acteurs** aux rôles bien distincts.

### 3.1 Les Propriétaires (clients principaux)

Les propriétaires sont les **clients contractuels** de la société. Ils confient la gestion de un ou plusieurs biens via un **mandat de gestion**. Ils :
- Perçoivent les loyers reversés (nets de frais)
- Sont facturés pour les honoraires de gestion
- Doivent pouvoir accéder à leurs documents via un **espace personnel en ligne**

### 3.2 Les Locataires (clients secondaires)

Les locataires occupent les biens gérés. Ils ne sont **pas clients de la gestion** mais peuvent être **clients de services additionnels** (conciergerie, prestations premium). Ils :
- Paient leur loyer et leurs charges
- Reçoivent leurs quittances de loyer
- Peuvent souscrire à des services additionnels facturés séparément

### 3.3 Les Collaborateurs internes

| Profil              | Rôle principal                                              |
|---------------------|-------------------------------------------------------------|
| Gestionnaire locatif | Suivi des mandats, baux, loyers, relation propriétaires    |
| Comptable           | Comptabilité mandant, rapprochement, reversements           |
| Chargé de services  | Gestion des services additionnels locataires                |
| Responsable travaux | Suivi des prestataires, ordres de service, réceptions       |
| Direction           | Pilotage global, reporting, validation                      |
| Administrateur SI   | Configuration, droits, maintenance applicative              |

---

## 4. Périmètre fonctionnel

> **Légende des priorités :**  
> `P1` = Indispensable au lancement  
> `P2` = Important — Phase 2 (6 mois)  
> `P3` = Optionnel / Phase 3

---

### 4.1 Module — CRM Propriétaires

> Référentiel central des propriétaires, clients principaux de la société.

| Fonctionnalité                                      | Priorité | Détail                                                              |
|-----------------------------------------------------|----------|---------------------------------------------------------------------|
| Fiche propriétaire complète                         | P1       | Identité, coordonnées, pièces d'identité, RIB, fiscalité (NIF/SCI) |
| Gestion multi-propriétaires (personne physique/morale) | P1    | SCI, indivision, personne physique                                  |
| Historique complet des interactions                 | P1       | Emails, appels, courriers — timeline par propriétaire               |
| Suivi de la relation commerciale                    | P2       | Score satisfaction, alertes anniversaire mandat                     |
| Documents propriétaires                             | P1       | Stockage GED : mandat, pièces d'identité, RIB, KYC                 |
| Tableau de bord propriétaire interne                | P1       | Vue 360° : biens, baux actifs, loyers, solde à reverser            |
| Segmentation portefeuille                           | P2       | Tags : VIP, multi-biens, investisseur, SCI…                         |
| Export fiche propriétaire (PDF)                     | P2       | Rapport de synthèse propriétaire générable à la demande             |

---

### 4.2 Module — Référentiel des Biens Immobiliers

> Gestion du patrimoine confié en gestion, avec valorisation haut de gamme.

| Fonctionnalité                                      | Priorité | Détail                                                              |
|-----------------------------------------------------|----------|---------------------------------------------------------------------|
| Fiche bien complète                                 | P1       | Adresse, type (appt, villa, loft…), superficie, DPE, ERP, diagnostics |
| Caractéristiques haut de gamme                      | P1       | Équipements premium, mobilier inventorié, prestations (piscine, domotique…) |
| Galerie photos & documents                          | P1       | Photos HD, plans, diagnostics immobiliers, DDT                      |
| Valorisation locative                               | P1       | Loyer de marché, loyer pratiqué, écart, révision IRL                |
| Lien propriétaire — bien — mandat                   | P1       | Un bien = un mandat = un propriétaire (ou indivision)               |
| Historique des locataires par bien                  | P1       | Timeline des baux successifs                                        |
| Suivi des diagnostics et obligations légales        | P1       | Alertes d'expiration DPE, électricité, gaz, plomb, amiante          |
| Gestion des clés et accès                           | P2       | Registre des jeux de clés, badges, codes                            |
| Carte interactive du portefeuille                   | P3       | Vue géographique des biens gérés                                    |

---

### 4.3 Module — Mandats de Gestion

> Pièce contractuelle centrale liant la société au propriétaire.

| Fonctionnalité                                      | Priorité | Détail                                                              |
|-----------------------------------------------------|----------|---------------------------------------------------------------------|
| Création et gestion du mandat de gestion            | P1       | N° mandat auto, date début, durée, reconduction tacite              |
| Paramétrage des honoraires par mandat               | P1       | % sur loyers TTC, forfait mensuel, honoraires location, états des lieux |
| Clause de services inclus / exclus                  | P1       | Détail des prestations couvertes par le mandat                      |
| Génération PDF du mandat (modèle paramétrable)      | P1       | Signature électronique intégrée                                     |
| Suivi du statut du mandat                           | P1       | Actif / Suspendu / Résilié                                          |
| Alertes de reconduction et de résiliation           | P1       | Notification J-90, J-30 avant échéance                              |
| Avenant au mandat                                   | P2       | Modification des conditions, historique des avenants                |
| Archivage légal des mandats                         | P1       | Conservation 10 ans, horodatage, immuabilité                        |

---

### 4.4 Module — Gestion des Locataires et Baux

> Suivi opérationnel des occupants des biens gérés.

| Fonctionnalité                                      | Priorité | Détail                                                              |
|-----------------------------------------------------|----------|---------------------------------------------------------------------|
| Fiche locataire                                     | P1       | Identité, contacts, pièces dossier de location (revenus, garant…)   |
| Scoring dossier locataire                           | P2       | Calcul automatique de la solidité du dossier (ratio loyer/revenus)  |
| Création et gestion du bail                         | P1       | Type (vide, meublé, mobilité), durée, loyer, charges, dépôt de garantie |
| Génération PDF du bail (modèles paramétrables)      | P1       | Loi ALUR / meublé — Signature électronique                          |
| État des lieux d'entrée et de sortie                | P1       | Formulaire numérique, photos, comparaison entrée/sortie             |
| Gestion du dépôt de garantie                        | P1       | Encaissement, restitution, retenues justifiées                      |
| Révision annuelle du loyer (IRL)                    | P1       | Calcul automatique + notification propriétaire + avenant bail       |
| Gestion des renouvellements et congés               | P1       | Alertes légales, courriers automatiques (LRAR)                      |
| Suivi des assurances locataires (MRH)               | P2       | Alerte si attestation manquante ou expirée                          |

---

### 4.5 Module — Quittancement et Encaissement des Loyers

> Automatisation des flux financiers locataires vers la société.

| Fonctionnalité                                      | Priorité | Détail                                                              |
|-----------------------------------------------------|----------|---------------------------------------------------------------------|
| Appels de loyer automatiques                        | P1       | Génération mensuelle, envoi email/portail locataire                 |
| Quittances de loyer                                 | P1       | Génération auto après paiement, envoi PDF                           |
| Encaissement des loyers (multi-modes)               | P1       | Virement, prélèvement SEPA, chèque, espèces                         |
| Prélèvement SEPA automatisé                         | P1       | Mandat SEPA locataire, génération fichier SEPA (XML ISO 20022)      |
| Lettrage automatique des règlements                 | P1       | Rapprochement appel de loyer / paiement reçu                        |
| Gestion des impayés                                 | P1       | Détection automatique, workflow de relance (J+5, J+15, J+30, mise en demeure) |
| Gestion des charges récupérables                    | P1       | Provisions, régularisation annuelle, justificatifs                  |
| Assurance loyers impayés (GLI/PNO)                  | P2       | Suivi des contrats GLI, déclaration de sinistres                    |
| Tableau de bord recouvrement                        | P1       | Taux de recouvrement, impayés en cours, ancienneté                  |

---

### 4.6 Module — Comptabilité Mandant

> Module critique : comptabilité séparée pour chaque propriétaire, conformément à la loi Hoguet.

| Fonctionnalité                                      | Priorité | Détail                                                              |
|-----------------------------------------------------|----------|---------------------------------------------------------------------|
| Compte mandant individuel par propriétaire          | P1       | Isolation totale des flux par mandant (loi Hoguet)                  |
| Compte séquestre / compte client séparé             | P1       | Fonds mandants séparés des fonds propres de la société              |
| Compte rendu de gestion (CRG) mensuel               | P1       | Récapitulatif : loyers encaissés, charges, honoraires, reversement net |
| Reversement automatique aux propriétaires           | P1       | Génération virement + avis de virement PDF                          |
| Gestion des charges et dépenses imputées au mandant | P1       | Travaux, frais divers — validation avant imputation                 |
| Historique comptable complet par propriétaire       | P1       | Consultation sur N années                                           |
| Export comptable (FEC, CSV, connecteur expert-comptable) | P1  | Compatible CEGID, EBP, Sage, QuadraCompta                           |
| Déclarations fiscales propriétaires                 | P2       | Aide à la déclaration revenus fonciers (récapitulatif annuel)       |
| Attestation fiscale annuelle par propriétaire       | P1       | Document PDF récapitulatif des loyers versés sur l'année            |

---

### 4.7 Module — Facturation des Honoraires

> Facturation de la société vers ses clients propriétaires.

| Fonctionnalité                                      | Priorité | Détail                                                              |
|-----------------------------------------------------|----------|---------------------------------------------------------------------|
| Calcul automatique des honoraires de gestion        | P1       | Sur la base du loyer encaissé × taux défini dans le mandat          |
| Facturation des honoraires de location              | P1       | Frais de mise en location, états des lieux — déclenchement auto     |
| Facturation des prestations ponctuelles             | P1       | Devis + facturation de travaux/services non inclus dans le mandat   |
| Génération automatique des factures mensuelles      | P1       | PDF brandé, numérotation automatique, archivage                     |
| Gestion des avoirs et rectifications                | P1       | Avoir partiel ou total, rattachement à la facture d'origine         |
| Suivi des règlements propriétaires                  | P1       | Factures réglées / en attente / en retard                           |
| Tableau de bord CA honoraires                       | P1       | CA par propriétaire, par bien, par période                          |
| Devis propriétaires                                 | P1       | Génération devis, envoi, suivi acceptation, conversion en facture   |

---

### 4.8 Module — Gestion des Travaux et Prestataires

> Suivi des interventions sur les biens gérés, imputables au propriétaire ou à la société.

| Fonctionnalité                                      | Priorité | Détail                                                              |
|-----------------------------------------------------|----------|---------------------------------------------------------------------|
| Référentiel prestataires                            | P1       | Fiche prestataire : RIB, assurance décennale, RC Pro, agréments     |
| Ticket d'intervention / bon de travaux              | P1       | Création depuis fiche bien ou demande locataire, qualification urgence |
| Devis prestataires                                  | P1       | Réception, validation (avec seuil d'accord propriétaire), archivage |
| Ordre de service (OS)                               | P1       | Émission OS au prestataire, suivi exécution                         |
| Réception des travaux                               | P1       | Validation, réserves, compte rendu                                  |
| Facturation et imputation                           | P1       | Facture prestataire → imputée au propriétaire ou à la société       |
| Historique des interventions par bien               | P1       | Timeline complète, filtrable par type / prestataire / montant       |
| Notification propriétaire                           | P1       | Alerte pour validation devis > seuil défini dans le mandat          |
| Suivi des garanties et contrats d'entretien         | P2       | Alertes d'expiration, équipements couverts                          |

---

### 4.9 Module — Comptabilité Générale (Société)

> Comptabilité propre de la société de gestion (distincte de la comptabilité mandant).

| Fonctionnalité                                      | Priorité | Détail                                                              |
|-----------------------------------------------------|----------|---------------------------------------------------------------------|
| Comptabilité générale (PCG français)                | P1       | Plan comptable paramétrable, journaux, lettrages                    |
| Comptabilité auxiliaire clients et fournisseurs     | P1       | Clients = propriétaires / locataires (services), Fournisseurs = prestataires |
| Saisie et intégration des factures                  | P1       | Saisie manuelle + OCR pour les factures fournisseurs                |
| Gestion de la TVA                                   | P1       | CA3, taux multiples, déclaration exportable                         |
| Rapprochement bancaire                              | P1       | Import relevés CFONB/OFX, lettrage automatique                      |
| Clôtures mensuelles et annuelles                    | P1       | Génération FEC, bilans intermédiaires                               |
| Trésorerie prévisionnelle                           | P2       | Projection à 30/60/90 jours                                         |
| Connexion expert-comptable                          | P1       | Export FEC, accès lecture expert-comptable, dossier de révision     |

---

### 4.10 Module — Reporting & Tableaux de Bord

> Pilotage de l'activité à destination de la direction et des gestionnaires.

| Fonctionnalité                                      | Priorité | Détail                                                              |
|-----------------------------------------------------|----------|---------------------------------------------------------------------|
| Dashboard direction (KPIs globaux)                  | P1       | Portefeuille, CA, taux d'occupation, impayés, satisfaction          |
| Rapport par propriétaire                            | P1       | Synthèse annuelle exportable PDF                                    |
| Rapport par bien                                    | P1       | Rendement locatif, historique baux, charges, travaux                |
| Rapport d'activité mensuel                          | P1       | Loyers encaissés, honoraires, travaux, reversements                 |
| Tableau de bord impayés                             | P1       | En temps réel, par locataire, ancienneté, statut relance            |
| Suivi des mandats (actifs, à renouveler, résiliés)  | P1       | Alertes sur mandats à risque de résiliation                         |
| Statistiques haut de gamme                         | P2       | Loyer moyen au m², comparatif marché, taux de vacance               |
| Export personnalisé (Excel, CSV, PDF)               | P1       | Tout tableau exportable                                             |

---

## 5. Espace Propriétaire — Portail Client

> Interface web sécurisée, **à destination exclusive des propriétaires**, accessible 24h/24 depuis PC, tablette et mobile.  
> C'est un élément **différenciateur fort** de l'offre haut de gamme.

### 5.1 Accès et authentification

| Fonctionnalité                     | Détail                                                                     |
|------------------------------------|----------------------------------------------------------------------------|
| Création de compte propriétaire    | Invitation automatique à la signature du mandat                            |
| Authentification sécurisée         | Email + mot de passe + MFA (code SMS ou application Authenticator)         |
| SSO optionnel                      | Connexion via Google / Apple (configurable)                                |
| Gestion multi-biens dans un seul compte | Un propriétaire avec N biens voit tout depuis un espace unique       |

### 5.2 Tableau de bord propriétaire

Le propriétaire dispose d'un **dashboard personnalisé** affichant en temps réel :

- **Solde du compte mandant** (fonds disponibles à reverser)
- **Statut de chaque bien** : loué / vacant / travaux en cours
- **Prochain reversement** : montant estimé et date
- **Alertes actives** : document à signer, devis en attente de validation, impayé en cours
- **Synthèse annuelle** : loyers encaissés, charges, honoraires, reversements nets

### 5.3 Espace Documents

> Centre névralgique du portail — tous les documents du propriétaire, classés et accessibles à tout moment.

| Type de document                      | Accès | Fonctionnalité                                          |
|---------------------------------------|-------|---------------------------------------------------------|
| **Contrats de gestion (mandats)**     | ✅    | Consultation, téléchargement PDF, historique des versions |
| **Baux en cours**                     | ✅    | Par bien, avec date d'échéance et locataire associé      |
| **Factures d'honoraires**             | ✅    | Filtre par période, statut (payée / en attente), téléchargement PDF |
| **Devis**                             | ✅    | Devis reçus, statut (en attente / accepté / refusé), **signature électronique en ligne** |
| **Comptes rendus de gestion (CRG)**   | ✅    | PDF mensuel téléchargeable, historique sur N années      |
| **Avis de reversement**               | ✅    | Détail de chaque virement effectué                       |
| **Attestations fiscales annuelles**   | ✅    | Récapitulatif annuel pour déclaration revenus fonciers   |
| **Rapports de travaux**               | ✅    | Photos, devis, factures des interventions par bien       |
| **États des lieux**                   | ✅    | Entrée et sortie, avec photos                            |

### 5.4 Fonctionnalités interactives du portail

| Fonctionnalité                            | Priorité | Détail                                                  |
|-------------------------------------------|----------|---------------------------------------------------------|
| Signature électronique des documents      | P1       | Mandats, avenants, validation de devis travaux (eIDAS)  |
| Messagerie sécurisée avec le gestionnaire | P1       | Thread par bien, notifications email                    |
| Validation de devis en ligne              | P1       | Accepter / Refuser un devis prestataire avec commentaire |
| Notification en temps réel                | P1       | Nouveau document disponible, impayé détecté, reversement effectué |
| Historique des reversements               | P1       | Tableau filtrable, export Excel/PDF                     |
| Simulation de rendement locatif           | P3       | Outil de projection sur N années                        |
| Préférences de notification               | P1       | Email, SMS — paramétrable par type d'alerte             |

### 5.5 Standards UX du portail propriétaire

> Le portail est la vitrine de la qualité de service. Son design doit refléter le positionnement **haut de gamme** de la société.

- **Design premium** : palette sobre (blanc, noir, or ou couleur de marque), typographie haut de gamme, espacements généreux
- **Interface épurée** : pas de complexité inutile — le propriétaire accède à l'information en 2 clics maximum
- **Mobile-first** : expérience identique sur smartphone (PWA ou application native)
- **Accessibilité** : WCAG 2.1 AA minimum
- **Marque blanche complète** : logo, couleurs, domaine personnalisé (`espace.nomdelasociete.fr`)

---

## 6. Services Additionnels Locataires

> Les locataires ne sont **pas clients de la gestion**, mais peuvent accéder à des services à valeur ajoutée facturés séparément, cohérents avec le positionnement haut de gamme.

### 6.1 Catalogue de services

| Service                          | Exemple de prestation                              | Mode de facturation         |
|----------------------------------|----------------------------------------------------|-----------------------------|
| Conciergerie                     | Gestion du courrier, prise en charge des livraisons | Abonnement mensuel ou acte  |
| Ménage et entretien              | Prestataire partenaire, planification              | À la prestation             |
| Maintenance premium              | Intervention rapide garantie < 4h                  | Forfait ou acte             |
| Décoration / aménagement         | Mise en valeur du bien à l'entrée                  | Devis sur mesure            |
| Location de mobilier premium     | Pack mobilier haut de gamme                        | Mensuel                     |
| Assistance administrative        | Aide aux démarches locataire                       | À l'heure                   |

### 6.2 Gestion des services dans l'ERP

| Fonctionnalité                                   | Priorité | Détail                                           |
|--------------------------------------------------|----------|--------------------------------------------------|
| Catalogue de services paramétrables              | P2       | Nom, description, tarif, TVA applicable          |
| Souscription d'un service par locataire          | P2       | Depuis l'interface back-office gestionnaire      |
| Facturation locataire distincte                  | P2       | Facture séparée du loyer, propre à la société    |
| Espace locataire simplifié                       | P3       | Accès quittances, services souscrits, messagerie |
| Suivi du CA services additionnels                | P2       | Dashboard dédié, par service, par bien           |

> ⚠️ **Note importante :** La facturation des services additionnels est émise par la **société de gestion**, et non imputée au compte mandant du propriétaire.

---

## 7. Exigences techniques

### 7.1 Architecture applicative

Modèle de déploiement souhaité :
☐ SaaS (Cloud hébergé chez le prestataire)
☐ Cloud privé (OVH / AWS / Azure — hébergement France obligatoire)
☐ On-premise
☑ Recommandé : Cloud privé France (données sensibles — loi Hoguet)

Hébergement : Données hébergées impérativement en France (RGPD + réglementation immobilière)

### 7.2 Stack technique recommandée

| Composant          | Technologie recommandée                   | Contrainte                            |
|--------------------|-------------------------------------------|---------------------------------------|
| Backend            | `[Python/Django, Node.js, Laravel…]`      | API REST documentée (OpenAPI 3.0)     |
| Frontend Back-office | `[React, Vue.js, Next.js…]`             | `[Préférence à préciser]`             |
| Portail propriétaire | `[Next.js / Nuxt.js — SSR recommandé]` | PWA ou application mobile (iOS/Android) |
| Base de données    | PostgreSQL (recommandé)                   | Schéma multi-mandant isolé            |
| Authentification   | OAuth 2.0 / OpenID Connect               | MFA obligatoire, SSO optionnel        |
| Stockage documents | S3-compatible (OVH Object Storage…)       | Chiffrement côté serveur, CDN         |
| Signature électronique | Yousign / DocuSign / Universign       | Conformité eIDAS, valeur légale       |
| Infrastructure     | Docker / Kubernetes                       | CI/CD automatisé                      |
| Emails transactionnels | Brevo / Mailjet / Postmark            | Templates HTML branded                |
| SMS                | Twilio / OVH SMS                          | Notifications critiques               |

### 7.3 Performance et disponibilité

| Indicateur                          | Exigence                                    |
|-------------------------------------|---------------------------------------------|
| Disponibilité (SLA)                 | ≥ 99,5% hors maintenance planifiée          |
| Temps de réponse back-office        | < 1,5 seconde (95e percentile)              |
| Temps de réponse portail propriétaire | < 1 seconde (page d'accueil)              |
| Génération PDF (CRG, facture)       | < 3 secondes                                |
| Utilisateurs simultanés             | `[X collaborateurs + Y propriétaires actifs]` |
| Fenêtre de maintenance              | Samedi 23h – dimanche 5h                    |
| RPO (perte de données max.)         | ≤ 1 heure                                  |
| RTO (durée max. d'indisponibilité)  | ≤ 4 heures                                  |

---

## 8. Sécurité et conformité

### 8.1 Sécurité applicative

| Exigence                          | Détail                                                              |
|-----------------------------------|---------------------------------------------------------------------|
| Chiffrement en transit            | TLS 1.3 obligatoire sur toutes les communications                   |
| Chiffrement au repos              | AES-256 pour la base de données et les documents stockés            |
| MFA                               | Obligatoire pour les gestionnaires, comptables et administrateurs   |
| Audit trail complet               | Journalisation de toutes les actions (qui, quoi, quand, depuis quelle IP) |
| Politique de mots de passe        | Minimum 12 caractères, complexité imposée, rotation annuelle        |
| Tests de sécurité                 | Pentest annuel par prestataire indépendant, rapport fourni          |
| Gestion des sessions              | Timeout automatique après `[15/30]` minutes d'inactivité            |

### 8.2 Conformité réglementaire

| Réglementation        | Exigence                                                               |
|-----------------------|------------------------------------------------------------------------|
| **RGPD**              | Registre des traitements, consentements, droit à l'effacement, DPO désigné |
| **Loi Hoguet**        | Séparation stricte fonds mandants / fonds propres, numérotation des mandats, archivage 10 ans |
| **Loi ALUR**          | Conformité des baux, encadrement des loyers, mentions obligatoires     |
| **FEC**               | Génération du Fichier des Écritures Comptables conforme à l'article A47-A-1 du LPF |
| **eIDAS**             | Signature électronique qualifiée ou avancée selon usage               |

### 8.3 Gestion des fonds mandants (loi Hoguet)

> ⚠️ **Point de conformité critique** — La société est titulaire d'une carte professionnelle G. Les fonds appartenant aux propriétaires doivent être :

- Logés sur un **compte bancaire séquestre dédié**, séparé du compte courant de la société
- Suivis dans l'ERP via des **comptes mandants individuels** par propriétaire
- Faisant l'objet d'un **compte rendu de gestion** transmis au moins une fois par an (ou à chaque opération)

---

## 9. Intégrations externes

| Système tiers                         | Type d'intégration     | Flux et fréquence                           |
|---------------------------------------|------------------------|---------------------------------------------|
| **Banque (EBICS / API)**              | Import automatique     | Relevés quotidiens, génération virements SEPA |
| **Expert-comptable**                  | Export FEC + accès     | Mensuel, accès lecture dossier de révision   |
| **Signature électronique** (Yousign…) | API native             | Temps réel, à chaque document à signer       |
| **Diagnostiqueurs / DDT**             | Import PDF structuré   | À chaque nouvelle entrée en location         |
| **Prestataires SMS** (Twilio…)        | API                    | Notifications temps réel                     |
| **Emailing transactionnel** (Brevo…)  | API                    | Quittances, relances, alertes, CRG           |
| **Portail annonces** (SeLoger, PAP…)  | API / export           | Publication automatique en cas de vacance    |
| **Assurance GLI / PNO**               | Import/Export          | Déclaration de contrats et sinistres         |
| **Power BI / Metabase** (optionnel)   | Connecteur SQL / API   | Reporting avancé direction                   |

---

## 10. Gestion des droits et profils

### 10.1 Profils back-office internes

| Profil               | Accès                                                                | Droits                              |
|----------------------|----------------------------------------------------------------------|-------------------------------------|
| Administrateur SI    | Tous les modules + configuration                                     | Lecture / Écriture / Config         |
| Direction            | Tous les modules (lecture) + validation financière                   | Lecture + validation                |
| Gestionnaire locatif | CRM, Biens, Baux, Loyers, Travaux, Portail propriétaire             | Lecture / Écriture périmètre        |
| Comptable            | Comptabilité mandant, Facturation, Comptabilité générale            | Lecture / Écriture comptabilité     |
| Chargé de services   | Services additionnels, Fiche locataire (partielle)                  | Écriture services                   |
| Responsable travaux  | Module travaux, Prestataires, Fiche bien (partielle)                | Écriture travaux                    |

### 10.2 Profils portail propriétaire

| Profil                 | Accès                                                                |
|------------------------|----------------------------------------------------------------------|
| Propriétaire standard  | Ses propres biens, documents, CRG, factures                         |
| Propriétaire multi-biens | Vue consolidée multi-biens dans un seul compte                   |
| Représentant SCI       | Accès au nom de la SCI, avec délégation possible à un tiers         |

### 10.3 Règles de gestion des accès

- Modèle **RBAC** (Role-Based Access Control)
- **Séparation des tâches** : l'émission et la validation d'une facture doivent être réalisées par deux personnes différentes
- Toute modification sur les données sensibles (mandat, RIB, montant loyer) génère une **entrée dans l'audit trail**
- Connexion propriétaire : **MFA obligatoire** dès la première connexion

---

## 11. Interface utilisateur et design

### 11.1 Back-office (équipe interne)

- Interface **web responsive** (PC prioritaire, tablette secondaire)
- Design professionnel, clair, adapté à un usage intensif quotidien
- Navigation par raccourcis clavier pour les tâches répétitives (comptabilité, quittancement)
- Mode sombre optionnel
- Composants UI cohérents (système de design : `[à définir avec le prestataire]`)
- Notifications in-app en temps réel (impayés, documents à valider, alertes mandats)

### 11.2 Portail propriétaire (clients finaux)

- Design **haut de gamme, épuré, branded** — reflet du positionnement de la société
- Palette : `[Couleurs de marque]` — typographie premium — espacements généreux
- **Mobile-first** : PWA ou application mobile native iOS / Android
- Temps de chargement < 1 seconde (Core Web Vitals au vert)
- **Marque blanche** : domaine personnalisé, logo, favicon, emails aux couleurs de la société
- Accessibilité **WCAG 2.1 niveau AA**
- Zéro jargon technique : vocabulaire simple, orienté propriétaire non expert

### 11.3 Exigences multilingues et multi-devises

| Exigence        | Valeur                                              |
|-----------------|-----------------------------------------------------|
| Langue back-office | Français (obligatoire)                           |
| Langue portail  | Français (obligatoire) + `[Anglais / autres si besoin]` |
| Devises         | EUR (obligatoire) + `[Autres devises si biens à l'étranger]` |

---

