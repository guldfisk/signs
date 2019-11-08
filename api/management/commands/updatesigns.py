import itertools
from collections import defaultdict

import requests as r
import re

from django.core.management.base import BaseCommand

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

        for line in re.finditer('"(.+?)(~(\d+))?\|(\d+)"', response.content.decode('UTF-8')):
            meaning, _, _, external_id = line.groups()
            atom, _ = models.SemanticAtom.objects.get_or_create(meaning = meaning)
            models.Sign.objects.create(
                atom = atom,
                external_id = external_id,
            )

        response = r.get(
            'http://tegnsprog.dk/indeks/artikel_liste.js',
            headers = headers,
        )

        collector = defaultdict(list)

        for line in re.finditer('"(.*?)[|~].*(t_(\d+)).*"', response.content.decode('UTF-8')):
            meaning, _, external_id = line.groups()
            collector[meaning.lower()].append(external_id)

        for meaning, ids in collector.items():

            atom, created = models.SemanticAtom.objects.get_or_create(meaning = meaning)

            if not created:
                models.Sign.objects.filter(atom = atom).delete()

            for external_id in ids:
                models.Sign.objects.create(
                    atom = atom,
                    external_id = external_id,
                )