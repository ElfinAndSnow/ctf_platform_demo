from django.shortcuts import render
from .models import Book
from rest_framework.viewsets import ModelViewSet
from .serializer import BookSerializer


class BookViewSet(ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = []
