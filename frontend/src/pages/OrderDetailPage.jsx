import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  async function loadOrder() {
    try {
      const { data } = await api.get(`/orders/${orderId}/`);
      setOrder(data);
    } catch {
      setError('Не удалось загрузить заказ.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line
  }, [orderId]);

  async function markDelivered() {
    setUpdating(true);
    try {
      await api.patch(`/orders/${orderId}/`, { status: 'delivering' });
      setTimeout(async () => {
        await api.patch(`/orders/${orderId}/`, { status: 'delivered' });
        await loadOrder();
        setUpdating(false);
      }, 1500);
    } catch {
      setUpdating(false);
      alert('Ошибка при подтверждении доставки');
    }
  }

  // Скачать PDF чек
  function downloadPDFReceipt() {
    fetch(`/api/orders/${orderId}/receipt/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      }
    })
      .then(response => {
        if (!response.ok) throw new Error("Ошибка скачивания PDF");
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order_${orderId}_receipt.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch(() => alert("Ошибка при скачивании PDF чека"));
  }

  // Открыть чек в новой вкладке и сразу вызвать печать
  function printPDFReceipt() {
    fetch(`/api/orders/${orderId}/receipt/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access')}`,
      }
    })
      .then(response => {
        if (!response.ok) throw new Error("Ошибка печати PDF");
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url, "_blank");
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
        } else {
          alert("Окно печати было заблокировано браузером.");
        }
      })
      .catch(() => alert("Ошибка при печати PDF чека"));
  }

  if (loading) return <div className="text-center py-12">Загрузка...</div>;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;

  // Рендер статуса
  const statusInfo = {
    delivering: { label: 'Доставляется', className: "bg-yellow-100 text-yellow-800" },
    delivered: { label: 'Доставлен', className: "bg-green-100 text-green-800" },
    pending: { label: 'В обработке', className: "bg-gray-100 text-gray-800" },
  };
  const currentStatus = statusInfo[order.status] || { label: order.status, className: "" };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Детали заказа #{order.id}</h2>
        <div className="mb-4 flex flex-col md:flex-row md:justify-between gap-2">
          <div>
            <span className="block"><strong>Дата:</strong> {order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}</span>
            <span className="block mt-1">
              <strong>Статус:</strong>
              <span className={`ml-2 inline-block px-2 py-1 rounded ${currentStatus.className}`}>
                {currentStatus.label}
              </span>
            </span>
          </div>
          <div className="flex md:items-end justify-start md:justify-end mt-2 md:mt-0">
            <span className="text-lg font-bold">Итого: {order.total} ₽</span>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Товар</th>
                <th className="px-4 py-3 text-right">Цена</th>
                <th className="px-4 py-3 text-center">Количество</th>
                <th className="px-4 py-3 text-right">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.product.name}</td>
                  <td className="px-4 py-3 text-right">{item.price} ₽</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{item.price * item.quantity} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button
            onClick={() => navigate('/account')}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Назад к профилю
          </button>
          {order.status === "delivered" ? (
            <>
              <button
                onClick={downloadPDFReceipt}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Скачать чек (PDF)
              </button>
              <button
                onClick={printPDFReceipt}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Печать чека
              </button>
            </>
          ) : (
            <button
              onClick={markDelivered}
              className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
              disabled={updating}
            >
              {updating ? "Подтверждение..." : "Подтвердить доставку"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
