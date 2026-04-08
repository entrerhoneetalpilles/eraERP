import { getThreads } from '@/lib/dal/emails'
import { MailClient } from './mail-client'
import { PageHeader } from '@/components/ui/page-header'
import type { Mail, MailFolder, MailMessage } from './mail-data'

export default async function MailsPage({
    searchParams,
}: {
    searchParams: { folder?: string }
}) {
    const folder = (searchParams?.folder ?? 'inbox') as MailFolder
    const threads = await getThreads(folder)

    const mails: Mail[] = (threads as any[]).map((t) => ({
        id: t.id,
        from: {
            name: t.owner?.nom ?? t.to_name ?? 'Contact',
            email: t.owner?.email ?? '',
        },
        to: t.to_name
            ? [{ name: t.to_name, email: t.to_email ?? '' }]
            : [{ name: 'Entre Rhône et Alpilles', email: 'contact@entre-rhone-alpilles.fr' }],
        subject: t.subject,
        body: t.messages?.at(-1)?.contenu ?? '',
        preview: (t.messages?.at(-1)?.contenu ?? '').slice(0, 120),
        date: t.updatedAt.toISOString(),
        read: (t.messages ?? []).every((m: any) => m.lu_at !== null),
        folder: t.folder ?? 'inbox',
        contactType: t.contact_type ?? 'autre',
        labels: [],
        messages: (t.messages ?? []).map((m: any): MailMessage => ({
            id: m.id,
            contenu: m.contenu,
            author_type: m.author_type,
            createdAt: m.createdAt.toISOString(),
        })),
    }))

    return (
        <div className="space-y-6">
            <PageHeader
                title="Messagerie"
                description={`${mails.length} message${mails.length !== 1 ? 's' : ''}`}
            />
            <MailClient initialMails={mails} currentFolder={folder} />
        </div>
    )
}