import { useEffect, useState } from "react";
import { fetchProducts, fetchStores } from "../api";
import { useCart } from "../contexts/CartContext";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [category, setCategory] = useState("");
  const [store, setStore] = useState("");
  const [search, setSearch] = useState("");

  const { items, add } = useCart();

  // Получаем товары, магазины, категории
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setAllProducts(Array.isArray(data) ? data : []);
        setProducts(Array.isArray(data) ? data : []);
        // Категории собираем из товаров
        const cats = Array.from(new Set(data.map(p => p.category?.name).filter(Boolean)));
        setCategories(cats);
        // Магазины из цен
        let storeSet = new Set();
        data.forEach(p => p.prices.forEach(sp => storeSet.add(JSON.stringify(sp.store))));
        setStores(Array.from(storeSet).map(s => JSON.parse(s)));
      } catch {
        setError("Не удалось загрузить товары");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // Фильтрация и поиск
  useEffect(() => {
    let filtered = allProducts;
    if (category)
      filtered = filtered.filter(p => p.category?.name === category);
    if (store)
      filtered = filtered.filter(p => p.prices.some(sp => String(sp.store.id) === String(store)));
    if (search)
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    setProducts(filtered);
  }, [category, store, search, allProducts]);

  if (loading) return <div className="text-center py-12">Загрузка...</div>;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Все товары</h1>

      {/* --- Фильтры --- */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Категории */}
        <select
          className="border rounded px-3 py-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">Все категории</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Магазины */}
        <select
          className="border rounded px-3 py-2"
          value={store}
          onChange={e => setStore(e.target.value)}
        >
          <option value="">Все магазины</option>
          {stores.map(st => (
            <option key={st.id} value={st.id}>{st.name}</option>
          ))}
        </select>

        {/* Поиск */}
        <input
          type="text"
          className="border rounded px-3 py-2 flex-1 min-w-[180px]"
          placeholder="Поиск…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* --- Сетка товаров --- */}
      {products.length === 0 ? (
        <p className="text-gray-500">Товары не найдены.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const inCart = items.some(i => i.id === p.id);

            return (
              <div key={p.id} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-40 w-full object-cover mb-4 rounded-xl"
                  />
                )}
                <h2 className="font-semibold mb-2">{p.name}</h2>
                <div className="text-sm mb-4 space-y-1">
                  {p.prices.map((sp, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-gray-600">{sp.store.name}:</span>
                      <span>
                        {sp.discount ? (
                          <>
                            <span className="line-through text-red-500 mr-2">{sp.old_price ? `${sp.old_price} ₽` : `${(sp.price + 50)} ₽`}</span>
                            <span className="font-bold">{sp.price} ₽</span>
                          </>
                        ) : (
                          <span className="font-bold">{sp.price} ₽</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => !inCart && add({
                    id: p.id,
                    name: p.name,
                    price: p.prices[0]?.price,
                    store: p.prices[0]?.store.name,
                    store_id: p.prices[0]?.store.id,
                    quantity: 1,
                    image: p.image,
                  })}
                  className={`mt-auto py-2 rounded text-sm font-medium transition ${
                    inCart
                      ? "bg-red-600 text-white cursor-default"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  disabled={inCart}
                >
                  {inCart ? "В корзине" : "В корзину"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
