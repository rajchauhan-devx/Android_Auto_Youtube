import React, {useState} from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors} from '../theme/colors';
import {Spacing} from '../theme/spacing';
import Header from '../components/common/Header';
import ReviewCard from '../components/review/ReviewCard';
import CustomButton from '../components/common/CustomButton';
import EmptyState from '../components/common/EmptyState';

interface ReviewItem {
  id: string;
  title: string;
  type: 'image' | 'audio';
  duration: number;
}

export default function ReviewExportScreen({navigation}: {navigation: any}) {
  const [items, setItems] = useState<ReviewItem[]>([]);

  const handleDurationChange = (id: string, value: number) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? {...item, duration: value} : item)),
    );
  };

  const handleExport = () => {
    navigation.navigate('YouTube');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Review & Export" />
      <FlatList
        data={items}
        renderItem={({item}) => (
          <ReviewCard
            title={item.title}
            type={item.type}
            duration={item.duration}
            onDurationChange={value => handleDurationChange(item.id, value)}
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="rate-review"
            title="No Items to Review"
            message="Generated content will appear here"
          />
        }
      />
      <View style={styles.footer}>
        <CustomButton
          title="Export"
          onPress={handleExport}
          disabled={items.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    paddingVertical: Spacing.md,
    paddingBottom: 100,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});
