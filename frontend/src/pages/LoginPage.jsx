import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const nav = useNavigate();
  const { loadUser } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr]  = useState('');
  const [ok,  setOk]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    try {
      const { data } = await login(form);
      localStorage.setItem('access', data.access);
      await loadUser();

      setOk(true);
      setTimeout(() => nav('/account'), 5000);
    } catch (e) {
      const msg = e.response?.data?.detail;
      if (msg?.includes('credentials')) setErr('Неверный email или пароль');
      else                              setErr('Ошибка входа');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Вход</h2>

      {ok && (
        <div className="mb-4 text-green-700 bg-green-100 p-3 rounded">
          Успешный вход! Перенаправляем в&nbsp;профиль…
        </div>
      )}
      {err && (
        <div className="mb-4 text-red-600">{err}</div>
      )}

      <form onSubmit={submit} className="bg-white p-6 rounded shadow">
        <input
          type="email" placeholder="Email"
          className="w-full border rounded px-3 py-2 mb-4"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password" placeholder="Пароль"
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
