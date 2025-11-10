"use client"

import { useState, useEffect } from "react"
import { IMAGES } from "@/config/images"
import { OptimizedImage } from "@/components/ui/OptimizedImage"

export function ImageChecker() {
  const [results, setResults] = useState<{ path: string; exists: boolean; loading: boolean }[]>([])
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkImages = async () => {
      // Extraer todas las rutas de imágenes del objeto IMAGES
      const imagePaths = Object.entries(IMAGES)
        .filter(([key, value]) => typeof value === "string" && !key.startsWith("get"))
        .map(([_, path]) => path as string)

      // Inicializar resultados
      setResults(imagePaths.map((path) => ({ path, exists: false, loading: true })))

      // Verificar cada imagen
      const checkPromises = imagePaths.map(async (path, index) => {
        try {
          const res = await fetch(path, { method: "HEAD" })
          const exists = res.ok

          setResults((prev) => {
            const newResults = [...prev]
            newResults[index] = { path, exists, loading: false }
            return newResults
          })

          return { path, exists, loading: false }
        } catch (error) {
          setResults((prev) => {
            const newResults = [...prev]
            newResults[index] = { path, exists: false, loading: false }
            return newResults
          })

          return { path, exists: false, loading: false }
        }
      })

      await Promise.all(checkPromises)
      setChecking(false)
    }

    checkImages()
  }, [])

  const missingImages = results.filter((result) => !result.exists && !result.loading)
  const loadedImages = results.filter((result) => result.exists && !result.loading)
  const loadingImages = results.filter((result) => result.loading)

  return (
    <div className="min-h-screen bg-dark text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Verificador de Imágenes</h1>

        {checking || loadingImages.length > 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p>
              Verificando imágenes... ({loadedImages.length + missingImages.length} de {results.length})
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 p-4 rounded-lg bg-light">
              <h2 className="text-xl font-bold mb-4">Resumen</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${loadedImages.length > 0 ? "bg-green-900/30" : "bg-gray-800"}`}>
                  <p className="text-lg font-bold">Imágenes cargadas correctamente</p>
                  <p className="text-3xl font-bold">{loadedImages.length}</p>
                </div>
                <div className={`p-4 rounded-lg ${missingImages.length > 0 ? "bg-red-900/30" : "bg-gray-800"}`}>
                  <p className="text-lg font-bold">Imágenes con problemas</p>
                  <p className="text-3xl font-bold">{missingImages.length}</p>
                </div>
              </div>
            </div>

            {missingImages.length > 0 && (
              <div className="mb-8 p-4 rounded-lg bg-red-900/30 border border-red-500/50">
                <h2 className="text-xl font-bold mb-4">Imágenes con problemas</h2>
                <ul className="space-y-2">
                  {missingImages.map((result) => (
                    <li key={result.path} className="p-2 bg-red-950/50 rounded-lg">
                      {result.path}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Vista previa de imágenes</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {loadedImages.map((result) => (
                  <div key={result.path} className="bg-light p-2 rounded-lg">
                    <div className="relative h-32 mb-2 bg-darker rounded-lg overflow-hidden">
                      <OptimizedImage src={result.path} alt={`Imagen ${result.path}`} fill className="object-contain" />
                    </div>
                    <p className="text-xs truncate">{result.path}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400">
                Nota: Si hay imágenes con problemas, asegúrate de que existan en la carpeta public y que las rutas en
                config/images.ts sean correctas.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
