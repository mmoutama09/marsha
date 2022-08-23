"""Marsha deposit app URLs configuration."""

from django.urls import include, path

from rest_framework.routers import DefaultRouter

from .api import DepositedFileViewSet, FileDepositoryViewSet
from .views import FileDepositoryLTIView


app_name = "deposit"

router = DefaultRouter()
router.register("filedepositories", FileDepositoryViewSet, basename="file_depository")
router.register("depositedfiles", DepositedFileViewSet, basename="deposited_file")

urlpatterns = [
    path(
        "lti/filedepositories/<uuid:uuid>",
        FileDepositoryLTIView.as_view(),
        name="file_depository_lti_view",
    ),
    path("api/", include(router.urls)),
]