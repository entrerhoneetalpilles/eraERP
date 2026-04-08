'use client'

import { useRef } from 'react'
import { cn } from '@conciergerie/ui'
import { Input } from '@conciergerie/ui'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Trash2, Archive, MailOpen, Mail, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Mail as MailType, ContactType, MailFolder } from './mail-data'

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
    mails: MailType[]
    selectedId: string | null
    bulkSelected: Set<string>
    search: string
    onSelect: (id: string) => void
    onSearch: (v: string) => void
    onToggleBulk: (id: string, shiftKey?: boolean) => void
    onSelectAll: () => void
    onClearSelection: () => void
    onBulkMoveTo: (folder: MailFolder) => void
    onBulkMarkRead: (read: boolean) => void
}

export function MailList({
    mails,
    selectedId,
    bulkSelected,
    search,
    onSelect,
    onSearch,
    onToggleBulk,
    onSelectAll,
    onClearSelection,
    onBulkMoveTo,
    onBulkMarkRead,
}: MailListProps) {
    const lastClickedRef = useRef<string | null>(null)
    const allSelected = mails.length > 0 && mails.every((m) => bulkSelected.has(m.id))
    const someSelected = bulkSelected.size > 0

    function handleCheckbox(id: string, e: React.MouseEvent) {
        onToggleBulk(id, e.shiftKey)
        lastClickedRef.current = id
    }

    return (
        <div className="flex h-full flex-col">
            {/* Barre de recherche */}
            <div className="border-b p-3 shrink-0">
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

            {/* Toolbar multi-sélection */}
            <div className={cn(
                'border-b px-3 py-1.5 flex items-center gap-2 shrink-0 transition-all',
                someSelected ? 'bg-primary/5' : 'bg-transparent'
            )}>
                <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) => checked ? onSelectAll() : onClearSelection()}
                    className="shrink-0"
                />
                {someSelected ? (
                    <>
                        <span className="text-xs text-muted-foreground flex-1">
                            {bulkSelected.size} sélectionné{bulkSelected.size > 1 ? 's' : ''}
                        </span>
                        <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7"
                            onClick={() => onBulkMarkRead(true)}
                            title="Marquer comme lu"
                        >
                            <MailOpen className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7"
                            onClick={() => onBulkMarkRead(false)}
                            title="Marquer comme non lu"
                        >
                            <Mail className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7"
                            onClick={() => onBulkMoveTo('archived')}
                            title="Archiver"
                        >
                            <Archive className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 hover:text-destructive"
                            onClick={() => onBulkMoveTo('trash')}
                            title="Corbeille"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onBulkMoveTo('inbox')}>
                                    Déplacer → Boîte de réception
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onBulkMoveTo('sent')}>
                                    Déplacer → Envoyés
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onBulkMoveTo('archived')}>
                                    Déplacer → Archivés
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <button
                            onClick={onClearSelection}
                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-1"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </>
                ) : (
                    <span className="text-xs text-muted-foreground flex-1">
                        {mails.length} message{mails.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Liste */}
            <ScrollArea className="flex-1">
                {mails.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                        Aucun message
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {mails.map((mail) => (
                            <div
                                key={mail.id}
                                className={cn(
                                    'group relative flex items-start gap-0 border-b transition-colors',
                                    selectedId === mail.id && !someSelected ? 'bg-muted' : 'hover:bg-muted/50',
                                    !mail.read && 'bg-primary/5',
                                    bulkSelected.has(mail.id) && 'bg-primary/10',
                                )}
                            >
                                {/* Checkbox */}
                                <div
                                    className={cn(
                                        'flex items-center justify-center w-8 h-full py-3 shrink-0 transition-opacity',
                                        someSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    )}
                                    onClick={(e) => { e.stopPropagation(); handleCheckbox(mail.id, e) }}
                                >
                                    <Checkbox
                                        checked={bulkSelected.has(mail.id)}
                                        onCheckedChange={() => onToggleBulk(mail.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>

                                {/* Contenu cliquable */}
                                <button
                                    className="flex-1 flex flex-col gap-1 p-3 pl-1 text-left min-w-0"
                                    onClick={() => {
                                        if (!someSelected) onSelect(mail.id)
                                        else onToggleBulk(mail.id)
                                    }}
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
                                        <span className={cn(
                                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                            CONTACT_COLORS[mail.contactType]
                                        )}>
                                            {CONTACT_LABELS[mail.contactType]}
                                        </span>
                                    </div>

                                    {!mail.read && (
                                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}

function X({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    )
}
