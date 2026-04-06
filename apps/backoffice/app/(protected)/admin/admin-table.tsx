"use client"

import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { getUsers } from "@/lib/dal/admin"

type UserRow = Awaited<ReturnType<typeof getUsers>>[number]

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  GESTIONNAIRE: "Gestionnaire",
  COMPTABLE: "Comptable",
  TRAVAUX: "Resp. travaux",
  SERVICES: "Chargé services",
  DIRECTION: "Direction",
}

const columns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "nom",
    header: "Nom",
    cell: ({ row }) => (
      <Link
        href={`/admin/users/${row.original.id}/edit`}
        className="font-medium text-foreground hover:text-primary cursor-pointer"
      >
        {row.original.nom}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Rôle",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-foreground">
        {ROLE_LABELS[row.original.role] ?? row.original.role}
      </span>
    ),
  },
  {
    accessorKey: "actif",
    header: "Statut",
    cell: ({ row }) => (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          row.original.actif
            ? "bg-green-100 text-green-800"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {row.original.actif ? "Actif" : "Inactif"}
      </span>
    ),
  },
  {
    id: "since",
    header: "Depuis",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {new Date(row.original.createdAt).toLocaleDateString("fr-FR")}
      </span>
    ),
  },
]

export function AdminTable({ data }: { data: UserRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Rechercher un utilisateur…"
      searchColumn="nom"
    />
  )
}

