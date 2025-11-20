"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileImage, X, Loader2, CheckCircle, ShoppingCart } from "lucide-react"
import { orderAPI } from "@/lib/api/order"
import { PaymentCountdownTimer } from "./PaymentCountdownTimer"

interface PaymentMethod {
  name: string
  instructions?: string
}

interface PaymentUploaderProps {
  orderId: string
  orderExpiresAt: string | Date
  paymentMethod: PaymentMethod | string // Accept both for backward compatibility
  onSuccess: () => void
}

export function PaymentUploader({ orderId, orderExpiresAt, paymentMethod, onSuccess }: PaymentUploaderProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [notes, setNotes] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isTimerExpired, setIsTimerExpired] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Extract payment method name and instructions
  const paymentMethodName = typeof paymentMethod === 'string' ? paymentMethod : paymentMethod.name
  const paymentInstructions = typeof paymentMethod === 'object' ? paymentMethod.instructions : undefined

  const handleTimerExpire = () => {
    setIsTimerExpired(true)
    setError("El tiempo para subir el comprobante ha expirado. Esta orden ha sido marcada como abandonada. Por favor, realiza una nueva compra desde el inicio.")
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setError(null)

    // Validar tamaño (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("El archivo no debe superar 5MB")
      return
    }

    // Validar tipo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    if (!validTypes.includes(selectedFile.type)) {
      setError("Solo se permiten imágenes JPG, PNG o archivos PDF")
      return
    }

    setFile(selectedFile)

    // Crear preview si es imagen
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const fakeEvent = { target: { files: [droppedFile] } } as any
      handleFileSelect(fakeEvent)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)
    setWarning(null)

    try {
      const response = await orderAPI.uploadPaymentProof(
        orderId,
        file,
        paymentMethodName,
        transactionId || undefined,
        notes || undefined
      )

      // Check if there's a warning in the response
      if (response && typeof response === 'object' && 'warning' in response && response.warning) {
        setWarning(response.message || null)
      }

      // Small delay to show warning before redirecting
      setTimeout(() => {
        onSuccess()
      }, response.warning ? 2000 : 500)
    } catch (err: any) {
      console.error('Error uploading payment proof:', err)

      // Handle specific error for expired orders
      if (err.error === 'ORDER_EXPIRED') {
        setError(err.message || "Esta orden ha expirado. Por favor, realiza una nueva compra desde el inicio para garantizar la disponibilidad de los items.")
        setIsExpired(true)
      } else if (err.message && err.message.includes('JSON')) {
        // Handle JSON parsing errors with friendly message
        setError("Hubo un problema al procesar la respuesta del servidor. Por favor, verifica tu conexión e inténtalo de nuevo.")
      } else {
        setError(err.message || "No pudimos procesar tu comprobante de pago. Por favor, verifica que el archivo sea válido e inténtalo nuevamente.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-dark border border-light rounded-lg p-6">
      <h2 className="text-2xl font-russo text-white mb-2">Subir Comprobante</h2>
      <p className="text-gray-400 mb-4">Sube una captura de pantalla o foto de tu comprobante de pago</p>

      {/* Countdown Timer */}
      <div className="mb-6">
        <PaymentCountdownTimer
          expiresAt={orderExpiresAt}
          onExpire={handleTimerExpire}
        />
      </div>

      {/* Payment Instructions - Prominent Display */}
      {paymentInstructions && (
        <div className="mb-6 bg-blue-500/10 border-l-4 border-blue-500 rounded-r-lg p-5">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-blue-400 font-bold text-2xl mb-2">Instrucciones para realizar el pago</h3>
              <p className="text-white text-base leading-relaxed whitespace-pre-line">{paymentInstructions}</p>
            </div>
          </div>
        </div>
      )}

      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-secondary/50 rounded-lg p-12 text-center cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all"
        >
          <Upload className="w-16 h-16 text-secondary mx-auto mb-4" />
          <p className="text-white font-medium text-lg mb-2">Arrastra tu archivo aquí</p>
          <p className="text-gray-400 mb-1">o haz clic para seleccionar</p>
          <p className="text-sm text-gray-500">JPG, PNG o PDF - Máximo 5MB</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-darker rounded-lg p-6 flex items-center gap-6 border border-light">
            {preview ? (
              <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded border border-light" />
            ) : (
              <div className="w-24 h-24 bg-dark rounded flex items-center justify-center border border-light">
                <FileImage className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-white font-medium text-lg mb-1">{file.name}</p>
              <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={() => {
                setFile(null)
                setPreview(null)
                setError(null)
              }}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              disabled={isUploading}
            >
              <X className="w-6 h-6 text-red-500" />
            </button>
          </div>

          {/* Campos adicionales opcionales */}
          <div className="space-y-4">
            <div>
              <label htmlFor="transactionId" className="block text-sm font-medium text-gray-300 mb-2">
                ID de Transacción (Opcional)
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Si tu banco o método de pago te proporcionó un número de referencia o ID de la transacción, ingrésalo aquí
              </p>
              <input
                id="transactionId"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Ej: REF-123456789 o número de confirmación"
                className="w-full px-4 py-3 bg-darker border border-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                disabled={isUploading}
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cualquier información adicional que quieras compartir sobre tu pago..."
                rows={3}
                className="w-full px-4 py-3 bg-darker border border-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                disabled={isUploading}
              />
            </div>
          </div>

          {warning && (
            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-500">{warning}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
              {(isExpired || isTimerExpired) && (
                <button
                  onClick={() => router.push('/tienda')}
                  className="w-full mt-3 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Volver a la Tienda
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={isUploading || isTimerExpired}
            className="w-full py-4 bg-primary hover:bg-secondary text-white font-bold text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center neon-border-cyan"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Subiendo Comprobante...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 mr-2" />
                Confirmar y Subir Comprobante
              </>
            )}
          </button>

          <p className="text-sm text-gray-400 text-center">
            Una vez subido, nuestro equipo verificará tu pago y procesará tu orden
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
