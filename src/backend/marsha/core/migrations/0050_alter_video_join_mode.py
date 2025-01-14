# Generated by Django 4.0.4 on 2022-06-08 12:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0049_noop_run_missing_migrations"),
    ]

    operations = [
        migrations.AlterField(
            model_name="video",
            name="join_mode",
            field=models.CharField(
                choices=[
                    ("approval", "approval"),
                    ("denied", "denied"),
                    ("forced", "forced"),
                ],
                default="approval",
                help_text="Join the discussion mode.",
                max_length=20,
                verbose_name="Join the discussion mode",
            ),
        ),
    ]
