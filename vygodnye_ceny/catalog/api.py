from rest_framework import serializers, viewsets, routers, permissions
from .models import Category, Store, Product, StoreProduct, PriceSuggestion, CartItem

# ---------- сериалайзеры ----------

class CategorySer(serializers.ModelSerializer):
    class Meta: model = Category; fields = ["id", "name"]

class StoreSer(serializers.ModelSerializer):
    class Meta: model = Store; fields = ["id", "name"]

class StorePriceSer(serializers.ModelSerializer):
    store = StoreSer()
    class Meta: model = StoreProduct; fields = ["store", "price", "discount"]

class ProductSer(serializers.ModelSerializer):
    prices = StorePriceSer(many=True, source="storeproduct_set")
    class Meta: model = Product; fields = ["id", "name", "image", "category", "prices"]

class PriceSuggestionSer(serializers.ModelSerializer):
    class Meta:
        model = PriceSuggestion
        fields = ["id", "product", "store", "suggested_price", "comment", "sent_at"]
        read_only_fields = ["sent_at", "approved"]

class CartItemSer(serializers.ModelSerializer):
    product = ProductSer(read_only=True)
    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity"]

# ---------- вьюсеты ----------

class ProductView(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.prefetch_related("storeproduct_set__store")
    serializer_class = ProductSer
    filterset_fields = ["category", "storeproduct__store"]

class CategoryView(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySer

class StoreView(viewsets.ReadOnlyModelViewSet):
    queryset = Store.objects.all()
    serializer_class = StoreSer

class PriceSuggestionView(viewsets.ModelViewSet):
    queryset = PriceSuggestion.objects.all()
    serializer_class = PriceSuggestionSer
    permission_classes = [permissions.AllowAny]          # гость может предлагать цену

class CartItemView(viewsets.ModelViewSet):
    serializer_class = CartItemSer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    def perform_create(self, ser):
        ser.save(user=self.request.user)

# ---------- роутер ----------
router = routers.DefaultRouter()
router.register("products", ProductView)
router.register("categories", CategoryView)
router.register("stores", StoreView)
router.register("price-suggestion", PriceSuggestionView)
router.register("cart", CartItemView, basename="cart")
