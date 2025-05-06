from django.db import models


class Category(models.Model):
    name = models.CharField("Категория", max_length=100)

    def __str__(self):
        return self.name


class Store(models.Model):
    name = models.CharField("Название магазина", max_length=100)
    address = models.TextField("Адрес", blank=True)
    website = models.URLField("Сайт", blank=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField("Название товара", max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name="Категория")
    image = models.ImageField("Изображение", upload_to='products/', blank=True)

    def __str__(self):
        return self.name


class StoreProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    price = models.DecimalField("Цена", max_digits=6, decimal_places=2)
    discount = models.BooleanField("Есть скидка", default=False)
    updated_at = models.DateTimeField("Обновлено", auto_now=True)

    class Meta:
        unique_together = ('product', 'store')

    def __str__(self):
        return f"{self.product.name} в {self.store.name}"


class Feedback(models.Model):
    name = models.CharField("Имя", max_length=100)
    email = models.EmailField("E-mail", blank=True)
    message = models.TextField("Сообщение")
    sent_at = models.DateTimeField("Дата отправки", auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.sent_at.strftime('%Y-%m-%d')})"


class PriceSuggestion(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    store = models.ForeignKey(Store, on_delete=models.CASCADE)
    suggested_price = models.DecimalField("Предлагаемая цена", max_digits=6, decimal_places=2)
    author = models.CharField("Имя отправителя", max_length=100, blank=True)
    comment = models.TextField("Комментарий", blank=True)
    sent_at = models.DateTimeField("Дата", auto_now_add=True)
    approved = models.BooleanField("Одобрено", default=False)

    def __str__(self):
        return f"{self.product.name} - {self.suggested_price}₽"