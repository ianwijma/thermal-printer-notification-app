import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import ServerList from './serverList';
import ValidateServer from './validateServer';
import { detectServers } from "./utils/network";

export default function Setup() {
  const [servers, setServers] = useState(null);
  const [server, setServer] = useState(null);

  let CurrentView = () => <ActivityIndicator size="large" color="black" />;
  if (server) {
    CurrentView = () => <ValidateServer server={server} />;
  } else if (servers) {
    CurrentView = () => <ServerList servers={servers} setServer={setServer} />;
  }

  useEffect(() => {
    setServers(null);
    setServer(null);
    const call = async () => {
      const dankServers = await detectServers();
      setServers(dankServers);
    }
    call();
  }, []);

  return (
    <View style={[styles.container, styles.horizontal]}>
      <CurrentView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'column',
  },
});
