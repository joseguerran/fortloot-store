// Configuración centralizada de imágenes
export const IMAGES = {
  // Logos de métodos de pago
  PAYPAL: "/paypal-logo.png",
  CRYPTOMUS: "/cryptomus-logo.png",
  BINANCE: "/binance-logo-new.png",
  PAGOMOVIL: "/pagomovil-logo.png",
  TIKTOK_LOGO: "/tiktok-logo-white.svg",

  // Fondo principal
  NEON_GAMING_NEW: "/neon-gaming-background-new.jpeg",

  // V-Bucks
  VBUCKS_DEFAULT: "/fortnite-vbucks-1000.jpeg",
  VBUCKS_BLUE: "/fortnite-vbucks-blue.jpeg",
  VBUCKS_PURPLE: "/fortnite-vbucks-purple.jpeg",
  VBUCKS_GOLD: "/fortnite-vbucks-gold.jpeg",

  // Fortnite Crew
  FORTNITE_CREW_NEW: "/fortnite-crew-new.png",
  FORTNITE_CREW_BENEFITS: "/fortnite-crew-benefits.png",
  FORTNITE_CREW_UPDATE: "/fortnite-crew-update-1920x1080-69778b93752c.jpg",

  // Paquetes y Bundles
  FORTNITE_PACK_SOLEDAD: "/fortnite-pack-soledad.png",
  FORTNITE_SKINS_BAND: "/fortnite-skins-band.jpeg",
  FORTNITE_REVOLUCION_GRAFITERA: "/Revolu-grafitera copy.jpeg",
  FORTNITE_XERICK_STARTER_PACK: "/fortnite-xerick-starter-pack.jpeg",
  FORTNITE_SARAH_NINJA_PACK: "/fortnite-sarah-ninja-pack.jpeg",
  FORTNITE_DIA_DEL_JUICIO_PACK: "/fortnite-dia-del-juicio-pack.jpeg",
  FORTNITE_LEYENDAS_ANIME_PACK: "/fortnite-leyendas-anime-pack.jpeg",
  FORTNITE_MAESTROS_MAGMA_PACK: "/ES-ES_FNECO_30-10_SummerLegendsPack_EGS_2560x1440_2560x1440-5312fe446e638f9a9fed2756864c656e.jpeg",
  FORTNITE_LEYENDAS_VERANO_PACK: "/ES-ES_FNECO_30-10_SummerLegendsPack_EGS_2560x1440_2560x1440-7ed7cfc96791bb2efb3df5d46cb9d6ee.jpeg",
  FORTNITE_BATMAN_CAPED_CRUSADER_PACK: "/ES-ES_FNECO_33-20_CapedCrusader_EGS_Landscape_2560x1440_2560x1440-7f1c544d464972bcbf3232524d234b9c.jpeg",
  FORTNITE_LAST_LAUGH_BUNDLE: "/ES-ES_FNECO_33-11_RMT_LastLaughBundle_EGS_2560x1440_2560x1440-5415113bf00fb2a6344c4fe7bc692174.jpeg",
  FORTNITE_SAINT_ACADEMY_QUEST_PACK: "/ES-ES_FNECO36-00_RMT_SaintAcademyQuest_Pack_EGS_Landscape_2560x1440_2560x1440-39c9e03db779dc6bfbc67771174ccaaf.jpeg",

  // Función para obtener imagen por tipo
  getByType: (type: string, variant?: string): string => {
    switch (type) {
      case "vbucks":
        switch (variant) {
          case "blue": return IMAGES.VBUCKS_BLUE
          case "purple": return IMAGES.VBUCKS_PURPLE
          case "gold": return IMAGES.VBUCKS_GOLD
          default: return IMAGES.VBUCKS_DEFAULT
        }
      case "crew":
        switch (variant) {
          case "benefits": return IMAGES.FORTNITE_CREW_BENEFITS
          case "update": return IMAGES.FORTNITE_CREW_UPDATE
          default: return IMAGES.FORTNITE_CREW_NEW
        }
      case "bundle":
        switch (variant) {
          case "revolucion-grafitera": return IMAGES.FORTNITE_REVOLUCION_GRAFITERA
          case "xerick": return IMAGES.FORTNITE_XERICK_STARTER_PACK
          case "sarah-ninja": return IMAGES.FORTNITE_SARAH_NINJA_PACK
          case "dia-del-juicio": return IMAGES.FORTNITE_DIA_DEL_JUICIO_PACK
          case "leyendas-anime": return IMAGES.FORTNITE_LEYENDAS_ANIME_PACK
          case "maestros-magma": return IMAGES.FORTNITE_MAESTROS_MAGMA_PACK
          case "leyendas-verano": return IMAGES.FORTNITE_LEYENDAS_VERANO_PACK
          case "batman-caped-crusader": return IMAGES.FORTNITE_BATMAN_CAPED_CRUSADER_PACK
          case "last-laugh": return IMAGES.FORTNITE_LAST_LAUGH_BUNDLE
          case "saint-academy-quest": return IMAGES.FORTNITE_SAINT_ACADEMY_QUEST_PACK
          default: return IMAGES.FORTNITE_PACK_SOLEDAD
        }
      default:
        return IMAGES.FORTNITE_REVOLUCION_GRAFITERA
    }
  },

  // Función para obtener un placeholder aleatorio
  getRandomPlaceholder: (): string => {
    return IMAGES.FORTNITE_REVOLUCION_GRAFITERA
  }
}