import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
} from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';

import {standarLog} from './log';

const onListCalendar = async (result = false) => {
  let calendars = [];
  if (await cekPermissionCalendar()) {
    await RNCalendarEvents.findCalendars().then(res => {
      return (calendars = res);
    });
  }
  standarLog('Total List => ', calendars.length);
  standarLog('Calendars => ', calendars);
  if (result) {
    return calendars;
  }
};

const onListEvent = async () => {
  let events = [];
  const startDate = '2021-03-15T00:00:00.000Z';
  const endDate = '2021-03-17T23:59:59.000Z';
  const calendars = [];
  if (await cekPermissionCalendar()) {
    await RNCalendarEvents.fetchAllEvents(startDate, endDate, calendars).then(
      res => {
        return (events = res);
      },
    );
  }
  standarLog('Total List', events.length);
  standarLog('Events', events);
};

const haveCalendar = async () => {
  standarLog('Masuk haveCalendar');
  const data = await onListCalendar(true);
  // return data.map(x => (x.title)).includes("Create Obat Kalbe")
  return data
    .filter(x => x.title === 'Create Obat Kalbe')
    .map(x => x.id)
    .toString();
};

const onAddEvent = async () => {
  const date = new Date();
  let calendarId = await haveCalendar();
  if (!calendarId) {
    standarLog('Masuk Create Calendar');
    const calendarName = 'Create Obat Kalbe';
    const calendar = {
      title: calendarName,
      entityType: 'event',
      name: calendarName,
      accessLevel: 'owner',
      color: '#FF0000',
      source: {name: calendarName, type: calendarName},
      isPrimary: false,
      allowsModifications: false,
    };
    await RNCalendarEvents.saveCalendar(calendar).then(res => {
      standarLog('Calendar Created', res);
      calendarId = res;
      return res;
    });
    standarLog('Keluar Create Calendar');
  }
  if ((await cekPermissionCalendar()) && calendarId) {
    const title = `Test ${date.toDateString()}`;
    const note = `Note ${date.toString()}`;
    await RNCalendarEvents.saveEvent(title, {
      calendarId: calendarId,
      startDate: '2021-03-16T10:30:37.000Z',
      endDate: '2021-03-17T06:59:00.000Z',
      location: 'Los Angeles, CA',
      notes: note,
      alarms: [
        {
          date: 0,
        },
        // {
        //     date: '2021-03-16T09:58:37.164Z',
        // },
        // {
        //     date: '2021-03-16T09:59:37.164Z',
        // }
      ],
    }).then(res => {
      standarLog('Event Created', res);
      return res;
    });
  }
};

const cekPermissionCalendar = async () => {
  let permissions;
  try {
    permissions = await RNCalendarEvents.checkPermissions().then(res => res);
    if (permissions !== 'authorized') {
      standarLog('Not Authorized');
      permissions = await RNCalendarEvents.requestPermissions().then(
        res => res,
      );
    }

    if (permissions !== 'authorized') {
      throw 'Access calendar not authorized';
    }
    // standarLog("permission => ", permissions);
  } catch {}

  standarLog('Permission', permissions);
  return permissions;
};

const Calendar = () => {
  return (
    <>
      <Button title="List Calendar" onPress={() => onListCalendar()} />
      <Button title="List Event" onPress={() => onListEvent()} />
      <Button title="Add Event" onPress={() => onAddEvent()} />
      <Button title="Cek Calendar" onPress={() => haveCalendar()} />
    </>
  );
};

export default Calendar;
