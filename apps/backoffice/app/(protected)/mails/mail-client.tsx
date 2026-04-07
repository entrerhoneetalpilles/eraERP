'use client'

import { MailNav } from './mail-nav'
import { MailList } from './mail-list'
import { MailDisplay } from './mail-display'
import { ComposeDialog } from './compose-dialog'
import { useMail } from './use-mail'
import type { Mail, MailFolder } from './mail-data'

interface MailClientProps {
    initialMails: Mail[]
    currentFolder: MailFolder
}

export function MailClient({ initialMails, currentFolder }: MailClientProps) {
    const {
        mails, selected, selectedId,
        folder, contactFilter, search, composeOpen,
        loading, unreadCount,
        setFolder, setContactFilter, setSearch,
        setComposeOpen, selectMail, moveTo, refresh,
    } = useMail(initialMails, currentFolder)

    return (
        <>
            <div className="rounded-lg border bg-card overflow-hidden h-[calc(100vh-14rem)]">
                <div className="flex h-full">

                    {/* Panneau gauche — Navigation */}
                    <div className="w-52 shrink-0 border-r overflow-y-auto bg-card">
                        <MailNav
                            folder={folder}
                            contactFilter={contactFilter}
                            unreadCount={unreadCount}
                            onFolderChange={setFolder}
                            onContactFilterChange={setContactFilter}
                            onCompose={() => setComposeOpen(true)}
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