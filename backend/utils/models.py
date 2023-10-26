import datetime

from django.db import models


class AbstractTimeLimitedModel(models.Model):
    time_limit_second = 3000
    created_at = models.DateTimeField(verbose_name="开始时间", auto_now_add=True)
    time_limit = models.IntegerField(verbose_name="时间限制", default=time_limit_second)
    is_expired = models.BooleanField(verbose_name="是否超时", default=False, null=True)

    class Meta:
        abstract = True

    def get_created_at(self):
        return self.created_at

    def get_time_limit(self):
        return self.time_limit

    def expiration_verification(self):
        """
        Should be implemented
        """
        created_at = self.get_created_at()
        time_limit = self.get_time_limit()

        current_time = datetime.datetime.now(datetime.timezone.utc)
        time_elapsed = (current_time - created_at).total_seconds()

        if time_elapsed > time_limit:
            # Time limit exceeded logic
            self.is_expired = True
            self.save()
            return True
        else:
            self.is_expired = False
            self.save()
            return False
