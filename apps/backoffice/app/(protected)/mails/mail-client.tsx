'use client'

import { useState } from 'react'
import { MailNav } from './mail-nav'
import { MailList } from './mail-list'
import { MailDisplay } from './mail-display'
import { ComposeDialog } from './compose-dialog'
import { useMail } from './use-mail'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Mail, MailFolder } from './mail-data'

interface MailClientProps {
    initialMails: Mail[]
    currentFolder: MailFolder
}

type MobilePanel = 'nav' | 'list' | 'detail'

export function MailClient({ initialMails, currentFolder }: MailClientProps) {
    const {
        mails, selected, selectedId,
        folder, contactFilter, search, composeOpen,
        loading, unreadCount,
        setFolder, setContactFilter, setSearch,
        setComposeOpen, selectMail, moveTo, refresh,
    } = useMail(initialMails, currentFolder)

    // Mobile panel navigation
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>('list')

    function handleSelectMail(id: string) {
        selectMail(id)
        setMobilePanel('detail')
    }

    function handleFolderChange(f: MailFolder) {
        setFolder(f)
        setMobilePanel('list')
    }

    function handleCompose() {
        setComposeOpen(true)
    }

    return (
        <>
            {/* ── Desktop : 3-panel layout ── */}
            <div className="hidden md:flex rounded-lg border bg-card overflow-hidden h-[calc(100vh-10rem)]">
                {/* Panneau gauche — Navigation */}
                <div className="w-52 shrink-0 border-r overflow-y-auto bg-card">
                    <MailNav
                        folder={folder}
                        contactFilter={contactFilter}
                        unreadCount={unreadCount}
                        onFolderChange={handleFolderChange}
                        onContactFilterChange={setContactFilter}
                        onCompose={handleCompose}
                    />
                </div>

                {/* Panneau central — Liste */}
                <div className="w-72 shrink-0 border-r overflow-hidden">
                    {loading ? (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Chargement...
                        </div>
                    ) : (
                        <MailList
                            mails={mails}
                            selectedId={selectedId}
                            search={search}
                            onSelect={selectMail}
                            onSearch={setSearch}
                        />
                    )}
                </div>

                {/* Panneau droit — Détail */}
                <div className="flex-1 overflow-hidden">
                    <MailDisplay
                        mail={selected}
                        onMoveTo={moveTo}
                        onReply={() => setComposeOpen(true)}
                    />
                </div>
            </div>

            {/* ── Mobile : stacked panels ── */}
            <div className="md:hidden flex flex-col rounded-lg border bg-card overflow-hidden" style={{ height: 'calc(100svh - 8rem)' }}>

                {/* Panel: nav (dossiers) */}
                {mobilePanel === 'nav' && (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-sm"
                                onClick={() => setMobilePanel('list')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Retour
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <MailNav
                                folder={folder}
                                contactFilter={contactFilter}
                                unreadCount={unreadCount}
                                onFolderChange={handleFolderChange}
                                onContactFilterChange={(c) => {
                                    setContactFilter(c)
                                    setMobilePanel('list')
                                }}
                                onCompose={() => {
                                    handleCompose()
                                    setMobilePanel('list')
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Panel: liste */}
                {mobilePanel === 'list' && (
                    <div className="flex flex-col h-full">
                        {/* Toolbar mobile liste */}
                        <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
                            <button
                                onClick={() => setMobilePanel('nav')}
                                className="text-sm font-medium text-primary flex items-center gap-1"
                            >
                                Dossiers
                            </button>
                            <span className="text-xs text-muted-foreground font-medium capitalize">
                                {FOLDER_LABELS[folder]}
                            </span>
                            <button
                                onClick={handleCompose}
                                className="text-sm font-medium text-primary"
                            >
                                Nouveau
                            </button>
                        </div>
                        {/* Liste */}
                        <div className="flex-1 overflow-hidden">
                            {loading ? (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    Chargement...
                                </div>
                            ) : (
                                <MailList
                                    mails={mails}
                                    selectedId={selectedId}
                                    search={search}
                                    onSelect={handleSelectMail}
                                    onSearch={setSearch}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Panel: détail */}
                {mobilePanel === 'detail' && (
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-sm"
                                onClick={() => setMobilePanel('list')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {FOLDER_LABELS[folder]}
                            </Button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <MailDisplay
                                mail={selected}
                                onMoveTo={(id, f) => {
                                    moveTo(id, f)
                                    setMobilePanel('list')
                                }}
                                onReply={() => setComposeOpen(true)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <ComposeDialog
                open={composeOpen}
                onClose={() => {
                    setComposeOpen(false)
                    refresh()
                }}
                defaultTo={selected?.from.email ?? ''}
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
