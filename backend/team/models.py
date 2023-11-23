from django.db import models
from account.models import User, Score


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
    invitation_token = models.CharField(
        verbose_name="邀请码",
        default="",
        max_length=12,
        help_text="No longer than 12 characters"
    )

    class Meta:
        verbose_name = "战队"

    def check_points(self):
        users = self.members.all()
        scores = Score.objects.filter(user__in=users)

        points = 0
        solved = 0
        for score in scores:
            if score.challenge not in self.solved_challenges_team.all():
                points += score.challenge.points
                solved += 1
                self.solved_challenges_team.add(
                    score.challenge,
                    through_defaults={
                        'solved_by': score.user,
                        'current_points': points
                    }
                )
        self.points = points
        self.challenges_solved = solved
        self.save()
        return points, solved

    def check_challenges(self):
        self.challenges_solved = 0
        for user in self.members.all():
            for challenge in user.solved_challenges.all():
                if challenge not in self.solved_challenges_team.all():
                    self.solved_challenges_team.add(challenge)
        for challenge in self.solved_challenges_team.all():
            self.challenges_solved += 1
        self.save()
        return self.challenges_solved

    def get_leader(self):
        return self.leader

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


class TeamScore(models.Model):
    team = models.ForeignKey('team.Team', on_delete=models.CASCADE)
    challenge = models.ForeignKey('challenge.Challenge', on_delete=models.CASCADE)
    solved_at = models.DateTimeField(verbose_name="解题时间", auto_now_add=True)
    solved_by = models.ForeignKey('account.User', on_delete=models.CASCADE)
    current_points = models.IntegerField(default=0, blank=True)

    def __str__(self):
        return (str(self.id) +
                " | " +
                str(self.team) +
                ", " +
                str(self.challenge) + ", " +
                str(self.current_points)) + ", " + str(self.solved_at)
