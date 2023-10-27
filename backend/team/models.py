from django.db import models
from account.models import User


class Team(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(verbose_name="战队", max_length=127, null=True)
    description = models.TextField(verbose_name="战队简介", null=True, blank=True, default="该战队尚未填写简介")
    points = models.IntegerField(verbose_name="战队总分", default=0, null=True)
    challenges_solved = models.IntegerField(verbose_name="战队总解出题数(不重复)", default=0, null=True)
    leader = models.OneToOneField(
        User,
        verbose_name="队长",
        on_delete=models.SET_NULL,
        related_name="leading_team",
        null=True,
        blank=True
    )
    teammate = models.ManyToManyField(
        User,
        through='TeamMembership',
        verbose_name="队员",
        blank=True,
        related_name="teams"
    )
    # 邀请码部分待修改
    invitation_token = models.CharField(
        verbose_name="邀请码",
        default="",
        max_length=12,
        help_text="No longer than 12 characters"
    )

    class Meta:
        verbose_name = "战队"

    def check_points(self):
        self.points = 0
        for user in self.teammate.all():
            # self.points += user.check_points()
            for challenge in user.solved_challenges.all():
                if challenge not in self.solved_challenges_team.all():
                    self.solved_challenges_team.add(challenge)
        for challenge in self.solved_challenges_team.all():
            self.points += challenge.points
        self.save()
        return self.points

    def check_challenges(self):
        self.challenges_solved = 0
        for user in self.teammate.all():
            for challenge in user.solved_challenges.all():
                if challenge not in self.solved_challenges_team.all():
                    self.solved_challenges_team.add(challenge)
        for challenge in self.solved_challenges_team.all():
            self.challenges_solved += 1
        self.save()
        return self.points

    def get_leader(self):
        return self.leader

    def get_teammates(self):
        return User.objects.filter(teams=self)
    # 战队不能单纯总和队员总分，应当根据队员解题的并集
    # 由此应当在题目中建立另一个ManyToMany字段solved_by_teams，指向Team
    # 在check每个队员的points后再check全队的points
    # check每个人points时，对each challenge in user.solved_challenges要做检验
    # 检验其solved_by_teams中是否包含self，也就是当前Team object
    # 若不包含则添加，之后再check全队的points

    # def __str__(self):
    #     return str(self.id) + " | " + self.name + "_" + str(self.points)

    def __str__(self):
        team_info = f"Team ID: {self.id}, Name: {self.name}, Leader ID: {self.leader.id}"
        return team_info

# TO DO
# fix the relationship.


class TeamMembership(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
