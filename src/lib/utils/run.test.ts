import { describe, expect, it } from "vitest"
import {
  formatDistanceShort,
  formatDuration,
  formatPace,
  formatRunDistance,
  formatRunDurationDisplay,
  formatRunPace,
} from "./run"

describe("formatRunPace", () => {
  it("formate les secondes/km en minutes'secondes\"", () => {
    expect(formatRunPace(330)).toBe(`5'30"`)
  })
  it("complète les secondes sur deux chiffres", () => {
    expect(formatRunPace(305)).toBe(`5'05"`)
  })
})

describe("formatPace", () => {
  it("formate en m:ss", () => {
    expect(formatPace(330)).toBe("5:30")
    expect(formatPace(245)).toBe("4:05")
  })
})

describe("formatRunDurationDisplay", () => {
  it("sans heure", () => {
    expect(formatRunDurationDisplay(1530)).toBe(`25'30"`)
  })
  it("avec heure", () => {
    expect(formatRunDurationDisplay(3750)).toBe(`1h02'30"`)
  })
})

describe("formatDuration", () => {
  it("sans heure", () => {
    expect(formatDuration(1530)).toBe("25:30")
  })
  it("avec heure", () => {
    expect(formatDuration(3750)).toBe("1:02:30")
  })
})

describe("distances", () => {
  it("formatRunDistance convertit des mètres en km à deux décimales", () => {
    expect(formatRunDistance(10500)).toBe("10.50")
  })
  it("formatDistanceShort garde des km à deux décimales", () => {
    expect(formatDistanceShort(10.5)).toBe("10.50")
  })
})
