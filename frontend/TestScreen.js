import React, { useState } from 'react';
import { View } from 'react-native';
import InputField from './components/InputField'; // adjust path

export default function TestScreen() {
  const [text, setText] = useState('');

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <InputField
        value={text}
        onChangeText={setText}
        placeholder="Test"
      />
    </View>
  );
}