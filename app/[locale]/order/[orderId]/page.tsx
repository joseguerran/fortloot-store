'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  subtotalAmount: number;
  discountAmount: number;
  createdAt: string;
  expiresAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  paymentProofUrl?: string;
  paymentUploadedAt?: string;
  items: Array<{
    catalogItem: {
      name: string;
      description: string;
      image: string;
      type: string;
    };
    quantity: number;
    priceAtPurchase: number;
  }>;
}

const STATUS_KEYS: Record<string, string> = {
  PENDING: 'pending',
  PENDING_PAYMENT: 'pendingPayment',
  PAYMENT_UPLOADED: 'paymentUploaded',
  PAYMENT_VERIFIED: 'paymentVerified',
  PAYMENT_REJECTED: 'paymentRejected',
  WAITING_FRIENDSHIP: 'waitingFriendship',
  WAITING_PERIOD: 'waitingPeriod',
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-yellow-500',
  PENDING_PAYMENT: 'text-orange-500',
  PAYMENT_UPLOADED: 'text-blue-500',
  PAYMENT_VERIFIED: 'text-cyan-500',
  PAYMENT_REJECTED: 'text-red-500',
  WAITING_FRIENDSHIP: 'text-purple-500',
  WAITING_PERIOD: 'text-indigo-500',
  QUEUED: 'text-blue-400',
  PROCESSING: 'text-cyan-400',
  COMPLETED: 'text-green-500',
  FAILED: 'text-red-600',
  CANCELLED: 'text-gray-500',
  EXPIRED: 'text-gray-600',
};

