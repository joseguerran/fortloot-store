"use client"

import { memo } from "react"
import { Modal } from "@/components/ui/Modal"

interface TermsConditionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TermsConditionsModal = memo(({ isOpen, onClose }: TermsConditionsModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {{
        title: "Términos y Condiciones",
        children: (
          <>
            <p className="text-sm text-gray-500 mb-4">Fecha de Última Actualización: 13 de mayo de 2025</p>

            <h3 className="text-xl font-bold mt-6 mb-3">1. Introducción y Aceptación</h3>

            <p>
              Bienvenido/a a FortLoot (en adelante, el "Sitio" o "FortLoot"). Estos Términos y Condiciones (en
              adelante, "T&C") rigen el uso de nuestro sitio web ubicado en [Dirección de tu sitio web] y la compra de
              los productos digitales ofrecidos en él, incluyendo, pero no limitado a, Pavos (V-Bucks) y otros
              artículos virtuales para el videojuego Fortnite (en adelante, los "Productos").
            </p>

            <p>
              Al acceder al Sitio, navegar por él o realizar una compra, usted (en adelante, el "Usuario") acepta haber
              leído, entendido y estar de acuerdo con vincularse legalmente a estos T&C, nuestra Política de Privacidad
              y nuestra Política de Reembolsos, las cuales se incorporan aquí por referencia. Si no está de acuerdo con
              alguno de estos términos, por favor, no utilice el Sitio ni adquiera nuestros Productos.
            </p>

            <p>
              FortLoot es un vendedor independiente y no está afiliado, asociado, autorizado, respaldado ni conectado
              oficialmente de ninguna manera con Epic Games, Inc. ni con ninguna de sus subsidiarias o afiliadas.
              Fortnite, Pavos (V-Bucks) y todas las marcas, imágenes y propiedades intelectuales relacionadas son
              propiedad de Epic Games, Inc.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">2. Elegibilidad y Uso del Sitio</h3>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Edad:</strong> Para utilizar este Sitio y adquirir Productos, el Usuario debe tener al menos 18
                años de edad o la mayoría de edad legal en su jurisdicción. Si es menor de edad, solo puede usar el
                Sitio y realizar compras bajo la supervisión y con el consentimiento de un padre o tutor legal.
              </li>
              <li>
                <strong>Información del Usuario:</strong> El Usuario se compromete a proporcionar información verdadera,
                precisa, actual y completa al realizar una compra o al registrarse.
              </li>
              <li>
                <strong>Uso Permitido:</strong> El Sitio y los Productos se ofrecen únicamente para uso personal y no
                comercial del Usuario.
              </li>
              <li>
                <strong>Usos Prohibidos:</strong> Queda estrictamente prohibido utilizar el Sitio para cualquier
                propósito ilegal, fraudulento o que viole los derechos de terceros.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">3. Productos y Servicios</h3>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Descripción:</strong> FortLoot ofrece Productos digitales para ser utilizados exclusivamente
                dentro del videojuego Fortnite.
              </li>
              <li>
                <strong>Naturaleza Digital:</strong> Los Productos son bienes digitales intangibles, cuyo uso ocurre
                dentro del ecosistema de Fortnite.
              </li>
              <li>
                <strong>Disponibilidad y Precios:</strong> Los Productos y sus precios están sujetos a cambios sin
                previo aviso.
              </li>
              <li>
                <strong>Compatibilidad:</strong> Es responsabilidad del Usuario asegurarse de la compatibilidad con su
                cuenta.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">4. Proceso de Compra y Pago</h3>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Pedido:</strong> Al realizar un pedido, el Usuario hace una oferta para comprar los Productos
                seleccionados.
              </li>
              <li>
                <strong>Información Requerida:</strong> El Usuario deberá proporcionar información precisa para el
                procesamiento.
              </li>
              <li>
                <strong>Pago:</strong> El pago se procesará a través de las pasarelas de pago disponibles.
              </li>
              <li>
                <strong>Confirmación:</strong> El Usuario recibirá una confirmación tras la verificación del pago.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">5. Entrega de Productos</h3>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Método de Entrega:</strong> Los Productos se entregarán según el método especificado durante la
                compra.
              </li>
              <li>
                <strong>Plazo de Entrega:</strong> La entrega se realizará tras la confirmación del pago.
              </li>
              <li>
                <strong>Confirmación:</strong> La entrega se considera completada cuando los Productos son acreditados.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">6. Política de Reembolsos</h3>

            <p>Todas las solicitudes de reembolso se rigen por nuestra Política de Reembolsos.</p>

            <h3 className="text-xl font-bold mt-6 mb-3">7. Propiedad Intelectual</h3>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Contenido de FortLoot:</strong> El contenido del Sitio es propiedad de FortLoot o sus
                licenciantes.
              </li>
              <li>
                <strong>Contenido de Terceros:</strong> Las marcas de Fortnite son propiedad de Epic Games, Inc.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">8. Limitación de Responsabilidad</h3>

            <p>
              El Sitio y los Productos se proporcionan "tal cual" y "según disponibilidad", sin garantías de ningún
              tipo. FortLoot no es responsable por:
            </p>

            <ul className="list-disc pl-6 mb-4">
              <li>El funcionamiento del juego Fortnite o cambios realizados por Epic Games.</li>
              <li>Problemas técnicos o suspensiones de la cuenta del Usuario.</li>
              <li>La pérdida o uso indebido de los Productos una vez entregados.</li>
              <li>Cualquier interacción entre el Usuario y Epic Games.</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">9. Indemnización</h3>

            <p>
              El Usuario acepta indemnizar y mantener indemne a FortLoot de cualquier reclamo que surja de su uso del
              Sitio o la violación de estos T&C.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">10. Modificaciones a los Términos</h3>

            <p>
              FortLoot se reserva el derecho de modificar estos T&C en cualquier momento. Los cambios serán efectivos
              tras su publicación en el Sitio.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">11. Disposiciones Generales</h3>

            <p>
              Si alguna disposición de estos T&C es considerada inválida, las disposiciones restantes permanecerán en
              vigor. Estos T&C constituyen el acuerdo completo entre el Usuario y FortLoot.
            </p>
          </>
        ),
      }}
    </Modal>
  )
})

TermsConditionsModal.displayName = "TermsConditionsModal"
