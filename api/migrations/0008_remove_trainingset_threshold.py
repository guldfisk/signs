# Generated by Django 3.2.8 on 2021-10-25 12:40

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_auto_20210927_1550'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='trainingset',
            name='threshold',
        ),
    ]
