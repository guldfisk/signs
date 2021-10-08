from collections import defaultdict

import requests as r
import re

from django.core.management.base import BaseCommand
from django.db import transaction

from api import models


class Command(BaseCommand):
    help = 'Update signs'

    def handle(self, *args, **options):
        models.SemanticAtom.objects.all().delete()
        models.Sign.objects.all().delete()

        headers = {
            'Accept': '*.*',
            'Accept-Encoding': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Host': 'tegnsprog.dk',
            'Referer': 'http://tegnsprog.dk/',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0',
        }

        response = r.get(
            'http://tegnsprog.dk/indeks/artikel.js',
            headers = headers,
        )

        with transaction.atomic():
            for line in re.finditer('"(.+?)\|(\d+)"', response.content.decode('UTF-8')):
                meaning, external_id = line.groups()
                atom, _ = models.SemanticAtom.objects.get_or_create(
                    meaning = meaning,
                    external_id = external_id,
                )

            response = r.get(
                'http://tegnsprog.dk/indeks/artikel_liste.js',
                headers = headers,
            )

            for line in re.finditer('"(.+?)\|.*(t_(\d+))\|(f_(\d+)).*"', response.content.decode('UTF-8')):
                meaning, _, video_id, _, thumb_id = line.groups()

                try:
                    atom = models.SemanticAtom.objects.get(meaning__iexact = meaning)
                except models.SemanticAtom.DoesNotExist:
                    continue

                models.Sign.objects.create(
                    atom = atom,
                    video_id = video_id,
                    thumbnail_id = thumb_id,
                )
