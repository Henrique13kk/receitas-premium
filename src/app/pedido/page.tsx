"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, Clock, MapPin, Phone, CreditCard, Package, Truck, Home } from "lucide-react"
import Link from "next/link"

interface OrderData {
  id: string
  items: any[]
  customer: {
    name: string
    phone: string
    paymentMethod: 'pix' | 'card' | 'cash'
    changeAmount?: string
    address: {
      street: string
      number: string
      complement: string
      neighborhood: string
      city: string
      cep: string
      reference: string
    }
  }
  delivery: {
    option: 'delivery' | 'pickup'
    fee: number
  }
  totals: {
    subtotal: number
    deliveryFee: number
    total: number
  }
  estimatedTime: string
  status: string
  timestamp: string
}

export default function PedidoPage() {
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [currentStatus, setCurrentStatus] = useState('confirmed')
  const [estimatedDelivery, setEstimatedDelivery] = useState('')

  useEffect(() => {
    // Recuperar dados do pedido do localStorage
    const savedOrder = localStorage.getItem('currentOrder')
    if (savedOrder) {
      const order = JSON.parse(savedOrder)
      setOrderData(order)
      
      // Calcular tempo estimado de entrega
      const orderTime = new Date(order.timestamp)
      const estimatedMinutes = order.delivery.option === 'delivery' ? 50 : 30
      const deliveryTime = new Date(orderTime.getTime() + estimatedMinutes * 60000)
      setEstimatedDelivery(deliveryTime.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }))

      // Simular progresso do pedido
      setTimeout(() => setCurrentStatus('preparing'), 3000)
      setTimeout(() => setCurrentStatus('ready'), 15000)
      if (order.delivery.option === 'delivery') {
        setTimeout(() => setCurrentStatus('delivering'), 25000)
        setTimeout(() => setCurrentStatus('delivered'), 45000)
      }
    }
  }, [])

  const getStatusSteps = () => {
    const isDelivery = orderData?.delivery.option === 'delivery'
    
    const steps = [
      { 
        id: 'confirmed', 
        title: 'Pedido Confirmado', 
        description: 'Seu pedido foi recebido',
        icon: CheckCircle 
      },
      { 
        id: 'preparing', 
        title: 'Preparando', 
        description: 'Estamos preparando seu pedido',
        icon: Package 
      },
      { 
        id: 'ready', 
        title: isDelivery ? 'Saiu para Entrega' : 'Pronto para Retirada', 
        description: isDelivery ? 'Seu pedido está a caminho' : 'Pode vir buscar no balcão',
        icon: isDelivery ? Truck : Home 
      }
    ]

    if (isDelivery) {
      steps.push({
        id: 'delivered',
        title: 'Entregue',
        description: 'Pedido entregue com sucesso',
        icon: CheckCircle
      })
    }

    return steps
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'pix': return 'PIX'
      case 'card': return 'Cartão'
      case 'cash': return 'Dinheiro'
      default: return method
    }
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pedido não encontrado</h2>
          <p className="text-gray-600 mb-6">Não foi possível encontrar os dados do seu pedido.</p>
          <Link 
            href="/"
            className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
          >
            Voltar ao Cardápio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/"
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-geist-sans">
                Pedido Confirmado!
              </h1>
              <p className="text-lg opacity-90">
                Pedido #{orderData.id.slice(-6)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status do Pedido */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Status do Pedido</h2>
          
          <div className="space-y-6">
            {getStatusSteps().map((step, index) => {
              const isActive = step.id === currentStatus
              const isCompleted = getStatusSteps().findIndex(s => s.id === currentStatus) > index
              const Icon = step.icon
              
              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500' : isActive ? 'bg-amber-500' : 'bg-gray-200'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      isCompleted || isActive ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      isCompleted || isActive ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      isCompleted || isActive ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {isActive && (
                    <div className="flex-shrink-0">
                      <div className="animate-pulse bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        Em andamento
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Tempo Estimado */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">
                Tempo estimado: {orderData.estimatedTime}
              </span>
              {estimatedDelivery && (
                <span className="text-sm">
                  (até às {estimatedDelivery})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detalhes do Pedido */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Itens do Pedido</h3>
            
            <div className="space-y-4 mb-6">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                    
                    {item.extras.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Adicionais:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.extras.map((extra: string, i: number) => (
                            <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              + {extra}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.removedIngredients.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Sem:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.removedIngredients.map((ingredient: string, i: number) => (
                            <span key={i} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                              - {ingredient}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.observations && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Observações:</p>
                        <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                          {item.observations}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-800">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo de Valores */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">R$ {orderData.totals.subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              
              {orderData.delivery.option === 'delivery' && orderData.totals.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de entrega</span>
                  <span className="font-semibold">R$ {orderData.totals.deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span className="text-gray-800">Total</span>
                <span className="text-amber-600">R$ {orderData.totals.total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          {/* Informações de Entrega/Retirada */}
          <div className="space-y-6">
            {/* Dados do Cliente */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-amber-600" />
                Seus Dados
              </h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold text-gray-800">{orderData.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-semibold text-gray-800">{orderData.customer.phone}</p>
                </div>
              </div>
            </div>

            {/* Endereço de Entrega ou Retirada */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                {orderData.delivery.option === 'delivery' ? 'Endereço de Entrega' : 'Retirada no Balcão'}
              </h3>
              
              {orderData.delivery.option === 'delivery' ? (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">
                    {orderData.customer.address.street}, {orderData.customer.address.number}
                  </p>
                  {orderData.customer.address.complement && (
                    <p className="text-gray-600">{orderData.customer.address.complement}</p>
                  )}
                  <p className="text-gray-600">
                    {orderData.customer.address.neighborhood} - {orderData.customer.address.city}
                  </p>
                  <p className="text-gray-600">CEP: {orderData.customer.address.cep}</p>
                  {orderData.customer.address.reference && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Referência:</strong> {orderData.customer.address.reference}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-semibold text-gray-800">Sabor & Arte</p>
                  <p className="text-gray-600">Rua das Delícias, 123 - Centro</p>
                  <p className="text-gray-600">Tel: (11) 9999-8888</p>
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Lembre-se:</strong> Apresente este pedido no balcão para retirada
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Forma de Pagamento */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                Forma de Pagamento
              </h3>
              
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">
                  {getPaymentMethodText(orderData.customer.paymentMethod)}
                </p>
                
                {orderData.customer.paymentMethod === 'cash' && orderData.customer.changeAmount && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Troco para:</strong> {orderData.customer.changeAmount}
                    </p>
                  </div>
                )}
                
                {orderData.customer.paymentMethod === 'pix' && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>PIX:</strong> Chave será enviada via WhatsApp quando o pedido estiver pronto
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 text-center"
          >
            Fazer Novo Pedido
          </Link>
          
          <a 
            href={`https://wa.me/5511999998888?text=Olá! Gostaria de saber sobre meu pedido #${orderData.id.slice(-6)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition-all duration-300 text-center"
          >
            Falar no WhatsApp
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4 mt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-2 font-geist-sans">Sabor & Arte</h3>
          <p className="text-gray-300 text-sm">
            Rua das Delícias, 123 - Centro | Tel: (11) 9999-8888
          </p>
        </div>
      </footer>
    </div>
  )
}