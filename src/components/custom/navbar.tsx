'use client';

import { Home, Search, Heart, User, Crown, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Determinar aba ativa baseado na URL atual
  const getActiveTab = () => {
    if (pathname === '/') return 'home';
    if (pathname === '/buscar') return 'search';
    if (pathname === '/admin') return 'admin';
    if (pathname === '/favoritos') return 'favorites';
    if (pathname === '/perfil') return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    loadUserData();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserData();
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser(session.user);
      
      // Verificar se é admin na tabela admin_users
      const { data: adminCheck } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .single();
      
      setIsAdmin(!!adminCheck);
    }
  };

  const handleProfileClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      router.push('/perfil');
    }
  };

  return (
    <>
      {/* Top Bar - Apenas logo e ações rápidas */}
      <div className="sticky top-0 z-50 bg-[#0D0D0D]/95 backdrop-blur-sm border-b border-[#00FF7F]/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00FF7F] to-[#00CC66] rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#00FF7F]/30">
                <Crown className="w-5 h-5 text-[#0D0D0D]" />
              </div>
              <span className="text-lg font-bold font-poppins bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hidden sm:block">
                Receitas Premium
              </span>
            </Link>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAdmin && (
                <Link 
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-[#252525] text-[#00FF7F] rounded-full font-bold hover:bg-[#2A2A2A] transition-all duration-300 hover:scale-105 text-sm border border-[#00FF7F]/20"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">{user.email}</span>
                </div>
              ) : (
                <Link 
                  href="/login"
                  className="flex items-center gap-2 px-5 py-2 bg-[#00FF7F] text-[#0D0D0D] rounded-full font-bold hover:bg-[#00CC66] transition-all duration-300 hover:scale-105 shadow-lg shadow-[#00FF7F]/30 text-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Entrar</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Inspirado na referência */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-xl border-t border-[#00FF7F]/20 shadow-2xl shadow-black/50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            {/* Home */}
            <Link
              href="/"
              className="flex flex-col items-center gap-1 group relative"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'home' 
                  ? 'bg-[#00FF7F] shadow-lg shadow-[#00FF7F]/50' 
                  : 'bg-transparent group-hover:bg-[#252525]'
              }`}>
                <Home className={`w-5 h-5 transition-colors duration-300 ${
                  activeTab === 'home' ? 'text-[#0D0D0D]' : 'text-gray-400 group-hover:text-[#00FF7F]'
                }`} />
              </div>
              <span className={`text-xs font-semibold transition-colors duration-300 ${
                activeTab === 'home' ? 'text-[#00FF7F]' : 'text-gray-500 group-hover:text-gray-300'
              }`}>
                Início
              </span>
              {activeTab === 'home' && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00FF7F] rounded-full animate-pulse" />
              )}
            </Link>

            {/* Search */}
            <Link
              href="/buscar"
              className="flex flex-col items-center gap-1 group relative"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'search' 
                  ? 'bg-[#00FF7F] shadow-lg shadow-[#00FF7F]/50' 
                  : 'bg-transparent group-hover:bg-[#252525]'
              }`}>
                <Search className={`w-5 h-5 transition-colors duration-300 ${
                  activeTab === 'search' ? 'text-[#0D0D0D]' : 'text-gray-400 group-hover:text-[#00FF7F]'
                }`} />
              </div>
              <span className={`text-xs font-semibold transition-colors duration-300 ${
                activeTab === 'search' ? 'text-[#00FF7F]' : 'text-gray-500 group-hover:text-gray-300'
              }`}>
                Buscar
              </span>
              {activeTab === 'search' && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00FF7F] rounded-full animate-pulse" />
              )}
            </Link>

            {/* Admin (apenas para admins) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex flex-col items-center gap-1 group relative"
              >
                <div className={`p-3 rounded-2xl transition-all duration-300 ${
                  activeTab === 'admin' 
                    ? 'bg-[#00FF7F] shadow-lg shadow-[#00FF7F]/50' 
                    : 'bg-transparent group-hover:bg-[#252525]'
                }`}>
                  <Shield className={`w-5 h-5 transition-colors duration-300 ${
                    activeTab === 'admin' ? 'text-[#0D0D0D]' : 'text-gray-400 group-hover:text-[#00FF7F]'
                  }`} />
                </div>
                <span className={`text-xs font-semibold transition-colors duration-300 ${
                  activeTab === 'admin' ? 'text-[#00FF7F]' : 'text-gray-500 group-hover:text-gray-300'
                }`}>
                  Admin
                </span>
                {activeTab === 'admin' && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00FF7F] rounded-full animate-pulse" />
                )}
              </Link>
            )}

            {/* Favorites */}
            <Link
              href="/favoritos"
              className="flex flex-col items-center gap-1 group relative"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'favorites' 
                  ? 'bg-[#00FF7F] shadow-lg shadow-[#00FF7F]/50' 
                  : 'bg-transparent group-hover:bg-[#252525]'
              }`}>
                <Heart className={`w-5 h-5 transition-colors duration-300 ${
                  activeTab === 'favorites' ? 'text-[#0D0D0D]' : 'text-gray-400 group-hover:text-[#00FF7F]'
                }`} />
              </div>
              <span className={`text-xs font-semibold transition-colors duration-300 ${
                activeTab === 'favorites' ? 'text-[#00FF7F]' : 'text-gray-500 group-hover:text-gray-300'
              }`}>
                Favoritos
              </span>
              {activeTab === 'favorites' && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00FF7F] rounded-full animate-pulse" />
              )}
            </Link>

            {/* Profile */}
            <button
              onClick={handleProfileClick}
              className="flex flex-col items-center gap-1 group relative"
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${
                activeTab === 'profile' 
                  ? 'bg-[#00FF7F] shadow-lg shadow-[#00FF7F]/50' 
                  : 'bg-transparent group-hover:bg-[#252525]'
              }`}>
                <User className={`w-5 h-5 transition-colors duration-300 ${
                  activeTab === 'profile' ? 'text-[#0D0D0D]' : 'text-gray-400 group-hover:text-[#00FF7F]'
                }`} />
              </div>
              <span className={`text-xs font-semibold transition-colors duration-300 ${
                activeTab === 'profile' ? 'text-[#00FF7F]' : 'text-gray-500 group-hover:text-gray-300'
              }`}>
                Perfil
              </span>
              {activeTab === 'profile' && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#00FF7F] rounded-full animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
