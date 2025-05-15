from django.conf import settings
from django.db import models
from django.utils import timezone
class Category(models.Model):
    name = models.CharField("Название категории", max_length=120)

    def __str__(self):
        return self.name

class Store(models.Model):
    name    = models.CharField("Название магазина", max_length=120)
    address = models.CharField("Адрес", max_length=250, blank=True)
    website = models.URLField("Сайт", blank=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name     = models.CharField("Название товара", max_length=120)
    category = models.ForeignKey(Category, verbose_name="Категория", on_delete=models.CASCADE)
    image    = models.ImageField("Изображение", upload_to='products/', blank=True)

    def __str__(self):
        return self.name

class StoreProduct(models.Model):
    product  = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    store    = models.ForeignKey(Store,   on_delete=models.CASCADE, verbose_name="Магазин")
    price    = models.DecimalField("Цена", max_digits=8, decimal_places=2)
    discount = models.BooleanField("Скидка", default=False)
    updated  = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        unique_together = ("product", "store")
        verbose_name = "Цена товара в магазине"
        verbose_name_plural = "Цены товаров по магазинам"

    def __str__(self):
        return f"{self.product} в {self.store}: {self.price}₽"

class PriceSuggestion(models.Model):
    product         = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    store           = models.ForeignKey(Store,   on_delete=models.CASCADE, verbose_name="Магазин")
    suggested_price = models.DecimalField("Предложенная цена", max_digits=8, decimal_places=2)
    author_name     = models.CharField("Имя отправителя", max_length=120, blank=True)
    comment         = models.TextField("Комментарий", blank=True)
    approved        = models.BooleanField("Одобрено", default=False)
    sent_at         = models.DateTimeField("Дата отправки", auto_now_add=True)

    def __str__(self):
        return f"{self.product} в {self.store} – {self.suggested_price}₽"

class CartItem(models.Model):
    user     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Пользователь")
    product  = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name="Товар")
    store    = models.ForeignKey(Store, on_delete=models.CASCADE, verbose_name="Магазин", null=True)
    quantity = models.PositiveIntegerField("Количество", default=1)
    added_at = models.DateTimeField("Добавлено", auto_now_add=True)

    class Meta:
        unique_together = ("user", "product", "store")  # 👈 важно!
        verbose_name = "Товар в корзине"
        verbose_name_plural = "Корзина"

    def __str__(self):
        return f"{self.user} – {self.product} x{self.quantity}"


class Order(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    total      = models.DecimalField(max_digits=10, decimal_places=2)
    # ДОБАВЬ ЭТО поле:
    STATUS_CHOICES = [
        ('pending', 'В обработке'),
        ('delivering', 'Доставляется'),
        ('delivered', 'Доставлен'),
    ]
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Статус'
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Заказ #{self.id} от {self.created_at:%d.%m.%Y}"


class OrderItem(models.Model):
    order    = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product  = models.ForeignKey("Product", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)      # оставляем default=1
    price    = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.product} x{self.quantity}"