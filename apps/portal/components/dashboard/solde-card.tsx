"use client"

import { motion } from "framer-motion"

interface SoldeCardProps {
  solde: number
  sequestre: number
  dernierVirement: { montant: number; date: Date } | null
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

export function SoldeCard({ solde, sequestre, dernierVirement }: SoldeCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Primary — dark card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="col-span-2 sm:col-span-1 bg-gradient-dark rounded-2xl p-5 shadow-luxury relative overflow-hidden"
      >
        {/* Subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #DFC078 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <p className="text-xs text-garrigue-400 mb-2 tracking-wide uppercase">Solde disponible</p>
          <p className="font-serif text-3xl text-white font-light">{fmt(solde)}</p>
          {sequestre > 0 && (
            <p className="text-xs text-garrigue-400/70 mt-2">
              + {fmt(sequestre)} en séquestre
            </p>
          )}
        </div>
      </motion.div>

      {/* Secondary — white card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.4, 0, 0.2, 1] }}
        className="col-span-2 sm:col-span-1 bg-white rounded-2xl p-5 shadow-luxury-card border border-argile-200/50"
      >
        <p className="text-xs text-garrigue-400 mb-2 tracking-wide uppercase">Dernier virement</p>
        {dernierVirement ? (
          <>
            <p className="font-serif text-2xl text-garrigue-900 font-light">
              {fmt(dernierVirement.montant)}
            </p>
            <p className="text-xs text-garrigue-400 mt-2">
              le{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
              }).format(dernierVirement.date)}
            </p>
          </>
        ) : (
          <p className="text-sm text-garrigue-400 font-light mt-2">Aucun virement</p>
        )}
      </motion.div>
    </div>
  )
}
