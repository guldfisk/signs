from __future__ import annotations

from django.db import models
from django.utils.timezone import now
from django.contrib.auth import get_user_model


class SemanticAtom(models.Model):
    meaning = models.CharField(max_length = 255)


class Sign(models.Model):
    external_id = models.IntegerField()
    atom = models.ForeignKey(
        SemanticAtom,
        on_delete = models.CASCADE,
        related_name = 'signs',
    )


class TrainingSet(models.Model):
    signs = models.ManyToManyField(Sign)
    created_at = models.DateTimeField(default = now)
    threshold = models.IntegerField()
    size = models.IntegerField()
    user = models.ForeignKey(
        get_user_model(),
        on_delete = models.CASCADE,
        related_name = 'training_sets',
    )


class Familiarity(models.Model):
    user = models.ForeignKey(
        get_user_model(),
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
