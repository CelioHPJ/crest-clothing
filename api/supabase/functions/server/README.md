# Backend TypeScript - E-commerce de Vestuário

Este é o backend TypeScript do e-commerce, implementado usando Deno, Hono, e Supabase.

## Arquitetura

O backend segue uma arquitetura de três camadas:

```
Frontend (JavaScript) -> Server (TypeScript) -> Database (Supabase KV Store)
```

## Tecnologias

- **Runtime**: Deno
- **Framework Web**: Hono
- **Banco de Dados**: Supabase (KV Store)
- **Linguagem**: TypeScript

## Endpoints da API

### Health Check

```
GET /make-server-4fbb70ef/health
```

Retorna o status do servidor.

**Resposta:**
```json
{
  "status": "ok"
}
```

---

### Produtos

#### Listar todos os produtos

```
GET /make-server-4fbb70ef/products
```

**Resposta:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Camiseta Básica Premium",
      "price": 89.90,
      "image": "url...",
      "category": "Camisetas",
      "description": "...",
      "sizes": ["P", "M", "G", "GG"],
      "colors": ["Preto", "Branco", "Cinza"]
    }
  ]
}
```

#### Obter produto por ID

```
GET /make-server-4fbb70ef/products/:id
```

**Resposta:**
```json
{
  "product": {
    "id": 1,
    "name": "Camiseta Básica Premium",
    ...
  }
}
```

#### Filtrar produtos por categoria

```
GET /make-server-4fbb70ef/products/category/:category
```

**Resposta:**
```json
{
  "products": [...]
}
```

#### Listar categorias

```
GET /make-server-4fbb70ef/categories
```

**Resposta:**
```json
{
  "categories": ["Camisetas", "Vestidos", "Calças", ...]
}
```

---

### Carrinho

#### Salvar carrinho

```
POST /make-server-4fbb70ef/cart/save
```

**Body:**
```json
{
  "userId": "user123",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "selectedSize": "M",
      "selectedColor": "Preto"
    }
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Cart saved successfully"
}
```

#### Obter carrinho

```
GET /make-server-4fbb70ef/cart/:userId
```

**Resposta:**
```json
{
  "cart": [...]
}
```

#### Limpar carrinho

```
DELETE /make-server-4fbb70ef/cart/:userId
```

**Resposta:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

### Pedidos

#### Criar pedido

```
POST /make-server-4fbb70ef/orders
```

**Body:**
```json
{
  "userId": "user123",
  "items": [...],
  "total": 299.90
}
```

**Resposta:**
```json
{
  "success": true,
  "order": {
    "id": "uuid...",
    "userId": "user123",
    "items": [...],
    "total": 299.90,
    "status": "pending",
    "createdAt": "2026-03-11T..."
  }
}
```

#### Obter pedido por ID

```
GET /make-server-4fbb70ef/orders/:orderId
```

**Resposta:**
```json
{
  "order": {...}
}
```

#### Listar pedidos do usuário

```
GET /make-server-4fbb70ef/users/:userId/orders
```

**Resposta:**
```json
{
  "orders": [...]
}
```

#### Atualizar status do pedido

```
PUT /make-server-4fbb70ef/orders/:orderId/status
```

**Body:**
```json
{
  "status": "completed"
}
```

**Resposta:**
```json
{
  "success": true,
  "order": {...}
}
```

---

## Tipos TypeScript

### Product
```typescript
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
```

### CartItem
```typescript
interface CartItem {
  productId: number;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}
```

### Order
```typescript
interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: string;
}
```

---

## Armazenamento de Dados

O backend utiliza o Supabase KV Store para persistência de dados:

### Estrutura de Chaves

- `cart:{userId}` - Carrinho do usuário
- `order:{orderId}` - Dados do pedido
- `user:{userId}:orders` - Lista de IDs de pedidos do usuário

---

## Segurança

- Todas as rotas usam CORS aberto para facilitar desenvolvimento
- Autenticação via Bearer Token com `publicAnonKey`
- Logs detalhados de erros para debugging

---

## Como Usar no Frontend

Importe o serviço de API:

```javascript
import { productsApi, cartApi, ordersApi } from './services/api';

// Exemplo: Obter produtos
const { products } = await productsApi.getAll();

// Exemplo: Salvar carrinho
await cartApi.save('user123', items);

// Exemplo: Criar pedido
const { order } = await ordersApi.create('user123', items, total);
```

---

## Desenvolvimento

O servidor é iniciado automaticamente pelo Deno com:

```typescript
Deno.serve(app.fetch);
```

Todas as requisições passam pelo logger para facilitar debugging.
