from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.question_categories, name='question_categories'),
    path('judgement/<int:question_id>/', views.judgement, name='judgement'),
]
