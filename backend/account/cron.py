from django_cron import CronJobBase, Schedule

from account.models import UserChallengeSession


class UserChallengeSessionCronJob(CronJobBase):
    schedule = Schedule(run_every_mins=1)
    code = 'account.user_challenge_session_cron_job'    # a unique code

    def do(self):
        print("running cron job.")
        sessions = UserChallengeSession.objects.filter(is_expired=False)
        for session in sessions:
            print("doing cron job for session:" + str(session))
            session.expiration_verification()
