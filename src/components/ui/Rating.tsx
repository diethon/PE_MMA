import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants';

interface RatingProps {
  rating: number;
  reviews?: number;
  size?: number;
  showText?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  reviews,
  size = 18,
  showText = true,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View className="flex-row items-center">
      {Array.from({ length: fullStars }).map((_, i) => (
        <MaterialIcons key={`full-${i}`} name="star" size={size} color={Colors.star} />
      ))}
      {hasHalfStar ? (
        <MaterialIcons name="star-half" size={size} color={Colors.star} />
      ) : null}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <MaterialIcons key={`empty-${i}`} name="star-border" size={size} color={Colors.star} />
      ))}
      {showText && reviews !== undefined ? (
        <Text className="text-text-secondary text-sm ml-1.5">({reviews} reviews)</Text>
      ) : null}
    </View>
  );
};
