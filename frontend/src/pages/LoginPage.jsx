import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';

export default function LoginPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err,  setErr]  = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(form);
      localStorage.setItem('access', data.access);
      nav('/');
    } catch {
      setErr('Неверные данные');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Вход</h2>

      {err && <p className="mb-4 text-red-600">{err}</p>}

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
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Войти
        </button>
      </form>
    </div>
  );
}
