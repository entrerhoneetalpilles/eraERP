// apps/backoffice/app/(protected)/mails/mail-data.ts

export type MailFolder = 'inbox' | 'sent' | 'drafts' | 'archived' | 'trash'
export type ContactType = 'proprietaire' | 'voyageur' | 'prestataire' | 'autre'

export interface MailContact {
    name: string
    email: string
}

export interface MailAttachment {
    name: string
    size: string
}

export interface Mail {
    id: string
    from: MailContact
    to: MailContact[]
    subject: string
    body: string
    preview: string
    date: string
    read: boolean
    folder: MailFolder
    contactType: ContactType
    labels?: string[]
    attachments?: MailAttachment[]
}

export const MOCK_MAILS: Mail[] = [
    {
        id: '1',
        from: { name: 'Jean-Pierre Martin', email: 'jp.martin@gmail.com' },
        to: [{ name: 'Conciergerie', email: 'contact@conciergerie.fr' }],
        subject: 'Questions sur le CRG de mars',
        body: 'Bonjour,\n\nJe souhaitais avoir quelques précisions sur le compte-rendu de gestion de mars. Les charges de nettoyage me semblent supérieures à celles du mois précédent.\n\nPouvez-vous m\'expliquer ce point ?\n\nCordialement,\nJean-Pierre Martin',
        preview: 'Les charges de nettoyage me semblent supérieures à celles du mois précédent...',
        date: '2026-04-06T10:30:00',
        read: false,
        folder: 'inbox',
        contactType: 'proprietaire',
        labels: ['crg'],
    },
    {
        id: '2',
        from: { name: 'Sophie Durand', email: 'sophie.durand@gmail.com' },
        to: [{ name: 'Conciergerie', email: 'contact@conciergerie.fr' }],
        subject: 'Demande d\'informations — Mas des Oliviers',
        body: 'Bonjour,\n\nNous arriverons le 12 avril et souhaiterions savoir si un lit bébé est disponible dans la propriété.\n\nMerci d\'avance,\nSophie Durand',
        preview: 'Nous arriverons le 12 avril et souhaiterions savoir si un lit bébé est disponible...',
        date: '2026-04-06T09:15:00',
        read: false,
        folder: 'inbox',
        contactType: 'voyageur',
        labels: ['réservation'],
    },
    {
        id: '3',
        from: { name: 'Propre & Net SARL', email: 'contact@proprenet.fr' },
        to: [{ name: 'Conciergerie', email: 'contact@conciergerie.fr' }],
        subject: 'Devis ménage — Semaine 15',
        body: 'Bonjour,\n\nVeuillez trouver ci-joint notre devis pour les prestations de ménage de la semaine 15.\n\nTotal : 420€ TTC pour 6 interventions.\n\nCordialement,\nPropre & Net SARL',
        preview: 'Veuillez trouver ci-joint notre devis pour les prestations semaine 15...',
        date: '2026-04-05T16:00:00',
        read: true,
        folder: 'inbox',
        contactType: 'prestataire',
        attachments: [{ name: 'devis-semaine15.pdf', size: '142 Ko' }],
        labels: ['devis', 'ménage'],
    },
    {
        id: '4',
        from: { name: 'Conciergerie', email: 'contact@conciergerie.fr' },
        to: [{ name: 'Jean-Pierre Martin', email: 'jp.martin@gmail.com' }],
        subject: 'CRG Mars 2026 — Villa Rosée',
        body: 'Bonjour Jean-Pierre,\n\nVeuillez trouver ci-joint votre compte-rendu de gestion pour le mois de mars 2026.\n\nRécapitulatif :\n- Revenus bruts : 3 200€\n- Charges : 640€\n- Net reversé : 2 560€\n\nCordialement,\nL\'équipe Conciergerie',
        preview: 'Veuillez trouver ci-joint votre compte-rendu de gestion pour mars 2026...',
        date: '2026-04-04T11:00:00',
        read: true,
        folder: 'sent',
        contactType: 'proprietaire',
        attachments: [{ name: 'crg-mars-2026-villa-rosee.pdf', size: '318 Ko' }],
    },
    {
        id: '5',
        from: { name: 'Conciergerie', email: 'contact@conciergerie.fr' },
        to: [{ name: 'Sophie Durand', email: 'sophie.durand@gmail.com' }],
        subject: 'Confirmation de réservation — Mas des Oliviers',
        body: 'Bonjour Sophie,\n\nNous avons le plaisir de confirmer votre réservation au Mas des Oliviers du 12 au 19 avril 2026.\n\nLes codes d\'accès vous seront communiqués 48h avant votre arrivée.\n\nBonne préparation de séjour !\nL\'équipe Conciergerie',
        preview: 'Nous avons le plaisir de confirmer votre réservation au Mas des Oliviers...',
        date: '2026-04-03T14:30:00',
        read: true,
        folder: 'sent',
        contactType: 'voyageur',
    },
    {
        id: '6',
        from: { name: 'Conciergerie', email: 'contact@conciergerie.fr' },
        to: [{ name: 'Marc Electricité', email: 'marc.elec@artisans.fr' }],
        subject: 'Demande de devis — Remplacement tableau électrique',
        body: 'Bonjour Marc,\n\nSuite à notre échange téléphonique, pourriez-vous nous faire parvenir un devis pour le remplacement du tableau électrique de la Villa Rosée ?\n\nMerci,\nL\'équipe Conciergerie',
        preview: 'Pourriez-vous nous faire parvenir un devis pour le remplacement du tableau...',
        date: '2026-04-02T09:00:00',
        read: true,
        folder: 'drafts',
        contactType: 'prestataire',
    },
    {
        id: '7',
        from: { name: 'Thomas Lefebvre', email: 't.lefebvre@gmail.com' },
        to: [{ name: 'Conciergerie', email: 'contact@conciergerie.fr' }],
        subject: 'Avis séjour — Bastide de Provence',
        body: 'Bonjour,\n\nNous venons de terminer notre séjour à la Bastide de Provence. Tout était parfait !\n\nLa propriété est magnifique et très bien équipée. Nous recommanderons sans hésiter.\n\nMerci pour votre accueil,\nThomas Lefebvre',
        preview: 'Tout était parfait ! La propriété est magnifique et très bien équipée...',
        date: '2026-04-01T18:45:00',
        read: true,
        folder: 'archived',
        contactType: 'voyageur',
        labels: ['avis'],
    },
    {
        id: '8',
        from: { name: 'Marie Fontaine', email: 'marie.fontaine@outlook.fr' },
        to: [{ name: 'Conciergerie', email: 'contact@conciergerie.fr' }],
        subject: 'Intérêt pour un mandat de gestion',
        body: 'Bonjour,\n\nJe possède un appartement à Avignon que je souhaite mettre en location saisonnière. Votre conciergerie m\'a été recommandée.\n\nPouvez-vous m\'envoyer vos conditions de gestion ?\n\nCordialement,\nMarie Fontaine',
        preview: 'Je possède un appartement à Avignon que je souhaite mettre en location saisonnière...',
        date: '2026-04-06T08:00:00',
        read: false,
        folder: 'inbox',
        contactType: 'autre',
    },
]