import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Product, Store, PriceSuggestion, StoreProduct


# 📦 API: список товаров с ценами по магазинам
def api_product_list(request):
    products = Product.objects.all()
    result = []

    for product in products:
        stores = StoreProduct.objects.filter(product=product)
        store_prices = [
            {
                'store': {'id': sp.store.id, 'name': sp.store.name},
                'price': float(sp.price),
                'discount': sp.discount
            }
            for sp in stores
        ]

        result.append({
            'id': product.id,
            'name': product.name,
            'image': product.image.url if product.image else None,
            'category': {'id': product.category.id, 'name': product.category.name},
            'prices': store_prices
        })

    return JsonResponse(result, safe=False)


# 📄 API: список товаров (только id и name для формы)
def api_product_list_short(request):
    products = Product.objects.all().values('id', 'name')
    return JsonResponse(list(products), safe=False)


# 🏪 API: список магазинов
def api_store_list(request):
    stores = Store.objects.all().values('id', 'name')
    return JsonResponse(list(stores), safe=False)


# 📨 API: отправка пользовательского предложения цены
@csrf_exempt
def api_send_suggestion(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            suggestion = PriceSuggestion.objects.create(
                product_id=data['product'],
                store_id=data['store'],
                suggested_price=data['price'],
                comment=data.get('comment', ''),
                author_name='',
                approved=False
            )

            return JsonResponse({'success': True, 'id': suggestion.id})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'Only POST allowed'}, status=405)


def product_list(request):
    return HttpResponse("Главная страница работает ✅")