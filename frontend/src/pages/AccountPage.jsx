import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, getMyOrders } from "../api";

export default function AccountPage() {
  const { user, ready } = useAuth();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      nav("/login");
      return;
    }

    setLoading(true);
    Promise.all([
      api.get("/suggest-price/?mine=1")
        .then(r => setSuggestions(r.data))
        .catch(() => setSuggestions([])),

      getMyOrders()
        .then(r => setOrders(r.data))
        .catch(() => setOrders([])),
    ]).finally(() => setLoading(false));
  }, [ready, user, nav]);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Личный кабинет</h1>

      {/* Предложения цены */}
      <section className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Ваши предложения цен</h2>

        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Товар</th>
                  <th className="px-3 py-2 text-left">Магазин</th>
                  <th className="px-3 py-2 whitespace-nowrap">Предложенная&nbsp;цена</th>
                  <th className="px-3 py-2">Статус</th>
                  <th className="px-3 py-2 whitespace-nowrap">Дата&nbsp;отправки</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.length ? (
                  suggestions.map(s => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2">{s.product}</td>
                      <td className="px-3 py-2">{s.store}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{s.suggested_price}&nbsp;₽</td>
                      <td className="px-3 py-2">
                        {s.approved ? (
                          <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                            Одобрено
                          </span>
                        ) : (
                          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">
                            На&nbsp;рассмотрении
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(s.sent_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                      У вас пока нет предложений.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* История заказов */}
      <section className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">История заказов</h2>

        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : orders.length ? (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">Дата</th>
                <th className="px-3 py-2">Сумма</th>
                <th className="px-3 py-2">Детали</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="px-3 py-2">
                    {new Date(o.date).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{o.total} ₽</td>
                  <td className="px-3 py-2">
                    <Link
                      to={`/orders/${o.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Просмотреть
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Заказов пока нет.</p>
        )}
      </section>
    </div>
  );
}
