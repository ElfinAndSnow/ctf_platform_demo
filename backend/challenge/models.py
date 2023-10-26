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
    solved_by_teams = models.ManyToManyField('team.team', related_name="solved_challenges_team", blank=True)

    image_name = models.CharField(verbose_name="镜像名称", max_length=127, null=True, blank=True)

    # 单个题目的分数可以有所不同
    points = models.IntegerField(verbose_name="题目分数", default=100, null=True)

    def __str__(self):
        return str(self.id) + " | " + self.name + "_" + self.type
