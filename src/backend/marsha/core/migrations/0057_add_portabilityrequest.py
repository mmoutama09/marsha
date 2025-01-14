# Generated by Django 4.0.5 on 2022-10-04 11:41

import uuid

from django.conf import settings
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0056_add_ltiuserassociation"),
    ]

    operations = [
        migrations.CreateModel(
            name="PortabilityRequest",
            fields=[
                (
                    "deleted",
                    models.DateTimeField(db_index=True, editable=False, null=True),
                ),
                (
                    "deleted_by_cascade",
                    models.BooleanField(default=False, editable=False),
                ),
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
                    "from_lti_user_id",
                    models.CharField(
                        help_text="the requesting user's LTI user ID",
                        max_length=255,
                        verbose_name="resource model",
                    ),
                ),
                (
                    "state",
                    models.CharField(
                        choices=[
                            ("pending", "pending"),
                            ("accepted", "accepted"),
                            ("rejected", "rejected"),
                        ],
                        default="pending",
                        help_text="state of the request",
                        max_length=20,
                        verbose_name="request state",
                    ),
                ),
                (
                    "for_playlist",
                    models.ForeignKey(
                        help_text="playlist which portability is asked for",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="portability_requests",
                        to="core.playlist",
                        verbose_name="for playlist",
                    ),
                ),
                (
                    "from_lti_consumer_site",
                    models.ForeignKey(
                        help_text="the requesting user's LTI consumer site",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="portability_requests",
                        to="core.consumersite",
                        verbose_name="consumer site",
                    ),
                ),
                (
                    "from_playlist",
                    models.ForeignKey(
                        help_text="playlist requesting the access",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="portability_requesting_access",
                        to="core.playlist",
                        verbose_name="from playlist",
                    ),
                ),
                (
                    "from_user",
                    models.ForeignKey(
                        blank=True,
                        help_text="Marsha user requesting the portability",
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="portability_requests",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="user",
                    ),
                ),
                (
                    "updated_by_user",
                    models.ForeignKey(
                        blank=True,
                        help_text="Marsha user who accepted or rejected the request",
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="actioned_portability_requests",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="updated by user",
                    ),
                ),
            ],
            options={
                "verbose_name": "portability request",
                "verbose_name_plural": "portability requests",
                "db_table": "portability_request",
                "unique_together": {("for_playlist", "from_playlist")},
            },
        ),
    ]
