from django.contrib import admin
from utils.models import AbstractTimeLimitedModel
from account.models import User, UserChallengeSession, Score

admin.site.register(Score)
admin.site.register(User)
admin.site.register(UserChallengeSession)
