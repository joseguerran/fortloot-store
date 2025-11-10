"use client"

import { useEffect, useState } from "react"

// Lista de todas las imágenes referenciadas en el código
const expectedImages = [
  "/paypal-logo.png",
  "/fortnite-revolucion-grafitera.jpeg",
  "/pagomovil-logo.png",
  "/vbucks-stack.png",
  "/neon-gaming-background.png",
  "/mercadopago-logo.png",
  "/fortnite-crew-new.png",
  "/x-logo-white.png",
  "/fortnite-pack-soledad.png",
  "/fortnite-skins-band.jpeg",
  "/binance-logo-new.png",
  "/favicon.png",
  "/favicon.ico",
  "/placeholder-t7u3b.png",
  "/placeholder-6ucdx.png",
  "/placeholder-3565b.png",
  "/placeholder-pob0k.png",
  "/placeholder-4x6gh.png",
  "/gaming-background.jpeg",
  "/placeholder-rhtsq.png",
  "/placeholder-v3100.png",
  "/placeholder-qggoj.png",
  "/placeholder-hlcbr.png",
  "/fortnite-vbucks.jpeg",
  "/fortnite-vbucks-blue.jpeg",
  "/fortnite-vbucks-purple.jpeg",
  "/fortnite-vbucks-gold.jpeg",
  "/fortnite-crew-benefits.png",
]

export default function CheckImages() {
  const [missingImages, setMissingImages] = useState<string[]>([])
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkImages = async () => {
      const missing: string[] = []

      for (const img of expectedImages) {
        try {
          const res = await fetch(img, { method: "HEAD" })
          if (!res.ok) {
            missing.push(img)
          }
        } catch (error) {
          missing.push(img)
        }
      }

      setMissingImages(missing)
      setChecking(false)
    }

    checkImages()
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Verificación de Imágenes</h1>

      {checking ? (
        <p>Verificando imágenes...</p>
      ) : (
        <>
          {missingImages.length === 0 ? (
            <div className="bg-green-100 text-green-800 p-4 rounded-md">✅ Todas las imágenes están disponibles.</div>
          ) : (
            <div className="bg-red-100 text-red-800 p-4 rounded-md">
              ❌ Faltan {missingImages.length} imágenes:
              <ul className="list-disc pl-8 mt-2">
                {missingImages.map((img) => (
                  <li key={img}>{img}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-2">Todas las imágenes verificadas:</h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {expectedImages.map((img) => (
                <li key={img} className={`p-2 rounded-md ${missingImages.includes(img) ? "bg-red-50" : "bg-green-50"}`}>
                  {img}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
