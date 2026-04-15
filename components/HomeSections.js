import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';

export function QuickActionsSection({ actions, onActionPress, styles }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Brze akcije</Text>
      <View style={styles.quickActionsRow}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={styles.quickActionCard}
            onPress={() => onActionPress(action)}
            activeOpacity={0.85}
          >
            <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
            <Text style={styles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function ContinueSection({ lastOpenedModule, onOpenLast, styles }) {
  if (!lastOpenedModule) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nastavi gdje si stao</Text>
      <TouchableOpacity style={styles.continueCard} onPress={onOpenLast} activeOpacity={0.9}>
        <View>
          <Text style={styles.continueEyebrow}>Zadnje otvoreno</Text>
          <Text style={styles.continueTitle}>{lastOpenedModule.title}</Text>
          <Text style={styles.continueSubtitle}>Otvori ponovno jednim dodirom</Text>
        </View>
        <Text style={styles.continueEmoji}>{lastOpenedModule.emoji || '↗️'}</Text>
      </TouchableOpacity>
    </View>
  );
}

export function FavoritesSection({ favoriteModules, onOpenModule, styles }) {
  if (!favoriteModules.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Favoriti</Text>
      <View style={styles.favoritesRow}>
        {favoriteModules.map((module) => (
          <TouchableOpacity
            key={module.key}
            style={styles.favoriteChip}
            onPress={() => onOpenModule(module)}
            activeOpacity={0.85}
          >
            <Text style={styles.favoriteChipEmoji}>{module.emoji}</Text>
            <Text style={styles.favoriteChipText}>{module.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function ModulesGridSection({ modules, favoriteKeys, onOpenModule, onToggleFavorite, styles }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Svi moduli</Text>
      <View style={styles.grid}>
        {modules.map((module) => {
          const isFavorite = favoriteKeys.includes(module.key);
          return (
            <TouchableOpacity
              key={module.key}
              style={styles.cardWrap}
              onPress={() => onOpenModule(module)}
              activeOpacity={0.9}
            >
              <ImageBackground source={module.image} style={styles.card} imageStyle={styles.cardImage}>
                <View style={styles.overlay}>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      onToggleFavorite(module.key);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.favoriteButtonText}>{isFavorite ? '★' : '☆'}</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}