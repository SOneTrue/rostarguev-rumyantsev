# catalog/views.py
from django.http import JsonResponse, HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Product,
    Store,
    StoreProduct,
    CartItem,
    PriceSuggestion,
    Order,
    OrderItem,
)
from .serializers import (
    PriceSuggestionSerializer,
    OrderSerializer,
)

# ───────────────────  ТОВАРЫ / МАГАЗИНЫ  ────────────────────
def api_product_list(request):
    """Список товаров + цены по магазинам."""
    products = Product.objects.all()
    result = []

    for product in products:
        stores = StoreProduct.objects.filter(product=product)
        store_prices = [
            {
                "store": {"id": sp.store.id, "name": sp.store.name},
                "price": float(sp.price),
                "discount": sp.discount,
            }
            for sp in stores
        ]

        result.append(
            {
                "id": product.id,
                "name": product.name,
                "image": product.image.url if product.image else None,
                "category": {
                    "id": product.category.id,
                    "name": product.category.name,
                },
                "prices": store_prices,
            }
        )
    return JsonResponse(result, safe=False)


def api_product_list_short(request):
    """Список товаров (id + название) для форм."""
    products = Product.objects.all().values("id", "name")
    return JsonResponse(list(products), safe=False)


def api_store_list(request):
    """Список магазинов."""
    stores = Store.objects.all().values("id", "name")
    return JsonResponse(list(stores), safe=False)


# ───────────────────  ПРЕДЛОЖЕНИЯ ЦЕН  ────────────────────
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def api_suggest_price(request):
    """GET — мои заявки, POST — создать новую заявку."""
    if request.method == "GET":
        mine = request.query_params.get("mine") == "1"
        qs = PriceSuggestion.objects.select_related("product", "store")
        if mine:
            qs = qs.filter(author_name=request.user.email)
        data = PriceSuggestionSerializer(qs, many=True).data
        return Response(data)

    # POST
    d = request.data
    obj = PriceSuggestion.objects.create(
        product_id=d["product"],
        store_id=d["store"],
        suggested_price=d["price"],
        comment=d.get("comment", ""),
        author_name=request.user.email,
        approved=False,
    )
    return Response({"success": True, "id": obj.id})


# ───────────────────  CHECKOUT  ────────────────────
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_checkout(request):
    """Оформляет заказ из корзины текущего пользователя."""
    cart = CartItem.objects.filter(user=request.user).select_related("product")
    if not cart.exists():
        return Response({"error": "Корзина пуста"}, status=400)

    # считаем итог
    total = sum(ci.product.storeproduct_set.get(store=ci.product.store).price * ci.quantity
                for ci in cart)

    order = Order.objects.create(user=request.user, total=total)

    OrderItem.objects.bulk_create(
        [
            OrderItem(
                order=order,
                product=ci.product,
                quantity=ci.quantity,
                price=ci.product.storeproduct_set.get(store=ci.product.store).price,
            )
            for ci in cart
        ]
    )
    cart.delete()  # чистим корзину
    return Response({"success": True, "order_id": order.id})


# ───────────────────  СПИСОК / ДЕТАЛИ ЗАКАЗОВ  ────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_orders(request):
    """GET /?mine=1 — все заказы пользователя; GET /?id=… — детали одного заказа."""
    order_id = request.query_params.get("id")
    qs = Order.objects.filter(user=request.user).prefetch_related("items__product")

    if order_id:
        order = qs.filter(id=order_id).first()
        if not order:
            return Response({"error": "Not found"}, status=404)
        return Response(OrderSerializer(order).data)

    # краткий список для кабинета
    data = OrderSerializer(qs, many=True).data
    brief = [{"id": o["id"], "date": o["created_at"], "total": o["total"]} for o in data]
    return Response(brief)


# ───────────────────  ПРОСТАЯ ТЕСТОВАЯ СТРАНИЦА  ────────────────────
def product_list(request):
    return HttpResponse("Главная страница работает ✅")
