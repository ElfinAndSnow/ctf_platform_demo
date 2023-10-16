from django.db import models


# Create your models here.
class Question(models.Model):
    question_id = models.AutoField(primary_key=True)
    question_type = models.CharField(max_length=60)
    description = models.TextField()
    timer = models.PositiveIntegerField(null=True, blank=True)
    flag = models.CharField(max_length=100, null=False, blank=True)
    # Add start_time to save the start time and avoid conflicts.
    start_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.description
