'use client'

import { useState, useEffect } from 'react'
import { MailNav } from './mail-nav'
import { MailList } from './mail-list'
import { MailDisplay } from './mail-display'
import { ComposeDialog } from './compose-dialog'
import type { ComposeMode } from './compose-dialog'
import { useMail } from './use-mail'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Mail, MailFolder } from './mail-data'

interface MailClientProps {
    initialMails: Mail[]
    currentFolder: MailFolder
}

type MobilePanel = 'nav' | 'list' | 'detail'

interface ComposeState {
    open: boolean
    mode: ComposeMode
    defaultTo: string | string[]
    defaultSubject: string
    defaultBody: string
    replyToThreadId?: string
}

const DEFAULT_COMPOSE: ComposeState = {
    open: false,
    mode: 'compose',
    defaultTo: '',
    defaultSubject: '',
    defaultBody: '',
}

export function MailClient({ initialMails, currentFolder }: MailClientProps) {
    const {
        mails, selected, selectedId,
        bulkSelected, folder, contactFilter, search, loading, unreadCount,
        setFolder, setContactFilter, setSearch,
        selectMail, moveTo, refresh, refreshSelectedMail,
        toggleBulkSelect, selectAll, clearBulkSelection,
        bulkMoveTo, bulkMarkRead,
    } = useMail(initialMails, currentFolder)

    const [mobilePanel, setMobilePanel] = useState<MobilePanel>('list')
    const [compose, setCompose] = useState<ComposeState>(DEFAULT_COMPOSE)

    function openCompose(overrides: Partial<ComposeState> = {}) {
        setCompose({ ...DEFAULT_COMPOSE, open: true, ...overrides })
    }

    function closeCompose() {
        setCompose((prev) => ({ ...prev, open: false }))
        refresh()
    }

    function handleSelectMail(id: string) {
        selectMail(id)
        setMobilePanel('detail')
    }

    function handleFolderChange(f: MailFolder) {
        setFolder(f)
        setMobilePanel('list')
    }

    function handleReply() {
        if (!selected) return
        openCompose({
            mode: 'reply',
            defaultTo: selected.from.email,
            defaultSubject: selected.subject.startsWith('Re: ') ? selected.subject : `Re: ${selected.subject}`,
            replyToThreadId: selected.id,
        })
    }

    function handleForward(subject: string, body: string) {
        openCompose({ mode: 'forward', defaultSubject: subject, defaultBody: body })
    }

    // ── Raccourcis clavier globaux ──
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            const tag = (e.target as HTMLElement).tagName
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
            if (e.metaKey || e.ctrlKey || e.altKey) return

            const mailIds = mails.map((m) => m.id)
            const currentIdx = selectedId ? mailIds.indexOf(selectedId) : -1

            switch (e.key) {
                case 'c': case 'n':
                    e.preventDefault(); openCompose(); break
                case 'r':
                    if (selected) { e.preventDefault(); handleReply() } break
                case 'f':
                    if (selected) {
                        e.preventDefault()
                        const quotedBody = `\n\n\n---------- Message transféré ----------\nDe : ${selected.from.name} <${selected.from.email}>\n\n${selected.body}`
                        handleForward(`Fwd: ${selected.subject}`, quotedBody)
                    }
                    break
                case 'e': case 'a':
                    if (selected) { e.preventDefault(); moveTo(selected.id, 'archived') } break
                case '#':
                    if (selected) { e.preventDefault(); moveTo(selected.id, 'trash') } break
                case 'j': case 'ArrowDown':
                    if (mailIds.length > 0) {
                        e.preventDefault()
                        const next = currentIdx < mailIds.length - 1 ? currentIdx + 1 : 0
                        selectMail(mailIds[next])
                    }
                    break
                case 'k': case 'ArrowUp':
                    if (mailIds.length > 0) {
                        e.preventDefault()
                        const prev = currentIdx > 0 ? currentIdx - 1 : mailIds.length - 1
                        selectMail(mailIds[prev])
                    }
                    break
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [mails, selectedId, selected, moveTo, selectMail])

    const sharedListProps = {
        mails,
        selectedId,
        bulkSelected,
        search,
        onSearch: setSearch,
        onToggleBulk: toggleBulkSelect,
        onSelectAll: selectAll,
        onClearSelection: clearBulkSelection,
        onBulkMoveTo: bulkMoveTo,
        onBulkMarkRead: bulkMarkRead,
    }

    return (
        <>
            {/* ── Desktop : 3-panel ── */}
            <div className="hidden md:flex border-t bg-card overflow-hidden h-[calc(100vh-3rem)]">
                <div className="w-52 shrink-0 border-r overflow-y-auto bg-card">
                    <MailNav
                        folder={folder}
                        contactFilter={contactFilter}
                        unreadCount={unreadCount}
                        onFolderChange={handleFolderChange}
                        onContactFilterChange={setContactFilter}
                        onCompose={() => openCompose()}
                    />
                </div>

                <div className="w-80 shrink-0 border-r overflow-hidden">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Chargement...
                        </div>
                    ) : (
                        <MailList {...sharedListProps} onSelect={selectMail} />
                    )}
                </div>

                <div className="flex-1 overflow-hidden">
                    <MailDisplay
                        mail={selected}
                        onMoveTo={moveTo}
                        onReply={handleReply}
                        onForward={handleForward}
                        onSent={() => selected && refreshSelectedMail(selected.id)}
                    />
                </div>
            </div>

            {/* ── Mobile : stacked ── */}
            <div className="md:hidden flex flex-col bg-card overflow-hidden" style={{ height: 'calc(100svh - 3rem)' }}>
                {mobilePanel === 'nav' && (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-sm" onClick={() => setMobilePanel('list')}>
                                <ArrowLeft className="w-4 h-4" />
                                Retour
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <MailNav
                                folder={folder}
                                contactFilter={contactFilter}
                                unreadCount={unreadCount}
                                onFolderChange={(f) => { handleFolderChange(f); setMobilePanel('list') }}
                                onContactFilterChange={(c) => { setContactFilter(c); setMobilePanel('list') }}
                                onCompose={() => { openCompose(); setMobilePanel('list') }}
                            />
                        </div>
                    </div>
                )}

                {mobilePanel === 'list' && (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
                            <button onClick={() => setMobilePanel('nav')} className="text-sm font-medium text-primary">
                                Dossiers
                            </button>
                            <span className="text-xs text-muted-foreground font-medium capitalize">
                                {FOLDER_LABELS[folder]}
                            </span>
                            <button onClick={() => openCompose()} className="text-sm font-medium text-primary">
                                Nouveau
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {loading ? (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    Chargement...
                                </div>
                            ) : (
                                <MailList {...sharedListProps} onSelect={handleSelectMail} />
                            )}
                        </div>
                    </div>
                )}

                {mobilePanel === 'detail' && (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
                            <Button variant="ghost" size="sm" className="gap-1.5 text-sm" onClick={() => setMobilePanel('list')}>
                                <ArrowLeft className="w-4 h-4" />
                                {FOLDER_LABELS[folder]}
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <MailDisplay
                                mail={selected}
                                onMoveTo={(id, f) => { moveTo(id, f); setMobilePanel('list') }}
                                onReply={handleReply}
                                onForward={handleForward}
                                onSent={() => selected && refreshSelectedMail(selected.id)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <ComposeDialog
                open={compose.open}
                onClose={closeCompose}
                mode={compose.mode}
                defaultTo={compose.defaultTo}
                defaultSubject={compose.defaultSubject}
                defaultBody={compose.defaultBody}
                replyToThreadId={compose.replyToThreadId}
            />
        </>
    )
}

const FOLDER_LABELS: Record<string, string> = {
    inbox: 'Boîte de réception',
    sent: 'Envoyés',
    drafts: 'Brouillons',
    archived: 'Archivés',
    trash: 'Corbeille',
}
