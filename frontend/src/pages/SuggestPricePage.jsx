import { useState, useEffect } from 'react';
import { sendPriceSuggestion } from '../api';

export default function SuggestPricePage() {
  const [form, setForm] = useState({
    product: '',
    store: '',
    price: '',
    comment: '',
  });

  const [ok, setOk] = useState(false);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    // Получаем список товаров и магазинов
    fetch('http://213.171.24.80:8000/api/products/')
      .then((res) => res.json())
      .then((data) => setProducts(data));

    fetch('http://213.171.24.80:8000/api/stores/')
      .then((res) => res.json())
      .then((data) => setStores(data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await sendPriceSuggestion(form);
    setOk(true);
  };

  if (ok)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-green-700">Спасибо! Заявка отправлена.</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h2 className="text-3xl font-bold mb-6">Предложить новую цену</h2>

      <form onSubmit={submit} className="bg-white p-6 rounded shadow space-y-4">
        <select
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Выберите товар…</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={form.store}
          onChange={(e) => setForm({ ...form, store: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Выберите магазин…</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Новая цена"
          className="w-full border rounded px-3 py-2"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />

        <textarea
          rows="3"
          placeholder="Комментарий"
          className="w-full border rounded px-3 py-2"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Отправить предложение
        </button>
      </form>

      <div className="text-center mt-4">
        <a href="/" className="text-blue-600 hover:underline">
          Вернуться к каталогу
        </a>
      </div>
    </div>
  );
}
