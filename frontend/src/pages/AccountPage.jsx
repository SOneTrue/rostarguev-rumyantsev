import { useState } from 'react';

export default function AccountPage() {
  // Заглушечные данные
  const [suggestions] = useState([
    { id: 1, product: 'Хлеб', store: 'Магнит', price: 30, approved: false },
  ]);
  const [orders] = useState([
    { id: 1, date: '2025‑05‑12', total: 285 },
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Личный кабинет</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Предложения цен */}
        <section className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Предложения цен</h3>
          {suggestions.length ? (
            <ul className="space-y-2">
              {suggestions.map((s) => (
                <li key={s.id} className="flex justify-between border-b pb-2">
                  <span>{s.product} – {s.store}</span>
                  <span className={s.approved ? 'text-green-600' : 'text-yellow-600'}>
                    {s.price} ₽ ({s.approved ? 'одобрено' : 'ожидает'})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Нет предложений</p>
          )}
        </section>

        {/* История заказов */}
        <section className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">История заказов</h3>
          {orders.length ? (
            <ul className="space-y-2">
              {orders.map((o) => (
                <li key={o.id} className="flex justify-between border-b pb-2">
                  <span>{o.date}</span>
                  <span className="font-medium">{o.total} ₽</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Заказов пока нет</p>
          )}
        </section>
      </div>
    </div>
  );
}
