from django.urls import path
from . import views

urlpatterns = [
    path("products/", views.api_product_list, name="api_product_list"),
    path("products-short/", views.api_product_list_short, name="api_product_list_short"),
    path("stores/", views.api_store_list, name="api_store_list"),
    path("suggest-price/", views.api_suggest_price, name="api_suggest_price"),
    path("checkout/", views.api_checkout, name="api_checkout"),
    path("orders/", views.api_orders, name="api_orders"),
    path("cart/add/", views.api_cart_add, name="api_cart_add"),
]
