import { useState } from "react";

// Функция форматирования телефона: +7 (XXX) XXX-XX-XX
function formatPhone(input) {
  let cleaned = input.replace(/\D/g, "");

  // Преобразуем "8..." или "7..." в "+7..."
  if (cleaned.startsWith("8")) cleaned = "7" + cleaned.slice(1);
  if (!cleaned.startsWith("7")) cleaned = "7" + cleaned.slice(cleaned[0] === "7" ? 1 : 0);

  // Обрезаем до 11 символов
  cleaned = cleaned.slice(0, 11);

  let result = "+7";
  if (cleaned.length > 1) result += " (" + cleaned.slice(1, 4);
  if (cleaned.length >= 4) result += ") " + cleaned.slice(4, 7);
  if (cleaned.length >= 7) result += "-" + cleaned.slice(7, 9);
  if (cleaned.length >= 9) result += "-" + cleaned.slice(9, 11);

  return result;
}

function validateFullName(value) {
  if (!value.trim()) return "Введите ФИО";
  if (value.trim().length < 3) return "Слишком короткое ФИО";
  return "";
}

function validatePhone(value) {
  const cleaned = value.replace(/\D/g, "");
  if (!cleaned) return "Введите номер телефона";
  if (cleaned.length !== 11) return "Номер должен содержать 11 цифр";
  if (!/^7\d{10}$/.test(cleaned)) return "Введите номер в формате +7...";
  return "";
}

function validateAddress(value) {
  if (!value.trim()) return "Введите адрес доставки";
  if (value.trim().length < 5) return "Адрес слишком короткий";
  return "";
}

export default function CheckoutModal({ open, onClose, onSubmit, loading }) {
  const [fields, setFields] = useState({
    full_name: "",
    phone: "",
    address: ""
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  if (!open) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    // Форматируем телефон
    if (name === "phone") {
      value = formatPhone(value);
    }
    setFields({ ...fields, [name]: value });

    // Валидация на лету
    let err = "";
    if (name === "full_name") err = validateFullName(value);
    if (name === "phone")     err = validatePhone(value);
    if (name === "address")   err = validateAddress(value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const fullNameError = validateFullName(fields.full_name);
    const phoneError    = validatePhone(fields.phone);
    const addressError  = validateAddress(fields.address);

    setErrors({
      full_name: fullNameError,
      phone: phoneError,
      address: addressError,
    });

    if (fullNameError || phoneError || addressError) {
      setFormError("Проверьте правильность заполнения полей");
      return;
    }

    try {
      await onSubmit(fields);
    } catch (e) {
      setFormError(e.message || "Не удалось оформить заказ");
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
        {formError && <div className="mb-4 text-red-600">{formError}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <input
              className={`border rounded px-3 py-2 w-full ${errors.full_name ? "border-red-400" : ""}`}
              name="full_name"
              placeholder="ФИО"
              value={fields.full_name}
              onChange={handleChange}
              disabled={loading}
              autoFocus
            />
            {errors.full_name && <div className="text-xs text-red-500 mt-1">{errors.full_name}</div>}
          </div>
          <div>
            <input
              className={`border rounded px-3 py-2 w-full ${errors.phone ? "border-red-400" : ""}`}
              name="phone"
              placeholder="Телефон"
              value={fields.phone}
              onChange={handleChange}
              disabled={loading}
              inputMode="tel"
              maxLength={18}
            />
            {errors.phone && <div className="text-xs text-red-500 mt-1">{errors.phone}</div>}
          </div>
          <div>
            <input
              className={`border rounded px-3 py-2 w-full ${errors.address ? "border-red-400" : ""}`}
              name="address"
              placeholder="Адрес доставки"
              value={fields.address}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.address && <div className="text-xs text-red-500 mt-1">{errors.address}</div>}
          </div>
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
