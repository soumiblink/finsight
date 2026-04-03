from django.dispatch import receiver
from django.db.models.signals import pre_save, pre_delete, post_save

from .models import Category, Expenses, Income, Source
