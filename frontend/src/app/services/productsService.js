// src/services/productsService.js
import { supabase } from "../../utils/supabase/client";

export const productsService = {
  // 1. Busca todos os produtos para a vitrine
  getAllProducts: async () => {
    // 🌟 1ª MUDANÇA: Usamos o Join para ir buscar o nome da categoria
    const { data, error } = await supabase.from('products').select('*, categories(name)');
    
    if (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error; 
    }
    
    // 🌟 2ª MUDANÇA: Criamos a propriedade 'category' com o nome em texto, 
    // para que a ProductsPage e o ProductCard funcionem sem precisar de alterações
    const produtosFormatados = data.map((produto) => ({
      ...produto,
      category: produto.categories?.name || "Sem categoria"
    }));

    return produtosFormatados;
  },

  // 2. Busca apenas um produto (quando o cliente clica para ver os detalhes)
  getProductById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)') // 🌟 Também adicionamos o Join aqui!
      .eq('id', id)
      .single(); 
      
    if (error) {
      console.error("Erro ao buscar o produto:", error);
      throw error;
    }
    
    // Formatamos este também para a página de Detalhes funcionar direitinho
    return {
      ...data,
      category: data.categories?.name || "Sem categoria"
    };
  }
};