import type { StoreItem } from "@/types"

/**
 * Ordena los items de la tienda para que los pavos y el Fortnite Crew (IDs del 1 al 5)
 * aparezcan primero, seguidos por el resto de los items
 */
export const sortItemsByPriority = (items: StoreItem[]): StoreItem[] => {
  // Crear una copia del array para no mutar el original
  return [...items].sort((a, b) => {
    // Verificar si los IDs son numéricos o tienen el formato "fallback-X" o "vbucks-X" o "crew-X"
    const idA = a.id.replace(/^(fallback|vbucks|crew)-/, "")
    const idB = b.id.replace(/^(fallback|vbucks|crew)-/, "")

    // Verificar si los IDs están entre 1 y 5 o si son de tipo vbucks o crew
    const isAPriority =
      ["1", "2", "3", "4", "5"].includes(idA) || a.id.startsWith("vbucks-") || a.id.startsWith("crew-")
    const isBPriority =
      ["1", "2", "3", "4", "5"].includes(idB) || b.id.startsWith("vbucks-") || b.id.startsWith("crew-")

    // Alternativa: verificar por tipo
    const isAVbucksOrCrew = a.type === "vbucks" || a.type === "crew"
    const isBVbucksOrCrew = b.type === "vbucks" || b.type === "crew"

    // Priorizar por ID y luego por tipo
    if (isAPriority && !isBPriority) return -1
    if (!isAPriority && isBPriority) return 1

    // Si ambos o ninguno son prioritarios por ID, verificar por tipo
    if (!isAPriority && !isBPriority) {
      if (isAVbucksOrCrew && !isBVbucksOrCrew) return -1
      if (!isAVbucksOrCrew && isBVbucksOrCrew) return 1
    }

    // Si ambos son vbucks, ordenar por precio
    if (a.type === "vbucks" && b.type === "vbucks") {
      return a.price.finalPrice - b.price.finalPrice
    }

    // Si ambos son crew, ordenar por precio
    if (a.type === "crew" && b.type === "crew") {
      return a.price.finalPrice - b.price.finalPrice
    }

    // Si ambos tienen la misma prioridad, mantener el orden original
    return 0
  })
}
