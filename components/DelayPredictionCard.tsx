'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, CheckCircle, Clock, Info, Brain, RefreshCw } from 'lucide-react'

interface Prediction {
  prediction: string
  estimatedDelay: string
  confidence: string
  reason: string
  advice: string
}

interface Props {
  routeId: string
  busId: string
}

const predictionConfig = {
  'On Time': {
    color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    icon: CheckCircle,
    border: 'border-l-emerald-500',
    glow: 'shadow-emerald-500/10',
  },
  'Minor Delay': {
    color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    icon: Clock,
    border: 'border-l-yellow-400',
    glow: 'shadow-yellow-500/10',
  },
  'Moderate Delay': {
    color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    icon: AlertTriangle,
    border: 'border-l-orange-500',
    glow: 'shadow-orange-500/10',
  },
  'Severe Delay': {
    color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    icon: AlertTriangle,
    border: 'border-l-rose-500',
    glow: 'shadow-rose-500/10',
  },
}

export default function DelayPredictionCard({ routeId, busId }: Props) {
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [generatedAt, setGeneratedAt] = useState('')

  const fetchPrediction = () => {
    if (!routeId || !busId) return
    setLoading(true)
    setError(false)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const scheduledDeparture = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    fetch('/api/predict-delay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routeId, busId, dayOfWeek, scheduledDeparture }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.prediction) {
          setPrediction(data.prediction)
          setGeneratedAt(
            now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) +
            ', ' +
            now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          )
        } else {
          setError(true)
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPrediction()
  }, [routeId, busId])

  if (loading) {
    return (
      <div className="mt-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Brain size={14} className="text-indigo-400 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            AI Analyzing Route Data...
          </span>
        </div>
        <Skeleton className="h-4 w-40 bg-slate-800" />
        <Skeleton className="h-3 w-full bg-slate-800" />
        <Skeleton className="h-3 w-full bg-slate-800" />
        <Skeleton className="h-3 w-3/4 bg-slate-800" />
      </div>
    )
  }

  if (error || !prediction) {
    return (
      <div className="mt-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center gap-2 text-slate-500 text-sm">
        <Info size={14} />
        <span>Prediction unavailable — RAG knowledge base may need indexing.</span>
      </div>
    )
  }

  const config =
    predictionConfig[prediction.prediction as keyof typeof predictionConfig]
    || predictionConfig['On Time']

  const Icon = config.icon

  return (
    <div className={`mt-3 p-5 rounded-2xl border-l-4 bg-[#020617]/60 backdrop-blur-md border border-r-white/5 border-y-white/5 ${config.border} shadow-2xl ${config.glow} transition-all duration-300`}>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            <Brain size={16} className="text-indigo-400" />
          </div>
          <div>
            <span className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-1">
              Neural Precision Engine
            </span>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">
              AI Delay Analysis
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${config.color}`}>
            {prediction.prediction}
          </Badge>
          {prediction.estimatedDelay !== '0' && prediction.estimatedDelay !== '0 minutes' && (
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
               <Clock size={12} className="text-slate-500" />
               <span className="text-xs font-black text-slate-100 uppercase tracking-tighter">
                 {prediction.estimatedDelay}
               </span>
            </div>
          )}
        </div>
      </div>

      {/* Reason — detailed, multi-line */}
      <p className="text-xs text-slate-300 font-medium leading-relaxed mb-3">
        {prediction.reason}
      </p>

      {/* Advice — tactical gold highlight */}
      <div className="text-xs text-yellow-400 font-bold bg-yellow-400/10 p-4 rounded-xl border border-yellow-400/20 leading-relaxed flex gap-3 shadow-[0_0_20px_rgba(250,204,21,0.1)]">
        <span className="text-lg">💡</span>
        <span>{prediction.advice}</span>
      </div>

      {/* Footer: Confidence + Timestamp + Refresh */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-800/40 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Confidence:</span>
            <span className="text-[10px] text-slate-400 font-black">
              {prediction.confidence}
            </span>
          </div>
          {generatedAt && (
            <span className="text-[9px] text-slate-600 font-medium">
              Generated {generatedAt}
            </span>
          )}
        </div>
        <button
          onClick={fetchPrediction}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors group"
          title="Refresh prediction"
        >
          <RefreshCw size={12} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </button>
      </div>

    </div>
  )
}
