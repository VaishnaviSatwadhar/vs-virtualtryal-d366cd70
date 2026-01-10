import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface WishlistItem {
  id: string;
  product_name: string;
  product_image: string;
  category: string | null;
  notes: string | null;
  created_at: string;
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = useCallback(async (
    productName: string,
    productImage: string,
    category?: string,
    notes?: string
  ) => {
    if (!user) {
      toast.error('Please sign in to save products');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('saved_products')
        .insert({
          user_id: user.id,
          product_name: productName,
          product_image: productImage,
          category: category || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setWishlistItems(prev => [data, ...prev]);
      toast.success(`${productName} added to wishlist!`);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      return false;
    }
  }, [user]);

  const removeFromWishlist = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setWishlistItems(prev => prev.filter(item => item.id !== id));
      toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
      return false;
    }
  }, [user]);

  const isInWishlist = useCallback((productName: string) => {
    return wishlistItems.some(item => item.product_name === productName);
  }, [wishlistItems]);

  const getWishlistItemByName = useCallback((productName: string) => {
    return wishlistItems.find(item => item.product_name === productName);
  }, [wishlistItems]);

  return {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistItemByName,
    refreshWishlist: fetchWishlist,
  };
};
