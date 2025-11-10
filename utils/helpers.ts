// UI Helper Functions
// All pricing logic has been moved to the backend
// The frontend only displays prices that come from the backend API

// Función para obtener el color de rareza
export const getRarityColor = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case "common":
      return "bg-gray-400"
    case "uncommon":
      return "bg-green-500"
    case "rare":
      return "bg-[#00F5D4]"
    case "epic":
      return "bg-[#E91E63]"
    case "legendary":
      return "bg-[#ADFF2F]"
    default:
      return "bg-gray-400"
  }
}

// Función para obtener el nombre de rareza en español
export const getRarityName = (rarity: string): string => {
  switch (rarity.toLowerCase()) {
    case "common":
      return "Común"
    case "uncommon":
      return "Poco común"
    case "rare":
      return "Raro"
    case "epic":
      return "Épico"
    case "legendary":
      return "Legendario"
    default:
      return "Desconocido"
  }
}

// Función para formatear precio en USD
export const formatUSD = (amount: number): string => {
  return `$${amount.toFixed(2)}`
}

// Función auxiliar para desplazamiento suave
export const scrollToSection = (id: string): void => {
  try {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  } catch (error) {
    console.error("Error al desplazarse a la sección:", error)
  }
}