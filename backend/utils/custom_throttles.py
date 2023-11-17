from rest_framework import throttling


class SessionThrottle(throttling.UserRateThrottle):
    THROTTLE_RATES = {
        'user': '1/minute',
    }


class AuthAnonThrottle(throttling.AnonRateThrottle):
    THROTTLE_RATES = {
        'anon': '5/minute',
    }
    