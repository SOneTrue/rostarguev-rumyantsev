# catalog/serializers.py
from django.contrib.auth import get_user_model
from djoser.serializers import UserCreateSerializer as Base
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    PriceSuggestion,
    Order,
    OrderItem,
)

# ───────────────────  JWT‑логин ПО EMAIL  ────────────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Авторизация по email вместо username."""
    def validate(self, attrs):
        attrs["username"] = attrs.get("email")
        return super().validate(attrs)


# ───────────────────  Регистрация  ────────────────────
User = get_user_model()


class UserCreateSerializer(Base):
    """Djoser‑сериализатор регистрации (username = email)."""
    class Meta(Base.Meta):
        model  = User
        fields = ("id", "email", "password")

    def create(self, validated_data):
        validated_data["username"] = validated_data["email"]
        return super().create(validated_data)


# ───────────────────  Предложение цены  ────────────────────
class PriceSuggestionSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source="product.name")
    store   = serializers.CharField(source="store.name")
    sent_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model  = PriceSuggestion
        fields = (
            "id",
            "product",
            "store",
            "suggested_price",
            "approved",
            "sent_at",
        )


# ───────────────────  Заказы  ────────────────────
class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source="product.name")

    class Meta:
        model  = OrderItem
        fields = ("product", "quantity", "price")


class OrderSerializer(serializers.ModelSerializer):
    items      = OrderItemSerializer(many=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d")

    class Meta:
        model  = Order
        fields = ("id", "created_at", "total", "items")
