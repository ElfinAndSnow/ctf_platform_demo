from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from article.models import Article
from article.serializer import ArticleSerializer
from utils.custom_permissions import IsAdminOrAuthorOrReadOnly


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAdminOrAuthorOrReadOnly]

    def get_permissions(self):
        """
            Instantiates and returns the list of permissions that this view requires.
            """
        if self.action == 'list' or self.action == 'retrieve' or self.action == 'create':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminOrAuthorOrReadOnly]
        return [permission() for permission in permission_classes]


