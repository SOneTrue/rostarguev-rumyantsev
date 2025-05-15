import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

// Функция для преобразования ошибок к одному сообщению на русском
function getReadableError(data) {
  // Ошибки поля email
  if (data?.email) {
    if (
      Array.isArray(data.email) &&
      data.email.some(e => e.includes('valid email'))
    ) {
      return "Введите корректный email.";
    }
    if (
      Array.isArray(data.email) &&
      data.email.some(e => e.toLowerCase().includes('already exists'))
    ) {
      return "Пользователь с таким email уже зарегистрирован.";
    }
  }

  // Ошибки пароля
  if (data?.password) {
    if (
      Array.isArray(data.password) &&
      data.password.some(e => e.includes('too short'))
    ) {
      return "Пароль слишком короткий. Минимум 8 символов.";
    }
    if (
      Array.isArray(data.password) &&
      data.password.some(e => e.includes('entirely numeric'))
    ) {
      return "Пароль не должен состоять только из цифр.";
    }
    if (
      Array.isArray(data.password) &&
      data.password.some(e => e.includes('too common'))
    ) {
      return "Пароль слишком простой.";
    }
  }

  // Общие или неизвестные ошибки
  if (typeof data === "string" && data.includes('Пароли не совпадают')) {
    return data;
  }
  if (typeof data === "string") {
    return data;
  }
  return "Проверьте корректность заполнения формы.";
}

export default function RegisterPage() {
  const nav = useNavigate();
  const { loadUser } = useAuth();

  const [form, setForm] = useState({ email: '', pass1: '', pass2: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();

    if (form.pass1 !== form.pass2) {
      setErr('Пароли не совпадают.');
      return;
    }

    try {
      await register({ email: form.email, password: form.pass1 });

      // автоматический логин после регистрации
      const { data } = await login({ email: form.email, password: form.pass1 });
      localStorage.setItem('access', data.access);
      await loadUser();

      nav('/account', {
        state: { message: 'Регистрация прошла успешно! Вход выполнен.' }
      });
    } catch (e) {
      if (!e.response) {
        setErr('Нет соединения с сервером. Проверьте интернет и попробуйте снова.');
        return;
      }
      const data = e.response?.data;
      setErr(getReadableError(data));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Регистрация</h2>

      {err && (
        <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded text-center">
          {err}
        </div>
      )}

      <form onSubmit={submit} className="bg-white p-6 rounded shadow">
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2 mb-4"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          className="w-full border rounded px-3 py-2 mb-4"
          value={form.pass1}
          onChange={e => setForm({ ...form, pass1: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Повторите пароль"
          className="w-full border rounded px-3 py-2 mb-4"
          value={form.pass2}
          onChange={e => setForm({ ...form, pass2: e.target.value })}
          required
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}
