import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

// Types
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  sizes: string[];
  colors: string[];
}

interface CartItem {
  productId: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: string;
}

const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
};

// Products data
const products: Product[] = [
  {
    id: 1,
    name: "Camiseta Básica Premium",
    price: 89.9,
    image:
      "https://images.unsplash.com/photo-1636458938604-38cd6718ee43?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmclMjB0c2hpcnR8ZW58MXx8fHwxNzczMTQ2NTY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Camisetas",
    description:
      "Camiseta de algodão premium, confortável e versátil para o dia a dia. Modelagem moderna e acabamento de qualidade.",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Branco", "Cinza"],
  },
  {
    id: 2,
    name: "Vestido Elegante",
    price: 299.9,
    image:
      "https://images.unsplash.com/photo-1562182856-e39faab686d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZHJlc3MlMjB3b21hbnxlbnwxfHx8fDE3NzMxODgyMzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Vestidos",
    description:
      "Vestido sofisticado perfeito para ocasiões especiais. Tecido de alta qualidade com caimento impecável.",
    sizes: ["P", "M", "G"],
    colors: ["Preto", "Vinho", "Azul Marinho"],
  },
  {
    id: 3,
    name: "Calça Jeans Slim",
    price: 199.9,
    image:
      "https://images.unsplash.com/photo-1602585198422-d795fa9bfd6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGplYW5zJTIwZmFzaGlvbnxlbnwxfHx8fDE3NzMxNjc1MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Calças",
    description:
      "Calça jeans slim fit em denim de alta qualidade. Confortável e estilosa para todas as ocasiões.",
    sizes: ["36", "38", "40", "42", "44"],
    colors: ["Azul Escuro", "Azul Médio", "Preto"],
  },
  {
    id: 4,
    name: "Jaqueta de Couro",
    price: 599.9,
    image:
      "https://images.unsplash.com/photo-1727518154538-59e7dc479f8f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwamFja2V0JTIwbGVhdGhlcnxlbnwxfHx8fDE3NzMxODgyMzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Jaquetas",
    description:
      "Jaqueta de couro sintético premium. Design moderno e atemporal que nunca sai de moda.",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Marrom"],
  },
  {
    id: 5,
    name: "Tênis Casual Branco",
    price: 249.9,
    image:
      "https://images.unsplash.com/photo-1651371409956-20e79c06a8bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMHNuZWFrZXJzJTIwc2hvZXN8ZW58MXx8fHwxNzczMTczNDMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Calçados",
    description:
      "Tênis branco versátil que combina com tudo. Conforto e estilo para o seu dia a dia.",
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43"],
    colors: ["Branco", "Off-White"],
  },
  {
    id: 6,
    name: "Moletom Streetwear",
    price: 179.9,
    image:
      "https://images.unsplash.com/photo-1771950014791-9a9771724369?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwaG9vZGllJTIwc3RyZWV0d2VhcnxlbnwxfHx8fDE3NzMxODgyMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Moletons",
    description:
      "Moletom com capuz estilo streetwear. Tecido macio e aquecido, perfeito para dias frios.",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Preto", "Cinza", "Verde Militar"],
  },
  {
    id: 7,
    name: "Bermuda Casual",
    price: 119.9,
    image:
      "https://images.unsplash.com/photo-1563884870649-b696c3bf12e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW1tZXIlMjBzaG9ydHMlMjBjYXN1YWx8ZW58MXx8fHwxNzczMTg4MjMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Bermudas",
    description:
      "Bermuda casual perfeita para o verão. Tecido leve e respirável com ajuste confortável.",
    sizes: ["P", "M", "G", "GG"],
    colors: ["Bege", "Azul Marinho", "Verde"],
  },
  {
    id: 8,
    name: "Suéter de Tricô",
    price: 159.9,
    image:
      "https://images.unsplash.com/photo-1769772273242-a7bd27684da4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrbml0JTIwc3dlYXRlciUyMGNvenl8ZW58MXx8fHwxNzczMTI0ODg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    category: "Suéteres",
    description:
      "Suéter de tricô aconchegante e estiloso. Ideal para compor looks elegantes e confortáveis.",
    sizes: ["P", "M", "G"],
    colors: ["Bege", "Cinza", "Azul"],
  },
];

