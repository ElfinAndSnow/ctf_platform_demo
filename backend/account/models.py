import datetime

import docker
from django.contrib.auth.models import AbstractUser
from django.contrib.sites.shortcuts import get_current_site
from django.db import models

from utils.models import AbstractTimeLimitedModel


class User(AbstractUser):
    # solved_challenges = models.ManyToManyField('challenge.Challenge', related_name="solved_by", blank=True)
    points = models.IntegerField(verbose_name="个人总分数", default=0, null=True)
    team = models.ForeignKey('team.Team', verbose_name="所属战队", on_delete=models.SET_NULL, related_name="members", null=True, blank=True)
    description = models.TextField(verbose_name="个人简介", null=True, blank=True)
    is_private = models.BooleanField(verbose_name="个人信息隐私状态", null=True, default=False)
    is_email_verified = models.BooleanField(verbose_name="是否已邮箱验证", null=True, default=False)
    # enable_password_reset = models.BooleanField(verbose_name="可否更改密码", null=True, default=False)

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


class UserChallengeSession(AbstractTimeLimitedModel):
    """
    Inherit from AbstractTimeLimitedModel, including
    created_at, time_limit fields, time_limit_second
    varialble and get_created_at() and get_time_limit()
    methods.
    """
    time_limit_second = 3000

    user = models.ForeignKey(User, verbose_name="用户", on_delete=models.CASCADE)
    challenge = models.ForeignKey('challenge.Challenge', verbose_name="题目", on_delete=models.CASCADE)
    # 不保存用户提交的flag
    # user_flag = models.CharField(verbose_name="用户提交的flag", max_length=127, blank=True)
    # 被动检测超时或已解决，每次收到请求之前先进行一次超时检查
    is_solved = models.BooleanField(verbose_name="是否已解决或已过期", default=False)

    container_id = models.CharField(verbose_name="容器id", max_length=255, null=True, blank=True)
    port = models.IntegerField(verbose_name="主机端口", default=50000, null=True)
    port_inside = models.CharField(verbose_name="容器内部端口/protocol", max_length=127, default="80/tcp", null=True)
    address = models.CharField(verbose_name="题目地址", max_length=127, null=True, blank=True)

    def distribute_port(self):
        _port = 50000
        sessions = UserChallengeSession.objects.filter(is_solved=False).order_by('-port')
        for session in sessions:
            is_expired = True
            if not session.is_expired:
                is_expired = session.expiration_verification()

            print(is_expired)
            if is_expired:
                continue
            if session.port == _port:
                _port -= 1

        self.port = _port
    def get_flag(self):
        return self.challenge.flag

    def get_current_state(self):
        return self.is_solved or self.is_expired

    def flag_verification(self, flag):
        correct_flag = self.get_flag()
        if flag == correct_flag:
            self.is_solved = True
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
        _str += str(self.created_at)
        return _str
