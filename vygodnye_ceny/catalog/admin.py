from django.contrib import admin
from .models import Category, Store, Product, StoreProduct, PriceSuggestion, CartItem

# inline для цен прямо в товаре
class StoreProductInline(admin.TabularInline):
    model = StoreProduct
    extra = 1
    min_num = 1
    max_num = 5
    autocomplete_fields = ['store']  # если много магазинов — удобно

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category']
    list_filter = ['category']
    search_fields = ['name']
    inlines = [StoreProductInline]

@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    search_fields = ['name']

@admin.register(StoreProduct)
class StoreProductAdmin(admin.ModelAdmin):
    list_display = ['product', 'store', 'price', 'discount', 'updated']
    list_filter = ['store', 'discount']
    search_fields = ['product__name', 'store__name']

@admin.register(PriceSuggestion)
class PriceSuggestionAdmin(admin.ModelAdmin):
    list_display = ['product', 'store', 'suggested_price', 'approved', 'sent_at']
    list_filter = ['approved', 'store']
    search_fields = ['product__name', 'author_name']

    def save_model(self, request, obj, form, change):
        """Обновляем цену в StoreProduct при одобрении"""
        super().save_model(request, obj, form, change)

        if obj.approved:
            # Пытаемся найти StoreProduct
            sp, created = StoreProduct.objects.get_or_create(
                product=obj.product,
                store=obj.store,
                defaults={'price': obj.suggested_price}
            )
            if not created:
                sp.price = obj.suggested_price
                sp.save()

admin.site.register(Category)
admin.site.register(CartItem)
