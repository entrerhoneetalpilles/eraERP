"use client"
// Loads boneyard skeleton registry client-side only.
// Imported as a leaf in layout.tsx so hooks run in a proper client context.
import "../bones/registry"

export function BonesProvider() {
  return null
}
