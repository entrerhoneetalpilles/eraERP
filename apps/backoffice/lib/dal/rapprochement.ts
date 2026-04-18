import { db } from "@conciergerie/db"

export async function getBankStatements() {
  return db.bankStatement.findMany({
    include: {
      lines: {
        select: { id: true, statut: true, montant: true },
      },
    },
    orderBy: { date_import: "desc" },
  })
}

export async function getBankLines(statementId: string) {
  return db.bankLine.findMany({
    where: { statement_id: statementId },
    orderBy: { date: "desc" },
  })
}

export async function getUnmatchedCompanyTransactions() {
  return db.companyTransaction.findMany({
    where: { lettree: false, journal: "BANQUE" },
    orderBy: { date: "desc" },
  })
}

export async function matchBankLine(bankLineId: string, transactionId: string) {
  await db.$transaction([
    db.bankLine.update({
      where: { id: bankLineId },
      data: { statut: "LETTREE", transaction_id: transactionId },
    }),
    db.companyTransaction.update({
      where: { id: transactionId },
      data: { lettree: true },
    }),
  ])
}

export async function ignoreBankLine(bankLineId: string) {
  await db.bankLine.update({
    where: { id: bankLineId },
    data: { statut: "IGNOREE" },
  })
}

export async function importBankStatementCsv(
  fichier_nom: string,
  lines: Array<{ date: string; libelle: string; montant: number }>
) {
  const montant_total = lines.reduce((s, l) => s + l.montant, 0)
  return db.bankStatement.create({
    data: {
      fichier_nom,
      format: "CSV",
      nb_lignes: lines.length,
      montant_total,
      lines: {
        create: lines.map(l => ({
          date: new Date(l.date),
          libelle: l.libelle,
          montant: l.montant,
        })),
      },
    },
  })
}

export async function getRapprochementStats() {
  const [totalLines, lettrees, nonLettrees, ignorees] = await Promise.all([
    db.bankLine.count(),
    db.bankLine.count({ where: { statut: "LETTREE" } }),
    db.bankLine.count({ where: { statut: "NON_LETTREE" } }),
    db.bankLine.count({ where: { statut: "IGNOREE" } }),
  ])
  return { totalLines, lettrees, nonLettrees, ignorees }
}
