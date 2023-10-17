from django.contrib import admin
from account.models import User, UserChallengeSession

admin.site.register(User)
admin.site.register(UserChallengeSession)
