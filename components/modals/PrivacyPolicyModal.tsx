"use client"

import { memo } from "react"
import { Modal } from "@/components/ui/Modal"

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PrivacyPolicyModal = memo(({ isOpen, onClose }: PrivacyPolicyModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {{
        title: "Política de Privacidad",
        children: (
          <>
            <p className="text-sm text-gray-500 mb-4">Fecha de Última Actualización: 13 de mayo de 2025</p>

            <h3 className="text-xl font-bold mt-6 mb-3">1. Introducción</h3>

            <p>
              Bienvenido/a a FortLoot ("nosotros", "nuestro"). Nos comprometemos a proteger la privacidad de nuestros
              usuarios ("usted", "su"). Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos,
              compartimos y protegemos su información personal cuando visita nuestro sitio web [Dirección de tu sitio
              web] (el "Sitio") y utiliza nuestros servicios para adquirir Productos digitales (Pavos y artículos de
              Fortnite).
            </p>

            <p>
              Esta política se ha elaborado de conformidad con la Ley de Protección de Datos Personales N° 25.326 de la
              República Argentina y sus normas complementarias.
            </p>

            <p>
              Al utilizar nuestro Sitio y servicios, usted acepta las prácticas descritas en esta Política de
              Privacidad. Si no está de acuerdo, por favor, no utilice el Sitio.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">2. Información que Recopilamos</h3>

            <p>Podemos recopilar diferentes tipos de información personal sobre usted, incluyendo:</p>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Información de Identificación y Contacto:</strong> Nombre, dirección de correo electrónico.
              </li>
              <li>
                <strong>Información de la Cuenta de Juego:</strong> Su nombre de usuario (ID) de Epic Games, necesario
                para la entrega de los Productos (ej: mediante el sistema de regalos).
              </li>
              <li>
                <strong>Información de Transacciones:</strong> Detalles de los Productos que compra, fecha y hora de la
                transacción, monto pagado. Importante: No almacenamos directamente los detalles completos de su tarjeta
                de crédito/débito u otra información financiera sensible; esta información es procesada de forma segura
                por nuestras pasarelas de pago de terceros (ej: Mercado Pago, PayPal). Solo recibimos la confirmación
                del pago y datos parciales para verificar la transacción.
              </li>
              <li>
                <strong>Información de Comunicación:</strong> Cualquier información que nos proporcione al contactar a
                nuestro equipo de soporte (consultas, reclamos).
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">3. Finalidad de la Recopilación de Datos</h3>

            <p>Utilizamos la información personal recopilada para las siguientes finalidades principales:</p>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Procesar sus Pedidos:</strong> Para gestionar sus compras, verificar pagos y entregarle los
                Productos adquiridos en su cuenta de Fortnite.
              </li>
              <li>
                <strong>Brindar Soporte al Cliente:</strong> Para responder a sus consultas, solicitudes de reembolso o
                reclamos.
              </li>
              <li>
                <strong>Comunicarnos con Usted:</strong> Para enviarle confirmaciones de pedido, notificaciones sobre la
                entrega, información importante sobre su cuenta o cambios en nuestros términos o políticas.
              </li>
              <li>
                <strong>Mejorar Nuestro Sitio y Servicios:</strong> Para analizar cómo los usuarios interactúan con
                nuestro Sitio, identificar tendencias, solucionar problemas técnicos y optimizar la experiencia del
                usuario.
              </li>
              <li>
                <strong>Seguridad y Prevención de Fraude:</strong> Para proteger la seguridad de nuestro Sitio,
                prevenir actividades fraudulentas o ilegales y cumplir con nuestras obligaciones legales.
              </li>
              <li>
                <strong>Cumplimiento Legal:</strong> Para cumplir con las leyes, regulaciones y procesos legales
                aplicables.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">4. Uso y Divulgación de la Información</h3>

            <p>
              No vendemos, alquilamos ni comercializamos su información personal a terceros. Podemos compartir su
              información personal únicamente en las siguientes circunstancias limitadas:
            </p>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Proveedores de Servicios:</strong> Con terceros que nos prestan servicios para operar nuestro
                negocio, como procesadores de pago. Estos proveedores solo tienen acceso a la información necesaria para
                realizar sus funciones y están obligados contractualmente a protegerla.
              </li>
              <li>
                <strong>Entrega de Productos:</strong> Su nombre de usuario de Epic Games se utilizará para la entrega
                del producto dentro del sistema de Fortnite (ej: gifting).
              </li>
              <li>
                <strong>Requerimientos Legales:</strong> Si así lo exige la ley, una orden judicial o un proceso legal.
              </li>
              <li>
                <strong>Transferencia de Negocio:</strong> En caso de fusión, adquisición, reorganización o venta de
                activos.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">5. Almacenamiento y Seguridad de los Datos</h3>

            <p>
              Tomamos medidas de seguridad razonables para proteger su información personal. Utilizamos conexiones
              seguras (SSL/TLS) para la transmisión de datos sensibles.
            </p>

            <p>
              Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.
              Aunque nos esforzamos por utilizar medios comercialmente aceptables para proteger su información personal,
              no podemos garantizar su seguridad absoluta.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">6. Cookies y Tecnologías Similares</h3>

            <p>
              Utilizamos cookies y tecnologías similares para mejorar la funcionalidad del Sitio, analizar el tráfico,
              personalizar contenido y facilitar su experiencia de usuario.
            </p>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico del Sitio.
              </li>
              <li>
                <strong>Cookies de Rendimiento y Analíticas:</strong> Nos ayudan a entender cómo los usuarios
                interactúan con el Sitio.
              </li>
              <li>
                <strong>Cookies de Funcionalidad:</strong> Permiten recordar sus preferencias.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">7. Privacidad de Menores de Edad</h3>

            <p>
              Nuestro Sitio no está dirigido intencionalmente a menores de 18 años sin el consentimiento de sus padres
              o tutores. No recopilamos a sabiendas información personal de menores sin dicho consentimiento.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">8. Cambios a esta Política de Privacidad</h3>

            <p>
              Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos cualquier cambio material
              publicando la nueva política en el Sitio y actualizando la "Fecha de Última Actualización".
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">9. Contacto</h3>

            <p>
              Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos en:
              fortlootlatam@gmail.com
            </p>
          </>
        ),
      }}
    </Modal>
  )
})

PrivacyPolicyModal.displayName = "PrivacyPolicyModal"
