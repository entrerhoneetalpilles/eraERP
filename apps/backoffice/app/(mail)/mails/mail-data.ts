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

export interface MailMessage {
    id: string
    contenu: string
    author_type: 'USER' | 'OWNER' | 'SYSTEM'
    createdAt: string
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
    messages?: MailMessage[]
}
