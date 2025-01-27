# Generated by Django 4.0.6 on 2022-07-26 09:23

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0052_migrate_livesession_liveattendance"),
    ]

    operations = [
        migrations.AddField(
            model_name="video",
            name="tags",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.CharField(max_length=200),
                blank=True,
                help_text="video tags",
                default=list,
                size=None,
            ),
        ),
        migrations.AddField(
            model_name="video",
            name="license",
            field=models.CharField(
                blank=True,
                choices=[
                    ("CC_BY", "Creative Common By Attribution"),
                    ("CC_BY-SA", "Creative Common By Attribution Share Alike"),
                    ("CC_BY-NC", "Creative Common By Attribution Non Commercial"),
                    (
                        "CC_BY-NC-SA",
                        "Creative Common By Attribution Non Commercial Share Alike",
                    ),
                    ("CC_BY-ND", "Creative Common By Attribution No Derivates"),
                    (
                        "CC_BY-NC-ND",
                        "Creative Common By Attribution Non Commercial No Derivates",
                    ),
                    ("CC0", "Public Domain Dedication "),
                    ("NO_CC", "All rights reserved"),
                ],
                help_text="License for this video",
                max_length=20,
                null=True,
                verbose_name="licenses",
            ),
        ),
    ]
