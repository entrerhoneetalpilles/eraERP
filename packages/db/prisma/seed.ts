import { config } from "dotenv"
import { resolve } from "path"
// Load root .env (monorepo root, two levels up from packages/db/prisma/)
config({ path: resolve(__dirname, "../../../.env") })

import { PrismaClient, UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

const db = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const passwordHash = await bcrypt.hash("Admin@12345!", 12)

  await db.user.upsert({
    where: { email: "admin@conciergerie.fr" },
    update: {},
    create: {
      email: "admin@conciergerie.fr",
      nom: "Administrateur",
      role: UserRole.ADMIN,
      password_hash: passwordHash,
      actif: true,
    },
  })

  const gestionnaireHash = await bcrypt.hash("Gestionnaire@12345!", 12)

  await db.user.upsert({
    where: { email: "gestionnaire@conciergerie.fr" },
    update: {},
    create: {
      email: "gestionnaire@conciergerie.fr",
      nom: "Marie Dupont",
      role: UserRole.GESTIONNAIRE,
      password_hash: gestionnaireHash,
      actif: true,
    },
  })

  const leoHash = await bcrypt.hash("S7YikmPU180599!", 12)

  await db.user.upsert({
    where: { email: "leo@entre-rhone-alpilles.fr" },
    update: {},
    create: {
      email: "leo@entre-rhone-alpilles.fr",
      nom: "Leo",
      role: UserRole.ADMIN,
      password_hash: leoHash,
      actif: true,
    },
  })

  console.log("Seed terminé.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
