"use client"

import { memo } from "react"
import { Modal } from "@/components/ui/Modal"

interface RefundPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const RefundPolicyModal = memo(({ isOpen, onClose }: RefundPolicyModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {{
        title: "Política de Reembolsos",
        children: (
          <>
            <p className="text-sm text-gray-500 mb-4">Fecha de Última Actualización: 12 de mayo de 2025</p>

            <p>
              En FortLoot, nos esforzamos por asegurar la satisfacción de nuestros clientes con cada compra de Pavos y
              artículos de Fortnite. Entendemos que pueden surgir situaciones excepcionales, y hemos establecido la
              siguiente política para gestionar las solicitudes de reembolso de manera justa y transparente.
            </p>

            <p>
              Debido a la naturaleza digital de los bienes que ofrecemos (Pavos y artículos virtuales para Fortnite),
              nuestra política de reembolsos es limitada. Una vez que un producto digital ha sido entregado y/o canjeado
              en una cuenta de Fortnite, generalmente no podemos ofrecer un reembolso o cambio.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">1. Casos Elegibles para un Reembolso:</h3>

            <p>Un reembolso completo o un reemplazo del producto podrán ser considerados en los siguientes casos:</p>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>No Entrega del Producto:</strong> Si has realizado el pago y no has recibido los Pavos o el
                artículo adquirido en tu cuenta de Fortnite dentro del plazo de entrega estipulado (una vez verificado
                el pago y procesada la orden), y el error es atribuible a FortLoot.
              </li>
              <li>
                <strong>Producto Incorrecto Entregado:</strong> Si recibes un artículo o una cantidad de Pavos diferente
                al que ordenaste, y el error es atribuible a FortLoot. Deberás informarnos antes de utilizar o canjear
                el producto incorrecto.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">2. Casos NO Elegibles para un Reembolso:</h3>

            <p>No se realizarán reembolsos en las siguientes circunstancias:</p>

            <ul className="list-disc pl-6 mb-4">
              <li>
                <strong>Cambio de Opinión / Arrepentimiento:</strong> Una vez que los Pavos o artículos han sido
                entregados o acreditados a la cuenta de Fortnite especificada, no se ofrecen reembolsos si simplemente
                cambias de opinión.
              </li>
              <li>
                <strong>Compra Accidental por Parte del Usuario:</strong> No nos hacemos responsables por compras
                realizadas por error o descuido por parte del cliente.
              </li>
              <li>
                <strong>Producto Ya Canjeado, Utilizado o Regalado:</strong> Si los Pavos han sido gastados, el artículo
                ha sido utilizado en el juego, o el regalo (si aplica) ha sido aceptado por el destinatario.
              </li>
              <li>
                <strong>Prohibiciones (Baneos) o Problemas con la Cuenta de Fortnite del Usuario:</strong> No somos
                responsables por la suspensión, baneo o cualquier otra restricción impuesta a tu cuenta de Fortnite por
                Epic Games debido a acciones que violen sus Términos de Servicio, independientemente de si los artículos
                comprados en FortLoot están involucrados o no.
              </li>
              <li>
                <strong>Errores en la Información Proporcionada por el Usuario:</strong> Si la entrega no se puede
                completar o se realiza a una cuenta incorrecta debido a que el usuario proporcionó información errónea
                (por ejemplo, un nombre de usuario de Epic Games incorrecto).
              </li>
              <li>
                <strong>Diferencias de Precio Posteriores a la Compra:</strong> Si el precio de un artículo cambia
                después de que hayas completado tu compra.
              </li>
              <li>
                <strong>Problemas de Compatibilidad o Requisitos del Juego:</strong> Es responsabilidad del usuario
                asegurarse de que su cuenta y plataforma son compatibles con los artículos adquiridos.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">3. Proceso para Solicitar un Reembolso:</h3>

            <p>
              Para solicitar un reembolso basado en los criterios de elegibilidad mencionados anteriormente, por favor
              sigue estos pasos:
            </p>

            <ul className="list-disc pl-6 mb-4">
              <li>
                Contacta a nuestro equipo de soporte a través de fortlootlatam@gmail.com o el formulario de contacto en
                nuestra página web.
              </li>
              <li>
                Proporciona la siguiente información:
                <ul className="list-disc pl-6 mt-2">
                  <li>Número de pedido.</li>
                  <li>Nombre de usuario de Epic Games asociado con la compra.</li>
                  <li>Fecha de la compra.</li>
                  <li>Motivo detallado de la solicitud de reembolso.</li>
                  <li>
                    Cualquier evidencia que respalde tu reclamación (capturas de pantalla, mensajes de error, etc.).
                  </li>
                </ul>
              </li>
              <li>
                Las solicitudes de reembolso deben realizarse dentro de un plazo de 24 horas desde la fecha de compra o
                la fecha de entrega programada, lo que ocurra más tarde.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">4. Procesamiento de Reembolsos:</h3>

            <ul className="list-disc pl-6 mb-4">
              <li>
                Una vez recibida tu solicitud, nuestro equipo la revisará y te contactará en un plazo de 3-5 días
                hábiles para informarte sobre la decisión.
              </li>
              <li>
                Si tu solicitud de reembolso es aprobada, el reembolso se procesará a través del método de pago original
                dentro de un plazo desde el día que se aceptó esta hasta 14 días hábiles, dependiendo de los tiempos de
                procesamiento de tu banco o proveedor de pagos.
              </li>
              <li>
                FortLoot se reserva el derecho de rechazar cualquier solicitud de reembolso que no cumpla con los
                criterios establecidos en esta política o que se considere fraudulenta o abusiva.
              </li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">
              5. Artículos de Fortnite y Términos de Servicio de Epic Games:
            </h3>

            <p>
              Todos los artículos y Pavos vendidos son para uso en el juego Fortnite, y su uso está sujeto a los
              Términos de Servicio y políticas de Epic Games. FortLoot no se hace responsable de ninguna acción tomada
              por Epic Games en relación con los artículos una vez entregados.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">6. Modificaciones a la Política de Reembolsos:</h3>

            <p>
              FortLoot se reserva el derecho de modificar esta Política de Reembolsos en cualquier momento. Cualquier
              cambio será efectivo inmediatamente después de su publicación en nuestra página web. Te recomendamos
              revisar esta política periódicamente.
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">7. Contacto:</h3>

            <p>
              Si tienes alguna pregunta sobre nuestra Política de Reembolsos, por favor contáctanos en
              fortlootlatam@gmail.com.
            </p>
          </>
        ),
      }}
    </Modal>
  )
})

RefundPolicyModal.displayName = "RefundPolicyModal"
