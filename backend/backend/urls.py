from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health(_):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health),          # 200 for Render health checks
    path("api/", include("api.urls")),  
    path("", health),                 # root returns 200 instead of 404
]
