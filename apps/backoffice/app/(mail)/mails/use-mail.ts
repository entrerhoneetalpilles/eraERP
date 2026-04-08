'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
    fetchThreadsAction, fetchThreadAction,
    markAsReadAction, moveThreadAction, deleteThreadAction,
    bulkMoveAction, bulkDeleteAction, bulkMarkReadAction,
} from './actions'
import type { Mail, MailFolder, ContactType } from './mail-data'

const POLL_INTERVAL = 20_000

export function useMail(initialMails: Mail[], initialFolder: MailFolder = 'inbox') {
    const [folder, setFolderState] = useState<MailFolder>(initialFolder)
    const [mails, setMails] = useState<Mail[]>(initialMails)
    const [selectedId, setSelectedId] = useState<string | null>(initialMails[0]?.id ?? null)
    const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
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

    // Changement de dossier
    useEffect(() => {
        setSelectedId(null)
        setBulkSelected(new Set())
        setContactFilter('all')
        setSearch('')
        loadMails(folder, 'all')
    }, [folder, loadMails])

    // Polling silencieux
    useEffect(() => {
        const id = setInterval(() => {
            loadMails(folderRef.current, contactFilter)
        }, POLL_INTERVAL)
        return () => clearInterval(id)
    }, [loadMails, contactFilter])

    // Changement de filtre contact
    useEffect(() => {
        loadMails(folder, contactFilter)
    }, [contactFilter, folder, loadMails])

    // Filtrage local
    const filtered = mails.filter((m) => {
        const matchSearch =
            search === '' ||
            m.subject.toLowerCase().includes(search.toLowerCase()) ||
            m.from.name.toLowerCase().includes(search.toLowerCase()) ||
            m.preview.toLowerCase().includes(search.toLowerCase())
        const matchFilter = contactFilter === 'all' || m.contactType === contactFilter
        return matchSearch && matchFilter
    })

    const selected = mails.find((m) => m.id === selectedId) ?? null
    const unreadCount = (f: MailFolder) => mails.filter((m) => m.folder === f && !m.read).length

    // ── Actions unitaires ──────────────────────────────────────────────────

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
        const nextMails = mails.filter((m) => m.id !== id)
        setMails(nextMails)
        if (selectedId === id) {
            setSelectedId(nextMails.find((m) => m.id !== id)?.id ?? null)
        }
        if (mail?.folder === 'trash' && target === 'trash') {
            await deleteThreadAction(id)
        } else {
            await moveThreadAction(id, target)
        }
    }

    async function refreshSelectedMail(id: string) {
        try {
            const updated = await fetchThreadAction(id)
            if (updated) {
                setMails((prev) => prev.map((m) => (m.id === id ? updated : m)))
            }
        } catch (e) {
            console.error('[useMail] refresh thread error', e)
        }
    }

    // ── Multi-sélection ────────────────────────────────────────────────────

    const lastBulkRef = useRef<string | null>(null)

    function toggleBulkSelect(id: string, shiftKey?: boolean) {
        setBulkSelected((prev) => {
            const next = new Set(prev)
            if (shiftKey && lastBulkRef.current) {
                // Sélection en range
                const ids = filtered.map((m) => m.id)
                const a = ids.indexOf(lastBulkRef.current)
                const b = ids.indexOf(id)
                if (a !== -1 && b !== -1) {
                    const [from, to] = a < b ? [a, b] : [b, a]
                    for (let i = from; i <= to; i++) next.add(ids[i])
                    return next
                }
            }
            if (next.has(id)) next.delete(id)
            else next.add(id)
            lastBulkRef.current = id
            return next
        })
    }

    function selectAll() {
        setBulkSelected(new Set(filtered.map((m) => m.id)))
    }

    function clearBulkSelection() {
        setBulkSelected(new Set())
    }

    // ── Actions groupées ───────────────────────────────────────────────────

    async function bulkMoveTo(target: MailFolder) {
        const ids = [...bulkSelected]
        setMails((prev) => prev.filter((m) => !bulkSelected.has(m.id)))
        if (selectedId && bulkSelected.has(selectedId)) setSelectedId(null)
        setBulkSelected(new Set())

        const toDelete = ids.filter((id) => {
            const mail = mails.find((m) => m.id === id)
            return mail?.folder === 'trash' && target === 'trash'
        })
        const toMove = ids.filter((id) => !toDelete.includes(id))

        await Promise.all([
            toMove.length > 0 ? bulkMoveAction(toMove, target) : Promise.resolve(),
            toDelete.length > 0 ? bulkDeleteAction(toDelete) : Promise.resolve(),
        ])
    }

    async function bulkMarkRead(read: boolean) {
        const ids = [...bulkSelected]
        setMails((prev) => prev.map((m) => bulkSelected.has(m.id) ? { ...m, read } : m))
        setBulkSelected(new Set())
        await bulkMarkReadAction(ids, read)
    }

    const setFolder = (f: MailFolder) => setFolderState(f)
    const refresh = () => loadMails(folder, contactFilter)

    return {
        mails: filtered,
        selected,
        selectedId,
        bulkSelected,
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
        refreshSelectedMail,
        toggleBulkSelect,
        selectAll,
        clearBulkSelection,
        bulkMoveTo,
        bulkMarkRead,
    }
}
