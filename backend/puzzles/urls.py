from django.urls import path
from . import views
from .views import QuestionListView, QuestionRetrieveView

urlpatterns = [
    # path('categories/', views.question_categories, name='question_categories'),
    # path('judgement/<int:question_id>/', views.judgement, name='judgement'),
    path(r'puzzles/', QuestionListView.as_view()),
    path(r'puzzles/', QuestionRetrieveView.as_view()),
]
