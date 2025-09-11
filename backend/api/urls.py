from django.urls import path, include
from django.http import JsonResponse
from . import views

def health(_):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("analyse-keyness/", views.analyse_keyness, name="keyness_view"),
    path('corpus-preview/', views.get_corpus_preview, name='corpus-preview'),
    path('upload-files/', views.upload_files, name='upload_files'),
    path("analyse-sentiment/", views.analyse_sentiment, name="analyse-sentiment"),
    path("health/", health),
    path("", health),                 # make root return 200 too
    path("api/", include("api.urls")),  # keep existing routes
]





