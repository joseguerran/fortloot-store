'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  createdAt: string;
  expiresAt: string | null;
  items: Array<{
    id: string;
    quantity: number;
    priceAtPurchase: number;
    catalogItem: {
      name: string;
      type: string;
      image: string;
    };
  }>;
}

interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  lifetimeValue: number;
  tier: string;
}

export default function MyOrdersPage() {
  const [epicAccountId, setEpicAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!epicAccountId.trim()) {
      setError('Por favor ingresa tu Epic ID');
      return;
    }

    setLoading(true);
    setError('');
    setOrders([]);
    setStats(null);

    try {
      // Fetch customer stats
      const statsRes = await fetch(
        `${API_BASE_URL}/customers/${epicAccountId}/stats`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!statsRes.ok) {
        if (statsRes.status === 404) {
          setError('No se encontraron órdenes para este Epic ID');
          return;
        }
        throw new Error('Error al obtener estadísticas');
      }

      const statsData = await statsRes.json();
      setStats(statsData.data);

      // Fetch orders
      const ordersRes = await fetch(
        `${API_BASE_URL}/orders?customerId=${statsData.data.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.data.orders || []);
      }
    } catch {
      setError('Error al cargar tus órdenes. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'bg-yellow-500', text: 'Pendiente' },
      PENDING_PAYMENT: { color: 'bg-yellow-500', text: 'Esperando Pago' },
      PAYMENT_UPLOADED: { color: 'bg-blue-500', text: 'Pago Subido' },
      PAYMENT_VERIFIED: { color: 'bg-green-500', text: 'Pago Verificado' },
      PAYMENT_REJECTED: { color: 'bg-red-500', text: 'Pago Rechazado' },
      WAITING_FRIENDSHIP: { color: 'bg-purple-500', text: 'Esperando Amistad' },
      WAITING_PERIOD: { color: 'bg-indigo-500', text: 'Período de Espera' },
      QUEUED: { color: 'bg-cyan-500', text: 'En Cola' },
      PROCESSING: { color: 'bg-blue-500', text: 'Procesando' },
      COMPLETED: { color: 'bg-green-500', text: 'Completada' },
      FAILED: { color: 'bg-red-500', text: 'Fallida' },
      EXPIRED: { color: 'bg-gray-500', text: 'Expirada' },
      CANCELLED: { color: 'bg-gray-500', text: 'Cancelada' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-500', text: status };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold text-white ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getTierBadge = (tier: string) => {
    const tierColors: Record<string, string> = {
      REGULAR: 'text-gray-400',
      VIP: 'text-yellow-400',
      PREMIUM: 'text-purple-400',
    };

    return (
      <span className={`font-bold ${tierColors[tier] || 'text-gray-400'}`}>
        {tier}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0118] text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-russo text-center mb-4 neon-text">
            Mis Órdenes
          </h1>
          <p className="text-center text-gray-400 mb-12">
            Consulta el historial de tus órdenes
          </p>

          {/* Search Form */}
          <div className="bg-[#1A0B2E] rounded-xl p-8 border border-primary/20 mb-8">
            <form onSubmit={handleSearch}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Epic ID
                </label>
                <input
                  type="text"
                  value={epicAccountId}
                  onChange={(e) => setEpicAccountId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0A0118] border border-primary/30 rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Ej: TheProPlayer#1"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Buscando...' : 'Buscar Órdenes'}
              </button>
            </form>
          </div>

          {/* Customer Stats */}
          {stats && (
            <div className="bg-[#1A0B2E] rounded-xl p-8 border border-secondary/20 mb-8">
              <h2 className="text-2xl font-russo mb-6 text-secondary">
                Estadísticas de Cliente
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tier</p>
                  <p className="text-2xl font-bold">{getTierBadge(stats.tier)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Órdenes</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Gastado</p>
                  <p className="text-2xl font-bold text-green-400">
                    ${stats.totalSpent.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Lifetime Value</p>
                  <p className="text-2xl font-bold text-purple-400">
                    ${stats.lifetimeValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Orders List */}
          {orders.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-russo mb-4">Historial de Órdenes</h2>

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#1A0B2E] rounded-xl p-6 border border-primary/20"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Orden</p>
                      <p className="font-mono text-lg font-bold">
                        {order.orderNumber}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Total</p>
                      <p className="font-bold text-green-400">
                        ${order.totalAmount?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Descuento</p>
                      <p className="font-bold text-secondary">
                        -${order.discountAmount?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Fecha</p>
                      <p className="font-bold">
                        {new Date(order.createdAt).toLocaleDateString('es')}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-primary/20 pt-4">
                    <p className="text-sm text-gray-400 mb-3">Items:</p>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 bg-[#0A0118] p-3 rounded-lg"
                        >
                          {item.catalogItem.image && (
                            <img
                              src={item.catalogItem.image}
                              alt={item.catalogItem.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-bold">{item.catalogItem.name}</p>
                            <p className="text-sm text-gray-400">
                              {item.catalogItem.type} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-bold text-primary">
                            ${item.priceAtPurchase.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="mt-4">
                    <a
                      href={`/order/${order.id}`}
                      className="inline-block bg-primary/20 hover:bg-primary/30 text-primary font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                      Ver Detalles
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {orders.length === 0 && stats && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">
                No se encontraron órdenes
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
