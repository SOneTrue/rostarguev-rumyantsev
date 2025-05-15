from django.http import JsonResponse
from rest_framework import status
from rest_framework import viewsets
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
    products = Product.objects.all()
    result = []

    for product in products:
        stores = StoreProduct.objects.filter(product=product)
        store_prices = [
            {
                "store": {"id": sp.store.id, "name": sp.store.name},
                "price": float(sp.price),
                "discount": sp.discount,
                "stock": sp.stock,  # <= Добавить!
            }
            for sp in stores
        ]
        image_url = request.build_absolute_uri(product.image.url) if product.image else None

        result.append(
            {
                "id": product.id,
                "name": product.name,
                "image": image_url,
                "category": {
                    "id": product.category.id,
                    "name": product.category.name,
                },
                "prices": store_prices,
            }
        )
    return JsonResponse(result, safe=False)


def api_product_list_short(request):
    products = Product.objects.all().values("id", "name")
    return JsonResponse(list(products), safe=False)


def api_store_list(request):
    stores = Store.objects.all().values("id", "name")
    return JsonResponse(list(stores), safe=False)


# ───────────────────  ПРЕДЛОЖЕНИЯ ЦЕН  ────────────────────
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def api_suggest_price(request):
    if request.method == "GET":
        mine = request.query_params.get("mine") == "1"
        qs = PriceSuggestion.objects.select_related("product", "store")
        if mine:
            qs = qs.filter(author_name=request.user.email)
        data = PriceSuggestionSerializer(qs, many=True).data
        return Response(data)

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
    cart = CartItem.objects.filter(user=request.user).select_related("product", "store")

    if not cart.exists():
        return Response({"error": "Корзина пуста"}, status=400)

    total = 0
    items = []

    for ci in cart:
        sp = StoreProduct.objects.filter(product=ci.product, store=ci.store).first()
        if not sp:
            continue  # Пропускаем, если нет цены
        total += sp.price * ci.quantity
        items.append(OrderItem(
            product=ci.product,
            quantity=ci.quantity,
            price=sp.price,
        ))

    if not items:
        return Response({"error": "Ни один товар не имеет цены"}, status=400)

    order = Order.objects.create(user=request.user, total=total, status='pending')
    for item in items:
        item.order = order

    OrderItem.objects.bulk_create(items)
    cart.delete()

    return Response({"success": True, "order_id": order.id})


# ───────────────────  ЗАКАЗЫ ────────────────────
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def api_orders(request):
    order_id = request.query_params.get("id")
    qs = Order.objects.filter(user=request.user).prefetch_related("items__product")

    if order_id:
        order = qs.filter(id=order_id).first()
        if not order:
            return Response({"error": "Not found"}, status=404)
        return Response(OrderSerializer(order).data)

    data = OrderSerializer(qs, many=True).data
    # Возвращаем теперь полный список нужных полей
    brief = [
        {
            "id": o["id"],
            "created_at": o["created_at"],  # поле с датой создания
            "total": o["total"],
            "status": o.get("status", "-"),  # актуальный статус
        }
        for o in data
    ]
    return Response(brief)


# ───────────────────  ДОБАВЛЕНИЕ В КОРЗИНУ ────────────────────
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def api_cart_add(request):
    product_id = request.data.get("product")
    store_id = request.data.get("store")
    quantity = int(request.data.get("quantity", 1))

    sp = StoreProduct.objects.filter(product_id=product_id, store_id=store_id).first()
    if not sp:
        return Response({"error": "Нет цены для этого товара в магазине"}, status=400)

    if quantity > sp.stock:
        quantity = sp.stock  # просто обрежь на максимум

    item, created = CartItem.objects.get_or_create(
        user=request.user,
        product_id=product_id,
        store_id=store_id,
        defaults={"quantity": quantity}
    )

    if not created:
        item.quantity = quantity
        item.save()

    return Response({"success": True, "quantity": item.quantity, "stock": sp.stock})


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Разрешить видеть только свои заказы
        return self.queryset.filter(user=self.request.user)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def api_order_detail(request, pk):
    try:
        order = Order.objects.get(pk=pk, user=request.user)
    except Order.DoesNotExist:
        return Response({'error': 'Заказ не найден'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    elif request.method == 'PATCH':
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from django.conf import settings
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
import os


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_order_receipt_pdf(request, pk):
    try:
        order = Order.objects.get(pk=pk, user=request.user)
    except Order.DoesNotExist:
        return HttpResponse('Заказ не найден', status=404)

    font_path = os.path.join(settings.BASE_DIR, 'static', 'fonts', 'DejaVuSans.ttf')
    if not os.path.exists(font_path):
        return HttpResponse(f'Файл шрифта не найден: {font_path}', status=500)
    pdfmetrics.registerFont(TTFont('DejaVuSans', font_path))

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="order_{order.id}_receipt.pdf"'

    p = canvas.Canvas(response, pagesize=A4)
    p.setFont("DejaVuSans", 16)
    p.drawString(50, 800, f"Чек заказа №{order.id}")
    p.setFont("DejaVuSans", 12)
    p.drawString(50, 780, f"Дата: {order.created_at.strftime('%d.%m.%Y %H:%M')}")
    y = 750
    p.drawString(50, y, "Товар")
    p.drawString(250, y, "Цена")
    p.drawString(350, y, "Кол-во")
    p.drawString(430, y, "Сумма")
    y -= 20
    for item in order.items.all():
        p.drawString(50, y, str(item.product.name))
        p.drawString(250, y, f"{item.price} ₽")
        p.drawString(350, y, str(item.quantity))
        p.drawString(430, y, f"{item.price * item.quantity} ₽")
        y -= 20
    p.setFont("DejaVuSans", 14)
    p.drawString(50, y - 10, f"Итого: {order.total} ₽")
    p.showPage()
    p.save()
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_cart_list(request):
    cart = CartItem.objects.filter(user=request.user).select_related("product", "store")
    data = [
        {
            "id": ci.product.id,
            "name": ci.product.name,
            "price": float(ci.product.storeproduct_set.get(store=ci.store).price),
            "store": ci.store.name,
            "store_id": ci.store.id,
            "quantity": ci.quantity,
            "stock": ci.product.storeproduct_set.get(store=ci.store).stock,
            "image": ci.product.image.url if ci.product.image else null,
        }
        for ci in cart
    ]
    return Response(data)
