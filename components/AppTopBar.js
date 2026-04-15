import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function AppTopBar({
  title = 'ab.hr',
  menuVisible,
  setMenuVisible,
  menuItems,
  onMenuPress,
  isLoggedIn,
  onLogout,
  styles,
}) {
  const renderInlineMenu = () => (
    <View style={styles.inlineMenu}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.inlineMenuItem}
          onPress={() => onMenuPress(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.inlineMenuText}>{item.title}</Text>
        </TouchableOpacity>
      ))}

      {isLoggedIn ? (
        <TouchableOpacity
          style={styles.inlineMenuItem}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.inlineMenuText}>🚪</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  return (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={() => setMenuVisible((v) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.hamburgerText}>🚜</Text>
      </TouchableOpacity>

      <Text style={styles.topBarTitle} numberOfLines={1}>
        {title}
      </Text>

      {menuVisible ? renderInlineMenu() : <View style={styles.topBarSpacer} />}
    </View>
  );
}
