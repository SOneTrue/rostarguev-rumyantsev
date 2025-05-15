import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

function getSavedCart() {
  try {
    return JSON.parse(localStorage.getItem('cart-items') || '[]');
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem('cart-items', JSON.stringify(items));
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(getSavedCart());
  const [error, setError] = useState('');

  // Сохраняем корзину при любом изменении
  useEffect(() => {
    saveCart(items);
  }, [items]);

  // Добавить товар
  const add = (p) => {
    setError('');
    // Проверим, сколько уже есть
    const index = items.findIndex((i) => i.id === p.id && i.store_id === p.store_id);
    const stock = Number(p.stock ?? 99); // если нет stock, пусть будет 99
    let newItems = [...items];

    if (index >= 0) {
      const currQty = newItems[index].quantity;
      if (currQty + 1 > stock) {
        setError('Нельзя добавить больше — такого количества товара нет в наличии.');
        return;
      }
      newItems[index] = { ...newItems[index], quantity: currQty + 1 };
    } else {
      if (stock < 1) {
        setError('Товара нет в наличии.');
        return;
      }
      newItems.push({ ...p, quantity: 1 });
    }

    setItems(newItems);
  };

  // Обновить количество
  const updateQty = (id, store_id, qty, maxStock) => {
    setError('');
    let q = Math.max(1, Number(qty) || 1);
    if (q > maxStock) {
      setError(`Доступно только ${maxStock} шт. этого товара`);
      q = maxStock;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.store_id === store_id ? { ...i, quantity: q } : i
      )
    );
  };

  const remove = (id, store_id) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.store_id === store_id)));
  };

  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        add,
        updateQty,
        remove,
        clear,
        total,
        error,
        setError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
