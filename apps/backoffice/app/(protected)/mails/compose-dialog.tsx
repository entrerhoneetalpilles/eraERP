'use client'

import { useState } from 'react'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@conciergerie/ui'
import { Label } from '@conciergerie/ui'
import { Textarea } from '@/components/ui/textarea'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Send, X } from 'lucide-react'
import { toast } from 'sonner'
import { sendMailAction } from './actions'
import type { ContactType } from './mail-data'

interface ComposeDialogProps {
    open: boolean
    onClose: () => void
    defaultTo?: string
    defaultSubject?: string
}

export function ComposeDialog({ open, onClose, defaultTo = '', defaultSubject = '' }: ComposeDialogProps) {
    const [to, setTo] = useState(defaultTo)
    const [subject, setSubject] = useState(defaultSubject)
    const [body, setBody] = useState('')
    const [contactType, setContactType] = useState<string>('')
    const [sending, setSending] = useState(false)

    async function handleSend() {
        if (!to || !subject || !body) return
        setSending(true)
        try {
            await sendMailAction({
                to,
                toName: to,
                subject,
                body,
                contactType: (contactType as ContactType) || 'autre',
            })
            toast.success('Message envoyé')
            onClose()
            setTo('')
            setSubject('')
            setBody('')
            setContactType('')
        } catch (error) {
            toast.error('Erreur lors de l\'envoi')
            console.error(error)
        } finally {
            setSending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Nouveau message
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-2">
                    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                        <Label className="text-right text-sm text-muted-foreground">À</Label>
                        <Input
                            placeholder="destinataire@email.com"
                            value={to}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
                            className="h-8"
                        />
                    </div>

                    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                        <Label className="text-right text-sm text-muted-foreground">Sujet</Label>
                        <Input
                            placeholder="Objet du message"
                            value={subject}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                            className="h-8"
                        />
                    </div>

                    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                        <Label className="text-right text-sm text-muted-foreground">Type</Label>
                        <Select
                            value={contactType}
                            onValueChange={(value: string | null) => {
                                if (value !== null) setContactType(value)
                            }}
                        >
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
                    </div>

                    <Textarea
                        placeholder="Votre message..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="min-h-[200px] resize-none"
                    />
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="mr-2 h-4 w-4" />
                        Annuler
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSend}
                        disabled={!to || !subject || !body || sending}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        {sending ? 'Envoi...' : 'Envoyer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}