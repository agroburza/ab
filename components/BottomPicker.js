import React from 'react';
import { Modal, View, Pressable, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function BottomPicker({
  visible,
  title,
  items,
  type,
  selectedValue,
  selectedValues,
  onClose,
  onSelect,
  onDone,
  styles,
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.bottomSheetOverlay}>
        <Pressable style={styles.bottomSheetBackdrop} onPress={onClose} />

        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />

          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>{title}</Text>

            <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.bottomSheetClose}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.bottomSheetList}>
            {items.map((option) => {
              const isSelected =
                type === 'activities'
                  ? selectedValues.includes(option.value)
                  : String(option.value ?? '') === String(selectedValue ?? '');

              return (
                <TouchableOpacity
                  key={`${type}-${option.value}-${option.label}`}
                  style={[styles.bottomSheetItem, isSelected && styles.bottomSheetItemSelected]}
                  onPress={() => onSelect(option)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.bottomSheetItemEmoji}>{option.emoji || '•'}</Text>
                  <Text
                    style={[styles.bottomSheetItemText, isSelected && styles.bottomSheetItemTextSelected]}
                  >
                    {option.label}
                  </Text>
                  {isSelected ? <Text style={styles.bottomSheetCheck}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {type === 'activities' ? (
            <TouchableOpacity style={styles.bottomSheetDoneButton} onPress={onDone} activeOpacity={0.9}>
              <Text style={styles.bottomSheetDoneButtonText}>Gotovo</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
