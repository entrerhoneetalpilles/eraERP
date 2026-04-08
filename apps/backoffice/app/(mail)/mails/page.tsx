import { auth } from '@/auth'
import { getThreads } from '@/lib/dal/emails'
import { MailClient } from './mail-client'
import type { Mail as MailType, MailFolder, MailMessage } from './mail-data'

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

export default async function MailsPage({
    searchParams,
}: {
    searchParams: { folder?: string }
}) {
    const [session, threads] = await Promise.all([
        auth(),
        getThreads((searchParams?.folder ?? 'inbox') as MailFolder),
    ])
    const folder = (searchParams?.folder ?? 'inbox') as MailFolder
    const userEmail = session?.user?.email ?? ''

    const mails: MailType[] = (threads as any[]).map((t) => {
        const isInbox = t.folder === 'inbox' || !t.folder
        const fromName = isInbox
            ? (t.to_name ?? t.owner?.nom ?? 'Contact')
            : 'Entre Rhône et Alpilles'
        const fromEmail = isInbox
            ? (t.to_email ?? t.owner?.email ?? '')
            : 'contact@entre-rhone-alpilles.fr'
        const toName = isInbox ? 'Entre Rhône et Alpilles' : (t.to_name ?? t.owner?.nom ?? 'Contact')
        const toEmail = isInbox ? 'contact@entre-rhone-alpilles.fr' : (t.to_email ?? t.owner?.email ?? '')
        const unreadMessages = isInbox
            ? (t.messages ?? []).filter((m: any) => m.author_type === 'OWNER' && m.lu_at === null)
            : (t.messages ?? []).filter((m: any) => m.lu_at === null)

        return {
            id: t.id,
            from: { name: fromName, email: fromEmail },
            to: [{ name: toName, email: toEmail }],
            subject: t.subject,
            body: t.messages?.at(-1)?.contenu ?? '',
            preview: (t.messages?.at(-1)?.contenu ?? '').replace(/<[^>]*>/g, '').slice(0, 120),
            date: t.updatedAt.toISOString(),
            read: unreadMessages.length === 0,
            folder: t.folder ?? 'inbox',
            contactType: t.contact_type ?? 'autre',
            labels: [],
            messages: (t.messages ?? []).map((m: any): MailMessage => ({
                id: m.id,
                contenu: m.contenu,
                author_type: m.author_type,
                createdAt: m.createdAt.toISOString(),
                attachments: (m.attachments ?? []).map((a: any) => ({
                    name: a.nom,
                    size: a.taille ? formatSize(a.taille) : '',
                    url: a.url_storage,
                })),
            })),
        }
    })

    return (
        <div className="flex flex-col h-screen bg-background">
            <MailClient initialMails={mails} currentFolder={folder} userEmail={userEmail} />
        </div>
    )
}
