from django.db import models

from account.models import User


class Article(models.Model):
    title = models.CharField(verbose_name='标题', max_length=127)
    author = models.ForeignKey(User, verbose_name="作者", on_delete=models.CASCADE)
    text = models.TextField(verbose_name="文章内容")

    def __str__(self):
        return self.title + "_by_" + self.author.username
