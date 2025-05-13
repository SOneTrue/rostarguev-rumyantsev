import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../api/auth';   // понадобился login
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const nav = useNavigate();
  const { loadUser } = useAuth();

  const [form, setForm] = useState({ email: '', pass1: '', pass2: '' });
  const [err,  setErr]  = useState('');
  const [ok,   setOk]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    if (form.pass1 !== form.pass2) {
      return setErr('Пароли не совпадают');
    }

    try {
      await register({ email: form.email, password: form.pass1 });

      // автоматический логин после регистрации
      const { data } = await login({ email: form.email, password: form.pass1 });
      localStorage.setItem('access', data.access);
      await loadUser();

      setOk(true);                 // покажем уведомление
      setTimeout(() => nav('/account'), 5000);
    } catch (e) {
      const data = e.response?.data;
      if (data?.password)       setErr('Слабый пароль');
      else if (data?.email)     setErr('Email уже используется');
      else                      setErr('Ошибка регистрации');
    }
  };

  /* --------- UI --------- */
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Регистрация</h2>

      {ok && (
        <div className="mb-4 text-green-700 bg-green-100 p-3 rounded">
          Аккаунт создан, вход выполнен! Перенаправляем в&nbsp;профиль…
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
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}
