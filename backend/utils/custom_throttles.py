from rest_framework import throttling


class SessionThrottle(throttling.UserRateThrottle):
    THROTTLE_RATES = {
        'user': '60/minute',
    }


class AuthAnonThrottle(throttling.AnonRateThrottle):
    THROTTLE_RATES = {
        'anon': '30/minute',
    }
    