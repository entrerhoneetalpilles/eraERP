import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@conciergerie/db", () => ({
  db: {
    owner: { count: vi.fn() },
    property: { count: vi.fn() },
    booking: { count: vi.fn(), findMany: vi.fn(), aggregate: vi.fn() },
    cleaningTask: { findMany: vi.fn() },
  },
}))

import { db } from "@conciergerie/db"
import { getDashboardStats } from "./stats"

beforeEach(() => vi.clearAllMocks())

describe("getDashboardStats", () => {
  it("returns all required fields including todayArrivals, todayDepartures, pendingCleanings", async () => {
    vi.mocked(db.owner.count).mockResolvedValue(3)
    vi.mocked(db.property.count).mockResolvedValue(5)
    vi.mocked(db.booking.count).mockResolvedValue(2)
    vi.mocked(db.booking.aggregate).mockResolvedValue({
      _sum: { revenu_net_proprietaire: 3000 },
    } as any)

    // Use mockResolvedValueOnce for ordered calls
    vi.mocked(db.booking.findMany)
      .mockResolvedValueOnce([]) // upcomingCheckIns
      .mockResolvedValueOnce([]) // todayArrivals
      .mockResolvedValueOnce([]) // todayDepartures

    vi.mocked(db.cleaningTask.findMany).mockResolvedValue([
      { id: "ct1", statut: "PLANIFIEE", property: { id: "p1", nom: "Villa A" }, contractor: null, date_prevue: new Date() },
      { id: "ct2", statut: "EN_COURS", property: { id: "p1", nom: "Villa A" }, contractor: null, date_prevue: new Date() },
    ] as any)

    const stats = await getDashboardStats()

    expect(stats).toHaveProperty("todayArrivals")
    expect(stats).toHaveProperty("todayDepartures")
    expect(stats).toHaveProperty("pendingCleanings")
    expect(stats.pendingCleanings).toHaveLength(2)
    expect(stats.totalOwners).toBe(3)
    expect(stats.revenuMoisCourant).toBe(3000)
  })
})
