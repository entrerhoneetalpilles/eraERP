"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Calendar, Home, Clock, BedDouble } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export type BookingMeta = {
  type: "booking"
  guestName: string
  propertyName: string
  statut: string
  checkIn: Date
  checkOut: Date
  nbNuits: number
}

export type CleaningMeta = {
  type: "cleaning"
  propertyName: string
  date: Date
}

export type BlockedMeta = {
  type: "blocked"
  propertyName: string
  dateDebut: Date
  dateFin: Date
  notes: string | null
}

export type EventMeta = BookingMeta | CleaningMeta | BlockedMeta

interface EventDetailModalProps {
  meta: EventMeta | null
  onClose: () => void
}

const STATUT_LABELS: Record<string, string> = {
  CONFIRMED: "Confirmée",
  CHECKEDIN: "En cours",
  CHECKEDOUT: "Terminée",
  PENDING: "En attente",
}

const STATUT_STYLES: Record<string, string> = {
  CONFIRMED: "bg-blue-50 text-blue-600",
  CHECKEDIN: "bg-olivier-50 text-olivier-600",
  CHECKEDOUT: "bg-gray-100 text-gray-500",
  PENDING: "bg-amber-50 text-amber-600",
}

function fmtDate(d: Date) {
  return format(d, "d MMMM yyyy", { locale: fr })
}

function BookingDetail({ m }: { m: BookingMeta }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <User size={15} className="text-blue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Voyageur</p>
          <p className="text-sm font-medium text-garrigue-900">{m.guestName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
          <Home size={15} className="text-garrigue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Bien</p>
          <p className="text-sm font-medium text-garrigue-900">{m.propertyName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
          <Calendar size={15} className="text-garrigue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Période</p>
          <p className="text-sm font-medium text-garrigue-900">
            {fmtDate(m.checkIn)} → {fmtDate(m.checkOut)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
          <BedDouble size={15} className="text-garrigue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Durée</p>
          <p className="text-sm font-medium text-garrigue-900">
            {m.nbNuits} nuit{m.nbNuits > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="pt-1">
        <span className={`inline-flex items-center text-xs px-3 py-1.5 rounded-full font-medium ${STATUT_STYLES[m.statut] ?? "bg-gray-100 text-gray-500"}`}>
          {STATUT_LABELS[m.statut] ?? m.statut}
        </span>
      </div>
    </div>
  )
}

function CleaningDetail({ m }: { m: CleaningMeta }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
          <Home size={15} className="text-sky-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Bien</p>
          <p className="text-sm font-medium text-garrigue-900">{m.propertyName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
          <Clock size={15} className="text-garrigue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Date prévue</p>
          <p className="text-sm font-medium text-garrigue-900">{fmtDate(m.date)}</p>
        </div>
      </div>
    </div>
  )
}

function BlockedDetail({ m }: { m: BlockedMeta }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <Home size={15} className="text-gray-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Bien</p>
          <p className="text-sm font-medium text-garrigue-900">{m.propertyName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
          <Calendar size={15} className="text-garrigue-500" />
        </div>
        <div>
          <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium">Période bloquée</p>
          <p className="text-sm font-medium text-garrigue-900">
            {fmtDate(m.dateDebut)} → {fmtDate(m.dateFin)}
          </p>
        </div>
      </div>
      {m.notes && (
        <div className="bg-calcaire-100 rounded-xl px-4 py-3">
          <p className="text-xs text-garrigue-500 leading-relaxed">{m.notes}</p>
        </div>
      )}
    </div>
  )
}

const TITLE: Record<EventMeta["type"], string> = {
  booking: "Réservation",
  cleaning: "Ménage prévu",
  blocked: "Période bloquée",
}

export function EventDetailModal({ meta, onClose }: EventDetailModalProps) {
  useEffect(() => {
    if (!meta) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [meta, onClose])

  return (
    <AnimatePresence>
      {meta && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-garrigue-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed z-50 bottom-0 inset-x-0 sm:inset-auto sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[380px] bg-white sm:rounded-2xl rounded-t-2xl shadow-luxury px-6 pt-6 pb-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="event-modal-title" className="font-serif text-2xl text-garrigue-900 font-light italic">
                {TITLE[meta.type]}.
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-calcaire-100 text-garrigue-400 hover:text-garrigue-900 transition-fast cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            {meta.type === "booking" && <BookingDetail m={meta} />}
            {meta.type === "cleaning" && <CleaningDetail m={meta} />}
            {meta.type === "blocked" && <BlockedDetail m={meta} />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
