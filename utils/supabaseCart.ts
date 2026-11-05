import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function addToCart(productId: string, qty: number) {
    const {
        data: { user },
        error: authErr,
    } = await supabase.auth.getUser();

    if (authErr) throw new Error('You must be logged in to add items to the cart.');

    const { error } = await supabase.rpc('add_cart_item', {
        p_user_id: user?.id,
        p_product_id: productId,
        p_qty: qty,
    });

    if (error) throw error;
}