import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api"; // ← Используем только api, не axios напрямую

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Получаем корзину с сервера
  async function fetchCart() {
    setLoading(true);
    try {
      const { data } = await api.get("/cart/");
      setItems(data);
      setError("");
    } catch (e) {
      setError("Не удалось загрузить корзину");
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCart();
  }, []);

  // Добавить товар
  async function add(p, qty = 1) {
    setError("");
    setLoading(true);
    try {
      await api.post("/cart/add/", {
        product: p.id,
        store: p.store_id,
        quantity: qty,
      });
      await fetchCart();
    } catch (e) {
      if (e?.response?.status === 401) {
        setError("Войдите в аккаунт, чтобы добавить товар в корзину!");
        setLoading(false);
        throw new Error("Войдите в аккаунт, чтобы добавить товар в корзину!");
      } else {
        setError(e?.response?.data?.error || "Ошибка при добавлении товара");
        setLoading(false);
        throw new Error(e?.response?.data?.error || "Ошибка при добавлении товара");
      }
    }
    setLoading(false);
  }



  // Изменить количество
  async function updateQty(id, store_id, qty, stock) {
    setError("");
    setLoading(true);
    try {
      await api.post("/cart/add/", {
        product: id,
        store: store_id,
        quantity: qty,
      });
      await fetchCart();
    } catch (e) {
      setError(e?.response?.data?.error || "Ошибка при изменении количества");
    }
    setLoading(false);
  }

  // Удалить товар (через обнуление количества)
  async function remove(id, store_id) {
    setError("");
    setLoading(true);
    try {
      await api.post("/cart/add/", {
        product: id,
        store: store_id,
        quantity: 0, // Сервер должен удалить или игнорировать item с qty=0
      });
      await fetchCart();
    } catch (e) {
      setError(e?.response?.data?.error || "Ошибка при удалении товара");
    }
    setLoading(false);
  }

  async function clear() {
    setError("");
    setLoading(true);
    try {
      await api.post("/cart/clear/");
      await fetchCart();
    } catch (e) {
      setError("Ошибка при очистке корзины");
    }
    setLoading(false);
  }

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
        loading,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
