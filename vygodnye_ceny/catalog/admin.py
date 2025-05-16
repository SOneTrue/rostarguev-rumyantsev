from django.contrib import admin
from .models import (
    Category, Store, Product, StoreProduct,
    PriceSuggestion, CartItem,
    Order, OrderItem
)

class StoreProductInline(admin.TabularInline):
    model = StoreProduct
    extra = 1
    min_num = 1
    max_num = 5
    autocomplete_fields = ['store']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price')
    can_delete = False

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
        super().save_model(request, obj, form, change)
        if obj.approved:
            sp, created = StoreProduct.objects.get_or_create(
                product=obj.product,
                store=obj.store,
                defaults={'price': obj.suggested_price}
            )
            if not created:
                sp.price = obj.suggested_price
                sp.save()

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'created_at', 'total', 'status', 'full_name', 'phone', 'address']
    list_filter = ['status', 'created_at', 'user']
    search_fields = ['id', 'user__username', 'full_name', 'phone']
    inlines = [OrderItemInline]
    list_editable = ['status']
    readonly_fields = ['user', 'created_at', 'total']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'price']
    list_filter = ['product']
    search_fields = ['product__name', 'order__id']

admin.site.register(Category)
admin.site.register(CartItem)
