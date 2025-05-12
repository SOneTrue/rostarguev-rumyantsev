import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Выгодные цены
        </Link>
        <nav className="space-x-4 hidden md:flex">
          <NavLink to="/" end className="hover:underline">
            Товары
          </NavLink>
          <NavLink to="/cart" className="hover:underline">
            Корзина
          </NavLink>
          <NavLink to="/suggest-price" className="hover:underline">
            Предложить цену
          </NavLink>
          <NavLink to="/account" className="hover:underline">
            Профиль
          </NavLink>
        </nav>
        <div className="md:hidden space-x-2">
          <NavLink to="/login" className="text-sm underline">
            Войти
          </NavLink>
          <NavLink to="/register" className="text-sm underline">
            Регистрация
          </NavLink>
        </div>
      </div>
    </header>
  );
}
