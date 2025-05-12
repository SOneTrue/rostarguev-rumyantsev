# vygodnye_ceny/urls.py
from django.contrib import admin          # ← добавить
from django.urls import path, include

from catalog.api import router as catalog_router

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # Djoser auth
    path("auth/", include("djoser.urls")),
    path("auth/", include("djoser.urls.jwt")),

    # DRF router (если используешь ViewSet)
    path("api/", include(catalog_router.urls)),

    # 👇 обязательно добавь это!
    path("api/", include("catalog.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)