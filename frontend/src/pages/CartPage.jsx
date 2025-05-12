import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { items, updateQty, remove, total } = useCart();
  const navigate = useNavigate();

  if (!items.length)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl mb-4">Корзина пуста</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Корзина</h2>

      <div className="relative">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100 text-sm text-left">
                <th className="p-3">Товар</th>
                <th className="p-3">Магазин</th>
                <th className="p-3 text-right">Цена</th>
                <th className="p-3 text-center">Количество</th>
                <th className="p-3 text-right">Сумма</th>
                <th className="p-3 text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t text-sm">
                  <td className="p-3 font-medium">{it.name}</td>
                  <td className="p-3">{it.store ?? '-'}</td>
                  <td className="p-3 text-right">{it.price} ₽</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) => updateQty(it.id, Number(e.target.value))}
                      className="w-16 border rounded text-center"
                    />
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {it.price * it.quantity} ₽
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => remove(it.id)}
                      className="text-red-600 hover:underline"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Блок итогов */}
        <div className="mt-6 flex justify-end">
          <div className="bg-white rounded-lg shadow p-4 w-full sm:w-auto sm:min-w-[280px] text-right">
            <div className="text-lg mb-2 font-semibold">
              Итого: <span className="text-2xl">{total} ₽</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 transition"
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
