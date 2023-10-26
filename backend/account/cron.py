from django_cron import CronJobBase, Schedule

from account.models import UserChallengeSession


class UserChallengeSessionCronJob(CronJobBase):
    RUN_EVERY_MINS = 2  # every 2 minutes

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'user_challenge_session_cron_job'    # a unique code

    def do(self):
        sessions = UserChallengeSession.objects.filter(is_expired=False)
        for session in sessions:
            session.expiration_verification()
