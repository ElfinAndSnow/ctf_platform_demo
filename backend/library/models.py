from django.db import models


class Book(models.Model):
    title = models.CharField(max_length=64, verbose_name="标题")
    # author =
    text = models.TextField(verbose_name="内容")
    create_time = models.DateTimeField(verbose_name="创建时间", auto_now_add=True)
    # objects = models.Manager()

    class Meta:
        db_table = "db_book"
        verbose_name = "书籍"
