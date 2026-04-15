import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';

export default function ToolPlaceholderScreen({ title, emoji, description, renderTopBar, renderLicenseBanner, styles }) {
  return (
    <SafeAreaView style={styles.safe}>
      {renderTopBar(title)}
      {renderLicenseBanner()}
      <View style={styles.placeholderWrap}>
        <Text style={styles.placeholderEmoji}>{emoji}</Text>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderText}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}
