import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Theme } from '@/constants/Theme';
import CalendarDay from '@/components/CalendarDay';
import DailyRatingModal from '@/components/DailyRatingModal';

interface DailyRating {
  id: string;
  rating_date: string;
  rating_value: number;
  notes: string;
}

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [ratings, setRatings] = useState<DailyRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    loadRatings();
  }, [currentDate]);

  useFocusEffect(
    useCallback(() => {
      loadRatings();
    }, [currentDate])
  );

  const loadRatings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No active session');
        setLoading(false);
        return;
      }

      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('daily_ratings')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('rating_date', startOfMonth.toISOString().split('T')[0])
        .lte('rating_date', endOfMonth.toISOString().split('T')[0]);

      if (error) {
        console.error('Error loading ratings:', error);
        return;
      }

      if (data) {
        setRatings(data);
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getRatingForDate = (day: number) => {
    const dateString = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return ratings.find((r) => r.rating_date === dateString);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isFutureDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const handleDayPress = (day: number) => {
    if (isFutureDate(day)) return;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    setShowRatingModal(true);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getMonthName = () => {
    const months = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];
    return months[currentDate.getMonth()];
  };

  const getExistingRating = () => {
    if (!selectedDate) return null;
    const dateString = selectedDate.toISOString().split('T')[0];
    return ratings.find((r) => r.rating_date === dateString) || null;
  };

  const calculateMonthStats = () => {
    if (ratings.length === 0) return null;
    const totalRating = ratings.reduce((sum, r) => sum + r.rating_value, 0);
    const average = (totalRating / ratings.length).toFixed(1);
    return {
      count: ratings.length,
      average: parseFloat(average),
    };
  };

  const days = getDaysInMonth();
  const stats = calculateMonthStats();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CalendarIcon size={40} color={Theme.colors.neutral.white} />
        <Text style={styles.title}>Calendrier</Text>
        <Text style={styles.subtitle}>Note tes journées</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
            <ChevronLeft size={24} color={Theme.colors.primary.main} />
          </TouchableOpacity>

          <TouchableOpacity onPress={goToToday} style={styles.monthLabel}>
            <Text style={styles.monthText}>
              {getMonthName()} {currentDate.getFullYear()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
            <ChevronRight size={24} color={Theme.colors.primary.main} />
          </TouchableOpacity>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.count}</Text>
              <Text style={styles.statLabel}>jours notés</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.average}</Text>
              <Text style={styles.statLabel}>moyenne</Text>
            </View>
          </View>
        )}

        <View style={styles.weekDaysContainer}>
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, index) => (
            <Text key={index} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary.main} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.daysContainer}>
              {days.map((day, index) => (
                <CalendarDay
                  key={index}
                  day={day}
                  rating={day ? getRatingForDate(day)?.rating_value : undefined}
                  isToday={day ? isToday(day) : false}
                  isFuture={day ? isFutureDate(day) : false}
                  onPress={day ? () => handleDayPress(day) : undefined}
                />
              ))}
            </View>

            <View style={styles.legend}>
              <Text style={styles.legendTitle}>Légende des notes</Text>
              <View style={styles.legendItems}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
                  <Text style={styles.legendText}>Excellent</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#95E1D3' }]} />
                  <Text style={styles.legendText}>Très bien</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#FFD93D' }]} />
                  <Text style={styles.legendText}>Bien</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#FFB347' }]} />
                  <Text style={styles.legendText}>Moyen</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
                  <Text style={styles.legendText}>À améliorer</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>

      {selectedDate && (
        <DailyRatingModal
          visible={showRatingModal}
          date={selectedDate}
          existingRating={getExistingRating()}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedDate(null);
          }}
          onSuccess={() => {
            loadRatings();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral.background,
  },
  header: {
    padding: Theme.spacing.xxxl,
    paddingTop: 60,
    backgroundColor: '#FFEB3B',
    borderBottomLeftRadius: Theme.borderRadius.xxxl,
    borderBottomRightRadius: Theme.borderRadius.xxxl,
    alignItems: 'center',
    gap: Theme.spacing.sm,
    ...Theme.shadows.lg,
  },
  title: {
    fontSize: Theme.typography.fontSizes.xxxl,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Theme.typography.fontSizes.md,
    color: '#333',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  monthButton: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.md,
    ...Theme.shadows.sm,
  },
  monthLabel: {
    paddingHorizontal: Theme.spacing.lg,
  },
  monthText: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Theme.colors.neutral.border,
    marginHorizontal: Theme.spacing.md,
  },
  statValue: {
    fontSize: Theme.typography.fontSizes.xxl,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.primary.main,
  },
  statLabel: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.neutral.text.secondary,
    marginTop: Theme.spacing.xs,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.sm,
  },
  weekDay: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Theme.spacing.xl,
  },
  legend: {
    backgroundColor: Theme.colors.neutral.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xxl,
    ...Theme.shadows.sm,
  },
  legendTitle: {
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.neutral.text.primary,
    marginBottom: Theme.spacing.md,
  },
  legendItems: {
    gap: Theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: Theme.borderRadius.sm,
  },
  legendText: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.neutral.text.secondary,
  },
});
