from decimal import Decimal

from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse

from .models import Product, StoreProduct, Category, Store
from django.contrib import messages
from django.urls import reverse
from .forms import FeedbackForm, PriceSuggestionForm


# ───────────────────────── список товаров ─────────────────────────
def product_list(request):
    category_id = request.GET.get('category')
    store_id = request.GET.get('store')

    categories = Category.objects.all()
    stores = Store.objects.all()

    products = Product.objects.all()
    if category_id:
        products = products.filter(category_id=category_id)

    # собираем цены
    store_products = (
        StoreProduct.objects
        .select_related('store')
        .filter(product__in=products)
    )
    if store_id:
        store_products = store_products.filter(store_id=store_id)

    price_map = {}
    for sp in store_products:
        price_map.setdefault(sp.product_id, []).append(sp)

    # приклеиваем цены к объектам
    for p in products:
        p.prices = price_map.get(p.id, [])

    context = {
        "products": products,
        "categories": categories,
        "stores": stores,
        "selected_category": int(category_id) if category_id else None,
        "selected_store": int(store_id) if store_id else None,
    }
    return render(request, "catalog/product_list.html", context)


# ───────────────────────── helpers для корзины ────────────────────
def _get_cart(request) -> dict:
    """Возвращает словарь корзины в сессии."""
    cart = request.session.get("cart", {})
    request.session["cart"] = cart
    return cart


# ───────────────────────── действия ───────────────────────────────
def add_to_cart(request, product_id: int):
    cart = _get_cart(request)
    cart[str(product_id)] = cart.get(str(product_id), 0) + 1
    request.session.modified = True
    return redirect("cart")


def remove_from_cart(request, product_id: int):
    cart = _get_cart(request)
    cart.pop(str(product_id), None)
    request.session.modified = True
    return redirect("cart")


# ───────────────────────── просмотр корзины ──────────────────────
def cart_view(request):
    cart = _get_cart(request)

    product_ids = cart.keys()
    products_qs = Product.objects.filter(id__in=product_ids).select_related("category")
    prod_map = {str(p.id): p for p in products_qs}

    items = []
    total = Decimal("0.00")

    for pid, qty in cart.items():
        product = prod_map.get(pid)
        if not product:
            continue

        # минимальная цена из всех магазинов (если нет — 0)
        prices_qs = (
            StoreProduct.objects
            .filter(product_id=pid)
            .order_by("price")
            .values_list("price", flat=True)
        )
        price = prices_qs[0] if prices_qs else Decimal("0.00")

        subtotal = price * qty
        total += subtotal

        items.append({
            "product": product,
            "qty": qty,
            "price": price,
            "subtotal": subtotal,
        })

    return render(request, "catalog/cart.html", {"items": items, "total": total})


# ───────────── обратная связь ─────────────
def feedback_view(request):
    if request.method == "POST":
        form = FeedbackForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Спасибо! Ваше сообщение отправлено.")
            return redirect(reverse("feedback"))
    else:
        form = FeedbackForm()

    return render(request, "catalog/feedback.html", {"form": form})


# ───────────── предложение цены ───────────
def suggest_price_view(request):
    if request.method == "POST":
        form = PriceSuggestionForm(request.POST)
        if form.is_valid():
            form.save()  # остаётся «на модерации» (approved=False)
            messages.success(request, "Спасибо! Предложение передано администратору.")
            return redirect(reverse("suggest_price"))
    else:
        form = PriceSuggestionForm()

    return render(request, "catalog/suggest_price.html", {"form": form})

