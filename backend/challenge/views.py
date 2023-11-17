from django.http import FileResponse
from django.shortcuts import render
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, viewsets, renderers, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from account.models import UserChallengeSession
from challenge.models import Challenge
from challenge.serializer import ChallengeSerializer, EmptySerializer
from utils.custom_permissions import IsActivatedUser


class ChallengeListView(generics.ListAPIView):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser]
    filter_backends = [DjangoFilterBackend, ]
    filterset_fields = ['type', ]


class ChallengeRetrieveView(generics.RetrieveAPIView):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [IsAuthenticated, IsActivatedUser]


class PassThroughRenderer(renderers.BaseRenderer):
    media_type = ""
    format = ""

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class ChallengeFileDownloadViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Challenge.objects.all()
    permission_classes = [IsAuthenticated, IsActivatedUser]

    # To avoid assertion error
    # AssertionError:
    # 'ChallengeFileDownloadViewSet' should either include a `serializer_class` attribute,
    # or override the `get_serializer_class()` method.
    serializer_class = EmptySerializer

    @action(methods=['get'], detail=True, renderer_classes=(PassThroughRenderer,))
    def download(self, request, *args, **kwargs):
        instance = self.get_object()
        session = UserChallengeSession.objects.filter(user=request.user, challenge=instance).last()
        if not session:
            return Response(
                data={"detail": "You haven't opened a challenge session yet."},
                status=status.HTTP_400_BAD_REQUEST
            )
        print(session)

        if session.get_current_state():
            return Response(
                data={"detail": "Your session has been closed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not instance.file:
            return Response(
                data={"detail": "This Challenge has no file to download."},
                status=status.HTTP_400_BAD_REQUEST
            )

        file_handle = instance.file.open()

        response = FileResponse(file_handle, content_type="application/x-rar-compressed")
        response['Content-Length'] = instance.file.size
        response['Content-Disposition'] = 'attachment; filename="%s"' % instance.file.name

        return response
      