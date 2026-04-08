'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@conciergerie/ui'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@conciergerie/ui'
import { Avatar, AvatarFallback } from '@conciergerie/ui'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
    Reply, Forward, Archive, Trash2, MoreVertical,
    Paperclip, User, Home, Wrench, Send, ChevronDown, ChevronUp,
    MailOpen, Mail as MailIcon, MoveRight,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
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

// ── Rendu HTML sécurisé dans iframe sandboxée ──────────────────────────────

function EmailBody({ content }: { content: string }) {
    const [height, setHeight] = useState(200)
    const isHtml = /<[a-z][\s\S]*>/i.test(content)

    const handleLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
        const iframe = e.currentTarget
        try {
            const body = iframe.contentDocument?.body
            if (body) setHeight(Math.max(body.scrollHeight + 32, 100))
        } catch {}
    }, [])

    if (isHtml) {
        const srcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                   font-size: 14px; line-height: 1.6; color: #1a1a1a;
                   margin: 0; padding: 8px; word-break: break-word; }
            a { color: #2563eb; }
            img { max-width: 100%; height: auto; }
            blockquote { border-left: 3px solid #e5e7eb; margin: 8px 0; padding-left: 12px; color: #6b7280; }
            pre, code { font-family: monospace; font-size: 13px; background: #f3f4f6; padding: 2px 4px; border-radius: 3px; }
        </style></head><body>${content}</body></html>`
        return (
            <iframe
                srcDoc={srcDoc}
                sandbox="allow-same-origin"
                className="w-full border-0 rounded"
                style={{ height }}
                onLoad={handleLoad}
                title="Contenu du message"
            />
        )
    }

    return <div className="whitespace-pre-wrap text-sm leading-relaxed">{content}</div>
}

// ── Composant principal ────────────────────────────────────────────────────

interface MailDisplayProps {
    mail: Mail | null
    onMoveTo: (id: string, folder: MailFolder) => void
    onReply: () => void
    onForward: (subject: string, body: string) => void
    onSent: () => void
}

export function MailDisplay({ mail, onMoveTo, onReply, onForward, onSent }: MailDisplayProps) {
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [replyOpen, setReplyOpen] = useState(false)
    const [replyBody, setReplyBody] = useState('')
    const [sending, setSending] = useState(false)
    const [collapsedMessages, setCollapsedMessages] = useState<Set<string>>(new Set())

    if (!mail) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground select-none">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                    <MailIcon className="w-6 h-6 opacity-30" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Aucun message sélectionné</p>
                    <p className="text-xs opacity-60">Cliquez sur un message pour le lire</p>
                </div>
                <div className="text-[10px] text-muted-foreground/50 mt-4 text-center leading-5">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded">J/K</span> naviguer ·{' '}
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded">C</span> composer
                </div>
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
            toast.success('Message déplacé dans la corbeille')
        }
    }

    function handleArchive() {
        onMoveTo(mail!.id, 'archived')
        toast.success('Message archivé')
    }

    function handleForwardClick() {
        const date = format(new Date(mail!.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })
        const quotedBody = [
            '',
            '',
            '---------- Message transféré ----------',
            `De : ${mail!.from.name} <${mail!.from.email}>`,
            `Date : ${date}`,
            `Objet : ${mail!.subject}`,
            `À : ${mail!.to.map((t) => t.email).join(', ')}`,
            '',
            mail!.body,
        ].join('\n')
        const subject = mail!.subject.startsWith('Fwd: ') ? mail!.subject : `Fwd: ${mail!.subject}`
        onForward(subject, quotedBody)
    }

    function toggleCollapse(id: string) {
        setCollapsedMessages((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
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

    const threadCount = messages.length

    return (
        <>
            {/* Confirm suppression définitive */}
            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer définitivement</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Ce message sera supprimé définitivement et ne pourra pas être récupéré.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Annuler</Button>
                        <Button
                            variant="destructive" size="sm"
                            onClick={() => { setConfirmDelete(false); onMoveTo(mail!.id, 'trash'); toast.success('Message supprimé') }}
                        >
                            Supprimer définitivement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex h-full flex-col">
                {/* ── Toolbar ── */}
                <div className="flex items-center gap-0.5 border-b px-2 py-1.5 shrink-0 bg-card">
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReplyOpen(true)}>
                                <Reply className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><span className="font-medium">R</span> · Répondre</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleForwardClick}>
                                <Forward className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><span className="font-medium">F</span> · Transférer</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-1 h-5" />

                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleArchive}>
                                <Archive className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><span className="font-medium">E</span> · Archiver</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="ghost" size="icon"
                                className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                                onClick={handleTrash}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {mail.folder === 'trash'
                                ? <><span className="font-medium">#</span> · Supprimer définitivement</>
                                : <><span className="font-medium">#</span> · Corbeille</>}
                        </TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-1 h-5" />

                    {/* Déplacer vers */}
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoveRight className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'inbox')}>
                                Déplacer dans Boîte de réception
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'sent')}>
                                Déplacer dans Envoyés
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'archived')}>
                                Déplacer dans Archivés
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'drafts')}>
                                Mettre en brouillon
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Actions supplémentaires */}
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setReplyOpen(true) }}>
                                <Reply className="h-4 w-4 mr-2" /> Répondre
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleForwardClick}>
                                <Forward className="h-4 w-4 mr-2" /> Transférer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'inbox')}>
                                <MailOpen className="h-4 w-4 mr-2" /> Marquer non lu
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* ── En-tête sujet + expéditeur ── */}
                <div className="px-5 pt-4 pb-3 border-b shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="text-base font-semibold leading-snug flex-1">{mail.subject}</h2>
                        {threadCount > 1 && (
                            <span className="shrink-0 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                                {threadCount} messages
                            </span>
                        )}
                    </div>

                    <div className="mt-3 flex items-start gap-2.5">
                        <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                            <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm">{mail.from.name}</span>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <ContactIcon className="h-3 w-3" />
                                    {mail.from.email}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-xs text-muted-foreground">
                                    À : {mail.to.map((t) => t.name).join(', ')}
                                </span>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <span className="text-xs text-muted-foreground ml-auto tabular-nums cursor-default">
                                            {formatDistanceToNow(new Date(mail.date), { addSuffix: true, locale: fr })}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {format(new Date(mail.date), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                                    </TooltipContent>
                                </Tooltip>
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

                {/* ── Thread ── */}
                <ScrollArea className="flex-1">
                    <div className="px-5 py-4 space-y-4">
                        {messages.map((msg, i) => {
                            const isOutbound = msg.author_type === 'USER'
                            const isCollapsed = collapsedMessages.has(msg.id)
                            const isLast = i === messages.length - 1
                            const showCollapseToggle = !isLast && messages.length > 2

                            return (
                                <div key={msg.id}>
                                    {showCollapseToggle && isCollapsed ? (
                                        <button
                                            onClick={() => toggleCollapse(msg.id)}
                                            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full py-1"
                                        >
                                            <div className="flex-1 h-px bg-border" />
                                            <ChevronDown className="w-3 h-3" />
                                            <span>Message précédent</span>
                                            <ChevronDown className="w-3 h-3" />
                                            <div className="flex-1 h-px bg-border" />
                                        </button>
                                    ) : (
                                        <MessageBubble
                                            message={msg}
                                            fromName={mail.from.name}
                                            isOutbound={isOutbound}
                                            onCollapse={showCollapseToggle ? () => toggleCollapse(msg.id) : undefined}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Pièces jointes */}
                    {mail.attachments && mail.attachments.length > 0 && (
                        <div className="px-5 pb-4">
                            <Separator className="mb-3" />
                            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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

                {/* ── Zone de réponse rapide ── */}
                {replyOpen ? (
                    <div className="border-t px-4 py-3 space-y-2 shrink-0 bg-card shadow-[0_-1px_0_0_hsl(var(--border))]">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">
                                Répondre à <span className="text-foreground font-semibold">{mail.from.name}</span>
                            </p>
                            <button
                                onClick={() => { setReplyOpen(false); setReplyBody('') }}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleQuickReply()
                                if (e.key === 'Escape') { setReplyOpen(false); setReplyBody('') }
                            }}
                        />
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] text-muted-foreground">⌘ + Entrée pour envoyer · Échap pour annuler</p>
                            <Button size="sm" disabled={!replyBody.trim() || sending} onClick={handleQuickReply}>
                                <Send className="h-3.5 w-3.5 mr-1.5" />
                                {sending ? 'Envoi...' : 'Envoyer'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="border-t px-4 py-3 shrink-0 bg-card">
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

// ── Bulle de message ───────────────────────────────────────────────────────

function MessageBubble({
    message,
    fromName,
    isOutbound,
    onCollapse,
}: {
    message: MailMessage
    fromName: string
    isOutbound: boolean
    onCollapse?: () => void
}) {
    const initials = isOutbound
        ? 'ERA'
        : fromName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className={cn('flex gap-2.5', isOutbound ? 'flex-row-reverse' : 'flex-row')}>
            <Avatar className="h-7 w-7 shrink-0 mt-1">
                <AvatarFallback className="text-[10px] font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className={cn('max-w-[78%] space-y-1', isOutbound ? 'items-end' : 'items-start', 'flex flex-col')}>
                <div
                    className={cn(
                        'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        isOutbound
                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                            : 'bg-muted text-foreground rounded-tl-sm'
                    )}
                >
                    <EmailBody content={message.contenu} />
                </div>
                <div className={cn('flex items-center gap-2 px-1', isOutbound ? 'flex-row-reverse' : 'flex-row')}>
                    <p className="text-[10px] text-muted-foreground">
                        {isOutbound ? 'Vous' : fromName} · {format(new Date(message.createdAt), "d MMM 'à' HH:mm", { locale: fr })}
                    </p>
                    {onCollapse && (
                        <button
                            onClick={onCollapse}
                            className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        >
                            <ChevronUp className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
