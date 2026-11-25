
import type { CustomerProduct, CustomerStore } from "./customer-store";

export interface CartItem {
  product: CustomerProduct;
  store: Pick<CustomerStore, "id" | "name" | "logo">;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

const CART_STORAGE_KEY = "townexpress_cart";

export const cartService = {
  getCart(): Cart {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);

      if (!savedCart) {
        return { items: [] };
      }

      return JSON.parse(savedCart) as Cart;
    } catch {
      return { items: [] };
    }
  },

  saveCart(cart: Cart): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  },

  addItem(
    product: CustomerProduct,
    store: Pick<CustomerStore, "id" | "name" | "logo">,
    quantity = 1
  ): Cart {
    const cart = this.getCart();

    // One store per cart for now.
    if (
      cart.items.length > 0 &&
      cart.items.some((item) => item.store.id !== store.id)
    ) {
      throw new Error(
        "Your cart already contains products from another store. Please checkout or clear your cart first."
      );
    }

    const existingItem = cart.items.find(
      (item) => item.product.id === product.id
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        throw new Error("Requested quantity exceeds available stock.");
      }

      existingItem.quantity = newQuantity;
    } else {
      if (quantity < 1 || quantity > product.stock) {
        throw new Error("Invalid product quantity.");
      }

      cart.items.push({
        product,
        store,
        quantity,
      });
    }

    this.saveCart(cart);

    return cart;
  },

  updateQuantity(productId: string, quantity: number): Cart {
    const cart = this.getCart();

    const item = cart.items.find(
      (cartItem) => cartItem.product.id === productId
    );

    if (!item) {
      return cart;
    }

    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    if (quantity > item.product.stock) {
      throw new Error("Requested quantity exceeds available stock.");
    }

    item.quantity = quantity;

    this.saveCart(cart);

    return cart;
  },

  removeItem(productId: string): Cart {
    const cart = this.getCart();

    cart.items = cart.items.filter(
      (item) => item.product.id !== productId
    );

    this.saveCart(cart);

    return cart;
  },

  clearCart(): Cart {
    const cart: Cart = { items: [] };

    this.saveCart(cart);

    return cart;
  },

  getItemCount(): number {
    return this.getCart().items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  },

  getSubtotal(): number {
    return this.getCart().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },
};
