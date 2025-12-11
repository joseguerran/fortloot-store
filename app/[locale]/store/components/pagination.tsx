"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Función para generar el rango de páginas a mostrar
  const getPageRange = () => {
    const range = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        range.push(i)
      }
    } else {
      // Siempre mostrar la primera página
      range.push(1)

      // Calcular el rango central
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Ajustar si estamos cerca del inicio o final
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4)
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3)
      }

      // Añadir elipsis si es necesario
      if (start > 2) {
        range.push("...")
      }

      // Añadir páginas del rango central
      for (let i = start; i <= end; i++) {
        range.push(i)
      }

      // Añadir elipsis si es necesario
      if (end < totalPages - 1) {
        range.push("...")
      }

      // Siempre mostrar la última página
      range.push(totalPages)
    }

    return range
  }

  return (
    <div className="flex items-center justify-center mt-8 space-x-2">
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-full ${
          currentPage === 1 ? "text-gray-400 cursor-not-allowed" : "text-[#00F5D4] hover:bg-[#1B263B] transition-colors"
        }`}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {getPageRange().map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={`page-${page}`}
            onClick={() => typeof page === "number" && onPageChange(page)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              currentPage === page ? "bg-[#FF007A] text-white" : "text-white hover:bg-[#1B263B]"
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-full ${
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-[#00F5D4] hover:bg-[#1B263B] transition-colors"
        }`}
        aria-label="Página siguiente"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
