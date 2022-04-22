import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen } from '@testing-library/react';

import {
  participantMockFactory,
  videoMockFactory,
} from 'utils/tests/factories';
import { wrapInIntlProvider } from 'utils/tests/intl';
import { useParticipantsStore } from 'data/stores/useParticipantsStore/index';
import { converse } from 'utils/window';

import { ViewersList } from '.';

jest.mock('utils/window', () => ({
  converse: {
    acceptParticipantToJoin: jest.fn(),
    askParticipantToJoin: jest.fn(),
    kickParticipant: jest.fn(),
    rejectParticipantToJoin: jest.fn(),
  },
}));

const mockedParticipantOnDemands1 = participantMockFactory();
const mockedParticipantOnDemands2 = participantMockFactory();

const mockedParticipantOnStage1 = participantMockFactory();
const mockedParticipantOnStage2 = participantMockFactory();

const mockedParticipantOnStage1Full = {
  ...mockedParticipantOnStage1,
  isInstructor: false,
  isOnStage: true,
};

const mockedParticipantOnStage2Full = {
  ...mockedParticipantOnStage2,
  isInstructor: false,
  isOnStage: true,
};

const participant1 = {
  id: 'example.jid.student1@prosody.org',
  isInstructor: true,
  isOnStage: false,
  name: 'Student 1',
};

const participant2 = {
  id: 'example.jid.student2@prosody.org',
  isInstructor: false,
  isOnStage: false,
  name: 'Student 2',
};

const participant3 = {
  id: 'example.jid.student3@prosody.org',
  isInstructor: false,
  isOnStage: false,
  name: 'Student 3',
};

describe('<ViewersList /> when user is an instructor', () => {
  beforeEach(() => jest.resetAllMocks());

  it('displays severals participants, not on stage and not asking, and then remove some of them', () => {
    const video = videoMockFactory();

    render(
      wrapInIntlProvider(<ViewersList isInstructor={true} video={video} />),
    );

    expect(screen.queryByText('Demands')).not.toBeInTheDocument();
    screen.getByText('On stage');
    screen.getByText(
      'Oops, nobody is on stage. Wait for your teacher to ask joining the stage.',
    );
    screen.getByText('Other participants');
    screen.getByText('No viewers are currently connected to your stream.');

    act(() => useParticipantsStore.getState().addParticipant(participant1));
    act(() => useParticipantsStore.getState().addParticipant(participant2));
    act(() => useParticipantsStore.getState().addParticipant(participant3));

    screen.getByText('Student 1');
    screen.getByText('Student 2');
    screen.getByText('Student 3');

    act(() => useParticipantsStore.getState().removeParticipant('Student 2'));

    expect(screen.queryByText('Student 2')).not.toBeInTheDocument();
  });

  it('displays severals participants, some on stage, and some asking, and some not on stage and not asking', () => {
    const video = videoMockFactory({
      participants_asking_to_join: [
        mockedParticipantOnDemands1,
        mockedParticipantOnDemands2,
      ],
      participants_in_discussion: [
        mockedParticipantOnStage1,
        mockedParticipantOnStage2,
      ],
    });

    useParticipantsStore.setState({
      participants: [
        participant1,
        participant2,
        mockedParticipantOnStage1Full,
        mockedParticipantOnStage2Full,
      ],
    });

    render(
      wrapInIntlProvider(<ViewersList isInstructor={true} video={video} />),
    );

    screen.getByText('Demands');
    screen.getByText('On stage');
    screen.getByText('Other participants');

    screen.getByText('Student 1');
    screen.getByText('Student 2');
    screen.getByText(mockedParticipantOnDemands1.name);
    screen.getByText(mockedParticipantOnDemands2.name);
    screen.getByText(mockedParticipantOnStage1Full.name);
    screen.getByText(mockedParticipantOnStage2Full.name);
  });

  it('displays a demanding participant and accepts it', () => {
    const video = videoMockFactory({
      participants_asking_to_join: [mockedParticipantOnDemands1],
    });

    render(
      wrapInIntlProvider(<ViewersList isInstructor={true} video={video} />),
    );

    screen.getByText('Demands');
    screen.getByText('On stage');
    screen.getByText(
      'Oops, nobody is on stage. Wait for your teacher to ask joining the stage.',
    );
    screen.getByText('Other participants');
    screen.getByText('No viewers are currently connected to your stream.');
    screen.getByText(mockedParticipantOnDemands1.name);

    const acceptButton = screen.getByRole('button', { name: 'Accept' });
    act(() => userEvent.click(acceptButton));
    expect(converse.acceptParticipantToJoin).toHaveBeenCalledTimes(1);
  });

  it('displays a demanding participant and rejects it', () => {
    const video = videoMockFactory({
      participants_asking_to_join: [mockedParticipantOnDemands1],
    });

    render(
      wrapInIntlProvider(<ViewersList isInstructor={true} video={video} />),
    );

    screen.getByText('Demands');
    screen.getByText('On stage');
    screen.getByText(
      'Oops, nobody is on stage. Wait for your teacher to ask joining the stage.',
    );
    screen.getByText('Other participants');
    screen.getByText('No viewers are currently connected to your stream.');
    screen.getByText(mockedParticipantOnDemands1.name);

    const rejectButton = screen.getAllByRole('button')[0];
    act(() => userEvent.click(rejectButton));
    expect(converse.rejectParticipantToJoin).toHaveBeenCalledTimes(1);
  });

  it('displays an on-stage participant and kicks it', () => {
    const video = videoMockFactory({
      participants_in_discussion: [mockedParticipantOnStage1],
    });

    useParticipantsStore.setState({
      participants: [mockedParticipantOnStage1Full],
    });

    render(
      wrapInIntlProvider(<ViewersList isInstructor={true} video={video} />),
    );

    expect(screen.queryByText('Demands')).not.toBeInTheDocument();
    screen.getByText('On stage');
    screen.getByText('Other participants');
    screen.getByText('No viewers are currently connected to your stream.');
    screen.getByText(mockedParticipantOnStage1Full.name);

    const terminateButton = screen.getByRole('button', { name: 'Terminate' });
    act(() => userEvent.click(terminateButton));
    expect(converse.kickParticipant).toHaveBeenCalledTimes(1);
  });
});

