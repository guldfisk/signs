from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    current_training_set = models.OneToOneField('api.TrainingSet', on_delete = models.SET_NULL, null = True)
