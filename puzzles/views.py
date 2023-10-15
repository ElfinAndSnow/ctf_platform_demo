from django.shortcuts import render
from django.utils import timezone
from .models import Question


# Create your views here.
def question_categories(request):
    categories = ['WEB', 'CRYPTO', 'PWN', 'REVERSE', 'PPC', 'MISC', 'STEGA']
    return render(request, 'categories.html', {'categories': categories})


# Set up a timer for the puzzle
def judgement(request, question_id):
    question = Question.object.get(pk=question_id)
    if 'start_time' not in request.session:
        request.session['start_time'] = timezone.now()

    # Check if the user exceeded the time limit(30 mins)
    elapsed_time = timezone.now() - request.session['start_time']
    if elapsed_time.total_seconds() > 1800:
        return render(request, 'timeout.html')

    # Continue processing the flag submission
    if request.method == 'POST':
        submitted_flag = request.POST.get('flag', '')
        if submitted_flag == question.flag:
            return render(request, 'success.html')
        else:
            return render(request, 'failure.html')

    return render(request, 'question_description.html', {'question': question})
