// src/components/CheckoutModal.jsx
import { useState } from "react";

export default function CheckoutModal({ open, onClose, onSubmit, loading }) {
  const [fields, setFields] = useState({
    full_name: "",
    phone: "",
    address: ""
  });
  const [error, setError] = useState("");

  // Сброс формы при закрытии
  if (!open) return null;

  const handleChange = e => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    // Простая валидация
    if (!fields.full_name || !fields.phone || !fields.address) {
      setError("Пожалуйста, заполните все поля");
      return;
    }
    try {
      await onSubmit(fields);
    } catch (e) {
      setError(e.message || "Не удалось оформить заказ");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-2xl p-8 w-[95vw] max-w-md shadow-lg">
        <button
          className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-black"
          onClick={onClose}
          disabled={loading}
          aria-label="Закрыть"
        >×</button>
        <h2 className="text-xl font-bold mb-5">Оформление заказа</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="border rounded px-3 py-2"
            name="full_name"
            placeholder="ФИО"
            value={fields.full_name}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            className="border rounded px-3 py-2"
            name="phone"
            placeholder="Телефон"
            value={fields.phone}
            onChange={handleChange}
            disabled={loading}
          />
          <input
            className="border rounded px-3 py-2"
            name="address"
            placeholder="Адрес доставки"
            value={fields.address}
            onChange={handleChange}
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded py-2 mt-2 transition"
            disabled={loading}
          >
            {loading ? "Отправка..." : "Подтвердить заказ"}
          </button>
        </form>
      </div>
    </div>
  );
}
