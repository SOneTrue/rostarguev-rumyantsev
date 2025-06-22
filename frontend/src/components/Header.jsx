import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, loadUser } = useAuth();
  const nav = useNavigate();

  const logout = () => {
    localStorage.removeItem('access');
    loadUser();
    nav('/login');
  };

  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">Выгодные цены</Link>

        <nav className="space-x-4 hidden md:flex">
          <NavLink to="/" end className="hover:underline">Товары</NavLink>
          <NavLink to="/cart" className="hover:underline">Корзина</NavLink>
          <NavLink to="/suggest-price" className="hover:underline">Предложить цену</NavLink>

          {user ? (
            <>
              <NavLink to="/account" className="hover:underline">Профиль</NavLink>
              <button onClick={logout} className="underline ml-2">Выйти</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="hover:underline">Войти</NavLink>
              <NavLink to="/register" className="hover:underline">Регистрация</NavLink>
            </>
          )}
        </nav>

        {/* мобильное меню */}
        <div className="md:hidden space-x-2">
          {user ? (
            <>
              <NavLink to="/account" className="text-sm underline">Профиль</NavLink>
              <button onClick={logout} className="text-sm underline">Выйти</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-sm underline">Войти</NavLink>
              <NavLink to="/register" className="text-sm underline">Регистрация</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
