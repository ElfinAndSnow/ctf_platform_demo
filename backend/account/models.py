from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # objects = models.Manager()

    class Meta:
        verbose_name = "用户"
