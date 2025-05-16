from django import forms
from .models import PriceSuggestion, Product, Store


class PriceSuggestionForm(forms.ModelForm):
    class Meta:
        model  = PriceSuggestion
        fields = ["product", "store", "suggested_price", "author", "comment"]
        widgets = {
            "product":         forms.Select(attrs={"class": "border p-2 w-full"}),
            "store":           forms.Select(attrs={"class": "border p-2 w-full"}),
            "suggested_price": forms.NumberInput(attrs={"class": "border p-2 w-full", "step": "0.01"}),
            "author":          forms.TextInput(attrs={"class": "border p-2 w-full", "placeholder": "Ваше имя"}),
            "comment":         forms.Textarea(attrs={"class": "border p-2 w-full h-24", "placeholder": "Комментарий (необязательно)"}),
        }
