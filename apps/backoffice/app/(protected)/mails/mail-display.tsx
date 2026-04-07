'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@conciergerie/ui'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@conciergerie/ui'
import { Avatar, AvatarFallback } from '@conciergerie/ui'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
    Reply, Forward, Archive, Trash2, MoreVertical,
    Paperclip, User, Home, Wrench,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Mail, MailFolder } from './mail-data'

const CONTACT_ICONS = {
    proprietaire: Home,
    voyageur: User,
    prestataire: Wrench,
    autre: User,
}

interface MailDisplayProps {
    mail: Mail | null
    onMoveTo: (id: string, folder: MailFolder) => void
    onReply: () => void
}

export function MailDisplay({ mail, onMoveTo, onReply }: MailDisplayProps) {
    const [confirmDelete, setConfirmDelete] = useState(false)

    if (!mail) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <p className="text-sm">Sélectionnez un message</p>
            </div>
        )
    }

    const ContactIcon = CONTACT_ICONS[mail.contactType]
    const initials = mail.from.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

    function handleTrash() {
        if (mail!.folder === 'trash') {
            setConfirmDelete(true)
        } else {
            onMoveTo(mail!.id, 'trash')
        }
    }

    function handleConfirmDelete() {
        setConfirmDelete(false)
        onMoveTo(mail!.id, 'trash') // moveTo détecte folder=trash → suppression définitive
    }

    return (
        <>
            {/* Dialog confirmation suppression définitive */}
            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer définitivement</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Ce message sera supprimé définitivement et ne pourra pas être récupéré. Confirmer ?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Supprimer définitivement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-col">
                {/* Toolbar */}
                <div className="flex items-center gap-1 border-b p-2">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReply}>
                                <Reply className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Répondre</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Forward className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Transférer</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-1 h-5" />

                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="ghost" size="icon" className="h-8 w-8"
                                onClick={() => onMoveTo(mail.id, 'archived')}
                            >
                                <Archive className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Archiver</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="ghost" size="icon" className="h-8 w-8"
                                onClick={handleTrash}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {mail.folder === 'trash' ? 'Supprimer définitivement' : 'Corbeille'}
                        </TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'inbox')}>
                                Déplacer dans la boîte de réception
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'drafts')}>
                                Mettre en brouillon
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Header */}
                <div className="p-4">
                    <h2 className="text-lg font-semibold">{mail.subject}</h2>
                    <div className="mt-3 flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-sm">{mail.from.name}</span>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <ContactIcon className="h-3 w-3" />
                                    {mail.from.email}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                    À : {mail.to.map((t) => t.name).join(', ')}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                    {format(new Date(mail.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {mail.labels && mail.labels.length > 0 && (
                        <div className="mt-2 flex gap-1 flex-wrap">
                            {mail.labels.map((l) => (
                                <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                            ))}
                        </div>
                    )}
                </div>

                <Separator />

                {/* Body */}
                <ScrollArea className="flex-1 p-4">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {mail.body}
                    </div>

                    {mail.attachments && mail.attachments.length > 0 && (
                        <div className="mt-6">
                            <Separator className="mb-4" />
                            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Pièces jointes
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {mail.attachments.map((att) => (
                                    <div
                                        key={att.name}
                                        className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                                    >
                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-xs">{att.name}</p>
                                            <p className="text-xs text-muted-foreground">{att.size}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>

                {/* Quick reply */}
                <div className="border-t p-3">
                    <Button onClick={onReply} variant="outline" className="w-full gap-2" size="sm">
                        <Reply className="h-4 w-4" />
                        Répondre à {mail.from.name}
                    </Button>
                </div>
            </div>
        </>
    )
}