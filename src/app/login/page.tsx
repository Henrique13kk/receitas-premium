'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, ChefHat } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se já está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/');
      }
      setLoading(false);
    });

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00FF7F]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00FF7F] to-[#00CC66] rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-[#00FF7F]/40">
              <Crown className="w-7 h-7 text-[#0D0D0D]" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold font-poppins bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Receitas Premium
          </h1>
          <p className="text-gray-400 text-sm">
            Entre para acessar receitas exclusivas
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#1A1A1A]/80 backdrop-blur-sm rounded-3xl border border-[#00FF7F]/20 p-8 shadow-2xl shadow-black/50">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#00FF7F',
                    brandAccent: '#00CC66',
                    brandButtonText: '#0D0D0D',
                    defaultButtonBackground: '#1A1A1A',
                    defaultButtonBackgroundHover: '#252525',
                    defaultButtonBorder: '#00FF7F33',
                    defaultButtonText: '#FFFFFF',
                    dividerBackground: '#00FF7F33',
                    inputBackground: '#0D0D0D',
                    inputBorder: '#00FF7F33',
                    inputBorderHover: '#00FF7F66',
                    inputBorderFocus: '#00FF7F',
                    inputText: '#FFFFFF',
                    inputLabelText: '#CCCCCC',
                    inputPlaceholder: '#666666',
                  },
                  space: {
                    inputPadding: '12px',
                    buttonPadding: '12px 24px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '16px',
                    buttonBorderRadius: '16px',
                    inputBorderRadius: '12px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '13px',
                    baseButtonSize: '14px',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'font-semibold',
                input: 'font-inter',
                label: 'font-inter font-medium',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Crie uma senha',
                  button_label: 'Criar conta',
                  loading_button_label: 'Criando conta...',
                  social_provider_text: 'Cadastrar com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se',
                },
                forgotten_password: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  button_label: 'Enviar instruções',
                  loading_button_label: 'Enviando...',
                  link_text: 'Esqueceu sua senha?',
                },
              },
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/`}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-[#00FF7F] transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <ChefHat className="w-4 h-4" />
            <span>Voltar para receitas</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
