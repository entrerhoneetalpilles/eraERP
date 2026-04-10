"use client"

import { motion } from "framer-motion"

interface SoldeCardProps {
  solde: number
  sequestre: number
  dernierVirement: { montant: number; date: Date } | null
}

export function SoldeCard({ solde, sequestre, dernierVirement }: SoldeCardProps) {
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl p-4 shadow-soft"
      >
        <p className="text-xs text-garrigue-400 mb-1">Solde disponible</p>
        <p className="font-serif text-2xl text-garrigue-900">{fmt(solde)}</p>
        {sequestre > 0 && (
          <p className="text-xs text-garrigue-400 mt-1">{fmt(sequestre)} en séquestre</p>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="bg-white rounded-xl p-4 shadow-soft"
      >
        <p className="text-xs text-garrigue-400 mb-1">Dernier virement</p>
        {dernierVirement ? (
          <>
            <p className="font-serif text-xl text-garrigue-900">{fmt(dernierVirement.montant)}</p>
            <p className="text-xs text-garrigue-400 mt-1">
              le{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
              }).format(dernierVirement.date)}
            </p>
          </>
        ) : (
          <p className="text-sm text-garrigue-400">Aucun virement</p>
        )}
      </motion.div>
    </div>
  )
}
