import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, CheckCircle, Package } from "lucide-react";
import { supabase } from "../../../utils/supabase/client.js";
import { Input } from "../atoms/Input.jsx";
import { Button } from "../atoms/button.jsx";

export function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);

  // Estado para os dados principais do produto
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
  });

  // Estado para a lista de variantes (Tamanhos/Cores/Estoque)
  // Já começamos com uma linha em branco por padrão
  const [variants, setVariants] = useState([
    { size: "", color: "", stock: "" }
  ]);

  // Busca as categorias logo que a página carrega
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  // Funções para manipular a lista de variantes
  const addVariantRow = () => {
    setVariants([...variants, { size: "", color: "", stock: "" }]);
  };

  const removeVariantRow = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  // Função principal para salvar tudo no banco de dados
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // 1. Salva o Produto na tabela 'products'
      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert([
          {
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            image_url: product.image_url,
            category_id: product.category_id,
          },
        ])
        .select()
        .single(); // Exige que o banco devolva o produto recém-criado (para pegarmos o ID)

      if (productError) throw productError;

      // 2. Prepara as variantes, adicionando o ID do produto que acabou de ser criado
      const variantsToInsert = variants.map((v) => ({
        product_id: newProduct.id,
        size: v.size.toUpperCase(), // Padroniza o tamanho para maiúsculo (ex: p -> P)
        color: v.color,
        stock: parseInt(v.stock, 10),
      }));

      // 3. Salva todas as variantes na tabela 'product_variants'
      const { error: variantError } = await supabase
        .from("product_variants")
        .insert(variantsToInsert);

      if (variantError) throw variantError;

      // Se chegou aqui, deu tudo certo! Limpa o formulário.
      setSuccess(true);
      setProduct({ name: "", description: "", price: "", image_url: "", category_id: "" });
      setVariants([{ size: "", color: "", stock: "" }]);
      
      // Tira a mensagem de sucesso após 4 segundos
      setTimeout(() => setSuccess(false), 4000);

    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar o produto. Verifique o console para mais detalhes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8 border-b pb-4">
        <Package className="w-8 h-8 text-gray-800" />
        <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        
        {/* SEÇÃO 1: Dados do Produto */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Detalhes da Peça</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
              <Input required value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} placeholder="Ex: Camiseta Básica" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
              <select 
                required
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                value={product.category_id}
                onChange={(e) => setProduct({ ...product, category_id: e.target.value })}
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
              <Input required type="number" step="0.01" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} placeholder="99.90" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link da Imagem / Caminho local</label>
              <Input value={product.image_url} onChange={(e) => setProduct({ ...product, image_url: e.target.value })} placeholder="/ultima-ceia.jpg ou https://..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea 
                className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-h-[100px]"
                value={product.description} 
                onChange={(e) => setProduct({ ...product, description: e.target.value })} 
                placeholder="Detalhes sobre o tecido, caimento..." 
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: Variantes (Grade de Tamanhos e Cores) */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-semibold text-gray-800">2. Grade de Tamanhos e Estoque</h2>
            <Button type="button" variant="outline" size="sm" onClick={addVariantRow} className="flex items-center gap-1">
              <Plus className="w-4 h-4" /> Nova Variação
            </Button>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {variants.map((variant, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <Input required placeholder="Tam (ex: P, M, 40)" value={variant.size} onChange={(e) => handleVariantChange(index, "size", e.target.value)} />
                </div>
                <div className="flex-1">
                  <Input required placeholder="Cor (ex: Preto)" value={variant.color} onChange={(e) => handleVariantChange(index, "color", e.target.value)} />
                </div>
                <div className="w-24">
                  <Input required type="number" min="0" placeholder="Qtd" value={variant.stock} onChange={(e) => handleVariantChange(index, "stock", e.target.value)} />
                </div>
                {variants.length > 1 && (
                  <Button type="button" variant="ghost" onClick={() => removeVariantRow(index)} className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* MENSAGENS E BOTÃO DE SUBMIT */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Produto e estoque cadastrados com sucesso!
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-800 text-white h-12 text-lg">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Salvar Produto no Catálogo"}
        </Button>

      </form>
    </div>
  );
}