export default function OrderStatusPage() {
  const t = useTranslations('orders');
  const tDetail = useTranslations('orders.detail');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError('');

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || tDetail('loadError'));
      }

      setOrder(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : tDetail('unknownError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadProof = () => {
    setShowUploadModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0118] text-white pt-24">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p>{tDetail('loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#0A0118] text-white pt-24">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="text-6xl mb-6">⚠</div>
            <h1 className="text-3xl font-russo mb-4">{tDetail('notFound')}</h1>
            <p className="text-gray-400 mb-8">{error || tDetail('notFoundDesc')}</p>
            <button
              onClick={() => router.push(`/${locale}/store`)}
              className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
            >
              {tDetail('backToHome')}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canUploadProof = order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_REJECTED';
  const isExpired = order.expiresAt && new Date(order.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-[#0A0118] text-white pt-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-russo mb-2 neon-text">{tDetail('title')}</h1>
            <p className="text-xl text-gray-400">#{order.orderNumber}</p>
          </div>

          {/* Status Badge */}
          <div className="bg-[#1A0B2E] rounded-xl p-8 border border-primary/20 mb-6">
            <div className="text-center">
              <p className="text-gray-400 mb-2">{tDetail('currentStatus')}:</p>
              <p className={`text-3xl font-russo ${STATUS_COLORS[order.status]}`}>
                {t(`status.${STATUS_KEYS[order.status] || order.status.toLowerCase()}`)}
              </p>
              {isExpired && (
                <p className="text-red-500 mt-4">{tDetail('orderExpired')}</p>
              )}
            </div>
          </div>

          {/* Payment Upload Button */}
          {canUploadProof && !isExpired && (
            <div className="bg-[#1A0B2E] rounded-xl p-6 border border-primary/20 mb-6">
              <div className="text-center">
                <h3 className="text-xl font-russo mb-4">
                  {order.status === 'PAYMENT_REJECTED' ? tDetail('upload.resubmitTitle') : tDetail('upload.title')}
                </h3>
                <p className="text-gray-400 mb-6">
                  {order.status === 'PAYMENT_REJECTED'
                    ? tDetail('upload.resubmitDesc')
                    : tDetail('upload.desc')
                  }
                </p>
                <button
                  onClick={handleUploadProof}
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  {tDetail('upload.button')}
                </button>
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="bg-[#1A0B2E] rounded-xl p-8 border border-primary/20 mb-6">
            <h2 className="text-2xl font-russo mb-6">{tDetail('orderDetails')}</h2>

            <div className="space-y-4 mb-6">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-[#0A0118] rounded-lg">
                  <img
                    src={item.catalogItem.image}
                    alt={item.catalogItem.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.catalogItem.name}</h3>
                    <p className="text-sm text-gray-400">{tDetail('quantity')}: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>{tDetail('subtotal')}:</span>
                <span>${order.subtotalAmount.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>{tDetail('discount')}:</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold pt-2">
                <span>{tDetail('total')}:</span>
                <span className="neon-text">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {(order.paymentMethod || order.transactionId || order.paymentUploadedAt || order.paymentProofUrl) && (
            <div className="bg-[#1A0B2E] rounded-xl p-8 border border-primary/20 mb-6">
              <h2 className="text-2xl font-russo mb-6">{tDetail('paymentInfo.title')}</h2>
              <div className="space-y-3">
                {order.paymentMethod && (
                  <div>
                    <span className="text-gray-400">{tDetail('paymentInfo.method')}: </span>
                    <span className="font-medium">{order.paymentMethod}</span>
                  </div>
                )}
                {order.transactionId && (
                  <div>
                    <span className="text-gray-400">{tDetail('paymentInfo.transactionId')}: </span>
                    <span className="font-mono text-sm">{order.transactionId}</span>
                  </div>
                )}
                {order.paymentUploadedAt && (
                  <div>
                    <span className="text-gray-400">{tDetail('paymentInfo.uploadedAt')}: </span>
                    <span>{new Date(order.paymentUploadedAt).toLocaleString(locale)}</span>
                  </div>
                )}
                {order.paymentProofUrl && (
                  <div className="mt-4">
                    <div className="text-gray-400 mb-3">{tDetail('paymentInfo.proofLabel')}:</div>
                    <div className="bg-[#0A0118] rounded-lg p-4">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${order.paymentProofUrl}`}
                        alt={tDetail('paymentInfo.proofAlt')}
                        className="w-full max-w-2xl mx-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${order.paymentProofUrl}`, '_blank')}
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {tDetail('paymentInfo.clickToEnlarge')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-[#1A0B2E] rounded-xl p-8 border border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">{tDetail('created')}: </span>
                <span>{new Date(order.createdAt).toLocaleString(locale)}</span>
              </div>
              {order.expiresAt && (
                <div>
                  <span className="text-gray-400">{tDetail('expires')}: </span>
                  <span className={isExpired ? 'text-red-500' : ''}>
                    {new Date(order.expiresAt).toLocaleString(locale)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push(`/${locale}/store`)}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
            >
              {tDetail('backToStore')}
            </button>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <PaymentUploadModal
          orderId={order.id}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchOrderDetails();
          }}
        />
      )}

      <Footer />
    </div>
  );
}

// Payment Upload Modal Component
function PaymentUploadModal({
  orderId,
  onClose,
  onSuccess,
}: {
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations('orders.detail.modal');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!paymentMethod || !transactionId || !file) {
      setError(t('errors.requiredFields'));
      return;
    }

    setIsUploading(true);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

      const formData = new FormData();
      formData.append('paymentMethod', paymentMethod);
      formData.append('transactionId', transactionId);
      formData.append('notes', notes);
      formData.append('paymentProof', file);

      const response = await fetch(`${API_BASE_URL}/payments/orders/${orderId}/proof`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('errors.uploadFailed'));
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknown'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A0B2E] rounded-xl p-8 max-w-md w-full border border-primary/20">
        <h2 className="text-2xl font-russo mb-6">{t('title')}</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('paymentMethod')} *</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0118] border border-primary/30 rounded-lg focus:outline-none focus:border-primary"
              required
            >
              <option value="">{t('selectMethod')}</option>
              <option value="Transferencia">{t('methods.transfer')}</option>
              <option value="PayPal">PayPal</option>
              <option value="Zelle">Zelle</option>
              <option value="Binance">Binance</option>
              <option value="Otro">{t('methods.other')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('transactionId')} *</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0118] border border-primary/30 rounded-lg focus:outline-none focus:border-primary"
              placeholder="ABC123..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('proofImage')} *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 bg-[#0A0118] border border-primary/30 rounded-lg focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-[#0A0118] border border-primary/30 rounded-lg focus:outline-none focus:border-primary"
              rows={3}
              placeholder={t('notesPlaceholder')}
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
              disabled={isUploading}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50"
              disabled={isUploading}
            >
              {isUploading ? t('uploading') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
