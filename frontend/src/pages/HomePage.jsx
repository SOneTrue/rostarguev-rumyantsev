import { useEffect, useState } from "react";
import { fetchProducts } from "../api";
import { useCart } from "../contexts/CartContext";

const PAGE_SIZE_4 = 16; // 4 строки по 4 товара
const PAGE_SIZE_5 = 15; // 3 строки по 5 товаров

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
  const [page, setPage] = useState(1);
  const [view, setView] = useState("4"); // "4" или "5"
  const pageSize = view === "5" ? PAGE_SIZE_5 : PAGE_SIZE_4;
  const [cartError, setCartError] = useState("");

  const { items, add, remove } = useCart();

  // Загрузка товаров
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setAllProducts(Array.isArray(data) ? data : []);
        setProducts(Array.isArray(data) ? data : []);
        // Категории из товаров
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
    setPage(1); // сбрасываем страницу при смене фильтров/поиска
  }, [category, store, search, allProducts]);

  // Пагинация
  const totalPages = Math.ceil(products.length / pageSize);
  const pagedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="text-center py-12">Загрузка...</div>;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Все товары</h1>
      {cartError && (
        <div className="mb-4 text-center text-red-600">{cartError}</div>
      )}
      {/* --- Фильтры --- */}
      <div className="flex flex-wrap gap-4 mb-6">
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
        <input
          type="text"
          className="border rounded px-3 py-2 flex-1 min-w-[180px]"
          placeholder="Поиск…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {/* Переключение вида (4 или 5 в строке) */}
        <select
          className="border rounded px-3 py-2"
          value={view}
          onChange={e => setView(e.target.value)}
          style={{ minWidth: 130 }}
        >
          <option value="4">4 в строке</option>
          <option value="5">5 в строке</option>
        </select>
      </div>

      {/* --- Сетка товаров --- */}
      {products.length === 0 ? (
        <p className="text-gray-500">Товары не найдены.</p>
      ) : (
        <>
          <div
            className={
              view === "5"
                ? "grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                : "grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }
          >
            {pagedProducts.map((p) => {
              // Сортируем цены по возрастанию (самый дешевый магазин первым)
              const sortedPrices = [...p.prices].sort((a, b) => a.price - b.price);
              const minPrice = sortedPrices.length > 0 ? sortedPrices[0].price : null;
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
                    {sortedPrices.map((sp, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-600">{sp.store.name}:</span>
                        {sp.price > minPrice ? (
                          <span className="line-through text-red-500 font-medium">{sp.price} ₽</span>
                        ) : (
                          <span className="font-bold">{sp.price} ₽</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {inCart ? (
                    <button
                      onClick={() => {
                        // Удалить именно тот товар и магазин
                        const itemInCart = items.find(
                          i => i.id === p.id && i.store_id === sortedPrices[0].store.id
                        );
                        if (itemInCart) {
                          remove(itemInCart.id, itemInCart.store_id);
                        }
                      }}
                      className="mt-auto py-2 rounded text-sm font-medium transition bg-red-600 text-white hover:bg-red-700"
                    >
                      Удалить из корзины
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        setCartError("");
                        if (!inCart && sortedPrices.length > 0) {
                          try {
                            await add({
                              id: p.id,
                              name: p.name,
                              price: sortedPrices[0].price,
                              store: sortedPrices[0].store.name,
                              store_id: sortedPrices[0].store.id,
                              quantity: 1,
                              image: p.image,
                              stock: sortedPrices[0]?.stock,
                            });
                          } catch (err) {
                            setCartError(err.message || "Ошибка добавления в корзину");
                          }
                        }
                      }}
                      className="mt-auto py-2 rounded text-sm font-medium transition bg-blue-600 text-white hover:bg-blue-700"
                    >
                      В корзину
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* --- Пагинация --- */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                «
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`px-3 py-1 rounded ${page === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                →
              </button>
              <button
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
