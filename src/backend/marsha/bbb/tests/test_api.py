"""Tests for the meeting API."""

import json
import random
import re
from unittest import mock
from urllib.parse import quote_plus
import uuid

from django.test import TestCase, override_settings

from rest_framework_simplejwt.tokens import AccessToken

from marsha.bbb import api, serializers
from marsha.core import factories as core_factories

from ..factories import MeetingFactory
from ..utils.bbb_utils import ApiMeetingException


# We don't enforce arguments documentation in tests
# pylint: disable=unused-argument


@override_settings(BBB_API_ENDPOINT="https://10.7.7.1/bigbluebutton/api")
@override_settings(BBB_API_SECRET="SuperSecret")
@override_settings(BBB_ENABLED=True)
class MeetingAPITest(TestCase):
    """Test for the Meeting API."""

    maxDiff = None

    @mock.patch.object(serializers, "get_meeting_infos")
    def test_api_meeting_fetch_student(self, mock_get_meeting_infos):
        """A student should be allowed to fetch a meeting."""
        meeting = MeetingFactory()
        mock_get_meeting_infos.return_value = {
            "returncode": "SUCCESS",
            "running": "true",
        }

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = ["student"]

        response = self.client.get(
            f"/api/meetings/{meeting.id!s}/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        content = json.loads(response.content)
        self.assertDictEqual(
            {
                "id": str(meeting.id),
                "infos": {"returncode": "SUCCESS", "running": "true"},
                "lti_id": str(meeting.lti_id),
                "title": meeting.title,
                "started": False,
                "meeting_id": str(meeting.meeting_id),
                "welcome_text": meeting.welcome_text,
                "playlist": {
                    "id": str(meeting.playlist.id),
                    "title": meeting.playlist.title,
                    "lti_id": meeting.playlist.lti_id,
                },
            },
            content,
        )

    @mock.patch.object(serializers, "get_meeting_infos")
    def test_api_meeting_fetch_instructor(self, mock_get_meeting_infos):
        """An instructor should be able to fetch a meeting."""
        meeting = MeetingFactory()
        mock_get_meeting_infos.return_value = {
            "returncode": "SUCCESS",
            "running": "true",
        }

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.get(
            f"/api/meetings/{meeting.id!s}/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        content = json.loads(response.content)
        self.assertDictEqual(
            {
                "id": str(meeting.id),
                "infos": {"returncode": "SUCCESS", "running": "true"},
                "lti_id": str(meeting.lti_id),
                "title": meeting.title,
                "started": False,
                "meeting_id": str(meeting.meeting_id),
                "welcome_text": meeting.welcome_text,
                "playlist": {
                    "id": str(meeting.playlist.id),
                    "title": meeting.playlist.title,
                    "lti_id": meeting.playlist.lti_id,
                },
            },
            content,
        )

    def test_api_meeting_update_anonymous(self):
        """An anonymous should not be able to update a meeting."""
        meeting = MeetingFactory()
        response = self.client.put(f"/api/meetings/{meeting.id!s}/")
        self.assertEqual(response.status_code, 401)

    def test_api_meeting_update_user_logged_in(self):
        """An logged in user should not be able to update a meeting."""
        user = core_factories.UserFactory(
            first_name="Jane", last_name="Doe", email="jane.doe@example.com"
        )
        meeting = MeetingFactory()
        self.client.force_login(user)
        response = self.client.put(f"/api/meetings/{meeting.id!s}/")
        self.assertEqual(response.status_code, 401)

    def test_api_meeting_update_student(self):
        """A student user should not be able to update a meeting."""
        meeting = MeetingFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = ["student"]
        data = {"title": "new title"}

        response = self.client.put(
            f"/api/meetings/{meeting.id!s}/",
            json.dumps(data),
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    def test_api_meeting_update_instructor_read_only(self):
        """An instructor should not be able to update a meeting in read_only."""
        meeting = MeetingFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": False}
        data = {"title": "new title"}

        response = self.client.put(
            f"/api/meetings/{meeting.id!s}/",
            data,
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

    @mock.patch.object(serializers, "get_meeting_infos")
    def test_api_meeting_update_instructor(self, mock_get_meeting_infos):
        """An instructor should be able to update a meeting."""
        meeting = MeetingFactory()

        mock_get_meeting_infos.return_value = {
            "returncode": "SUCCESS",
            "running": "true",
        }

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}
        data = {"title": "new title", "welcome_text": "Hello"}

        response = self.client.put(
            f"/api/meetings/{meeting.id!s}/",
            data,
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

        meeting.refresh_from_db()
        self.assertEqual("new title", meeting.title)
        self.assertEqual("Hello", meeting.welcome_text)

    def test_api_select_instructor_no_bbb_server(self):
        """An instructor should be able to fetch a meeting lti select."""
        playlist = core_factories.PlaylistFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = "None"
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}
        jwt_token.payload["playlist_id"] = str(playlist.id)

        response = self.client.get(
            "/api/meetings/lti-select/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        new_uuid = re.search(
            "http://testserver/lti/meetings/(.*)", response.json().get("new_url", "")
        ).group(1)
        self.assertEqual(uuid.UUID(new_uuid).version, 4)
        self.assertDictEqual(
            {
                "new_url": f"http://testserver/lti/meetings/{new_uuid}",
                "meetings": [],
            },
            response.json(),
        )

    def test_api_select_instructor_no_meetings(self):
        """An instructor should be able to fetch a meeting lti select."""
        playlist = core_factories.PlaylistFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = "None"
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}
        jwt_token.payload["playlist_id"] = str(playlist.id)

        response = self.client.get(
            "/api/meetings/lti-select/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        new_uuid = re.search(
            "http://testserver/lti/meetings/(.*)", response.json().get("new_url", "")
        ).group(1)
        self.assertEqual(uuid.UUID(new_uuid).version, 4)
        self.assertDictEqual(
            {
                "new_url": f"http://testserver/lti/meetings/{new_uuid}",
                "meetings": [],
            },
            response.json(),
        )

    def test_api_select_instructor(self):
        """An instructor should be able to fetch a meeting lti select."""
        # playlist = core_factories.PlaylistFactory()
        # MeetingFactory.build_batch(3, playlist=playlist)
        meeting = MeetingFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = "None"
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}
        jwt_token.payload["playlist_id"] = str(meeting.playlist_id)

        response = self.client.get(
            "/api/meetings/lti-select/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        new_uuid = re.search(
            "http://testserver/lti/meetings/(.*)", response.json().get("new_url", "")
        ).group(1)
        self.assertEqual(uuid.UUID(new_uuid).version, 4)
        self.assertDictEqual(
            {
                "new_url": f"http://testserver/lti/meetings/{new_uuid}",
                "meetings": [
                    {
                        "id": str(meeting.id),
                        "lti_id": str(meeting.lti_id),
                        "lti_url": f"http://testserver/lti/meetings/{str(meeting.id)}",
                        "title": meeting.title,
                        "meeting_id": str(meeting.meeting_id),
                        "playlist": {
                            "id": str(meeting.playlist_id),
                            "title": meeting.playlist.title,
                            "lti_id": meeting.playlist.lti_id,
                        },
                    }
                ],
            },
            response.json(),
        )

    @mock.patch.object(api, "create")
    def test_api_bbb_create_anonymous(self, mock_create_request):
        """An anonymous should not be able to create a meeting."""
        meeting = MeetingFactory()

        response = self.client.patch(f"/api/meetings/{meeting.id}/create/")
        self.assertEqual(response.status_code, 401)
        mock_create_request.assert_not_called()

    @mock.patch.object(api, "create")
    def test_api_bbb_create_user_logged_in(self, mock_create_request):
        """A logged in user should not be able to create a meeting."""
        user = core_factories.UserFactory(
            first_name="Jane", last_name="Doe", email="jane.doe@example.com"
        )
        meeting = MeetingFactory()
        self.client.force_login(user)

        response = self.client.patch(f"/api/meetings/{meeting.id}/create/")
        self.assertEqual(response.status_code, 401)
        mock_create_request.assert_not_called()

    @mock.patch.object(api, "create")
    def test_api_bbb_create_student(self, mock_create_request):
        """A student should not be able to create a meeting."""
        meeting = MeetingFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = ["student"]

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/create/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 403)
        mock_create_request.assert_not_called()

    @mock.patch.object(api, "create")
    @mock.patch.object(serializers, "get_meeting_infos")
    def test_api_bbb_create_new_meeting(
        self, mock_get_meeting_infos, mock_create_request
    ):
        """Starting a meeting with parameters should store them."""
        meeting = MeetingFactory()
        mock_get_meeting_infos.return_value = {"returncode": "SUCCESS"}
        mock_create_request.return_value = {"returncode": "SUCCESS"}

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}
        data = {"title": "new title", "welcome_text": "Hello"}

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/create/",
            data,
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(
            {
                "returncode": "SUCCESS",
            },
            response.data,
        )
        meeting.refresh_from_db()
        self.assertEqual("new title", meeting.title)
        self.assertEqual("Hello", meeting.welcome_text)
        mock_create_request.assert_called_with(meeting=meeting)

    @mock.patch.object(api, "create")
    @mock.patch.object(serializers, "get_meeting_infos")
    def test_api_bbb_create_existing_meeting(
        self, mock_get_meeting_infos, mock_create_request
    ):
        """No new meeting should be started if a BBB meeting exists for the same id."""
        meeting = MeetingFactory(
            meeting_id="21e6634f-ab6f-4c77-a665-4229c61b479a",
            title="Meeting 1",
            attendee_password="9#R1kuUl3R",
            moderator_password="0$C7Aaz0o",
        )

        mock_get_meeting_infos.return_value = {"returncode": "SUCCESS"}
        mock_create_request.side_effect = ApiMeetingException(
            {"message": "A meeting already exists with that meeting ID."}
        )

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}
        data = {"title": meeting.title, "welcome_text": meeting.welcome_text}

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/create/",
            data,
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 400)
        self.assertDictEqual(
            response.data,
            {"message": "A meeting already exists with that meeting ID."},
        )
        mock_create_request.assert_called_with(meeting=meeting)

    @mock.patch.object(api, "join")
    @mock.patch.object(serializers, "get_meeting_infos")
    def test_api_bbb_join_meeting_anonymous(
        self, mock_get_meeting_infos, mock_join_request
    ):
        """An anonymous should not be able to join a meeting."""
        meeting = MeetingFactory()

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/join/",
        )
        self.assertEqual(response.status_code, 401)
        mock_get_meeting_infos.assert_not_called()
        mock_join_request.assert_not_called()

    @mock.patch.object(api, "join")
    def test_api_bbb_join_meeting_user_logged_in(self, mock_join_request):
        """A logged in user should not be able to join a meeting."""
        user = core_factories.UserFactory(
            first_name="Jane", last_name="Doe", email="jane.doe@example.com"
        )
        meeting = MeetingFactory()
        self.client.force_login(user)

        response = self.client.patch(f"/api/meetings/{meeting.id}/join/")
        self.assertEqual(response.status_code, 401)
        mock_join_request.assert_not_called()

    def test_api_bbb_join_student(self):
        """Joining a meeting as student should return an attendee meeting url."""
        meeting = MeetingFactory(
            meeting_id="21e6634f-ab6f-4c77-a665-4229c61b479a",
            title="Meeting 1",
            attendee_password="9#R1kuUl3R",
            moderator_password="0$C7Aaz0o",
        )

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = ["student"]

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/join/",
            data=json.dumps({"fullname": "John Doe"}),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(
            "https://10.7.7.1/bigbluebutton/api/join?"
            f"fullName=John+Doe&meetingID={meeting.meeting_id}&"
            f"password={quote_plus(meeting.attendee_password)}&redirect=true",
            response.data.get("url"),
        )

    def test_api_bbb_join_instructor(self):
        """Joining a meeting as instructor should return a moderator meeting url."""
        meeting = MeetingFactory(
            meeting_id="21e6634f-ab6f-4c77-a665-4229c61b479a",
            title="Meeting 1",
            attendee_password="9#R1kuUl3R",
            moderator_password="0$C7Aaz0o",
        )

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/join/",
            data=json.dumps({"fullname": "John Doe"}),
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn(
            "https://10.7.7.1/bigbluebutton/api/join?"
            f"fullName=John+Doe&meetingID={meeting.meeting_id}&"
            f"password={quote_plus(meeting.moderator_password)}&redirect=true",
            response.data.get("url"),
        )

    def test_api_bbb_join_instructor_no_fullname(self):
        """Joining a meeting without fullname parameter should return a 422."""
        meeting = MeetingFactory(
            meeting_id="21e6634f-ab6f-4c77-a665-4229c61b479a",
            title="Meeting 1",
            attendee_password="9#R1kuUl3R",
            moderator_password="0$C7Aaz0o",
        )

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/join/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 400)
        self.assertDictEqual(
            {"message": "missing fullname parameter"},
            response.data,
        )

    @mock.patch.object(api, "end")
    def test_api_bbb_end_meeting_anonymous(self, mock_end_request):
        """An anonymous should not be able to end a meeting."""
        meeting = MeetingFactory()

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/end/",
        )
        self.assertEqual(response.status_code, 401)
        mock_end_request.assert_not_called()

    @mock.patch.object(api, "end")
    def test_api_bbb_end_meeting_user_logged_in(self, mock_end_request):
        """A logged in user should not be able to end a meeting."""
        user = core_factories.UserFactory(
            first_name="Jane", last_name="Doe", email="jane.doe@example.com"
        )
        meeting = MeetingFactory()
        self.client.force_login(user)

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/end/",
        )
        self.assertEqual(response.status_code, 401)
        mock_end_request.assert_not_called()

    @mock.patch.object(api, "end")
    def test_api_bbb_end_meeting_student(self, mock_end_request):
        """A student should not be able to end a meeting."""
        meeting = MeetingFactory()

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = ["student"]

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/end/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 403)
        mock_end_request.assert_not_called()

    @mock.patch.object(api, "end")
    def test_api_bbb_end_meeting_instructor(self, mock_end_request):
        """Ending a meeting as instructor should return a moderator meeting url."""
        meeting = MeetingFactory(
            meeting_id="21e6634f-ab6f-4c77-a665-4229c61b479a",
            title="Meeting 1",
            attendee_password="9#R1kuUl3R",
            moderator_password="0$C7Aaz0o",
        )
        mock_end_request.return_value = {
            "message": "A request to end the meeting was sent.",
            "messageKey": "sentEndMeetingRequest",
            "returncode": "SUCCESS",
        }

        jwt_token = AccessToken()
        jwt_token.payload["resource_id"] = str(meeting.id)
        jwt_token.payload["roles"] = [random.choice(["instructor", "administrator"])]
        jwt_token.payload["permissions"] = {"can_update": True}

        response = self.client.patch(
            f"/api/meetings/{meeting.id}/end/",
            HTTP_AUTHORIZATION=f"Bearer {jwt_token}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(
            {
                "returncode": "SUCCESS",
                "message": "A request to end the meeting was sent.",
                "messageKey": "sentEndMeetingRequest",
            },
            response.data,
        )