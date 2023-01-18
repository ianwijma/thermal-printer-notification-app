import React from 'react';
import { View, Button } from 'react-native';

export default function ServerList({ servers, setServer }) {
  return (
    <View>
      {servers.map((server) => <Button key={server} title={server} onPress={() => setServer(server)} />)}
    </View>
  )
}
