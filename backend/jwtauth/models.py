from django.db import models

from utils.models import AbstractTimeLimitedModel


class EmailVerification(AbstractTimeLimitedModel):
    # 默认超时时限5分钟
    time_limit_second = 10

    PURPOSE_CHOICES = (
        ('registration', 'Registration'),
        ('password_reset', 'Password Reset'),
    )

    user = models.ForeignKey(
        'account.User',
        verbose_name="用户",
        on_delete=models.CASCADE,
        related_name='email_verifications',
    )
    is_verified = models.BooleanField(verbose_name="是否验证", default=False, blank=True)
    purpose = models.CharField(max_length=15, choices=PURPOSE_CHOICES, null=False)
    code = models.CharField(verbose_name="验证代码", null=True, max_length=127)

    def __str__(self):
        state = "[OPEN]"
        if self.is_verified or self.is_expired:
            state = "[CLOSED]"
        return f"{self.id} | {state}{self.purpose}: {self.user.username}"

    def code_verification(self, code):
        if code == self.code:
            self.is_verified = True
            self.save()
            return True
        else:
            return False
