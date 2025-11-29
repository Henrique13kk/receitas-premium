'use client';

import { useState, useEffect, use } from 'react';
import { Clock, Star, Crown, ChefHat, Heart, ArrowLeft, Users, Flame } from 'lucide-react';
import Navbar from '@/components/custom/navbar';
import { categories } from '@/lib/data';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  prep_time: number;
  difficulty: string;
  rating: number;
  is_premium: boolean;
  ingredients: string[];
  instructions: string[];
  nutritional_info: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  created_at: string;
}

export default function ReceitaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
    loadRecipe();
  }, [id]);

  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setRecipe(data);

      // Verificar se é favorito
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('recipe_id', id)
          .single();

        setIsFavorite(!!favData);
      }
    } catch (error) {
      console.error('Erro ao carregar receita:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isFavorite) {
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, recipe_id: id });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00FF7F] mx-auto"></div>
          <p className="text-gray-400">Carregando receita...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ChefHat className="w-20 h-20 text-gray-600 mx-auto" />
          <p className="text-xl text-gray-400 font-semibold">Receita não encontrada</p>
          <Link href="/">
            <button className="px-6 py-3 bg-[#00FF7F] text-[#0D0D0D] rounded-2xl font-bold hover:bg-[#00CC66] transition-all duration-300">
              Voltar para Início
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = categories.find(c => c.id === recipe.category);

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-24">
      <Navbar />

      {/* Hero Section with Image */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-black/90 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </Link>
        </div>

        {/* Premium Badge */}
        {recipe.is_premium && (
          <div className="absolute top-6 right-6 z-10">
            <div className="px-4 py-2 bg-[#00FF7F] text-[#0D0D0D] rounded-full text-sm font-bold flex items-center gap-2 shadow-xl shadow-[#00FF7F]/50">
              <Crown className="w-4 h-4" />
              <span>PREMIUM</span>
            </div>
          </div>
        )}

        {/* Title and Meta Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-full text-sm font-semibold text-white border border-white/10">
                {categoryInfo?.icon} {categoryInfo?.label}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${
                recipe.difficulty === 'fácil' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                recipe.difficulty === 'médio' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {recipe.difficulty}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-poppins text-white mb-4 leading-tight">
              {recipe.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="text-lg font-medium">{recipe.prep_time} minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-current text-[#00FF7F]" />
                <span className="text-lg font-bold">{recipe.rating}</span>
              </div>
              <button
                onClick={toggleFavorite}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                <span className="text-sm font-medium">{isFavorite ? 'Favoritado' : 'Favoritar'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#00FF7F]/10 rounded-3xl p-6">
              <h2 className="text-2xl font-bold font-poppins text-white mb-4">Sobre esta receita</h2>
              <p className="text-gray-300 leading-relaxed">{recipe.description}</p>
            </div>

            {/* Ingredients */}
            <div className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#00FF7F]/10 rounded-3xl p-6">
              <h2 className="text-2xl font-bold font-poppins text-white mb-6 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-[#00FF7F]" />
                Ingredientes
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <span className="w-2 h-2 bg-[#00FF7F] rounded-full mt-2 flex-shrink-0" />
                    <span className="leading-relaxed">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#00FF7F]/10 rounded-3xl p-6">
              <h2 className="text-2xl font-bold font-poppins text-white mb-6">Modo de Preparo</h2>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-[#00FF7F] text-[#0D0D0D] rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-gray-300 leading-relaxed pt-1">{instruction}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nutritional Info */}
            <div className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#00FF7F]/10 rounded-3xl p-6 sticky top-6">
              <h3 className="text-xl font-bold font-poppins text-white mb-6 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#00FF7F]" />
                Informações Nutricionais
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#252525] rounded-2xl">
                  <span className="text-gray-400 font-medium">Calorias</span>
                  <span className="text-white font-bold text-lg">{recipe.nutritional_info?.calories || 0} kcal</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#252525] rounded-2xl">
                  <span className="text-gray-400 font-medium">Proteínas</span>
                  <span className="text-white font-bold text-lg">{recipe.nutritional_info?.protein || 0}g</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#252525] rounded-2xl">
                  <span className="text-gray-400 font-medium">Carboidratos</span>
                  <span className="text-white font-bold text-lg">{recipe.nutritional_info?.carbs || 0}g</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#252525] rounded-2xl">
                  <span className="text-gray-400 font-medium">Gorduras</span>
                  <span className="text-white font-bold text-lg">{recipe.nutritional_info?.fat || 0}g</span>
                </div>
              </div>

              {/* Premium Status */}
              <div className="mt-6 pt-6 border-t border-[#00FF7F]/10">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Status</span>
                  {recipe.is_premium ? (
                    <span className="px-3 py-1.5 bg-[#00FF7F]/20 text-[#00FF7F] rounded-full text-sm font-bold flex items-center gap-1.5 border border-[#00FF7F]/30">
                      <Crown className="w-3.5 h-3.5" />
                      Premium
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold border border-blue-500/30">
                      Grátis
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
