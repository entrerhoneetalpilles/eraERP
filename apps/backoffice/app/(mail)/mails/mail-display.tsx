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
import { Textarea } from '@/components/ui/textarea'
import {
    Reply, Forward, Archive, Trash2, MoreVertical,
    Paperclip, User, Home, Wrench, Send, RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { sendMailAction } from './actions'
import type { Mail, MailFolder, MailMessage } from './mail-data'
import { cn } from '@conciergerie/ui'

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
    onForward: (subject: string, body: string, from: string) => void
    onSent: () => void
}

export function MailDisplay({ mail, onMoveTo, onReply, onForward, onSent }: MailDisplayProps) {
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [replyOpen, setReplyOpen] = useState(false)
    const [replyBody, setReplyBody] = useState('')
    const [sending, setSending] = useState(false)

    if (!mail) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Reply className="w-5 h-5 opacity-40" />
                </div>
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

    async function handleQuickReply() {
        if (!replyBody.trim()) return
        setSending(true)
        try {
            await sendMailAction({
                to: mail!.from.email,
                toName: mail!.from.name,
                subject: mail!.subject.startsWith('Re: ') ? mail!.subject : `Re: ${mail!.subject}`,
                body: replyBody,
                contactType: mail!.contactType,
                replyToThreadId: mail!.id,
            })
            toast.success('Réponse envoyée')
            setReplyBody('')
            setReplyOpen(false)
            onSent()
        } catch {
            toast.error("Erreur lors de l'envoi")
        } finally {
            setSending(false)
        }
    }

    const messages: MailMessage[] = mail.messages?.length
        ? mail.messages
        : [{ id: mail.id, contenu: mail.body, author_type: 'OWNER', createdAt: mail.date }]

    return (
        <>
            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer définitivement</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Ce message sera supprimé définitivement et ne pourra pas être récupéré. Confirmer ?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDelete(false)}>Annuler</Button>
                        <Button variant="destructive" onClick={() => { setConfirmDelete(false); onMoveTo(mail!.id, 'trash') }}>
                            Supprimer définitivement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-col">
                {/* Toolbar */}
                <div className="flex items-center gap-0.5 border-b px-2 py-1.5 shrink-0">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReplyOpen(true)}>
                                <Reply className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Répondre</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                const quotedBody = `\n\n\n---------- Message transféré ----------\nDe : ${mail.from.name} <${mail.from.email}>\nDate : ${format(new Date(mail.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}\nObjet : ${mail.subject}\n\n${mail.body}`
                                onForward(`Fwd: ${mail.subject}`, quotedBody, mail.from.email)
                            }}>
                                <Forward className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Transférer</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-1 h-5" />

                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onMoveTo(mail.id, 'archived')}>
                                <Archive className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Archiver</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleTrash}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>{mail.folder === 'trash' ? 'Supprimer définitivement' : 'Corbeille'}</TooltipContent>
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

                {/* Sujet + expéditeur */}
                <div className="px-5 pt-4 pb-3 border-b shrink-0">
                    <h2 className="text-base font-semibold leading-snug">{mail.subject}</h2>
                    <div className="mt-2.5 flex items-start gap-2.5">
                        <Avatar className="h-8 w-8 shrink-0 mt-0.5">
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
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-xs text-muted-foreground">
                                    À : {mail.to.map((t) => t.name).join(', ')}
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto tabular-nums">
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

                {/* Thread conversation */}
                <ScrollArea className="flex-1">
                    <div className="px-5 py-4 space-y-5">
                        {messages.map((msg, i) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                                fromName={mail.from.name}
                                isFirst={i === 0}
                                isLast={i === messages.length - 1}
                            />
                        ))}
                    </div>

                    {mail.attachments && mail.attachments.length > 0 && (
                        <div className="px-5 pb-4">
                            <Separator className="mb-3" />
                            <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Pièces jointes ({mail.attachments.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {mail.attachments.map((att) => (
                                    <div
                                        key={att.name}
                                        className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                                    >
                                        <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
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

                {/* Zone de réponse */}
                {replyOpen ? (
                    <div className="border-t px-4 py-3 space-y-2 shrink-0 bg-card">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">
                                Répondre à <span className="text-foreground">{mail.from.name}</span>
                            </p>
                            <button
                                onClick={() => { setReplyOpen(false); setReplyBody('') }}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Annuler
                            </button>
                        </div>
                        <Textarea
                            placeholder="Votre réponse..."
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            className="min-h-[96px] text-sm resize-none"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    handleQuickReply()
                                }
                            }}
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] text-muted-foreground">⌘ + Entrée pour envoyer</p>
                            <Button size="sm" disabled={!replyBody.trim() || sending} onClick={handleQuickReply}>
                                <Send className="h-3.5 w-3.5 mr-1.5" />
                                {sending ? 'Envoi...' : 'Envoyer'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="border-t px-4 py-3 shrink-0">
                        <Button
                            onClick={() => setReplyOpen(true)}
                            variant="outline"
                            className="w-full gap-2 text-sm"
                            size="sm"
                        >
                            <Reply className="h-4 w-4" />
                            Répondre à {mail.from.name}
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}

function MessageBubble({
    message,
    fromName,
    isFirst,
    isLast,
}: {
    message: MailMessage
    fromName: string
    isFirst: boolean
    isLast: boolean
}) {
    const isOutbound = message.author_type === 'USER'
    const initials = isOutbound
        ? 'ERA'
        : fromName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className={cn('flex gap-2.5', isOutbound ? 'flex-row-reverse' : 'flex-row')}>
            <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <div className={cn('max-w-[78%] space-y-1', isOutbound ? 'items-end' : 'items-start')}>
                <div
                    className={cn(
                        'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        isOutbound
                            ? 'bg-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap'
                            : 'bg-muted text-foreground rounded-tl-sm whitespace-pre-wrap'
                    )}
                >
                    {message.contenu}
                </div>
                <p className={cn('text-[10px] text-muted-foreground px-1', isOutbound ? 'text-right' : 'text-left')}>
                    {isOutbound ? 'Vous' : fromName} · {format(new Date(message.createdAt), "d MMM 'à' HH:mm", { locale: fr })}
                </p>
            </div>
        </div>
    )
}
