import { useCart } from '../contexts/CartContext';

export default function CartPage() {
  const { items, updateQty, remove, total } = useCart();

  if (!items.length)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl mb-4">Корзина пуста</p>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Корзина</h2>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Товар</th>
            <th className="p-3 text-right">Цена</th>
            <th className="p-3 text-center">Кол-во</th>
            <th className="p-3 text-right">Сумма</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="p-3">{it.name}</td>
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
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-4 font-bold text-xl">
        Итого: {total} ₽
      </div>
    </div>
  );
}
