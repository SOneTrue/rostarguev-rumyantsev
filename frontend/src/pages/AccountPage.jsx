import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';              // тот же axios‑инстанс

export default function AccountPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) return nav('/login');

    // примеры энд‑пойнтов — замени на реальные при желании
    api.get('/api/suggest-price/?mine=1').then(r => setSuggestions(r.data))
      .catch(() => setSuggestions([]));

    api.get('/api/orders/?mine=1').then(r => setOrders(r.data))
      .catch(() => setOrders([]));
  }, [user, nav]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Личный кабинет</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ─────────  предложения  ───────── */}
        <section className="bg-white p-6 rounded shadow overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4">Ваши предложения цен</h3>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 text-left">Товар</th>
                <th className="px-2 py-1 text-left">Магазин</th>
                <th className="px-2 py-1">Предложенная цена</th>
                <th className="px-2 py-1">Статус</th>
                <th className="px-2 py-1">Дата отправки</th>
              </tr>
            </thead>
            <tbody>
              {suggestions.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="px-2 py-1">{s.product}</td>
                  <td className="px-2 py-1">{s.store}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{s.suggested_price} ₽</td>
                  <td className="px-2 py-1">
                    {s.approved
                      ? <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Одобрено</span>
                      : <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">На рассмотрении</span>}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">{s.sent_at}</td>
                </tr>
              ))}
              {!suggestions.length && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Нет предложений</td></tr>
              )}
            </tbody>
          </table>
        </section>

        {/* ─────────  заказы  ───────── */}
        <section className="bg-white p-6 rounded shadow overflow-x-auto">
          <h3 className="text-xl font-semibold mb-4">История заказов</h3>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 text-left">Дата</th>
                <th className="px-2 py-1">Сумма</th>
                <th className="px-2 py-1">Детали</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="px-2 py-1">{o.date}</td>
                  <td className="px-2 py-1 whitespace-nowrap">{o.total} ₽</td>
                  <td className="px-2 py-1">
                    <a href={`/order/${o.id}`} className="text-blue-600 hover:underline">Просмотреть</a>
                  </td>
                </tr>
              ))}
              {!orders.length && (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500">Заказов пока нет</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      <div className="mt-8 text-center">
        <a href="/" className="text-blue-600 hover:underline">Вернуться к каталогу</a>
      </div>
    </div>
  );
}
