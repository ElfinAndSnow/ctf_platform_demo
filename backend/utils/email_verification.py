import secrets
from datetime import datetime, timedelta

import jwt
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from rest_framework import status
from rest_framework.response import Response
from rest_framework.reverse import reverse_lazy
from rest_framework_simplejwt.tokens import RefreshToken

from account.models import User
from jwtauth.models import EmailVerification


def email_verification(instance: EmailVerification):
    user = instance.user
    print(user)
    username = user.username
    to_email = user.email

    subject = "Email Verification"
    body = "Hi " + username + "!\n"
    body += "You can verify through this code:\n"
    body += instance.code

    print(body)

    # generate email
    email = EmailMessage(
        subject=subject,
        body=body,
        to=[to_email, ],
        from_email=settings.EMAIL_HOST_USER,
    )
    # email.send()
    print(to_email)


def code_generate():
    return secrets.token_urlsafe(16)
