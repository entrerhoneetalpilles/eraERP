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

const mockArrival = {
  id: "b1",
  statut: "CONFIRMED",
  check_in: new Date("2026-04-04T14:00:00Z"),
  check_out: new Date("2026-04-07T11:00:00Z"),
  nb_nuits: 3,
  guest: { prenom: "Jean", nom: "Dupont" },
  property: { id: "p1", nom: "Villa Lavande" },
}

const mockDeparture = {
  id: "b2",
  statut: "CHECKEDOUT",
  check_in: new Date("2026-04-01T14:00:00Z"),
  check_out: new Date("2026-04-04T11:00:00Z"),
  nb_nuits: 3,
  guest: { prenom: "Marie", nom: "Martin" },
  property: { id: "p2", nom: "Appartement Mistral" },
}

const mockCleaning = {
  id: "ct1",
  statut: "PLANIFIEE",
  date_prevue: new Date("2026-04-04T10:00:00Z"),
  property: { id: "p2", nom: "Appartement Mistral" },
  contractor: { id: "c1", nom: "Prestation Pro" },
  booking: { id: "b2" },
}

describe("getDashboardStats", () => {
  it("returns all required KPI fields", async () => {
    vi.mocked(db.owner.count).mockResolvedValue(5)
    vi.mocked(db.property.count).mockResolvedValue(8)
    vi.mocked(db.booking.count).mockResolvedValue(3)
    vi.mocked(db.booking.aggregate).mockResolvedValue({
      _sum: { revenu_net_proprietaire: 4500 },
    } as any)
    vi.mocked(db.booking.findMany)
      .mockResolvedValueOnce([])       // upcomingCheckIns
      .mockResolvedValueOnce([])       // todayArrivals
      .mockResolvedValueOnce([])       // todayDepartures
    vi.mocked(db.cleaningTask.findMany).mockResolvedValue([])

    const stats = await getDashboardStats()

    expect(stats.totalOwners).toBe(5)
    expect(stats.totalProperties).toBe(8)
    expect(stats.activeBookings).toBe(3)
    expect(stats.revenuMoisCourant).toBe(4500)
  })

  it("returns todayArrivals with guest and property data", async () => {
    vi.mocked(db.owner.count).mockResolvedValue(1)
    vi.mocked(db.property.count).mockResolvedValue(1)
    vi.mocked(db.booking.count).mockResolvedValue(1)
    vi.mocked(db.booking.aggregate).mockResolvedValue({ _sum: { revenu_net_proprietaire: 0 } } as any)
    vi.mocked(db.booking.findMany)
      .mockResolvedValueOnce([])               // upcomingCheckIns
      .mockResolvedValueOnce([mockArrival])    // todayArrivals
      .mockResolvedValueOnce([])               // todayDepartures
    vi.mocked(db.cleaningTask.findMany).mockResolvedValue([])

    const stats = await getDashboardStats()

    expect(stats.todayArrivals).toHaveLength(1)
    expect(stats.todayArrivals[0].id).toBe("b1")
    expect(stats.todayArrivals[0].guest.prenom).toBe("Jean")
    expect(stats.todayArrivals[0].property.nom).toBe("Villa Lavande")
  })

  it("returns todayDepartures with guest and property data", async () => {
    vi.mocked(db.owner.count).mockResolvedValue(1)
    vi.mocked(db.property.count).mockResolvedValue(1)
    vi.mocked(db.booking.count).mockResolvedValue(0)
    vi.mocked(db.booking.aggregate).mockResolvedValue({ _sum: { revenu_net_proprietaire: 0 } } as any)
    vi.mocked(db.booking.findMany)
      .mockResolvedValueOnce([])               // upcomingCheckIns
      .mockResolvedValueOnce([])               // todayArrivals
      .mockResolvedValueOnce([mockDeparture])  // todayDepartures
    vi.mocked(db.cleaningTask.findMany).mockResolvedValue([])

    const stats = await getDashboardStats()

    expect(stats.todayDepartures).toHaveLength(1)
    expect(stats.todayDepartures[0].id).toBe("b2")
    expect(stats.todayDepartures[0].guest.nom).toBe("Martin")
    expect(stats.todayDepartures[0].property.nom).toBe("Appartement Mistral")
  })

  it("returns pendingCleanings with property, contractor and booking data", async () => {
    vi.mocked(db.owner.count).mockResolvedValue(1)
    vi.mocked(db.property.count).mockResolvedValue(1)
    vi.mocked(db.booking.count).mockResolvedValue(0)
    vi.mocked(db.booking.aggregate).mockResolvedValue({ _sum: { revenu_net_proprietaire: 0 } } as any)
    vi.mocked(db.booking.findMany)
      .mockResolvedValueOnce([])  // upcomingCheckIns
      .mockResolvedValueOnce([])  // todayArrivals
      .mockResolvedValueOnce([])  // todayDepartures
    vi.mocked(db.cleaningTask.findMany).mockResolvedValue([mockCleaning] as any)

    const stats = await getDashboardStats()

    expect(stats.pendingCleanings).toHaveLength(1)
    expect(stats.pendingCleanings[0].id).toBe("ct1")
    expect(stats.pendingCleanings[0].property.nom).toBe("Appartement Mistral")
    expect(stats.pendingCleanings[0].contractor?.nom).toBe("Prestation Pro")
    expect(stats.pendingCleanings[0].booking.id).toBe("b2")
  })
})
