import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getThreads } from '@/lib/dal/emails'
import { MailClient } from './mail-client'
import type { Mail, MailFolder, MailMessage } from './mail-data'

export default async function MailsPage({
    searchParams,
}: {
    searchParams: { folder?: string }
}) {
    const folder = (searchParams?.folder ?? 'inbox') as MailFolder
    const threads = await getThreads(folder)

    const mails: Mail[] = (threads as any[]).map((t) => {
        const isInbox = t.folder === 'inbox' || !t.folder
        const fromName = isInbox
            ? (t.from_name ?? t.owner?.nom ?? t.from_email ?? 'Contact')
            : 'Entre Rhône et Alpilles'
        const fromEmail = isInbox
            ? (t.from_email ?? t.owner?.email ?? '')
            : 'contact@entre-rhone-alpilles.fr'
        const toName = isInbox ? 'Entre Rhône et Alpilles' : (t.to_name ?? t.owner?.nom ?? 'Contact')
        const toEmail = isInbox ? (t.to_email ?? '') : (t.to_email ?? t.owner?.email ?? '')
        const unreadMessages = isInbox
            ? (t.messages ?? []).filter((m: any) => m.author_type === 'OWNER' && m.lu_at === null)
            : (t.messages ?? []).filter((m: any) => m.lu_at === null)
        return {
            id: t.id,
            from: { name: fromName, email: fromEmail },
            to: [{ name: toName, email: toEmail }],
            subject: t.subject,
            body: t.messages?.at(-1)?.contenu ?? '',
            preview: (t.messages?.at(-1)?.contenu ?? '').slice(0, 120),
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
            })),
        }
    })

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Topbar standalone */}
            <header className="h-12 flex items-center gap-3 px-4 border-b border-border bg-card shrink-0">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Retour à l'ERP</span>
                </Link>
                <div className="w-px h-4 bg-border" />
                <h1 className="text-sm font-semibold text-foreground">Messagerie</h1>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {mails.filter((m) => !m.read).length > 0
                        ? `${mails.filter((m) => !m.read).length} non lu${mails.filter((m) => !m.read).length > 1 ? 's' : ''}`
                        : 'À jour'}
                </span>
            </header>

            {/* Mail client — remplit l'espace restant */}
            <div className="flex-1 overflow-hidden p-0">
                <MailClient initialMails={mails} currentFolder={folder} />
            </div>
        </div>
    )
}
