import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { checkout } from "../api";
import CheckoutModal from "../components/CheckoutModal";

export default function CartPage() {
  const { items, updateQty, remove, clear, total, error, setError } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  // Для итоговой интеграции с API: сюда добавь новые поля!
  async function handleCheckoutSubmit(fields) {
    setError("");
    setLoading(true);
    try {
      // Собери orderItems для API (если нужно)
      const orderItems = items.map(it => ({
        product: it.id,
        quantity: it.quantity,
        price: it.price
      }));

      // Отправь на backend вместе с полями из формы:
      await checkout({
        full_name: fields.full_name,
        phone: fields.phone,
        address: fields.address,
        items: orderItems,
      });

      setShowModal(false);
      clear();
      navigate("/account");
    } catch (e) {
      setError("Не удалось оформить заказ. Попробуйте позже.");
      throw e; // для вывода ошибки в модалке
    } finally {
      setLoading(false);
    }
  }

  if (!items.length)
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl">Корзина пуста</p>
      </div>
    );

  function handleChangeQty(it, val) {
    const qty = Math.max(1, Number(val) || 1);
    if (qty > (it.stock ?? 99)) {
      setInputErrors((prev) => ({
        ...prev,
        [it.id + "-" + it.store_id]: `Доступно только ${it.stock ?? 99} шт.`,
      }));
      updateQty(it.id, it.store_id, it.stock ?? 99, it.stock ?? 99);
    } else {
      setInputErrors((prev) => ({ ...prev, [it.id + "-" + it.store_id]: "" }));
      updateQty(it.id, it.store_id, qty, it.stock ?? 99);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Корзина</h2>

      {error && (
        <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">{error}</div>
      )}

      <div className="relative">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead className="bg-gray-100 text-sm text-left">
              <tr>
                <th className="p-3">Товар</th>
                <th className="p-3">Магазин</th>
                <th className="p-3 text-right">Цена</th>
                <th className="p-3 text-center">Кол-во</th>
                <th className="p-3 text-right">Сумма</th>
                <th className="p-3 text-center">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const key = it.id + '-' + it.store_id;
                return (
                  <tr key={key} className="border-t text-sm">
                    <td className="p-3 font-medium">{it.name}</td>
                    <td className="p-3">{it.store ?? "-"}</td>
                    <td className="p-3 text-right">{it.price} ₽</td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="1"
                        max={it.stock ?? 99}
                        value={it.quantity}
                        onChange={e => handleChangeQty(it, e.target.value)}
                        className="w-16 border rounded text-center"
                      />
                      {inputErrors[it.id + '-' + it.store_id] && (
                        <div className="text-xs text-red-500">
                          {inputErrors[it.id + '-' + it.store_id]}
                        </div>
                      )}
                      {it.stock !== undefined && (
                        <div className="text-xs text-gray-400">
                          в наличии: {it.stock}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {it.price * it.quantity} ₽
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => remove(it.id, it.store_id)}
                        className="text-red-600 hover:underline"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* итог + кнопка оформления */}
        <div className="mt-6 flex justify-end">
          <div className="bg-white rounded-lg shadow p-4 w-full sm:w-auto sm:min-w-[280px] text-right">
            <div className="text-lg mb-3 font-semibold">
              Итого: <span className="text-2xl">{total} ₽</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              disabled={loading || Object.values(inputErrors).some(Boolean)}
              className={`w-full py-2 rounded transition ${
                loading || Object.values(inputErrors).some(Boolean)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {loading ? "Оформляем..." : "Оформить заказ"}
            </button>
          </div>
        </div>
      </div>

      {/* --- Модальное окно оформления заказа --- */}
      <CheckoutModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCheckoutSubmit}
        loading={loading}
      />
    </div>
  );
}
