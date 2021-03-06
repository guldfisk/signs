from django.urls import path, include, re_path


urlpatterns = [
    path('api/', include('api.urls')),
    path('api/auth/', include('knox.urls')),
    re_path('.*', include('frontend.urls')),
]