describe('<ViewersList /> when user is a student', () => {
  it('adds and removes several users from the list.', () => {
    const video = videoMockFactory();
    const { rerender } = render(
      wrapInIntlProvider(<ViewersList isInstructor={false} video={video} />),
    );

    expect(screen.queryByText('Demands')).not.toBeInTheDocument();
    screen.getByText('On stage');
    screen.getByText(
      'Oops, nobody is on stage. Wait for your teacher to ask joining the stage.',
    );
    screen.getByText('Other participants');
    screen.getByText('No viewers are currently connected to your stream.');

    act(() =>
      useParticipantsStore.getState().addParticipant({
        id: 'example.jid.instructor@prosody.org',
        isInstructor: true,
        isOnStage: true,
        name: 'Instructor',
      }),
    );
    screen.getByText('Instructor');

    act(() =>
      useParticipantsStore.getState().addParticipant({
        id: 'example.jid.student1@prosody.org',
        isInstructor: false,
        isOnStage: false,
        name: 'Student 1',
      }),
    );
    screen.getByText('Student 1');

    act(() =>
      useParticipantsStore.getState().addParticipant({
        id: 'example.jid.student2@prosody.org',
        isInstructor: false,
        isOnStage: false,
        name: 'Student 2',
      }),
    );
    screen.getByText('Student 2');

    expect(screen.queryByText('Demands')).toEqual(null);

    act(() => useParticipantsStore.getState().removeParticipant('Student 2'));
    expect(screen.queryByText('Student 2')).not.toBeInTheDocument();

    act(() =>
      useParticipantsStore.getState().addParticipant({
        id: 'example.jid.student2@prosody.org',
        isInstructor: false,
        isOnStage: false,
        name: 'Student 2',
      }),
    );
    rerender(
      wrapInIntlProvider(<ViewersList isInstructor={false} video={video} />),
    );
    screen.getByText('Student 2');
  });
});