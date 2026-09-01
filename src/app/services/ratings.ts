import { supabase } from './database-supabase';

export interface RatingData {
  id?: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPfp?: string;
  rating: number;
  title?: string;
  comment?: string;
  helpful?: number;
  unhelpful?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RatingStatistics {
  averageRating: number;
  totalRatings: number;
  ratingCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  percentages: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Get all ratings for a product
export const getProductRatings = async (productId: string) => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const ratings = data || [];
    const statistics = computeRatingStatistics(ratings);

    return { success: true, data: { ratings, statistics } };
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return { success: false, message: 'Failed to fetch ratings' };
  }
};

function computeRatingStatistics(ratings: RatingData[]): RatingStatistics {
  const totalRatings = ratings.length;
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  let sum = 0;
  for (const r of ratings) {
    const star = Math.min(5, Math.max(1, r.rating));
    ratingCounts[star]++;
    sum += star;
  }

  const averageRating = totalRatings > 0 ? sum / totalRatings : 0;
  const percentages = {
    1: totalRatings > 0 ? (ratingCounts[1] / totalRatings) * 100 : 0,
    2: totalRatings > 0 ? (ratingCounts[2] / totalRatings) * 100 : 0,
    3: totalRatings > 0 ? (ratingCounts[3] / totalRatings) * 100 : 0,
    4: totalRatings > 0 ? (ratingCounts[4] / totalRatings) * 100 : 0,
    5: totalRatings > 0 ? (ratingCounts[5] / totalRatings) * 100 : 0,
  };

  return { averageRating, totalRatings, ratingCounts, percentages };
}

// Get user's rating for a product
export const getUserRating = async (productId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (error) return { success: false, message: 'No rating found' };
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user rating:', error);
    return { success: false, message: 'Failed to fetch rating' };
  }
};

// Create a new rating
export const createRating = async (ratingData: RatingData) => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        id: crypto.randomUUID(),
        product_id: ratingData.productId,
        user_id: ratingData.userId,
        user_name: ratingData.userName,
        user_email: ratingData.userEmail,
        user_pfp: ratingData.userPfp || null,
        rating: ratingData.rating,
        title: ratingData.title,
        comment: ratingData.comment,
        helpful: 0,
        unhelpful: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating rating:', JSON.stringify(error, null, 2));
      return { success: false, message: error.message || 'Failed to create rating' };
    }
    return { success: true, data };
  } catch (error) {
    console.error('Error creating rating:', error);
    return { success: false, message: 'Failed to create rating' };
  }
};

// Update a rating
export const updateRating = async (ratingId: string, userId: string, updateData: Partial<RatingData>) => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .update({
        rating: updateData.rating,
        title: updateData.title,
        comment: updateData.comment,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ratingId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating rating:', error);
    return { success: false, message: 'Failed to update rating' };
  }
};

// Delete a rating
export const deleteRating = async (ratingId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('id', ratingId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting rating:', error);
    return { success: false, message: 'Failed to delete rating' };
  }
};

// Mark rating as helpful
export const markRatingHelpful = async (ratingId: string, helpful: boolean) => {
  try {
    const column = helpful ? 'helpful' : 'unhelpful';
    const { data, error } = await supabase
      .from('ratings')
      .update({ [column]: supabase.raw(`${column} + 1`) })
      .eq('id', ratingId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error marking rating:', error);
    return { success: false, message: 'Failed to mark rating' };
  }
};
