import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useRatingsStore } from '@/src/store/ratings';
import { importLetterboxdCsv, type ImportProgress, type ImportResult } from '@/src/utils/importLetterboxd';
import Colors from '@/constants/Colors';

type Step = 'idle' | 'picking' | 'matching' | 'preview' | 'importing' | 'done';

export default function ImportScreen() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const navigation = useNavigation();
  const addRating = useRatingsStore((s) => s.addRating);
  const ratings = useRatingsStore((s) => s.ratings);
  const clearRatings = useRatingsStore((s) => s.clearAll);

  const [step, setStep] = useState<Step>('idle');
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handlePickFile = useCallback(async () => {
    try {
      setStep('picking');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setStep('idle');
        return;
      }

      const file = result.assets[0];
      if (!file?.uri) {
        Alert.alert('Error', 'Could not read the selected file.');
        setStep('idle');
        return;
      }

      setStep('matching');
      const response = await fetch(file.uri);
      const csvContent = await response.text();

      const fullResult = await importLetterboxdCsv(csvContent, (p) => {
        setProgress(p);
      });

      setImportResult(fullResult);
      setStep('preview');
    } catch {
      Alert.alert('Import Error', 'Failed to process the file. Make sure it is a valid Letterboxd ratings.csv.');
      setStep('idle');
    }
  }, []);

  const handleConfirmImport = useCallback(() => {
    if (!importResult) return;
    setStep('importing');

    for (const r of importResult.ratings) {
      addRating(
        r.mediaId,
        r.mediaType,
        r.source,
        r.title,
        r.posterPath,
        r.overview,
        r.rating,
        r.review,
      );
    }

    setStep('done');
  }, [importResult, addRating]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {step === 'idle' && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {ratings.length > 0 && (
            <View style={styles.warningSection}>
              <Ionicons name="warning" size={20} color="#ff6b35" />
              <Text style={styles.warningText}>
                You already have {ratings.length} rating{ratings.length > 1 ? 's' : ''}. Importing will add to them.
              </Text>
              <Pressable
                style={styles.clearButton}
                onPress={() => {
                  Alert.alert(
                    'Clear All Ratings',
                    'This will remove all your current ratings. Are you sure?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Clear',
                        onPress: clearRatings,
                        style: 'destructive',
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.clearText}>Clear All</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.sectionTitleContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Import from Letterboxd
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
              Select your Letterboxd ratings.csv export
            </Text>
          </View>

          <View style={styles.instructions}>
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              How to export from Letterboxd:
            </Text>
            {[
              'Go to letterboxd.com/settings/data',
              'Click "Export your data"',
              'Unzip the downloaded file',
              'Select the ratings.csv file below',
            ].map((step, i) => (
              <View key={i} style={styles.instructionRow}>
                <Text style={[styles.instructionNum, { color: colors.tint }]}>{i + 1}.</Text>
                <Text style={[styles.instructionText, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.importButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={handlePickFile}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="film" size={24} color={colors.tint} />
            </View>
            <View style={styles.importInfo}>
              <Text style={[styles.importTitle, { color: colors.text }]}>
                Select ratings.csv
              </Text>
              <Text style={[styles.importDescription, { color: colors.text }]}>
                Choose the file exported from Letterboxd
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.tint} />
          </Pressable>
        </ScrollView>
      )}

      {(step === 'picking' || step === 'matching') && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            {step === 'picking' ? 'Reading file...' : 'Matching ratings to TMDB...'}
          </Text>
          {progress && (
            <Text style={[styles.progressSubtitle, { color: colors.text }]}>
              {progress.matched + progress.failed} of {progress.total} processed
              {'\n'}
              {progress.matched} matched, {progress.failed} failed
              {'\n'}
              Current: {progress.current}
            </Text>
          )}
        </View>
      )}

      {step === 'preview' && importResult && (
        <ScrollView style={styles.previewContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.resultHeader}>
            <Ionicons name="checkmark-circle" size={48} color="#4caf50" />
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              Parsing Complete
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {importResult.ratings.length + importResult.failed.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Total Entries</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.statNumber, { color: '#4caf50' }]}>
                {importResult.ratings.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Matched</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card }]}>
              <Text
                style={[
                  styles.statNumber,
                  { color: importResult.failed.length > 0 ? '#ff6b35' : colors.text },
                ]}
              >
                {importResult.failed.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Failed</Text>
            </View>
          </View>

          {importResult.failed.length > 0 && (
            <View style={styles.failedSection}>
              <Text style={[styles.failedTitle, { color: colors.text }]}>
                Could not match:
              </Text>
              {importResult.failed.slice(0, 10).map((f, i) => (
                <Text key={i} style={styles.failedItem}>
                  {f.title} — {f.reason}
                </Text>
              ))}
              {importResult.failed.length > 10 && (
                <Text style={styles.failedItem}>
                  ...and {importResult.failed.length - 10} more
                </Text>
              )}
            </View>
          )}

          <View style={styles.actionSection}>
            <Pressable
              style={styles.primaryButton}
              onPress={handleConfirmImport}
            >
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                Import {importResult.ratings.length} Rating
                {importResult.ratings.length > 1 ? 's' : ''}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, { borderColor: colors.cardBorder }]}
              onPress={() => {
                setStep('idle');
                setImportResult(null);
                setProgress(null);
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {step === 'importing' && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            Importing your ratings...
          </Text>
        </View>
      )}

      {step === 'done' && importResult && (
        <View style={styles.centerContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#4caf50" />
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            Import Complete!
          </Text>
          <Text style={[styles.progressSubtitle, { color: colors.text }]}>
            Successfully imported {importResult.ratings.length} rating
            {importResult.ratings.length > 1 ? 's' : ''}
            {importResult.failed.length > 0 &&
              ` (${importResult.failed.length} could not be matched)`}
          </Text>
          <Pressable
            style={[styles.primaryButton, { marginTop: 24 }]}
            onPress={() => {
              setStep('idle');
              setImportResult(null);
              setProgress(null);
            }}
          >
            <Text style={styles.primaryButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  instructions: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 8,
  },
  instructionNum: {
    fontSize: 13,
    fontWeight: '600',
    width: 20,
  },
  instructionText: {
    fontSize: 13,
    opacity: 0.8,
    flex: 1,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  importInfo: {
    flex: 1,
  },
  importTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  importDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  previewContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultHeader: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  actionSection: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a1a1a',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#ffa94d',
  },
  clearButton: {
    backgroundColor: '#2a2a3e',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 11,
    color: '#ff8e3c',
    fontWeight: '600',
  },
  failedSection: {
    backgroundColor: '#3a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  failedTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  failedItem: {
    fontSize: 12,
    color: '#ffa94d',
    marginBottom: 4,
    lineHeight: 18,
  },
});
