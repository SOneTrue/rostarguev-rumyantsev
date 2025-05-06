from django.contrib import admin
from .models import Category, Store, Product, StoreProduct, Feedback, PriceSuggestion

# базовые модели
admin.site.register(Category)
admin.site.register(Store)
admin.site.register(Product)
admin.site.register(StoreProduct)
admin.site.register(Feedback)

# PriceSuggestion c кастомным отображением
@admin.register(PriceSuggestion)
class PriceSuggestionAdmin(admin.ModelAdmin):
    list_display  = ("product", "store", "suggested_price", "approved", "sent_at")
    list_filter   = ("approved", "store")
    list_editable = ("approved",)