import { fireEvent, screen } from '@testing-library/react';
import { render } from 'lib-tests';
import { DateTime, Duration, Settings } from 'luxon';
import React from 'react';

import { SchedulingFields } from './index';

Settings.defaultLocale = 'en';
Settings.defaultZone = 'Europe/Paris';

describe('<SchedulingFields />', () => {
  it('triggers callbacks when updating fields', () => {
    const onStartingAtChange = jest.fn();
    const onEstimatedDurationChange = jest.fn();

    render(
      <SchedulingFields
        startingAt={null}
        estimatedDuration={null}
        onStartingAtChange={onStartingAtChange}
        onEstimatedDurationChange={onEstimatedDurationChange}
      />,
    );

    const startingAt = DateTime.local()
      .plus({ days: 1 })
      .set({ second: 0, millisecond: 0 });
    const inputStartingAtDate = screen.getByLabelText(/starting date/i);
    fireEvent.change(inputStartingAtDate, {
      target: { value: startingAt.toFormat('yyyy/MM/dd') },
    });

    const inputStartingAtTime = screen.getByLabelText(/starting time/i);
    fireEvent.change(inputStartingAtTime, {
      target: { value: startingAt.toLocaleString(DateTime.TIME_24_SIMPLE) },
    });
    expect(onStartingAtChange).toHaveBeenCalledWith(startingAt.toISO());

    const estimatedDuration = Duration.fromObject({ minutes: 30 });
    const inputEstimatedDuration = screen.getByLabelText(/estimated duration/i);
    fireEvent.change(inputEstimatedDuration, {
      target: { value: estimatedDuration.toFormat('h:mm') },
    });

    screen.getByDisplayValue(estimatedDuration.toFormat('h:mm'));
    expect(onEstimatedDurationChange).toHaveBeenCalledWith(
      estimatedDuration.toFormat('hh:mm:ss'),
    );
  });

  it('formats starting date and time', () => {
    const startingAt = DateTime.local(2022, 1, 27, 14, 22, 15);

    render(
      <SchedulingFields
        startingAt={startingAt.toISO()}
        estimatedDuration={null}
      />,
    );

    screen.getByDisplayValue(startingAt.toFormat('yyyy/MM/dd'));
    screen.getByDisplayValue(
      startingAt.toLocaleString(DateTime.TIME_24_SIMPLE),
    );
  });

  it('formats estimated duration', () => {
    const estimatedDuration = Duration.fromObject({ minutes: 30 });

    render(
      <SchedulingFields
        startingAt={null}
        estimatedDuration={estimatedDuration.toFormat('hh:mm:ss')}
      />,
    );

    screen.getByDisplayValue(estimatedDuration.toFormat('h:mm'));
  });

  it('clears inputs', () => {
    const startingAt = DateTime.local(2022, 1, 27, 14, 22);
    const estimatedDuration = Duration.fromObject({ minutes: 30 });
    const onStartingAtChange = jest.fn();
    const onEstimatedDurationChange = jest.fn();

    render(
      <SchedulingFields
        startingAt={startingAt.toISO()}
        estimatedDuration={estimatedDuration.toFormat('hh:mm:ss')}
        onStartingAtChange={onStartingAtChange}
        onEstimatedDurationChange={onEstimatedDurationChange}
      />,
    );

    const inputStartingAtDate = screen.getByLabelText(/starting date/i);
    fireEvent.change(inputStartingAtDate, { target: { value: null } });
    expect(onStartingAtChange).toHaveBeenCalledWith(null);

    const inputStartingAtTime = screen.getByLabelText(/starting time/i);
    fireEvent.change(inputStartingAtTime, { target: { value: null } });
    expect(onStartingAtChange).toHaveBeenCalledWith(null);

    const inputEstimatedDuration = screen.getByLabelText(/estimated duration/i);
    fireEvent.change(inputEstimatedDuration, { target: { value: null } });
    expect(onEstimatedDurationChange).toHaveBeenCalledWith(null);
  });

  it('shows error when setting a past start date', () => {
    const onStartingAtChange = jest.fn();
    const onEstimatedDurationChange = jest.fn();

    render(
      <SchedulingFields
        startingAt={null}
        estimatedDuration={null}
        onStartingAtChange={onStartingAtChange}
        onEstimatedDurationChange={onEstimatedDurationChange}
      />,
    );

    const startingAtPast = DateTime.local().minus({ days: 1 });
    const inputStartingAtDate = screen.getByLabelText(/starting date/i);
    fireEvent.change(inputStartingAtDate, {
      target: { value: startingAtPast.toFormat('yyyy/MM/dd') },
    });

    const inputStartingAtTime = screen.getByLabelText(/starting time/i);
    fireEvent.change(inputStartingAtTime, {
      target: { value: startingAtPast.toLocaleString(DateTime.TIME_24_SIMPLE) },
    });
    expect(onStartingAtChange).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        `${startingAtPast.toLocaleString(
          DateTime.DATETIME_MED,
        )} is not valid: Starting date and time should be set in the future.`,
      ),
    ).toBeInTheDocument();

    const startingAtFuture = DateTime.local().plus({ days: 1 });
    fireEvent.change(inputStartingAtDate, {
      target: { value: startingAtFuture.toFormat('yyyy/MM/dd') },
    });
    expect(
      screen.queryByText(
        `${startingAtPast.toLocaleString(
          DateTime.DATETIME_MED,
        )} is not valid: Starting date and time should be set in the future.`,
      ),
    ).not.toBeInTheDocument();
  });
});