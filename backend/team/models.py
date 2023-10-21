from django.db import models


class Team(models.Model):
    name = models.CharField(verbose_name="战队", max_length=127, null=True)
    description = models.TextField(verbose_name="战队简介", null=True, blank=True)
    points = models.IntegerField(verbose_name="战队总分", default=0, null=True)
    leader = models.OneToOneField(
        'account.User',
        verbose_name="队长",
        on_delete=models.SET_NULL,
        related_name="leading_team",
        null=True,
        blank=True
    )
    # TODO 邀请码
    # invitation_token = models.CharField(
    #     verbose_name="邀请码",
    #     default=
    # )

    class Meta:
        verbose_name = "战队"

    # 战队不能单纯总和队员总分，应当根据队员解题的并集
    # 由此应当在题目中建立另一个ManyToMany字段solved_by_teams，指向Team
    # 在check每个队员的points后再check全队的points
    # check每个人points时，对each challenge in user.solved_challenges要做检验
    # 检验其solved_by_teams中是否包含self，也就是当前Team object
    # 若不包含则添加，之后再check全队的points
    def check_points(self):
        self.points = 0
        for user in self.members.all():
            # self.points += user.check_points()
            for challenge in user.solved_challenges.all():
                if challenge not in self.solved_challenges_team.all():
                    self.solved_challenges_team.add(challenge)
        for challenge in self.solved_challenges_team.all():
            self.points += challenge.points
        self.save()
        return self.points

    def __str__(self):
        return str(self.id) + " | " + self.name + "_" + str(self.points)
