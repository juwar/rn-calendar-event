import React, {useEffect, useState} from 'react';
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

import {log} from './log';

const dateNow = new Date();
const listTimeEvent = [
  {
    date: dateNow.setHours(9, 0, 0, 0),
  },
  {
    date: dateNow.setHours(10, 0, 0, 0),
  },
  {
    date: dateNow.setHours(11, 0, 0, 0),
  },
  {
    date: dateNow.setHours(12, 0, 0, 0),
  },
  {
    date: dateNow.setHours(13, 0, 0, 0),
  },
  {
    date: dateNow.setHours(14, 0, 0, 0),
  },
  {
    date: dateNow.setHours(15, 0, 0, 0),
  },
  {
    date: dateNow.setHours(16, 0, 0, 0),
  },
  {
    date: dateNow.setHours(17, 0, 0, 0),
  },
  {
    date: dateNow.setHours(18, 0, 0, 0),
  },
  {
    date: dateNow.setHours(19, 0, 0, 0),
  },
  {
    date: dateNow.setHours(20, 0, 0, 0),
  },
  {
    date: dateNow.setHours(21, 0, 0, 0),
  },
  {
    date: dateNow.setHours(22, 0, 0, 0),
  },
];

const onListCalendar = async (result = false) => {
  let calendars = [];
  if (await cekPermissionCalendar()) {
    await RNCalendarEvents.findCalendars().then(res => {
      return (calendars = res);
    });
  }
  log('Total List => ', calendars.length);
  log('Calendars => ', calendars);
  if (result) {
    return calendars;
  }
};

const onListEvent = async date => {
  let events = [];
  // const startDate = '2021-01-15T00:00:00.000Z';
  // const endDate = '2021-03-17T23:59:59.000Z';
  const startDate = date.startDate;
  const endDate = date.endDate;
  const calendars = [];
  const calendarsId = await haveCalendar();
  if (calendarsId) {
    calendars.push(calendarsId);
  }
  if ((await cekPermissionCalendar()) && calendarsId) {
    await RNCalendarEvents.fetchAllEvents(startDate, endDate, calendars).then(
      res => {
        return (events = res);
      },
    );
  }
  log('Total List', events.length);
  log('Events', events);
  return events;
};

const haveCalendar = async () => {
  const data = await onListCalendar(true);
  let calendarId = data
    .filter(x => x.title === 'Create Obat Kalbe')
    .map(x => x.id)
    .toString();

  if (!calendarId) {
    log('Error');
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
      log('Calendar Created', res);
      calendarId = res;
      return res;
    });
  }
  return calendarId;
};

const onAddEvent = async () => {
  let calendarId = await haveCalendar();

  const createEvent = async date => {
    const title = `Test ${date.toDateString()}`;
    const note = `Note ${date.toString()}`;
    await RNCalendarEvents.saveEvent(title, {
      calendarId: calendarId,
      // startDate: '2021-03-16T05:00:00.000Z',
      // endDate: '2021-03-16T05:05:00.000Z',

      startDate: date.toISOString(),
      endDate: date.toISOString(),
      recurrenceRule: {
        frequency: 'daily',
        occurrence: 0,
        interval: 0,
        endDate: '2021-03-20T06:59:00.000Z',
      },
      notes: note,
      alarms: [
        {
          date: 0,
        },
      ],
    }).then(res => {
      log('Event Created', res);
      return res;
    });
  };
  if ((await cekPermissionCalendar()) && calendarId) {
    listTimeEvent.map(item => {
      createEvent(new Date(item.date));
    });
  }
};

const cekPermissionCalendar = async () => {
  let permissions;
  try {
    permissions = await RNCalendarEvents.checkPermissions().then(res => res);
    if (permissions !== 'authorized') {
      log('Not Authorized');
      permissions = await RNCalendarEvents.requestPermissions().then(
        res => res,
      );
    }

    if (permissions !== 'authorized') {
      throw 'Access calendar not authorized';
    }
    // log("permission => ", permissions);
  } catch {}

  log('Permission', permissions);
  return permissions;
};

const onDeleteEvent = async () => {
  const date = {
    startDate: '2021-01-01T05:00:00.000Z',
    endDate: '2021-12-31T05:00:00.000Z',
  };
  const listEvent = await onListEvent(date);
  listEvent.map(async item => {
    await RNCalendarEvents.removeEvent(item.id, {futureEvents: true}).then(
      res => {
        log('Event Removed', res);
      },
    );
  });
  await onListEvent(date);
};

const Calendar = () => {
  const [listEvent, setListEvent] = useState([]);
  const [onUpdate, setOnUpdate] = useState(false);

  const updateListEvent = async (filter = false) => {
    const date = {
      startDate: '2021-01-01T05:00:00.000Z',
      endDate: '2021-12-31T05:00:00.000Z',
    };

    const now = new Date();
    const newListEvent = await onListEvent(date)

    if (filter) {
      setListEvent(
        newListEvent.filter(
          item =>
            new Date(item.startDate).getDate() == now.getDate() &&
            new Date(item.startDate).getHours() > now.getHours(),
        ),
      );
    } else {
      setListEvent(newListEvent);
    }
  };

  const listEventToday = () => {
    const now = new Date();
    setListEvent(
      listEvent.filter(
        item =>
          new Date(item.startDate).getDate() == now.getDate() &&
          new Date(item.startDate).getHours() > now.getHours(),
      ),
    );
  };

  useEffect(async () => {
    await updateListEvent(true);
    // await listEventToday();
  }, []);

  useEffect(async () => {
    setOnUpdate[!onUpdate];
  }, [onUpdate]);

  return (
    <>
      <View style={styles.button}>
        <Button
          color="#ffffff"
          title="List Event Today"
          onPress={async () => {
            await updateListEvent(true), setOnUpdate(!onUpdate);
          }}
        />
      </View>
      <View style={styles.button}>
        <Button
          color="#ffffff"
          title="List All Event"
          onPress={async () => {
            await updateListEvent(), setOnUpdate(!onUpdate);
          }}
        />
      </View>
      <View style={styles.button}>
        <Button
          color="#ffffff"
          title="Add Event"
          onPress={async () => {
            await onAddEvent(), await updateListEvent(), setOnUpdate(!onUpdate);
          }}
        />
      </View>
      <View style={styles.button}>
        <Button
          color="#ffffff"
          title="Delete All Event"
          onPress={async () => {
            await onDeleteEvent(),
              await updateListEvent(),
              setOnUpdate(!onUpdate);
          }}
        />
      </View>
      {listEvent.length > 1 ? (
        <View>
          <SafeAreaView style={styles.container}>
            {listEvent.length > 1
              ? listEvent.map((data, index) => (
                  <View style={styles.item} key={`i${index}`}>
                    <Text style={styles.title} key={`t${index}`}>
                      Title : {data.title}
                    </Text>
                    <Text style={styles.title} key={`d${index}`}>
                      {new Date(data.startDate).toString()}
                    </Text>
                  </View>
                ))
              : null}
          </SafeAreaView>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#5345FE',
    marginTop: 20,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  item: {
    backgroundColor: '#ffffff',
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  title: {
    fontSize: 15,
    color: '#766AFF',
  },
  button: {
    color: '#ffffff',
    backgroundColor: '#00C2B6',
    marginVertical: 5,
    marginHorizontal: 5,
    borderRadius: 10,
  },
});

export default Calendar;
