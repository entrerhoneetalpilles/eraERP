import { describe, it, expect, vi, beforeEach } from "vitest"
import { autoCreateCleaningTask, updateCleaningStatut } from "./menage"

vi.mock("@conciergerie/db", () => ({
  db: {
    cleaningTask: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    booking: {
      findUnique: vi.fn(),
    },
  },
}))

import { db } from "@conciergerie/db"

beforeEach(() => vi.clearAllMocks())

describe("autoCreateCleaningTask", () => {
  it("creates a CleaningTask using booking check_out as date_prevue", async () => {
    const checkOut = new Date("2026-04-15T10:00:00Z")
    vi.mocked(db.booking.findUnique).mockResolvedValue({
      id: "b1",
      property_id: "p1",
      check_out: checkOut,
    } as any)
    vi.mocked(db.cleaningTask.findFirst).mockResolvedValue(null)
    vi.mocked(db.cleaningTask.create).mockResolvedValue({ id: "ct1" } as any)

    await autoCreateCleaningTask("b1")

    expect(db.cleaningTask.create).toHaveBeenCalledWith({
      data: {
        booking_id: "b1",
        property_id: "p1",
        date_prevue: checkOut,
        statut: "PLANIFIEE",
        checklist: [],
        photos: [],
      },
    })
  })

  it("does nothing if a CleaningTask already exists for this booking", async () => {
    vi.mocked(db.cleaningTask.findFirst).mockResolvedValue({ id: "ct1" } as any)
    await autoCreateCleaningTask("b1")
    expect(db.cleaningTask.create).not.toHaveBeenCalled()
  })
})

describe("updateCleaningStatut", () => {
  it("updates statut and sets date_realisation when TERMINEE", async () => {
    vi.mocked(db.cleaningTask.update).mockResolvedValue({} as any)
    await updateCleaningStatut("ct1", "TERMINEE")
    const call = vi.mocked(db.cleaningTask.update).mock.calls[0][0]
    expect(call.data.statut).toBe("TERMINEE")
    expect(call.data.date_realisation).toBeInstanceOf(Date)
  })

  it("does not set date_realisation for other statuts", async () => {
    vi.mocked(db.cleaningTask.update).mockResolvedValue({} as any)
    await updateCleaningStatut("ct1", "EN_COURS")
    const call = vi.mocked(db.cleaningTask.update).mock.calls[0][0]
    expect(call.data.date_realisation).toBeUndefined()
  })
})
