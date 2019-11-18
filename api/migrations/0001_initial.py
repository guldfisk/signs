# Generated by Django 2.2.7 on 2019-11-08 15:18

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SemanticAtom',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('meaning', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Sign',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('external_id', models.IntegerField()),
                ('atom', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='signs', to='api.SemanticAtom')),
            ],
        ),
        migrations.CreateModel(
            name='TrainingSet',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('threshold', models.IntegerField()),
                ('size', models.IntegerField()),
                ('signs', models.ManyToManyField(to='api.Sign')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='training_sets', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Familiarity',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('level', models.IntegerField()),
                ('sign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='familiarities', to='api.Sign')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='familiarities', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'sign')},
            },
        ),
    ]