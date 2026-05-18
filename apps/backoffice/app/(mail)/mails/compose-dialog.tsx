'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { KeyboardEvent, ChangeEvent } from 'react'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Send, X, ChevronDown, Paperclip, Bold, Italic, Underline, List, Save } from 'lucide-react'
import { toast } from 'sonner'
import { sendMailAction, saveDraftAction } from './actions'
import type { ContactType } from './mail-data'
import { cn } from '@conciergerie/ui'

// ── Chip input pour les destinataires ──────────────────────────────────────

function RecipientChips({
    recipients,
    onChange,
    placeholder,
    autoFocus,
}: {
    recipients: string[]
    onChange: (r: string[]) => void
    placeholder: string
    autoFocus?: boolean
}) {
    const [input, setInput] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (autoFocus) inputRef.current?.focus()
    }, [autoFocus])

    function add(raw: string) {
        const emails = raw.split(/[,;\s]+/).map((e) => e.trim()).filter((e) => e.includes('@'))
        if (emails.length === 0) return
        const next = [...new Set([...recipients, ...emails])]
        onChange(next)
        setInput('')
    }

    function remove(email: string) {
        onChange(recipients.filter((r) => r !== email))
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if ((e.key === 'Enter' || e.key === ',' || e.key === 'Tab') && input.trim()) {
            e.preventDefault()
            add(input)
        } else if (e.key === 'Backspace' && !input && recipients.length > 0) {
            onChange(recipients.slice(0, -1))
        }
    }

    function handlePaste(e: React.ClipboardEvent) {
        e.preventDefault()
        add(e.clipboardData.getData('text'))
    }

    return (
        <div
            className="flex flex-wrap gap-1 min-h-[34px] px-2 py-1.5 border rounded-md bg-background cursor-text focus-within:ring-1 focus-within:ring-ring transition-shadow"
            onClick={() => inputRef.current?.focus()}
        >
            {recipients.map((email) => (
                <span
                    key={email}
                    className="flex items-center gap-1 bg-muted rounded-full px-2 py-0.5 text-xs font-medium shrink-0"
                >
                    {email}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); remove(email) }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-2.5 h-2.5" />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={() => { if (input.trim()) add(input) }}
                placeholder={recipients.length === 0 ? placeholder : ''}
                className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
        </div>
    )
}

// ── Éditeur riche ──────────────────────────────────────────────────────────

function RichEditor({
    editorRef,
    onInput,
    onKeyDown,
}: {
    editorRef: React.RefObject<HTMLDivElement>
    onInput: () => void
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
}) {
    function fmt(cmd: string, val?: string) {
        document.execCommand(cmd, false, val ?? undefined)
        editorRef.current?.focus()
    }

    return (
        <div className="border border-input rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring transition-shadow">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 border-b border-input bg-muted/40 px-1.5 py-1">
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); fmt('bold') }}
                    className="p-1.5 rounded hover:bg-accent transition-colors"
                    title="Gras (Ctrl+B)"
                >
                    <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); fmt('italic') }}
                    className="p-1.5 rounded hover:bg-accent transition-colors"
                    title="Italique (Ctrl+I)"
                >
                    <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); fmt('underline') }}
                    className="p-1.5 rounded hover:bg-accent transition-colors"
                    title="Souligné (Ctrl+U)"
                >
                    <Underline className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-border mx-1" />
                <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); fmt('insertUnorderedList') }}
                    className="p-1.5 rounded hover:bg-accent transition-colors"
                    title="Liste à puces"
                >
                    <List className="w-3.5 h-3.5" />
                </button>
            </div>
            {/* Zone d'édition */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={onInput}
                onKeyDown={onKeyDown}
                className="min-h-[180px] max-h-[280px] overflow-y-auto px-3 py-2 text-sm outline-none bg-background [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline"
                data-placeholder="Votre message..."
            />
        </div>
    )
}

// ── Dialog principal ────────────────────────────────────────────────────────

export type ComposeMode = 'compose' | 'reply' | 'forward'

interface ComposeDialogProps {
    open: boolean
    onClose: () => void
    mode?: ComposeMode
    defaultTo?: string | string[]
    defaultSubject?: string
    defaultBody?: string
    replyToThreadId?: string
}

