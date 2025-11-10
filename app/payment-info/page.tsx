'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PaymentInfoPage() {
  return (
    <div className="min-h-screen bg-[#0A0118] text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-russo text-center mb-4 neon-text">
            Información de Pago
          </h1>
          <p className="text-center text-gray-400 mb-12">
            Métodos de pago disponibles para tu orden
          </p>

          {/* Important Notice */}
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-6 mb-8">
            <h3 className="text-yellow-500 font-bold text-lg mb-2">⚠ Importante</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Después de realizar el pago, debes subir tu comprobante en la página de tu orden</li>
              <li>El pago será verificado manualmente por nuestro equipo</li>
              <li>La verificación puede tomar entre 15 minutos y 2 horas</li>
              <li>Una vez verificado, tu pedido entrará en proceso de entrega</li>
              <li>Tu orden expira 1 hora antes del cierre del catálogo diario</li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            {/* Bank Transfer */}
            <div className="bg-[#1A0B2E] rounded-xl p-8 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🏦</div>
                <h2 className="text-2xl font-russo">Transferencia Bancaria</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0A0118] rounded-lg p-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Banco:</p>
                  <p className="font-bold">Banco de Venezuela</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tipo de Cuenta:</p>
                  <p className="font-bold">Corriente</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Número de Cuenta:</p>
                  <p className="font-mono">0102-1234-56-1234567890</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Titular:</p>
                  <p className="font-bold">FortLoot C.A.</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">RIF:</p>
                  <p className="font-mono">J-123456789</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email:</p>
                  <p>pagos@fortloot.com</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                * Incluye tu número de orden en la referencia o notas de la transferencia
              </p>
            </div>

            {/* PayPal */}
            <div className="bg-[#1A0B2E] rounded-xl p-8 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">💳</div>
                <h2 className="text-2xl font-russo">PayPal</h2>
              </div>
              <div className="bg-[#0A0118] rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Envía el pago a:</p>
                <p className="font-mono text-xl mb-4">payments@fortloot.com</p>
                <p className="text-sm text-gray-400">
                  Puedes usar tu cuenta PayPal o tarjeta de crédito/débito a través de PayPal
                </p>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                * Envía el pago como "Amigos y Familia" para evitar comisiones adicionales
              </p>
            </div>

            {/* Zelle */}
            <div className="bg-[#1A0B2E] rounded-xl p-8 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">💵</div>
                <h2 className="text-2xl font-russo">Zelle</h2>
              </div>
              <div className="bg-[#0A0118] rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">Envía el pago a:</p>
                <p className="font-mono text-xl mb-4">payments@fortloot.com</p>
                <p className="text-sm text-gray-400">
                  Zelle es un método rápido y sin comisiones para pagos en USD
                </p>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                * El pago se refleja instantáneamente
              </p>
            </div>

            {/* Cryptocurrencies */}
            <div className="bg-[#1A0B2E] rounded-xl p-8 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">₿</div>
                <h2 className="text-2xl font-russo">Criptomonedas</h2>
              </div>

              <div className="space-y-4">
                {/* USDT TRC20 */}
                <div className="bg-[#0A0118] rounded-lg p-6">
                  <p className="font-bold text-green-500 mb-2">USDT (TRC20)</p>
                  <p className="text-xs text-gray-400 mb-2">Red: Tron (TRC20)</p>
                  <div className="bg-black rounded p-3 break-all">
                    <p className="font-mono text-sm">TExampleAddress123456789012345678901234567</p>
                  </div>
                  <p className="text-xs text-yellow-500 mt-2">⚠ Asegúrate de usar la red TRC20</p>
                </div>

                {/* BTC */}
                <div className="bg-[#0A0118] rounded-lg p-6">
                  <p className="font-bold text-orange-500 mb-2">Bitcoin (BTC)</p>
                  <div className="bg-black rounded p-3 break-all">
                    <p className="font-mono text-sm">bc1qexampleaddress1234567890123456789</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Confirmación puede tomar hasta 30 minutos</p>
                </div>

                {/* ETH */}
                <div className="bg-[#0A0118] rounded-lg p-6">
                  <p className="font-bold text-blue-500 mb-2">Ethereum (ETH)</p>
                  <div className="bg-black rounded p-3 break-all">
                    <p className="font-mono text-sm">0xExampleAddress123456789012345678901234567890</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Red: Ethereum Mainnet</p>
                </div>

                {/* Binance Pay */}
                <div className="bg-[#0A0118] rounded-lg p-6">
                  <p className="font-bold text-yellow-500 mb-2">Binance Pay</p>
                  <p className="text-gray-300 mb-2">Pay ID:</p>
                  <p className="font-mono text-xl">123456789</p>
                  <p className="text-xs text-gray-400 mt-2">Método rápido y sin comisiones desde Binance</p>
                </div>
              </div>

              <p className="text-sm text-gray-400 mt-4">
                * Envía el monto exacto de tu orden. Las comisiones de red corren por tu cuenta.
              </p>
            </div>

            {/* Mobile Payment */}
            <div className="bg-[#1A0B2E] rounded-xl p-8 border border-primary/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">📱</div>
                <h2 className="text-2xl font-russo">Pago Móvil (Venezuela)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#0A0118] rounded-lg p-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Banco:</p>
                  <p className="font-bold">Banco de Venezuela</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Teléfono:</p>
                  <p className="font-mono">0424-1234567</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Cédula/RIF:</p>
                  <p className="font-mono">J-123456789</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Titular:</p>
                  <p className="font-bold">FortLoot C.A.</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                * Aplica la tasa de cambio del día. Consulta el monto en BsS antes de pagar.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[#1A0B2E] rounded-xl p-8 border border-secondary/20 mt-8">
            <h2 className="text-2xl font-russo mb-6 text-secondary">Pasos para Completar tu Pago</h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold">
                  1
                </span>
                <div>
                  <p className="font-bold mb-1">Realiza el pago</p>
                  <p className="text-gray-400 text-sm">
                    Elige uno de los métodos de pago disponibles y realiza la transferencia por el monto exacto de tu orden.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold">
                  2
                </span>
                <div>
                  <p className="font-bold mb-1">Toma captura del comprobante</p>
                  <p className="text-gray-400 text-sm">
                    Guarda una captura de pantalla clara donde se vea el monto, fecha, referencia y método de pago.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold">
                  3
                </span>
                <div>
                  <p className="font-bold mb-1">Sube tu comprobante</p>
                  <p className="text-gray-400 text-sm">
                    Ve a la página de tu orden y sube el comprobante junto con los datos de tu transacción.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold">
                  4
                </span>
                <div>
                  <p className="font-bold mb-1">Espera la verificación</p>
                  <p className="text-gray-400 text-sm">
                    Nuestro equipo verificará tu pago en un máximo de 2 horas. Recibirás un email de confirmación.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold">
                  5
                </span>
                <div>
                  <p className="font-bold mb-1">Recibe tu pedido</p>
                  <p className="text-gray-400 text-sm">
                    Una vez verificado, tu pedido será procesado y enviado a tu cuenta de Fortnite.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Support */}
          <div className="bg-[#0A0118] rounded-xl p-6 border border-accent/20 mt-8 text-center">
            <h3 className="text-xl font-russo mb-2 text-accent">¿Necesitas Ayuda?</h3>
            <p className="text-gray-400 mb-4">
              Si tienes dudas sobre los métodos de pago o necesitas asistencia, contáctanos:
            </p>
            <div className="flex justify-center gap-6">
              <a href="mailto:soporte@fortloot.com" className="text-primary hover:underline">
                soporte@fortloot.com
              </a>
              <span className="text-gray-600">|</span>
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
