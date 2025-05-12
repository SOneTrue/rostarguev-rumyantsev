import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', pass1: '', pass2: '' });
  const [err,  setErr]  = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (form.pass1 !== form.pass2) return setErr('Пароли не совпадают');

    try {
      await register({ email: form.email, password: form.pass1 });
      nav('/login');
    } catch (e) {
      setErr('Ошибка регистрации');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Регистрация</h2>

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
          value={form.pass1}
          onChange={e => setForm({ ...form, pass1: e.target.value })}
          required
        />
        <input
          type="password" placeholder="Повторите пароль"
          className="w-full border rounded px-3 py-2 mb-4"
          value={form.pass2}
          onChange={e => setForm({ ...form, pass2: e.target.value })}
          required
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}
