from django.http import JsonResponse
from .models import Product, StoreProduct

def api_product_list(request):
    products = Product.objects.all()
    result = []

    for product in products:
        stores = StoreProduct.objects.filter(product=product)
        store_prices = [
            {
                'store': sp.store.name,
                'price': float(sp.price),
                'discount': sp.discount
            }
            for sp in stores
        ]

        result.append({
            'id': product.id,
            'name': product.name,
            'image': product.image.url if product.image else None,
            'category': product.category.name,
            'prices': store_prices
        })

    return JsonResponse(result, safe=False)
