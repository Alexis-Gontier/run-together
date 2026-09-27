import { describe, expect, it } from "vitest"
import { parseActivitiesCsv, parseCsv, stravaRunType } from "./strava-archive"

describe("parseCsv", () => {
  it("gère guillemets, virgules, guillemets échappés et retours à la ligne", () => {
    expect(parseCsv('a,"b, c","d ""e""","f\ng"\r\n1,2,3,4')).toEqual([
      ["a", "b, c", 'd "e"', "f\ng"],
      ["1", "2", "3", "4"],
    ])
  })
})

describe("stravaRunType", () => {
  it.each([
    ["Run", "Run"],
    ["Trail Run", "TrailRun"],
    ["Virtual Run", "VirtualRun"],
    ["Course à pied", "Run"],
    ["Course virtuelle", "VirtualRun"],
    ["Walk", null],
    ["Marche", null],
    ["Ride", null],
    ["Randonnée", null],
  ])("%s → %s", (type, expected) => {
    expect(stravaRunType(type)).toBe(expected)
  })
})

describe("parseActivitiesCsv", () => {
  it("lit titre et sport par nom de fichier (en-têtes anglais, colonnes en double)", () => {
    const csv = [
      "﻿Activity ID,Activity Date,Activity Name,Activity Type,Activity Description,Distance,Filename,Distance",
      '1,"Jun 2, 2026",Footing du matin,Run,"Belle sortie, ""facile""",6.06,activities/1.fit.gz,6059',
      '2,"Jun 3, 2026",Balade,Walk,,3.1,activities/2.gpx,3100',
      '3,"Jun 4, 2026",Tapis,Run,,5,,5000',
    ].join("\n")
    const map = parseActivitiesCsv(csv)
    expect(map.size).toBe(2) // l'activité sans fichier est ignorée
    expect(map.get("1.fit.gz")).toEqual({
      name: "Footing du matin",
      type: "Run",
      sportType: "Run",
    })
    expect(map.get("2.gpx")?.sportType).toBeNull()
  })

  it("accepte les en-têtes français", () => {
    const csv =
      "ID de l’activité,Nom de l'activité,Type d'activité,Nom du fichier\n9,Sortie longue,Course à pied,activities/9.tcx.gz"
    expect(parseActivitiesCsv(csv).get("9.tcx.gz")).toMatchObject({
      name: "Sortie longue",
      sportType: "Run",
    })
  })

  it("renvoie une table vide si les colonnes manquent", () => {
    expect(parseActivitiesCsv("a,b\n1,2").size).toBe(0)
  })
})
