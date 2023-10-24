from django.contrib import admin

from utils.models import AbstractTimeLimitedModel
from jwtauth.models import EmailVerification

admin.site.register(EmailVerification)
