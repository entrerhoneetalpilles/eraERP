"use client"

import { motion } from "framer-motion"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { formatRelative } from "date-fns"
import { fr } from "date-fns/locale"

interface EventCardProps {
  type: "checkin" | "checkout"
  propertyName: string
  date: Date
}

export function EventCard({ type, propertyName, date }: EventCardProps) {
  const isCheckin = type === "checkin"
  const relativeDate = formatRelative(date, new Date(), { locale: fr })

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-luxury-card border border-argile-200/40 hover:shadow-luxury transition-smooth cursor-default"
    >
      {/* Icon badge */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isCheckin
            ? "bg-olivier-100 text-olivier-600"
            : "bg-calcaire-200 text-garrigue-600"
        }`}
      >
        {isCheckin ? (
          <ArrowDownLeft size={16} strokeWidth={2} />
        ) : (
          <ArrowUpRight size={16} strokeWidth={2} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold tracking-wide uppercase text-garrigue-400 mb-0.5">
          {isCheckin ? "Arrivée" : "Départ"}
        </p>
        <p className="font-serif text-base text-garrigue-900 truncate">
          {propertyName}
        </p>
        <p className="text-xs text-garrigue-400 mt-0.5 capitalize">{relativeDate}</p>
      </div>
    </motion.div>
  )
}
