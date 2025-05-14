import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        const { data } = await api.get(`/orders/?id=${orderId}`);
        setOrder(data);
      } catch {
        setError('Не удалось загрузить заказ.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) return <div className="text-center py-12">Загрузка...</div>;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-center">Детали заказа #{order.id}</h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Информация о заказе</h3>
              <p><strong>Дата:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
              <p>
                <strong>Статус:</strong>
                <span className="ml-2 inline-block px-2 py-1 rounded bg-green-100 text-green-800">
                  Завершен
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">Товар</th>
                <th className="px-6 py-3">Цена</th>
                <th className="px-6 py-3">Количество</th>
                <th className="px-6 py-3">Сумма</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">{item.product.name}</td>
                  <td className="px-6 py-4">{item.price} ₽</td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">{item.price * item.quantity} ₽</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 p-6 border-t">
          <div className="flex justify-end">
            <span className="text-lg font-bold">Итого: {order.total} ₽</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={() => navigate('/account')}
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
        >
          Назад к профилю
        </button>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Распечатать
        </button>
      </div>
    </main>
  );
}
