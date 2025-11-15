'use client'

import { useState } from 'react'

interface InteractiveDemoProps {
  nicho: string
  tipo: string
}

export function InteractiveDemo({ nicho, tipo }: InteractiveDemoProps) {
  const [demoState, setDemoState] = useState<any>({
    step: 0,
    data: {},
  })

  const demos = {
    automacao: {
      title: 'Simulador de Automação de Processos',
      color: 'purple',
      steps: [
        {
          title: 'Processo Manual Atual',
          description: 'Veja quanto tempo você perde hoje',
          demo: <AutomacaoManualDemo state={demoState} setState={setDemoState} />,
        },
        {
          title: 'Com Automação',
          description: 'Veja a transformação',
          demo: <AutomacaoAutomaticaDemo state={demoState} />,
        },
      ],
    },
    ecommerce: {
      title: 'Gestão de Pedidos Automatizada',
      color: 'blue',
      steps: [
        {
          title: 'Processo Manual',
          description: 'Gestão manual de pedidos',
          demo: <EcommerceManualDemo state={demoState} setState={setDemoState} />,
        },
        {
          title: 'Sistema Automatizado',
          description: 'Processamento instantâneo',
          demo: <EcommerceAutoDemo state={demoState} />,
        },
      ],
    },
    saude: {
      title: 'Agendamento Médico Inteligente',
      color: 'teal',
      steps: [
        {
          title: 'Agendamento Tradicional',
          description: 'Ligações e confirmações manuais',
          demo: <SaudeManualDemo state={demoState} setState={setDemoState} />,
        },
        {
          title: 'Sistema Automatizado',
          description: 'IA gerencia tudo',
          demo: <SaudeAutoDemo state={demoState} />,
        },
      ],
    },
    financas: {
      title: 'Análise Financeira em Tempo Real',
      color: 'green',
      steps: [
        {
          title: 'Planilhas Manuais',
          description: 'Horas de trabalho repetitivo',
          demo: <FinancasManualDemo state={demoState} setState={setDemoState} />,
        },
        {
          title: 'Dashboard Automatizado',
          description: 'Insights instantâneos',
          demo: <FinancasAutoDemo state={demoState} />,
        },
      ],
    },
    marketing: {
      title: 'Campanhas com IA',
      color: 'pink',
      steps: [
        {
          title: 'Campanhas Manuais',
          description: 'Criação e envio manual',
          demo: <MarketingManualDemo state={demoState} setState={setDemoState} />,
        },
        {
          title: 'IA Marketing',
          description: 'Automação completa',
          demo: <MarketingAutoDemo state={demoState} />,
        },
      ],
    },
  }

  const currentDemo = demos[nicho as keyof typeof demos] || demos.automacao
  const currentStep = currentDemo.steps[demoState.step] || currentDemo.steps[0]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              {currentDemo.title}
            </h2>
            <p className="text-xl text-gray-600">
              Experimente na prática como funciona
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              {currentDemo.steps.map((step, idx) => (
                <div key={idx} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      demoState.step === idx
                        ? `bg-${currentDemo.color}-600 text-white scale-110`
                        : demoState.step > idx
                        ? `bg-${currentDemo.color}-200 text-${currentDemo.color}-700`
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < currentDemo.steps.length - 1 && (
                    <div className="w-24 h-1 bg-gray-200 mx-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-2 text-gray-900">
              {currentStep.title}
            </h3>
            <p className="text-gray-600 mb-6">{currentStep.description}</p>
            
            <div className="min-h-[400px]">{currentStep.demo}</div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => setDemoState({ ...demoState, step: Math.max(0, demoState.step - 1) })}
                disabled={demoState.step === 0}
                className="px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                ← Anterior
              </button>
              
              {demoState.step < currentDemo.steps.length - 1 ? (
                <button
                  onClick={() => setDemoState({ ...demoState, step: demoState.step + 1 })}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-${currentDemo.color}-500 to-${currentDemo.color}-600 hover:from-${currentDemo.color}-600 hover:to-${currentDemo.color}-700 text-white shadow-lg`}
                >
                  Próximo →
                </button>
              ) : (
                <a
                  href="#contato"
                  className={`px-8 py-3 rounded-lg font-semibold transition-all bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg`}
                >
                  Quero Implementar!
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Demo Components por Nicho

function AutomacaoManualDemo({ state, setState }: any) {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Processar pedido #1234', time: 0, total: 15 },
    { id: 2, name: 'Enviar e-mail confirmação', time: 0, total: 5 },
    { id: 3, name: 'Atualizar planilha', time: 0, total: 10 },
  ])

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="font-semibold text-red-800">Tempo total gasto: ~30 minutos por pedido</p>
      </div>
      
      {tasks.map((task) => (
        <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="font-medium">{task.name}</span>
            <span className="text-gray-600">{task.total} min</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AutomacaoAutomaticaDemo({ state }: any) {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
        <p className="font-semibold text-green-800">Tempo total: 2 segundos (automático)</p>
        <p className="text-green-600 text-sm mt-1">Redução de 99.9% no tempo</p>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg">Sistema Processando...</p>
            <p className="text-sm text-gray-600">IA executando todas as tarefas</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Pedido processado</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>E-mail enviado automaticamente</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Banco de dados atualizado</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Demos simplificados para outros nichos (seguem o mesmo padrão)
function EcommerceManualDemo({ state, setState }: any) {
  return <AutomacaoManualDemo state={state} setState={setState} />
}

function EcommerceAutoDemo({ state }: any) {
  return <AutomacaoAutomaticaDemo state={state} />
}

function SaudeManualDemo({ state, setState }: any) {
  return <AutomacaoManualDemo state={state} setState={setState} />
}

function SaudeAutoDemo({ state }: any) {
  return <AutomacaoAutomaticaDemo state={state} />
}

function FinancasManualDemo({ state, setState }: any) {
  return <AutomacaoManualDemo state={state} setState={setState} />
}

function FinancasAutoDemo({ state }: any) {
  return <AutomacaoAutomaticaDemo state={state} />
}

function MarketingManualDemo({ state, setState }: any) {
  return <AutomacaoManualDemo state={state} setState={setState} />
}

function MarketingAutoDemo({ state }: any) {
  return <AutomacaoAutomaticaDemo state={state} />
}
