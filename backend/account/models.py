import datetime

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # solved_challenges = models.ManyToManyField('challenge.Challenge', related_name="solved_by", blank=True)
    points = models.IntegerField(verbose_name="个人总分数", default=0, null=True)
    team = models.ForeignKey('team.Team', verbose_name="所属战队", on_delete=models.SET_NULL, related_name="members", null=True, blank=True)
    description = models.TextField(verbose_name="个人简介", null=True, blank=True)
    is_private = models.BooleanField(verbose_name="个人信息状态", null=True, default=False)

    # 隐藏的字段
    # leading_team
    # solved_challenges

    class Meta:
        verbose_name = "用户"

    # 加分函数写在用户类下作为用户的方法
    # 逻辑不是加分而是算分
    # 每次调用方法依照solved_challenges字段中的Challenges重新计算用户总分
    def check_points(self):
        print("checking score: " + self.username)
        self.points = 0
        for challenge in self.solved_challenges.all():
            points = challenge.points
            self.points += points
        self.save()
        return self.points

    def __str__(self):
        return str(self.id) + " | " + self.username


class UserChallengeSession(models.Model):
    user = models.ForeignKey(User, verbose_name="用户", on_delete=models.CASCADE)
    challenge = models.ForeignKey('challenge.Challenge', verbose_name="题目", on_delete=models.CASCADE)
    start_time = models.DateTimeField(verbose_name="开始时间", auto_now_add=True)
    time_limit = models.IntegerField(verbose_name="时间限制", default=3000)
    # 不保存用户提交的flag
    # user_flag = models.CharField(verbose_name="用户提交的flag", max_length=127, blank=True)
    # 被动检测超时或已解决，每次收到请求之前先进行一次超时检查
    is_solved_or_expired = models.BooleanField(verbose_name="是否已解决或已过期", default=False)

    def get_start_time(self):
        return self.start_time

    def get_time_limit(self):
        return self.time_limit

    def get_flag(self):
        return self.challenge.flag

    def get_current_state(self):
        return self.is_solved_or_expired

    def expiration_verification(self):
        start_time = self.get_start_time()
        time_limit = self.get_time_limit()

        current_time = datetime.datetime.now(datetime.timezone.utc)
        time_elapsed = (current_time - start_time).total_seconds()

        if time_elapsed > time_limit:
            return True
        else:
            return False

    def flag_verification(self, flag):
        correct_flag = self.get_flag()
        if flag == correct_flag:
            self.is_solved_or_expired = True
            self.save()
        return flag == correct_flag

    def __str__(self):
        _str = str(self.id) + " | "
        is_closed = self.get_current_state()
        if is_closed:
            _str += "[CLOSED]"
        else:
            _str += "[OPEN]"
        _str += self.user.username + "_"
        _str += self.challenge.name + "_"
        _str += str(self.start_time)
        return _str
