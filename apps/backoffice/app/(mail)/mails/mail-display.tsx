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
    Paperclip, Send, ChevronDown, ChevronUp,
    Mail as MailIcon, MoveRight,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { sendMailAction } from './actions'
import type { Mail, MailFolder, MailMessage } from './mail-data'
import { cn } from '@conciergerie/ui'

// ── HTML sécurisé dans iframe sandboxée ───────────────────────────────────

function EmailBody({ content }: { content: string }) {
    const [height, setHeight] = useState(200)
    const isHtml = /<[a-z][\s\S]*>/i.test(content)

    const handleLoad = useCallback((e: React.SyntheticEvent<HTMLIFrameElement>) => {
        const iframe = e.currentTarget
        try {
            const body = iframe.contentDocument?.body
            if (body) setHeight(Math.max(body.scrollHeight + 32, 80))
        } catch {}
    }, [])

    if (isHtml) {
        const srcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
            * { box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                   font-size: 14px; line-height: 1.6; color: #1a1a1a;
                   margin: 0; padding: 0 0 8px 0; word-break: break-word; }
            a { color: #2563eb; }
            img { max-width: 100%; height: auto; }
            blockquote { border-left: 3px solid #e5e7eb; margin: 8px 0; padding-left: 12px; color: #6b7280; }
            pre, code { font-family: monospace; font-size: 13px; background: #f3f4f6; padding: 2px 4px; border-radius: 3px; }
        </style></head><body>${content}</body></html>`
        return (
            <iframe
                srcDoc={srcDoc}
                sandbox="allow-same-origin"
                className="w-full border-0"
                style={{ height }}
                onLoad={handleLoad}
                title="Contenu du message"
            />
        )
    }

    return <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{content}</div>
}

// ── Carte message style Gmail ──────────────────────────────────────────────

function MessageCard({
    message,
    mail,
    defaultExpanded,
}: {
    message: MailMessage
    mail: Mail
    defaultExpanded: boolean
}) {
    const [expanded, setExpanded] = useState(defaultExpanded)
    const [showDetails, setShowDetails] = useState(false)

    const isOutbound = message.author_type === 'USER'
    const senderName = isOutbound ? 'Entre Rhône et Alpilles' : mail.from.name
    const senderEmail = isOutbound ? 'contact@entre-rhone-alpilles.fr' : mail.from.email
    const initials = senderName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    const date = new Date(message.createdAt)

    return (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
            {/* Header — toujours visible */}
            <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
                onClick={() => setExpanded((v) => !v)}
            >
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold truncate">{senderName}</span>
                        {!expanded && (
                            <span className="text-xs text-muted-foreground truncate flex-1">
                                {message.contenu.replace(/<[^>]*>/g, '').slice(0, 80)}
                            </span>
                        )}
                    </div>
                    {expanded && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                                {senderEmail}
                            </span>
                            <button
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-1"
                                onClick={(e) => { e.stopPropagation(); setShowDetails((v) => !v) }}
                            >
                                {showDetails ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />}
                            </button>
                        </div>
                    )}
                </div>
                <div className="shrink-0 flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(date, { addSuffix: true, locale: fr })}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                        </TooltipContent>
                    </Tooltip>
                    {expanded
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    }
                </div>
            </button>

            {/* Détails expéditeur / destinataire */}
            {expanded && showDetails && (
                <div className="px-4 pb-2 text-xs text-muted-foreground space-y-0.5 border-t border-border/50 pt-2 bg-muted/20">
                    <div><span className="font-medium">De :</span> {senderName} &lt;{senderEmail}&gt;</div>
                    <div><span className="font-medium">À :</span> {mail.to.map((t) => `${t.name} <${t.email}>`).join(', ')}</div>
                    <div><span className="font-medium">Date :</span> {format(date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</div>
                    <div><span className="font-medium">Objet :</span> {mail.subject}</div>
                </div>
            )}

            {/* Corps du message */}
            {expanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border/50">
                    <EmailBody content={message.contenu} />
                </div>
            )}
        </div>
    )
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
        onForward(
            mail!.subject.startsWith('Fwd: ') ? mail!.subject : `Fwd: ${mail!.subject}`,
            quotedBody
        )
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

            <div className="flex h-full flex-col bg-background">
                {/* ── Toolbar ── */}
                <div className="flex items-center gap-0.5 border-b px-2 py-1.5 shrink-0 bg-card">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onReply}>
                                <Reply className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><span className="font-medium">R</span> · Répondre</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleForwardClick}>
                                <Forward className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><span className="font-medium">F</span> · Transférer</TooltipContent>
                    </Tooltip>

                    <Separator orientation="vertical" className="mx-1 h-5" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleArchive}>
                                <Archive className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent><span className="font-medium">E</span> · Archiver</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
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

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoveRight className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'inbox')}>Boîte de réception</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'sent')}>Envoyés</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'archived')}>Archivés</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onMoveTo(mail.id, 'drafts')}>Brouillons</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onReply}>
                                <Reply className="h-4 w-4 mr-2" /> Répondre
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleForwardClick}>
                                <Forward className="h-4 w-4 mr-2" /> Transférer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* ── Sujet ── */}
                <div className="px-6 pt-5 pb-3 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <h2 className="text-lg font-semibold leading-snug flex-1">{mail.subject}</h2>
                        {messages.length > 1 && (
                            <span className="shrink-0 text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 mt-1">
                                {messages.length} messages
                            </span>
                        )}
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
                    <div className="px-6 pb-4 space-y-2">
                        {messages.map((msg, i) => (
                            <MessageCard
                                key={msg.id}
                                message={msg}
                                mail={mail}
                                defaultExpanded={i === messages.length - 1}
                            />
                        ))}
                    </div>

                    {/* Pièces jointes */}
                    {mail.attachments && mail.attachments.length > 0 && (
                        <div className="px-6 pb-4">
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

                {/* ── Zone réponse rapide ── */}
                {replyOpen ? (
                    <div className="border-t px-4 py-3 space-y-2 shrink-0 bg-card">
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
                    <div className="border-t px-6 py-3 shrink-0 bg-card flex gap-2">
                        <Button
                            onClick={() => setReplyOpen(true)}
                            variant="outline"
                            className="gap-2 text-sm"
                            size="sm"
                        >
                            <Reply className="h-4 w-4" />
                            Répondre
                        </Button>
                        <Button
                            onClick={handleForwardClick}
                            variant="ghost"
                            className="gap-2 text-sm"
                            size="sm"
                        >
                            <Forward className="h-4 w-4" />
                            Transférer
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}
