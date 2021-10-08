from django.urls import path

from api import views


urlpatterns = [
    path('auth/login/', views.LoginEndpoint.as_view(), name = 'login_endpoint'),
    path('auth/signup/', views.SignupEndpoint.as_view(), name = 'signup_endpoint'),
    path('auth/user/', views.UserEndpoint.as_view(), name = 'user_endpoint'),

    path('sign/<int:pk>/', views.SignView.as_view()),
    path('sign/<int:pk>/familiarity/', views.SignFamiliarity.as_view()),
    path('sign/search/<str:query>/', views.SearchView.as_view()),

    path('training-set/<int:pk>/add/<int:sign_pk>/', views.AddSignView.as_view()),
    path('training-set/<int:pk>/remove/<int:sign_pk>/', views.RemoveSignView.as_view()),
    path('training-set/<int:pk>/', views.TrainingSetView.as_view()),
    path('training-set/', views.MyTrainingSetView.as_view()),
    path('training-set/sign/', views.TrainingView.as_view()),
    path('training-sets/', views.TrainingSetList.as_view()),

    path('repetition/', views.RepetitionView.as_view()),

]
