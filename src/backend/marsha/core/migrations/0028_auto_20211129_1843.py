# Generated by Django 3.2.9 on 2021-11-29 18:43

import uuid

import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0027_auto_20211125_1447"),
    ]

    operations = [
        migrations.CreateModel(
            name="SharedLiveMedia",
            fields=[
                ("deleted", models.DateTimeField(editable=False, null=True)),
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        help_text="primary key for the record as UUID",
                        primary_key=True,
                        serialize=False,
                        verbose_name="id",
                    ),
                ),
                (
                    "created_on",
                    models.DateTimeField(
                        default=django.utils.timezone.now,
                        editable=False,
                        help_text="date and time at which a record was created",
                        verbose_name="created on",
                    ),
                ),
                (
                    "updated_on",
                    models.DateTimeField(
                        auto_now=True,
                        help_text="date and time at which a record was last updated",
                        verbose_name="updated on",
                    ),
                ),
                (
                    "uploaded_on",
                    models.DateTimeField(
                        blank=True,
                        help_text="datetime at which the active version of the file was uploaded.",
                        null=True,
                        verbose_name="uploaded on",
                    ),
                ),
                (
                    "upload_state",
                    models.CharField(
                        choices=[
                            ("pending", "pending"),
                            ("processing", "processing"),
                            ("harvesting", "processing live to VOD"),
                            ("error", "error"),
                            ("ready", "ready"),
                            ("harvested", "harvested"),
                            ("deleted", "deleted"),
                        ],
                        default="pending",
                        help_text="state of the upload in AWS.",
                        max_length=20,
                        verbose_name="upload state",
                    ),
                ),
                (
                    "title",
                    models.CharField(
                        blank=True,
                        help_text="title of the shared live media",
                        max_length=255,
                        null=True,
                        verbose_name="title",
                    ),
                ),
                ("show_download", models.BooleanField(default=True)),
                (
                    "nb_pages",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Number of pages contained by the media",
                        null=True,
                    ),
                ),
                (
                    "extension",
                    models.CharField(
                        default=None,
                        help_text="media extension",
                        max_length=10,
                        null=True,
                        verbose_name="extension",
                        blank=True,
                    ),
                ),
                (
                    "video",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="shared_live_media",
                        to="core.video",
                        verbose_name="Video",
                    ),
                ),
            ],
            options={
                "verbose_name": "shared live media",
                "verbose_name_plural": "shared live medias",
                "db_table": "shared_live_media",
            },
        ),
    ]
