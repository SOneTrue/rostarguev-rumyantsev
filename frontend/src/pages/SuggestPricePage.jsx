import { useState } from 'react';
import { sendPriceSuggestion } from '../api';

export default function SuggestPricePage() {
  const [form, setForm] = useState({
    product: '',
    store: '',
    price: '',
    comment: '',
  });
  const [ok, setOk] = useState(false);

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
      <h2 className="text-3xl font-bold mb-6">Предложить цену</h2>

      <form onSubmit={submit} className="bg-white p-6 rounded shadow">
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Товар"
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
        />
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Магазин"
          value={form.store}
          onChange={(e) => setForm({ ...form, store: e.target.value })}
        />
        <input
          type="number"
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Цена"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <textarea
          rows="3"
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Комментарий"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Отправить
        </button>
      </form>
    </div>
  );
}
