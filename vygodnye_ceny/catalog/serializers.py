# catalog/serializers.py

from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer as Base
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    PriceSuggestion,
    Order,
    OrderItem,
    Product,
)

# ─────────── JWT‑логин ПО EMAIL ───────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Авторизация по email вместо username."""
    def validate(self, attrs):
        attrs["username"] = attrs.get("email")
        return super().validate(attrs)

# ─────────── Регистрация ───────────
User = get_user_model()

class UserCreateSerializer(Base):
    """Djoser‑сериализатор регистрации (username = email)."""
    class Meta(Base.Meta):
        model = User
        fields = ("id", "email", "password")

    def create(self, validated_data):
        validated_data["username"] = validated_data["email"]
        return super().create(validated_data)

# ─────────── Предложение цены ───────────
class PriceSuggestionSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source="product.name")
    store = serializers.CharField(source="store.name")
    sent_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = PriceSuggestion
        fields = (
            "id",
            "product",
            "store",
            "suggested_price",
            "approved",
            "sent_at",
        )

# ─────────── Заказы ───────────

class ProductShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ('id', 'name')

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductShortSerializer()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'created_at', 'total', 'status',
            'full_name', 'phone', 'address', 'payment_method', 'items'
        ]
        read_only_fields = ('id', 'user', 'created_at', 'total', 'status')

    # Если у тебя нужна поддержка создания заказа из сериализатора (например, через DRF ViewSet)
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        return order
