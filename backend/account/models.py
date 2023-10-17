from django.contrib.auth.models import AbstractUser
from django.db import models

from challenge.models import Challenge


class User(AbstractUser):
    # objects = models.Manager()

    class Meta:
        verbose_name = "用户"


class UserChallengeSession(models.Model):
    user = models.ForeignKey(User, verbose_name="用户", on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, verbose_name="题目", on_delete=models.CASCADE)
    start_time = models.DateTimeField(verbose_name="开始时间", auto_now_add=True)
    time_limit = models.IntegerField(verbose_name="时间限制", default=3000)


