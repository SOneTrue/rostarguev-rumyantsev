import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api, getMyOrders } from "../api";

export default function AccountPage() {
  const { user, ready } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  // Показ уведомления после входа или регистрации
  useEffect(() => {
    if (location.state && location.state.message) {
      setMessage(location.state.message);
      // Уведомление скрывается через 3 секунды
      const timeout = setTimeout(() => setMessage(''), 3000);
      // Чистим state, чтобы сообщение не повторялось при обновлении
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timeout);
    }
  }, [location.state]);

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

  // Функция для отрисовки статуса заказа
  function renderOrderStatus(status) {
    if (status === "delivering") {
      return <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">Доставляется</span>;
    }
    if (status === "delivered") {
      return <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Доставлен</span>;
    }
    if (status === "pending") {
      return <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">В обработке</span>;
    }
    return <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded">{status || "-"}</span>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-2 py-8">
      <h1 className="text-3xl font-bold mb-6">Личный кабинет</h1>

      {/* Сообщение о входе/регистрации */}
      {message && (
        <div className="mb-6 text-green-700 bg-green-100 p-3 rounded text-center text-base">
          {message}
        </div>
      )}

      {/* Предложения цены */}
      <section className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Ваши предложения цен</h2>
        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Товар</th>
                  <th className="px-3 py-2 text-left">Магазин</th>
                  <th className="px-3 py-2 text-right">Предложенная цена</th>
                  <th className="px-3 py-2 text-center">Статус</th>
                  <th className="px-3 py-2 text-center">Дата отправки</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {suggestions.length ? (
                  suggestions.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{s.product}</td>
                      <td className="px-3 py-2">{s.store}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">{s.suggested_price}&nbsp;₽</td>
                      <td className="px-3 py-2 text-center">
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
                      <td className="px-3 py-2 text-center whitespace-nowrap">
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
      <section className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">История заказов</h2>
        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Дата</th>
                  <th className="px-3 py-2 text-right">Сумма</th>
                  <th className="px-3 py-2 text-center">Статус</th>
                  <th className="px-3 py-2 text-center">Детали</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      {o.created_at
                        ? new Date(o.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">{o.total} ₽</td>
                    <td className="px-3 py-2 text-center">{renderOrderStatus(o.status)}</td>
                    <td className="px-3 py-2 text-center">
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
          </div>
        ) : (
          <p className="text-gray-500">Заказов пока нет.</p>
        )}
      </section>
    </div>
  );
}
