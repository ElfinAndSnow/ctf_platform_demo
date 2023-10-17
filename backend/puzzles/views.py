from django.shortcuts import render
from django.utils import timezone
from rest_framework import generics

from .models import Question
from .serializer import QuestionSerializer


# Create your views here.
# def question_categories(request):
#     categories = ['WEB','CRYPTO', 'PWN','REVERSE','PPC','MISC','STEGA']
#     return render(request, 'categories.html',{'categories':categories})
#
#
# # Set up a timer for the puzzle
# def judgement(request, question_id):
#     question = Question.object.get(pk=question_id)
#     # Save the start time.
#     if question.start_time is None:
#         now = timezone.now()
#         now = now.replace(microsecond=0)
#         question.start_time = now
#         question.save()
#
#     # Check if the user exceeded the time limit
#     elapsed_time = timezone.now() - question.start_time
#     if elapsed_time.total_seconds() > question.timer:
#         return render(request, 'timeout.html')
#
#     # Continue processing the flag submission
#     if request.method == 'POST':
#         submitted_flag = request.POST.get('flag','')
#         if submitted_flag == question.flag:
#             return render(request, 'success.html')
#         else:
#             return render(request, 'failure.html')
#
#     return render(request, 'question_description.html',{'question': question})
#


class QuestionListView(generics.ListAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


class QuestionRetrieveView(generics.RetrieveAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
