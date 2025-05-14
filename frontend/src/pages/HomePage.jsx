import { useEffect, useState } from "react";
import { fetchProducts } from "../api";
import { useCart } from "../contexts/CartContext";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { items, add } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchProducts();  // 👈 правильно так
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setError("Не удалось загрузить товары");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-center py-12">Загрузка...</div>;
  if (error) return <div className="text-center text-red-600 py-12">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Все товары</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">Товары не найдены.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => {
            const mainPrice = p.prices[0]?.price;
            const mainStore = p.prices[0]?.store.name;
            const store_id = p.prices[0]?.store.id;

            const inCart = items.some(i => i.id === p.id && i.store_id === store_id);

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
                      {sp.discount ? (
                        <span>
                          <span className="text-red-500 line-through mr-1">
                            {sp.price + 50}₽
                          </span>
                          <span className="font-bold">{sp.price}₽</span>
                        </span>
                      ) : (
                        <span className="font-medium">{sp.price}₽</span>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (!inCart) {
                      add({
                        id: p.id,
                        name: p.name,
                        price: mainPrice,
                        store: mainStore,
                        store_id: store_id,
                        quantity: 1,
                        image: p.image,
                      });
                    }
                  }}
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
