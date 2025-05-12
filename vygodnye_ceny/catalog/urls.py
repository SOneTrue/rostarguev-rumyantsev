from django.urls import path
from . import views

urlpatterns = [
    path('suggest-price/', views.api_send_suggestion, name='api_send_suggestion'),
    path('products/', views.api_product_list, name='api_product_list'),
    path('products-short/', views.api_product_list_short, name='api_product_list_short'),
    path('stores/', views.api_store_list, name='api_store_list'),
]
