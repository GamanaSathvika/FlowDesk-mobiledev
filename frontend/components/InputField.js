import React, { forwardRef, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

const InputField = forwardRef((props, ref) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createInputStyles(theme), [theme]);
  const {
    icon,
    label,
    placeholder,
    value,
    onChangeText,
    secure = false,
    keyboardType = 'default',
    textContentType,
    autoComplete,
    returnKeyType = 'next',
    blurOnSubmit = false,
    autoCapitalize = 'none',
    onSubmitEditing,
    ...rest
  } = props;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        {icon && (
          <Ionicons name={icon} size={20} color={theme.textSecondary} style={styles.icon} />
        )}
        <TextInput
          ref={ref}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          textContentType={textContentType}
          autoComplete={autoComplete}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
          {...rest}
        />
      </View>
    </View>
  );
});

export default InputField;

function createInputStyles(t) {
  return StyleSheet.create({
    container: { marginBottom: 16 },
    label: { color: t.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginLeft: 4 },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.inputBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      paddingHorizontal: 16,
      minHeight: 56,
    },
    icon: { marginRight: 12 },
    input: { flex: 1, color: t.textPrimary, fontSize: 16, paddingVertical: 12 },
  });
}
