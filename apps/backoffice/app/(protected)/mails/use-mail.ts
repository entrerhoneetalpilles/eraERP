'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchThreadsAction, markAsReadAction, moveThreadAction, deleteThreadAction } from './actions'
import type { Mail, MailFolder, ContactType } from './mail-data'

const POLL_INTERVAL = 15_000

export function useMail(initialMails: Mail[], initialFolder: MailFolder = 'inbox') {
    const [folder, setFolderState] = useState<MailFolder>(initialFolder)
    const [mails, setMails] = useState<Mail[]>(initialMails)
    const [selectedId, setSelectedId] = useState<string | null>(initialMails[0]?.id ?? null)
    const [contactFilter, setContactFilter] = useState<ContactType | 'all'>('all')
    const [search, setSearch] = useState('')
    const [composeOpen, setComposeOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const folderRef = useRef(folder)
    folderRef.current = folder

    const loadMails = useCallback(async (f: MailFolder, ct?: ContactType | 'all') => {
        setLoading(true)
        try {
            const fresh = await fetchThreadsAction(f, ct)
            setMails(fresh)
        } catch (e) {
            console.error('[useMail] fetch error', e)
        } finally {
            setLoading(false)
        }
    }, [])

    // Change folder
    useEffect(() => {
        setSelectedId(null)
        setContactFilter('all')
        setSearch('')
        loadMails(folder, 'all')
    }, [folder, loadMails])

    // Poll
    useEffect(() => {
        const id = setInterval(() => {
            loadMails(folderRef.current, contactFilter)
        }, POLL_INTERVAL)
        return () => clearInterval(id)
    }, [loadMails, contactFilter])  // Ajout contactFilter

    // Filter change
    useEffect(() => {
        loadMails(folder, contactFilter)
    }, [contactFilter, folder, loadMails])

    // Filtered mails (CORRIGÉ : inclut contactFilter)
    const filtered = mails.filter((m) => {
        const matchSearch =
            search === '' ||
            m.subject.toLowerCase().includes(search.toLowerCase()) ||
            m.from.name.toLowerCase().includes(search.toLowerCase()) ||
            m.preview.toLowerCase().includes(search.toLowerCase())
        const matchFilter = contactFilter === 'all' || m.contactType === contactFilter
        return matchSearch && matchFilter  // CORRIGÉ : && matchFilter
    })

    const selected = mails.find((m) => m.id === selectedId) ?? null
    const unreadCount = (f: MailFolder) => mails.filter((m) => m.folder === f && !m.read).length

    async function selectMail(id: string) {
        setSelectedId(id)
        const mail = mails.find((m) => m.id === id)
        if (mail && !mail.read) {
            setMails((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
            await markAsReadAction(id)
        }
    }

    async function moveTo(id: string, target: MailFolder) {
        const mail = mails.find((m) => m.id === id)
        setMails((prev) => prev.filter((m) => m.id !== id))
        if (selectedId === id) setSelectedId(null)

        if (mail?.folder === 'trash' && target === 'trash') {
            await deleteThreadAction(id)
        } else {
            await moveThreadAction(id, target)
        }
        // Auto-switch to target folder
        if (target !== folder) {
            setFolderState(target)
        }
    }

    const setFolder = (f: MailFolder) => setFolderState(f)

    const refresh = () => loadMails(folder, contactFilter)

    return {
        mails: filtered,  // Retourne filtered (avec contactFilter)
        selected,
        selectedId,
        folder,
        contactFilter,
        search,
        composeOpen,
        loading,
        unreadCount,
        setFolder,
        setContactFilter,
        setSearch,
        setComposeOpen,
        selectMail,
        moveTo,
        refresh,
    }
}