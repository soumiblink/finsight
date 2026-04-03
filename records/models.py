from django.db import models
from django.db.models import Sum
from django.utils import timezone
from finsight_core.utils import resize_photo, delete_photoURL
from finsight_core.validators import number_lt_zero
from django.conf import settings


class Budget(models.Model):

    title = models.CharField(max_length=50)
    desc = models.TextField(blank=True, null=True)
    _from = models.DateTimeField(verbose_name="from", default=timezone.now)
    to = models.DateTimeField(verbose_name="to")
    total_amount = models.FloatField(validators=[number_lt_zero])
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=timezone.now)

    @property
    def amount_used(self):
        return self.expenses_set.aggregate(Sum('amount')).get('amount__sum') or 0

    @property
    def has_expired(self):
        return not self.to > timezone.now()

    @property
    def amount_left(self):
        return self.total_amount - self.amount_used

    class Meta:
        ordering = ('-issued_at',)

    def __str__(self):
        return f"{self.title}"


class Source(models.Model):

    title = models.CharField(max_length=50)
    desc = models.CharField(max_length=250, blank=True, null=True)
    is_secure = models.BooleanField(default=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    def __str__(self):
        return self.title


class Category(models.Model):

    title = models.CharField(max_length=50)
    desc = models.CharField(max_length=250, blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class Income(models.Model):

    title = models.CharField(max_length=50)
    amount = models.FloatField()
    desc = models.CharField(max_length=200, blank=True, null=True)
    added_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    source = models.ManyToManyField(Source, blank=True)

    class Meta:
        ordering = ('-added_at',)

    def __str__(self):
        return self.title


class Expenses(models.Model):

    title = models.CharField(max_length=50)
    desc = models.CharField(max_length=250, blank=True)
    amount = models.FloatField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    categories = models.ManyToManyField(Category, blank=True)
    budget = models.ForeignKey(Budget, null=False, on_delete=models.CASCADE)
    receipt = models.ImageField(upload_to="expenses", null=True, blank=True)

    class Meta:
        ordering = ('-added_at',)

    def save(self, *args, **kwargs):
        if self.receipt:
            resize_photo(self.receipt, self.user, resize=False)
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.receipt:
            delete_photoURL(self.receipt, self.user)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.title
