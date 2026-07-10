import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { RatingInput } from './RatingInput';
import Colors from '@/constants/Colors';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (rating: number, review: string | null) => void;
  initialRating?: number;
  initialReview?: string | null;
  title: string;
}

export function ReviewModal({
  visible,
  onClose,
  onSave,
  initialRating = 0,
  initialReview = null,
  title,
}: ReviewModalProps) {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const [rating, setRating] = useState(initialRating);
  const [review, setReview] = useState(initialReview ?? '');

  const handleSave = () => {
    if (rating === 0) return;
    onSave(rating, review.trim() || null);
    setRating(0);
    setReview('');
  };

  const handleClose = () => {
    setRating(initialRating);
    setReview(initialReview ?? '');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.cardBorder }]} />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          <RatingInput value={rating} onChange={setRating} />

          <View style={styles.reviewSection}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Review (optional)</Text>
            <TextInput
              style={[styles.reviewInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.cardBorder }]}
              placeholder="What did you think?"
              placeholderTextColor="#666"
              multiline
              value={review}
              onChangeText={setReview}
              maxLength={300}
            />
            <Text style={styles.charCount}>{review.length}/300</Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={[styles.cancelBtn, { backgroundColor: colors.cardBorder }]} onPress={handleClose}>
              <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, { backgroundColor: colors.tint }, rating === 0 && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={rating === 0}
            >
              <Text style={styles.saveText}>Save Rating</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  reviewSection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewInput: {
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  charCount: {
    fontSize: 11,
    color: '#666',
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontWeight: '600',
    fontSize: 15,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
