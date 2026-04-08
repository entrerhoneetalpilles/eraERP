'use client'

import { cn } from '@conciergerie/ui'
import { Button } from '@/components/ui/button'
import { Separator } from '@conciergerie/ui'
import {
    Inbox, Send, FileText, Archive, Trash2,
    Users, Home, Wrench, PenSquare,
} from 'lucide-react'
import type { MailFolder, ContactType } from './mail-data'

interface MailNavProps {
    folder: MailFolder
    contactFilter: ContactType | 'all'
    unreadCount: (f: MailFolder) => number
    onFolderChange: (f: MailFolder) => void
    onContactFilterChange: (c: ContactType | 'all') => void
    onCompose: () => void
}

const FOLDERS: { key: MailFolder; label: string; icon: React.ElementType }[] = [
    { key: 'inbox', label: 'Boîte de réception', icon: Inbox },
    { key: 'sent', label: 'Envoyés', icon: Send },
    { key: 'drafts', label: 'Brouillons', icon: FileText },
    { key: 'archived', label: 'Archivés', icon: Archive },
    { key: 'trash', label: 'Corbeille', icon: Trash2 },
]

const CONTACT_FILTERS: { key: ContactType | 'all'; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: 'Tous', icon: Users },
    { key: 'proprietaire', label: 'Propriétaires', icon: Home },
    { key: 'voyageur', label: 'Voyageurs', icon: Users },
    { key: 'prestataire', label: 'Prestataires', icon: Wrench },
]

export function MailNav({
    folder, contactFilter, unreadCount,
    onFolderChange, onContactFilterChange, onCompose,
}: MailNavProps) {
    return (
        <div className="flex h-full flex-col gap-2 p-3">
            <Button onClick={onCompose} className="w-full gap-2" size="sm">
                <PenSquare className="h-4 w-4" />
                Nouveau message
            </Button>

            <Separator className="my-1" />

            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Dossiers
            </p>
            <nav className="flex flex-col gap-0.5">
                {FOLDERS.map(({ key, label, icon: Icon }) => {
                    const count = unreadCount(key)
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onFolderChange(key)}
                            className={cn(
                                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors w-full text-left',
                                folder === key
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted text-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1">{label}</span>
                            {count > 0 && (
                                <span className={cn(
                                    'ml-auto h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
                                    folder === key
                                        ? 'bg-primary-foreground text-primary'
                                        : 'bg-primary text-primary-foreground'
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </nav>

            <Separator className="my-1" />

            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Contacts
            </p>
            <nav className="flex flex-col gap-0.5">
                {CONTACT_FILTERS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onContactFilterChange(key)}
                        className={cn(
                            'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors w-full text-left',
                            contactFilter === key
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'hover:bg-muted text-foreground'
                        )}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                    </button>
                ))}
            </nav>
        </div>
    )
}