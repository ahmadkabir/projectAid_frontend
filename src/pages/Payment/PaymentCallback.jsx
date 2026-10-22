import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Receipt,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../services/api';

const formatAmount = (amount) =>
  `₦${Number(amount || 0).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = (
    searchParams.get('reference') ||
    searchParams.get('trxref') ||
    ''
  ).trim();

  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Confirming your payment with Paystack...');
  const [order, setOrder] = useState(null);
  const [returnTo, setReturnTo] = useState('/dashboard/orders');
  const started = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('paymentReturnTo');
    if (stored?.startsWith('/')) setReturnTo(stored);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!reference) {
      setStatus('failed');
      setMessage('No payment reference was provided.');
      return;
    }

    const verify = async () => {
      try {
        const response = await ordersAPI.verifyPayment(reference);
        setOrder(response.data.order);
        setStatus('success');
        setMessage('Your payment has been confirmed.');
        sessionStorage.removeItem('paymentReturnTo');
        toast.success('Payment successful');
      } catch (error) {
        setStatus('failed');
        setMessage(
          error.response?.data?.message ||
          error.message ||
          'We could not verify this payment.'
        );
      }
    };

    verify();
  }, [reference]);

  const retry = () => {
    started.current = false;
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="bg-primary-blue px-6 py-8 text-center text-white">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              {status === 'verifying' && <Loader2 size={28} className="animate-spin" />}
              {status === 'success' && <CheckCircle2 size={30} />}
              {status === 'failed' && <XCircle size={30} />}
            </div>
            <h1 className="text-xl font-bold">
              {status === 'verifying' && 'Verifying payment'}
              {status === 'success' && 'Payment successful'}
              {status === 'failed' && 'Payment not confirmed'}
            </h1>
            <p className="mt-2 text-sm text-white/75">{message}</p>
          </div>

          <div className="p-6">
            {status === 'verifying' && (
              <div className="flex items-center justify-center gap-3 py-6 text-sm text-gray-500">
                <Loader2 size={18} className="animate-spin text-primary-blue" />
                Please wait, this usually takes a few seconds.
              </div>
            )}

            {status === 'success' && order && (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Order</span>
                    <span className="font-semibold text-primary-blue">#{order.id}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Amount paid</span>
                    <span className="font-semibold text-primary-blue">
                      {formatAmount(order.totalAmount)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Reference</span>
                    <span className="max-w-[60%] truncate font-mono text-xs text-gray-600">
                      {order.transactionId}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  Your downloads are now available in your dashboard.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate('/dashboard/orders')}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-blue px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-blue-light"
                  >
                    <Receipt size={18} />
                    View my orders
                  </button>
                  <button
                    onClick={() => navigate(returnTo)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-primary-blue transition-colors hover:bg-gray-50"
                  >
                    Return
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  No access has been unlocked. If you were charged, the payment
                  webhook may still be processing. Check your orders in a moment
                  or contact support with your payment reference.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={retry}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-blue px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-blue-light"
                  >
                    <RefreshCw size={18} />
                    Try again
                  </button>
                  <Link
                    to="/dashboard/orders"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-primary-blue transition-colors hover:bg-gray-50"
                  >
                    View my orders
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
