# Generated by Django 4.0.7 on 2022-10-10 10:08

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0055_noop_alter_audiotrack_upload_state_and_more"),
        ("deposit", "0003_noop_alter_depositedfile_upload_state"),
    ]

    operations = [
        migrations.AlterField(
            model_name="filedepository",
            name="playlist",
            field=models.ForeignKey(
                help_text="playlist to which this file depository belongs",
                on_delete=django.db.models.deletion.PROTECT,
                related_name="filedepositories",
                to="core.playlist",
                verbose_name="playlist",
            ),
        ),
    ]
