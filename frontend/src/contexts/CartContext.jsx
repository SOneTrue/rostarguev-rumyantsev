import React, { createContext, useContext, useState } from 'react';
import { api } from '../api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const add = async (p) => {
    let store_id = p.store_id || (p.prices?.[0]?.store?.id);
    let price = parseFloat(p.price || p.prices?.[0]?.price);
    let store_name = p.store || p.prices?.[0]?.store?.name;

    if (!store_id || !price) {
      console.warn("⛔ У товара нет цен, нельзя добавить в корзину:", p);
      return;
    }

    try {
      await api.post("/cart/add/", {
        product: p.id,
        store: store_id,
        quantity: 1,
      });

      setItems((prev) => [
        ...prev,
        {
          id: p.id,
          name: p.name,
          price,
          store: store_name,
          store_id,
          quantity: 1,
        },
      ]);
    } catch (e) {
      console.error("Ошибка добавления в корзину:", e);
    }
  };

  const updateQty = (id, q) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: q } : i))
    );
  };

  const remove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, add, updateQty, remove, clear, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
