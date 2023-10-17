from django.db import models

# from account.models import User


class Challenge(models.Model):
    name = models.CharField(verbose_name="题目名称", max_length=127)
    type = models.CharField(verbose_name="题目类型", max_length=60)
    description = models.TextField()
    # timer = models.PositiveIntegerField(null=True, blank=True)
    flag = models.CharField(max_length=100, null=False, blank=True)
    # 记录解出该题的用户
    solved_by = models.ManyToManyField('account.User', related_name="solved_challenges", blank=True)

    # Add start_time
    # start_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name + "_" + self.type
