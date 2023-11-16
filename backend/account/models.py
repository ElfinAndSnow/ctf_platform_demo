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

        # 保存当前成绩
        score = Score.objects.filter(user=self).last()
        score.current_points = self.points
        score.save()
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
    is_solved = models.BooleanField(verbose_name="是否已解决", default=False)

    # 防止在超时检查中，多次销毁容器产生异常
    is_container_removed = models.BooleanField(verbose_name="是否已销毁容器", default=False)

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

    def create_container(self, request):
        client = docker.from_env()
        port = self.port
        image_name = self.challenge.image_name
        try:
            image = client.images.get(image_name)
        except docker.errors.ImageNotFound:
            print(f"Image {image_name} not found!")
        for k in image.attrs['ContainerConfig']['ExposedPorts']:
            port_inside = k
            break
        container = client.containers.run(
            image=image_name,
            detach=True,
            ports={port_inside: port}
        )
        self.container_id = container.id
        self.port_inside = port_inside
        self.address = str(get_current_site(request)).split(':')[0] + f":{port}"
        self.save()

    def destroy_container(self):
        client = docker.from_env()
        try:
            container = client.containers.get(container_id=self.container_id)
            container.kill()
            container.remove()
        except docker.errors.NotFound:
            print(f"Container '{self.container_id}' not found.")

    def expiration_verification(self):
        print("verifying" + self.__str__())
        _expired = super().expiration_verification()
        if not _expired:
            return _expired
        if not self.is_container_removed:
            self.destroy_container()
            self.is_container_removed = True
            self.save()
        return _expired

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


class Score(models.Model):
    user = models.ForeignKey('account.User', on_delete=models.CASCADE)
    challenge = models.ForeignKey('challenge.Challenge', on_delete=models.CASCADE)
    solved_at = models.DateTimeField(verbose_name="解题时间", auto_now_add=True)
    current_points = models.IntegerField(default=0, blank=True)

    def __str__(self):
        return (str(self.id) +
                " | " +
                str(self.user) +
                ", " +
                str(self.challenge) + ", " +
                str(self.current_points)) + ", " + str(self.solved_at)
