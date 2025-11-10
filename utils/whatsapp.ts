import { CartItem } from '@/context/CartContext';

/**
 * Genera un mensaje formateado para WhatsApp con los items del carrito
 * @param items - Array de items del carrito
 * @param total - Total del pedido
 * @returns Mensaje formateado para WhatsApp
 */
export function generateWhatsAppMessage(items: CartItem[], total: number): string {
  let message = 'Estoy interesado/a en finalizar la compra de los siguientes artículos:\n\n';

  items.forEach(item => {
    // Obtener el precio del item (viene en centavos del backend)
    const itemPrice = item.calculatedPrice?.finalPrice
      ? (item.calculatedPrice.finalPrice / 100)
      : (item.price?.finalPrice ? (item.price.finalPrice / 100) : 0);

    const itemName = item.name;
    const itemTotal = (itemPrice * item.quantity).toFixed(2);

    message += `• ${itemName}  ($${itemTotal})\n`;
  });

  message += `\nPrecio Final Total: $${total.toFixed(2)} USD\n\n`;
  message += '¡Gracias!';

  return message;
}

/**
 * Número de WhatsApp de FortLoot
 */
export const FORTLOOT_WHATSAPP = '5491169755444';

/**
 * Abre WhatsApp con un mensaje pre-formateado
 * @param items - Array de items del carrito
 * @param total - Total del pedido
 */
export function openWhatsAppWithCart(items: CartItem[], total: number): void {
  const message = generateWhatsAppMessage(items, total);
  const whatsappUrl = `https://wa.me/${FORTLOOT_WHATSAPP}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
