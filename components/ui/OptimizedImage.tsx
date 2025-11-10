"use client"

import { useState, useEffect } from "react"
import Image, { type StaticImageData } from "next/image"
import type { ImageProps } from "next/image"
import { IMAGES } from "@/config/images"

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
}

// SVG fallback genérico
const DEFAULT_SVG_FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%234F46E5"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="40" fill="white" font-family="Arial"%3EFortnite%3C/text%3E%3C/svg%3E'

export const OptimizedImage = ({ src, alt, fallbackSrc = DEFAULT_SVG_FALLBACK, ...props }: OptimizedImageProps) => {
  const [imgSrc, setImgSrc] = useState<string | StaticImageData>(src)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Normalizar la ruta de la imagen
  useEffect(() => {
    if (typeof src === "string") {
      // Si es una data URI, usarla directamente
      if (src.startsWith("data:")) {
        setImgSrc(src)
        return
      }

      // Si es una URL externa, usarla directamente
      if (src.startsWith("http")) {
        setImgSrc(src)
        return
      }

      // Si es una ruta local, asegurarse de que comience con "/"
      let normalizedSrc = src
      if (!src.startsWith("/")) {
        normalizedSrc = `/${src}`
      }

      // Verificar si la imagen está en la configuración
      const configImage = Object.values(IMAGES).find((img) => typeof img === "string" && img === normalizedSrc)

      setImgSrc(configImage || normalizedSrc)
    } else {
      // Si es un objeto importado, usarlo directamente
      setImgSrc(src)
    }
  }, [src])

  const handleError = () => {
    if (!error) {
      console.warn(`Image failed to load: ${typeof src === "string" ? src : "imported image"}, using fallback`)
      setImgSrc(fallbackSrc)
      setError(true)
    }
  }

  // Determinar si la imagen debe ser no optimizada
  const shouldBeUnoptimized = typeof imgSrc === "string" && (imgSrc.startsWith("http") || imgSrc.startsWith("data:"))

  return (
    <>
      {!loaded && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#1B263B] to-[#0D1B2A] animate-pulse"
          style={{
            width: props.width ? `${props.width}px` : "100%",
            height: props.height ? `${props.height}px` : "100%",
          }}
        />
      )}
      <Image
        {...props}
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        unoptimized={shouldBeUnoptimized}
        style={{
          ...props.style,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      />
    </>
  )
}
