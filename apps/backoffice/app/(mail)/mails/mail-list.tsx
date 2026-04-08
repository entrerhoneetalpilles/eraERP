'use client'

import { cn } from '@conciergerie/ui'
import { Badge } from '@conciergerie/ui'
import { Input } from '@conciergerie/ui'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Mail, ContactType } from './mail-data'

const CONTACT_COLORS: Record<ContactType, string> = {
    proprietaire: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    voyageur: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    prestataire: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    autre: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const CONTACT_LABELS: Record<ContactType, string> = {
    proprietaire: 'Propriétaire',
    voyageur: 'Voyageur',
    prestataire: 'Prestataire',
    autre: 'Autre',
}

interface MailListProps {
    mails: Mail[]
    selectedId: string | null
    search: string
    onSelect: (id: string) => void
    onSearch: (v: string) => void
}

export function MailList({ mails, selectedId, search, onSelect, onSearch }: MailListProps) {
    return (
        <div className="flex h-full flex-col">
            <div className="border-b p-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
                        className="pl-8 h-9"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                {mails.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                        Aucun message
                    </div>
                ) : (
                    <div className="flex flex-col gap-0">
                        {mails.map((mail) => (
                            <button
                                key={mail.id}
                                onClick={() => onSelect(mail.id)}
                                className={cn(
                                    'flex flex-col gap-1 border-b p-3 text-left transition-colors hover:bg-muted/50',
                                    selectedId === mail.id && 'bg-muted',
                                    !mail.read && 'bg-primary/5'
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className={cn('text-sm truncate', !mail.read && 'font-semibold')}>
                                        {mail.folder === 'sent' || mail.folder === 'drafts'
                                            ? mail.to[0]?.name
                                            : mail.from.name}
                                    </span>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(mail.date), { addSuffix: true, locale: fr })}
                                    </span>
                                </div>

                                <span className={cn('text-sm truncate', !mail.read ? 'font-medium' : 'text-foreground')}>
                                    {mail.subject}
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <span className="flex-1 truncate text-xs text-muted-foreground">
                                        {mail.preview}
                                    </span>
                                    <span
                                        className={cn(
                                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                            CONTACT_COLORS[mail.contactType]
                                        )}
                                    >
                                        {CONTACT_LABELS[mail.contactType]}
                                    </span>
                                </div>

                                {mail.attachments && mail.attachments.length > 0 && (
                                    <span className="text-[10px] text-muted-foreground">
                                        📎 {mail.attachments.length} pièce(s) jointe(s)
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}