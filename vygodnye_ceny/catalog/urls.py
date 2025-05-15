from django.urls import path

from . import views
from .views import api_order_receipt_pdf

urlpatterns = [
    path("products-short/", views.api_product_list_short, name="api_product_list_short"),
    path("stores/", views.api_store_list, name="api_store_list"),
    path("suggest-price/", views.api_suggest_price, name="api_suggest_price"),
    path("checkout/", views.api_checkout, name="api_checkout"),
    path("orders/", views.api_orders, name="api_orders"),
    path("orders/<int:pk>/", views.api_order_detail, name="api_order_detail"),  # ← добавь эту строку
    path("cart/add/", views.api_cart_add, name="api_cart_add"),
    path('orders/<int:pk>/receipt/', api_order_receipt_pdf, name='api_order_receipt_pdf'),
    path("cart/", views.api_cart_list, name="api_cart_list"),
    path("products/", views.api_product_list, name="api_product_list"),
]
