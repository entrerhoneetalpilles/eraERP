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
      upsert: vi.fn(),
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
    vi.mocked(db.cleaningTask.upsert).mockResolvedValue({ id: "ct1" } as any)

    await autoCreateCleaningTask("b1")

    expect(db.cleaningTask.upsert).toHaveBeenCalledWith({
      where: { booking_id: "b1" },
      update: {},
      create: {
        booking_id: "b1",
        property_id: "p1",
        date_prevue: checkOut,
        statut: "PLANIFIEE",
        checklist: [],
        photos: [],
      },
    })
  })

  it("upserts idempotently (no-op if already exists)", async () => {
    const checkOut = new Date("2026-04-15T10:00:00Z")
    vi.mocked(db.booking.findUnique).mockResolvedValue({
      id: "b1",
      property_id: "p1",
      check_out: checkOut,
    } as any)
    vi.mocked(db.cleaningTask.upsert).mockResolvedValue({ id: "ct1" } as any)

    await autoCreateCleaningTask("b1")
    // Called once with update: {} — no-op if existing record
    expect(db.cleaningTask.upsert).toHaveBeenCalledTimes(1)
    const call = vi.mocked(db.cleaningTask.upsert).mock.calls[0][0]
    expect(call.update).toEqual({})
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
