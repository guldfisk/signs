from __future__ import annotations

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now


class SemanticAtom(models.Model):
    external_id = models.IntegerField(unique = True)
    meaning = models.CharField(max_length = 255, unique = True)


class Sign(models.Model):
    video_id = models.IntegerField()
    thumbnail_id = models.IntegerField()
    atom = models.ForeignKey(
        SemanticAtom,
        on_delete = models.CASCADE,
        related_name = 'signs',
    )


class TrainingSet(models.Model):
    signs = models.ManyToManyField(Sign)
    created_at = models.DateTimeField(default = now)
    name = models.TextField()
    public = models.BooleanField(default = False)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = 'training_sets',
    )


class Familiarity(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete = models.CASCADE,
        related_name = 'familiarities',
    )
    level = models.IntegerField(default = 0)
    sign = models.ForeignKey(
        Sign,
        on_delete = models.CASCADE,
        related_name = 'familiarities',
    )

    class Meta:
        unique_together = ('user', 'sign')
