import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Cookie, Database, Mail, Clock, Globe, Lock, UserCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politica de Privacidad | FortLoot',
  description: 'Politica de privacidad y tratamiento de datos personales de FortLoot',
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-[#0D1B2A] text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00F5D4]/10 rounded-full mb-4">
            <Shield className="w-8 h-8 text-[#00F5D4]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Politica de Privacidad</h1>
          <p className="text-gray-400">
            Ultima actualizacion: 29 de Noviembre de 2024 | Version 1.0
          </p>
        </div>

        {/* Contenido */}
        <div className="space-y-10">
          {/* 1. Responsable */}
          <section className="bg-[#1B263B]/50 rounded-xl p-6 border border-[#1B263B]">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-[#00F5D4]" />
              <h2 className="text-xl font-bold">1. Responsable del Tratamiento</h2>
            </div>
            <div className="text-gray-300 space-y-2">
              <p><strong>Nombre:</strong> FortLoot</p>
              <p><strong>Contacto:</strong> contacto@fortloot.com</p>
              <p>
                FortLoot es un servicio de gifting de items de juegos.
              </p>
            </div>
          </section>

          {/* 2. Datos que recopilamos */}
          <section className="bg-[#1B263B]/50 rounded-xl p-6 border border-[#1B263B]">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-[#00F5D4]" />
              <h2 className="text-xl font-bold">2. Datos que Recopilamos</h2>
            </div>
            <div className="text-gray-300 space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">Datos de cuenta:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>ID de usuario del juego</li>
                  <li>Email o numero de WhatsApp (segun tu preferencia de contacto)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Datos de transacciones:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Historial de compras y pedidos</li>
                  <li>Comprobantes de pago</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Datos tecnicos:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Direccion IP (almacenada como hash anonimizado)</li>
                  <li>Cookies de sesion</li>
                  <li>Tipo de navegador y dispositivo</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Datos de analytics (si consientes):</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Paginas visitadas</li>
                  <li>Tiempo en el sitio</li>
                  <li>Interacciones con la interfaz</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Finalidad */}
          <section className="bg-[#1B263B]/50 rounded-xl p-6 border border-[#1B263B]">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-[#00F5D4]" />
              <h2 className="text-xl font-bold">3. Finalidad del Tratamiento</h2>
            </div>
            <div className="text-gray-300 space-y-2">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Procesamiento de pedidos:</strong> Gestionar y entregar tus compras</li>
                <li><strong>Comunicacion:</strong> Informarte sobre el estado de tus pedidos</li>
                <li><strong>Verificacion:</strong> Confirmar tu identidad para el envio de regalos</li>
                <li><strong>Mejora del servicio:</strong> Analizar el uso del sitio para mejorar la experiencia (solo si consientes)</li>
              </ul>
            </div>
          </section>

          {/* 4. Base Legal */}
          <section className="bg-[#1B263B]/50 rounded-xl p-6 border border-[#1B263B]">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-[#00F5D4]" />
              <h2 className="text-xl font-bold">4. Base Legal</h2>
            </div>
            <div className="text-gray-300 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-[#0D1B2A]/50 rounded-lg">
                <span className="text-[#00F5D4] font-bold">Necesarias</span>
                <span>Ejecucion de contrato - requerido para procesar tu compra</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#0D1B2A]/50 rounded-lg">
                <span className="text-[#00F5D4] font-bold">Analytics</span>
                <span>Consentimiento explicito - solo si lo autorizas</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-[#0D1B2A]/50 rounded-lg">
                <span className="text-[#00F5D4] font-bold">Marketing</span>
                <span>Consentimiento explicito - solo si lo autorizas</span>
              </div>
            </div>
          </section>

          {/* 5. Derechos GDPR */}
          <section className="bg-[#1B263B]/50 rounded-xl p-6 border border-[#1B263B]">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-[#00F5D4]" />
              <h2 className="text-xl font-bold">5. Tus Derechos (GDPR Art. 15-22)</h2>
            </div>
            <div className="text-gray-300 space-y-2">
              <p className="mb-4">Como usuario, tienes derecho a:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-center gap-2 p-3 bg-[#0D1B2A]/50 rounded-lg">
                  <span className="w-2 h-2 bg-[#00F5D4] rounded-full"></span>
                  <span>Acceder a tus datos personales</span>
                </li>
                <li className="flex items-center gap-2 p-3 bg-[#0D1B2A]/50 rounded-lg">
                  <span className="w-2 h-2 bg-[#00F5D4] rounded-full"></span>
                  <span>Rectificar datos incorrectos</span>
                </li>
                <li className="flex items-center gap-2 p-3 bg-[#0D1B2A]/50 rounded-lg">
                  <span className="w-2 h-2 bg-[#00F5D4] rounded-full"></span>
                  <span>Solicitar la eliminacion de tus datos</span>
                </li>
                <li className="flex items-center gap-2 p-3 bg-[#0D1B2A]/50 rounded-lg">
                  <span className="w-2 h-2 bg-[#00F5D4] rounded-full"></span>
                  <span>Portabilidad de tus datos</span>
                </li>
                <li className="flex items-center gap-2 p-3 bg-[#0D1B2A]/50 rounded-lg">
                  <span className="w-2 h-2 bg-[#00F5D4] rounded-full"></span>
                  <span>Oponerte al tratamiento</span>
                </li>
                <li className="flex items-center gap-2 p-3 bg-[#0D1B2A]/50 rounded-lg">
                  <span className="w-2 h-2 bg-[#00F5D4] rounded-full"></span>
                  <span>Retirar tu consentimiento</span>
                </li>
              </ul>
              <p className="mt-4 text-sm">
                Para ejercer cualquiera de estos derechos, contactaños a <strong>contacto@fortloot.com</strong>
              </p>
            </div>
          </section>

          {/* 6. Retencion */}
          <section className="bg-[#1B263B]/50 rounded-xl p-6 border border-[#1B263B]">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-[#00F5D4]" />
              <h2 className="text-xl font-bold">6. Retencion de Datos</h2>
            </div>
            <div className="text-gray-300">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1B263B]">
                    <th className="text-left py-2 text-white">Tipo de dato</th>
                    <th className="text-left py-2 text-white">Periodo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B263B]/50">
                  <tr>
                    <td className="py-3">Datos de transaccion</td>
                    <td className="py-3">7 años (obligacion fiscal)</td>
                  </tr>
                  <tr>
                    <td className="py-3">Datos de sesion</td>
                    <td className="py-3">30 dias</td>
                  </tr>
                  <tr>
                    <td className="py-3">Registros de consentimiento</td>
                    <td className="py-3">Indefinido (evidencia legal)</td>
                  </tr>
                  <tr>
                    <td className="py-3">Datos de analytics</td>
                    <td className="py-3">26 meses</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. Transferencias */}
          <section className="bg-[#1B263B]/50 rounded-xl p-6 border border-[#1B263B]">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-[#00F5D4]" />
              <h2 className="text-xl font-bold">7. Transferencias Internacionales</h2>
            </div>
            <div className="text-gray-300 space-y-2">
              <p>Algunos de nuestros proveedores de servicios operan fuera de tu pais:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li><strong>Google Analytics:</strong> EE.UU. (clausulas contractuales tipo)</li>
                <li><strong>Microsoft Clarity:</strong> EE.UU. (clausulas contractuales tipo)</li>
              </ul>
              <p className="mt-3 text-sm text-gray-400">
                Estas transferencias se realizan bajo las garantias adecuadas segun el GDPR.
              </p>
            </div>
          </section>

          {/* 8. Cookies */}
          <section className="bg-[#1B263B]/50 rounded-xl p-6 border border-[#1B263B]">
            <div className="flex items-center gap-3 mb-4">
              <Cookie className="w-6 h-6 text-[#00F5D4]" />
              <h2 className="text-xl font-bold">8. Cookies Utilizadas</h2>
            </div>
            <div className="text-gray-300 overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#1B263B]">
                    <th className="text-left py-2 text-white">Cookie</th>
                    <th className="text-left py-2 text-white">Tipo</th>
                    <th className="text-left py-2 text-white">Duracion</th>
                    <th className="text-left py-2 text-white">Proposito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B263B]/50 text-sm">
                  <tr>
                    <td className="py-3 font-mono text-xs">fortloot_session</td>
                    <td className="py-3">Esencial</td>
                    <td className="py-3">7 dias</td>
                    <td className="py-3">Sesion de usuario</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-xs">fortloot_cookie_consent</td>
                    <td className="py-3">Esencial</td>
                    <td className="py-3">1 ano</td>
                    <td className="py-3">Preferencias de cookies</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-xs">_ga, _gid</td>
                    <td className="py-3">Analytics</td>
                    <td className="py-3">2 años</td>
                    <td className="py-3">Google Analytics</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-mono text-xs">_clsk, _clck</td>
                    <td className="py-3">Analytics</td>
                    <td className="py-3">1 ano</td>
                    <td className="py-3">Microsoft Clarity</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-[#1B263B]">
            <p className="text-gray-400 mb-4">
              Si tienes preguntas sobre esta politica, contactaños a{' '}
              <a href="mailto:contacto@fortloot.com" className="text-[#00F5D4] hover:underline">
                contacto@fortloot.com
              </a>
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#00F5D4] hover:underline"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
