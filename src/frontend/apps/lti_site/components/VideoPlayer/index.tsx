import { Box } from 'grommet';
import { Maybe, Nullable } from 'lib-common';
import React, { useRef, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Redirect } from 'react-router';

import {
  FULL_SCREEN_ERROR_ROUTE,
  useThumbnail,
  TimedText,
  timedTextMode,
  Video,
  videoSize,
} from 'lib-components';
import { useVideoProgress } from 'data/stores/useVideoProgress';
import { createPlayer } from 'Player/createPlayer';
import { VideoPlayerInterface } from 'types/VideoPlayer';
import { useFetchTimedTextTrackLanguageChoices } from 'data/queries';

interface BaseVideoPlayerProps {
  video: Nullable<Video>;
  playerType: string;
  timedTextTracks: TimedText[];
  defaultVolume?: number;
}

const VideoPlayer = ({
  video,
  playerType,
  timedTextTracks,
  defaultVolume,
}: BaseVideoPlayerProps) => {
  const intl = useIntl();
  const videoNodeRef = useRef<Nullable<HTMLVideoElement>>(null);

  const { data } = useFetchTimedTextTrackLanguageChoices();
  const choices = useMemo(
    () =>
      data?.actions.POST.language.choices?.map((choice) => ({
        label: choice.display_name,
        value: choice.value,
      })),
    [data?.actions.POST.language.choices],
  );
  const thumbnail = useThumbnail((state) => state.getThumbnail());

  const setPlayerCurrentTime = useVideoProgress(
    (state) => state.setPlayerCurrentTime,
  );

  const languages: { [key: string]: string } =
    (choices &&
      choices.reduce(
        (acc, current) => ({
          ...acc,
          [current.value]: current.label,
        }),
        {},
      )) ||
    {};

  const playerRef = useRef<Maybe<VideoPlayerInterface>>(undefined);
  /**
   * Initialize the video player.
   * Noop out if the video is missing, render will redirect to an error page.
   */
  useEffect(() => {
    if (video) {
      // Instantiate the player and keep the instance in state
      playerRef.current = createPlayer(
        playerType,
        videoNodeRef.current!,
        setPlayerCurrentTime,
        video,
        intl.locale,
        (videoPlayer) => {
          if (defaultVolume !== undefined) {
            videoPlayer.volume(Math.min(1, Math.max(0, defaultVolume)));
          }
          timedTextTracks
            .filter((track) => track.is_ready_to_show)
            .filter((track) =>
              [
                timedTextMode.CLOSED_CAPTIONING,
                timedTextMode.SUBTITLE,
              ].includes(track.mode),
            )
            .forEach((track) => {
              if (playerRef.current) {
                playerRef.current.addTrack(track, languages);
              }
            });
        },
      );

      /** Make sure to destroy the player on unmount. */
      return () => playerRef.current && playerRef.current.destroy();
    }
  }, []);

  useEffect(() => {
    if (video?.urls?.manifests && playerRef.current) {
      playerRef.current.setSource(video.urls.manifests.hls);
    }
  }, [video?.urls?.manifests.hls]);

  const oldTimedTextTracks = useRef(timedTextTracks);
  useEffect(() => {
    if (!playerRef.current) {
      return;
    }
    const playerApi = playerRef.current;

    // tracks to add
    timedTextTracks
      .filter(
        (track) =>
          !oldTimedTextTracks.current.includes(track) &&
          track.is_ready_to_show &&
          [timedTextMode.CLOSED_CAPTIONING, timedTextMode.SUBTITLE].includes(
            track.mode,
          ),
      )
      .forEach((track) => playerApi.addTrack(track, languages));
    // tracks to remove
    oldTimedTextTracks.current
      .filter(
        (track) =>
          !timedTextTracks.includes(track) &&
          track.is_ready_to_show &&
          [timedTextMode.CLOSED_CAPTIONING, timedTextMode.SUBTITLE].includes(
            track.mode,
          ),
      )
      .forEach((track) => playerApi.removeTrack(track));

    oldTimedTextTracks.current = timedTextTracks;
  }, [timedTextTracks]);

  // The video is somehow missing and jwt must be set
  if (!video) {
    return <Redirect push to={FULL_SCREEN_ERROR_ROUTE('notFound')} />;
  }

  const thumbnailUrls =
    (thumbnail && thumbnail.is_ready_to_show && thumbnail.urls) ||
    video.urls!.thumbnails;
  const resolutions = Object.keys(video.urls!.mp4).map(
    (size) => Number(size) as videoSize,
  );

  // order resolutions from the higher to the lower
  resolutions.sort((a, b) => b - a);

  return (
    <Box>
      <video
        ref={videoNodeRef}
        crossOrigin="anonymous"
        poster={thumbnailUrls[resolutions[0]]}
        /* tabIndex is set to -1 to not take focus on this element when a user is navigating using
       their keyboard. */
        tabIndex={-1}
        playsInline
      >
        {resolutions.map((size, index) => (
          <source
            key={`url_${index}`}
            size={`${size}`}
            src={video.urls!.mp4[size]}
            type="video/mp4"
          />
        ))}
      </video>
    </Box>
  );
};

export default VideoPlayer;
