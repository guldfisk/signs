from django.urls import path

from api import views


urlpatterns = [
    # path('', views.CubeReleasesList.as_view(), name='index'),

    path('auth/login/', views.LoginEndpoint.as_view(), name = 'login_endpoint'),
    path('auth/signup/', views.SignupEndpoint.as_view(), name = 'signup_endpoint'),
    path('auth/user/', views.UserEndpoint.as_view(), name = 'user_endpoint'),

    path('sign/<int:pk>/', views.SignView.as_view()),
    path('atom/<int:pk>/', views.SemanticAtomView.as_view()),

    path('training-set/', views.create_training_set),
    path('training-set/sign/', views.get_sign),

]