// Health check endpoint
app.get("/make-server-4fbb70ef/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all products
app.get("/make-server-4fbb70ef/products", (c) => {
  try {
    return c.json({ products });
  } catch (error) {
    console.log(`Error getting products: ${error}`);
    return c.json({ error: "Failed to get products" }, 500);
  }
});

// Get product by ID
app.get("/make-server-4fbb70ef/products/:id", (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const product = products.find((p) => p.id === id);

    if (!product) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json({ product });
  } catch (error) {
    console.log(`Error getting product: ${error}`);
    return c.json({ error: "Failed to get product" }, 500);
  }
});

// Get products by category
app.get("/make-server-4fbb70ef/products/category/:category", (c) => {
  try {
    const category = c.req.param("category");
    const filteredProducts = products.filter((p) => p.category === category);

    return c.json({ products: filteredProducts });
  } catch (error) {
    console.log(`Error filtering products by category: ${error}`);
    return c.json({ error: "Failed to filter products" }, 500);
  }
});

// Save cart to KV store
app.post("/make-server-4fbb70ef/cart/save", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, items } = body;

    if (!userId || !items) {
      return c.json({ error: "Missing userId or items" }, 400);
    }

    await kv.set(`cart:${userId}`, items);
    return c.json({ success: true, message: "Cart saved successfully" });
  } catch (error) {
    console.log(`Error saving cart: ${error}`);
    return c.json({ error: "Failed to save cart" }, 500);
  }
});

// Get cart from KV store
app.get("/make-server-4fbb70ef/cart/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const cart = await kv.get(`cart:${userId}`);

    return c.json({ cart: cart || [] });
  } catch (error) {
    console.log(`Error getting cart: ${error}`);
    return c.json({ error: "Failed to get cart" }, 500);
  }
});

// Clear cart from KV store
app.delete("/make-server-4fbb70ef/cart/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    await kv.del(`cart:${userId}`);

    return c.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.log(`Error clearing cart: ${error}`);
    return c.json({ error: "Failed to clear cart" }, 500);
  }
});

// Create order
app.post("/make-server-4fbb70ef/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, items, total } = body;

    if (!userId || !items || !total) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const orderId = crypto.randomUUID();
    const order: Order = {
      id: orderId,
      userId,
      items,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, order);

    // Also save to user's order list
    const userOrders = (await kv.get(`user:${userId}:orders`)) || [];
    userOrders.push(orderId);
    await kv.set(`user:${userId}:orders`, userOrders);

    return c.json({ success: true, order });
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

// Get order by ID
app.get("/make-server-4fbb70ef/orders/:orderId", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({ order });
  } catch (error) {
    console.log(`Error getting order: ${error}`);
    return c.json({ error: "Failed to get order" }, 500);
  }
});

// Get user orders
app.get("/make-server-4fbb70ef/users/:userId/orders", async (c) => {
  try {
    const userId = c.req.param("userId");
    const orderIds = (await kv.get(`user:${userId}:orders`)) || [];

    const orders = await Promise.all(
      orderIds.map(async (orderId: string) => {
        return await kv.get(`order:${orderId}`);
      })
    );

    return c.json({ orders: orders.filter(Boolean) });
  } catch (error) {
    console.log(`Error getting user orders: ${error}`);
    return c.json({ error: "Failed to get user orders" }, 500);
  }
});

// Update order status
app.put("/make-server-4fbb70ef/orders/:orderId/status", async (c) => {
  try {
    const orderId = c.req.param("orderId");
    const body = await c.req.json();
    const { status } = body;

    if (!status) {
      return c.json({ error: "Missing status" }, 400);
    }

    const order = await kv.get(`order:${orderId}`);

    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    const updatedOrder = { ...order, status };
    await kv.set(`order:${orderId}`, updatedOrder);

    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log(`Error updating order status: ${error}`);
    return c.json({ error: "Failed to update order status" }, 500);
  }
});

// Get all categories
app.get("/make-server-4fbb70ef/categories", (c) => {
  try {
    const categories = Array.from(new Set(products.map((p) => p.category)));
    return c.json({ categories });
  } catch (error) {
    console.log(`Error getting categories: ${error}`);
    return c.json({ error: "Failed to get categories" }, 500);
  }
});

Deno.serve(app.fetch);