export function ComposeDialog({
    open,
    onClose,
    mode = 'compose',
    defaultTo = '',
    defaultSubject = '',
    defaultBody = '',
    replyToThreadId,
}: ComposeDialogProps) {
    const [to, setTo] = useState<string[]>([])
    const [cc, setCc] = useState<string[]>([])
    const [showCc, setShowCc] = useState(false)
    const [subject, setSubject] = useState('')
    const [contactType, setContactType] = useState<ContactType>('autre')
    const [attachments, setAttachments] = useState<Array<{ filename: string; content: string; contentType: string; size: number }>>([])
    const [sending, setSending] = useState(false)
    const [savingDraft, setSavingDraft] = useState(false)
    const [hasBodyContent, setHasBodyContent] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const editorRef = useRef<HTMLDivElement>(null)
    // Track the open→closed transition to init fields only once per open
    const wasOpenRef = useRef(false)

    useEffect(() => {
        // Only initialize when dialog transitions from closed to open
        if (!open) {
            wasOpenRef.current = false
            return
        }
        if (wasOpenRef.current) return  // already initialized, user is typing — don't reset
        wasOpenRef.current = true

        const initialTo = Array.isArray(defaultTo) ? defaultTo : defaultTo ? [defaultTo] : []
        setTo(initialTo)
        setCc([])
        setShowCc(false)
        setSubject(defaultSubject)
        setAttachments([])
        setSending(false)
        setHasBodyContent(!!defaultBody?.trim())
        requestAnimationFrame(() => {
            if (editorRef.current) {
                editorRef.current.innerHTML = defaultBody || ''
                setHasBodyContent(!!editorRef.current.textContent?.trim())
            }
        })
    }, [open, defaultTo, defaultSubject, defaultBody])

    const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        const loaded = await Promise.all(files.map((file) => new Promise<{ filename: string; content: string; contentType: string; size: number }>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const base64 = (reader.result as string).split(',')[1]
                resolve({ filename: file.name, content: base64, contentType: file.type || 'application/octet-stream', size: file.size })
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })))
        setAttachments((prev) => [...prev, ...loaded])
        if (fileInputRef.current) fileInputRef.current.value = ''
    }, [])

    function getBodyHtml(): string {
        return editorRef.current?.innerHTML ?? ''
    }

    const canSend = to.length > 0 && subject.trim() && hasBodyContent && !sending

    async function handleSend() {
        if (!canSend) return
        setSending(true)
        const htmlBody = getBodyHtml()
        try {
            for (const recipient of to) {
                await sendMailAction({
                    to: recipient,
                    toName: recipient,
                    subject,
                    body: htmlBody,
                    contactType,
                    replyToThreadId,
                    attachments: attachments.length > 0 ? attachments : undefined,
                })
            }
            if (cc.length > 0) {
                for (const recipient of cc) {
                    await sendMailAction({
                        to: recipient,
                        toName: recipient,
                        subject,
                        body: htmlBody + '\n\n[Copie]',
                        contactType,
                    })
                }
            }
            toast.success(to.length + cc.length > 1
                ? `Message envoyé à ${to.length + cc.length} destinataires`
                : 'Message envoyé')
            onClose()
        } catch {
            toast.error("Erreur lors de l'envoi")
        } finally {
            setSending(false)
        }
    }

    async function handleSaveDraft() {
        const htmlBody = getBodyHtml()
        if (!subject.trim() && !editorRef.current?.textContent?.trim()) return
        setSavingDraft(true)
        try {
            await saveDraftAction({ to, subject, body: htmlBody, contactType })
            toast.success('Brouillon enregistré')
            onClose()
        } catch {
            toast.error("Erreur lors de la sauvegarde")
        } finally {
            setSavingDraft(false)
        }
    }

    const title = mode === 'reply' ? 'Répondre' : mode === 'forward' ? 'Transférer' : 'Nouveau message'

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2.5 py-1">
                    {/* À */}
                    <div className="grid grid-cols-[48px_1fr_auto] items-start gap-2">
                        <span className="text-right text-sm text-muted-foreground pt-1.5">À</span>
                        <RecipientChips
                            recipients={to}
                            onChange={setTo}
                            placeholder="destinataire@email.com — Entrée pour ajouter"
                            autoFocus={open && to.length === 0}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCc((v) => !v)}
                            className={cn(
                                'text-xs text-muted-foreground hover:text-foreground transition-colors pt-1.5 select-none',
                                showCc && 'text-foreground'
                            )}
                        >
                            Cc <ChevronDown className={cn('inline w-3 h-3 transition-transform', showCc && 'rotate-180')} />
                        </button>
                    </div>

                    {/* CC */}
                    {showCc && (
                        <div className="grid grid-cols-[48px_1fr_auto] items-start gap-2">
                            <span className="text-right text-sm text-muted-foreground pt-1.5">Cc</span>
                            <RecipientChips
                                recipients={cc}
                                onChange={setCc}
                                placeholder="copie@email.com"
                            />
                            <div className="w-10" />
                        </div>
                    )}

                    {/* Sujet */}
                    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-2">
                        <span className="text-right text-sm text-muted-foreground">Sujet</span>
                        <input
                            className="col-span-2 h-8 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
                            placeholder="Objet du message"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    {/* Type de contact */}
                    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-2">
                        <span className="text-right text-sm text-muted-foreground">Type</span>
                        <Select value={contactType} onValueChange={(v) => setContactType(v as ContactType)}>
                            <SelectTrigger className="h-8">
                                <SelectValue placeholder="Type de contact" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="proprietaire">Propriétaire</SelectItem>
                                <SelectItem value="voyageur">Voyageur</SelectItem>
                                <SelectItem value="prestataire">Prestataire</SelectItem>
                                <SelectItem value="autre">Autre</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="w-10" />
                    </div>

                    {/* Éditeur riche */}
                    <RichEditor
                        editorRef={editorRef}
                        onInput={() => setHasBodyContent(!!editorRef.current?.textContent?.trim())}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend()
                        }}
                    />

                    {/* Pièces jointes */}
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {attachments.map((att, i) => (
                                <span key={i} className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1 text-xs">
                                    <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
                                    <span className="truncate max-w-[180px]">{att.filename}</span>
                                    <span className="text-muted-foreground">
                                        {att.size < 1024 * 1024 ? `${Math.round(att.size / 1024)} Ko` : `${(att.size / 1024 / 1024).toFixed(1)} Mo`}
                                    </span>
                                    <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-[10px] text-muted-foreground text-right">⌘ + Entrée pour envoyer</p>
                </div>

                <DialogFooter className="gap-2">
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} type="button">
                        <Paperclip className="mr-2 h-4 w-4" />
                        Joindre
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSaveDraft} disabled={savingDraft} type="button">
                        <Save className="mr-2 h-4 w-4" />
                        {savingDraft ? 'Enregistrement...' : 'Brouillon'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="mr-2 h-4 w-4" />
                        Annuler
                    </Button>
                    <Button size="sm" onClick={handleSend} disabled={!canSend || sending}>
                        <Send className="mr-2 h-4 w-4" />
                        {sending ? 'Envoi...' : to.length + cc.length > 1
                            ? `Envoyer (${to.length + cc.length})`
                            : 'Envoyer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
