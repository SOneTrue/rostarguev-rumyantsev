from django.urls import path
from . import views

urlpatterns = [
    path('', views.product_list, name='product_list'),

    # ───── корзина ─────
    path('cart/', views.cart_view, name='cart'),
    path('add-to-cart/<int:product_id>/', views.add_to_cart, name='add_to_cart'),
    path('remove-from-cart/<int:product_id>/', views.remove_from_cart, name='remove_from_cart'),

    # ───── пользовательские действия ─────
    path('feedback/', views.feedback_view, name='feedback'),
    path('suggest-price/', views.suggest_price_view, name='suggest_price'),

    # 🚀 новый API endpoint
    path('api/suggestions/', views.api_suggestion_create, name='api_suggestion_create'),
    path('api/products/', views.api_product_list, name='api_product_list'),

]
