import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

// Функция для обработки ошибок авторизации и перевода на русский
function getReadableLoginError(e) {
  if (!e.response) {
    return "Нет соединения с сервером. Проверьте интернет и попробуйте снова.";
  }
  const msg = e.response?.data?.detail || '';
  if (msg?.toLowerCase().includes('credentials')) {
    return "Неверный email или пароль.";
  }
  if (msg?.toLowerCase().includes('active')) {
    return "Ваш аккаунт заблокирован или неактивен.";
  }
  if (e.response.status === 400) {
    return "Пожалуйста, заполните все поля для входа.";
  }
  return "Произошла неизвестная ошибка. Попробуйте позже.";
}

export default function LoginPage() {
  const nav = useNavigate();
  const { loadUser } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    try {
      const { data } = await login(form);
      localStorage.setItem('access', data.access);
      await loadUser();
      nav('/account', { state: { message: 'Вход выполнен успешно!' } });
    } catch (e) {
      setErr(getReadableLoginError(e));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Вход</h2>

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
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Войти
        </button>
      </form>
    </div>
  );
}
