import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, Button } from 'react-native';
import { requestServerToGenerateCode, validateCode, validateToken } from './utils/network';

export default function ValidateServer({ server }) {
  const [requested, setRequested] = useState(false);
  const [validated, setValidated] = useState(false);
  const [token, setToken] = useState();

  useEffect(() => {
    (async () => {
      await requestServerToGenerateCode(server);

      setRequested(true);
    })()
  }, []);

  const validateText = async (text) => {
    const codeToken = await validateCode(server, text);
    setToken(codeToken);
  }

  const tokenValidate = async () => {
    setValidated(await validateToken(server, token));
  }

  const ValidateButton = () => {
    return token ? <Button title='validate' onPress={() => tokenValidate()} /> : null;
  }

  return (
    <View>
      <Text>Connection to {server}</Text>
      {requested ? <TextInput onChangeText={text => validateText(text)} /> : <ActivityIndicator size='large' color='black' />}
      <Text>{token}</Text>
      {validated ? (<Text>Done!</Text>) : <ValidateButton />}
    </View>
  )
}
