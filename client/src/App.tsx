import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { messages, sample } from './content/messages';
import { useProfileStore } from './state/profileStore';

const SnifferPage = lazy(() => import('./pages/SnifferPage'));
const ExchangePage = lazy(() => import('./pages/ExchangePage'));
const BigCluePage = lazy(() => import('./pages/BigCluePage'));

function ChosenRoute({ children }: { children: ReactNode }) {
  const unlocked = useProfileStore((state) => state.profile?.modeUnlocked);
  return unlocked ? children : <Navigate to="/" replace/>;
}

function ProfileGate() {
  const { profile, loading, error, load } = useProfileStore();
  useEffect(() => { void load(); }, [load]);
  if (loading) return <div className="full-loader"><div className="orbital-loader"/><strong>{sample(messages.loadingMessages)}</strong><span>ANONYMOUS CLUE SEAL IS BEING LOCATED</span></div>;
  if (error || !profile) return <div className="full-loader error-state"><strong>CLUE NETWORK DISCONNECTED</strong><span>{error}</span><button onClick={() => void load()}>RE-SUBMIT CONNECTIVITY</button></div>;
  return <Routes><Route element={<AppLayout/>}><Route index element={<HomePage/>}/><Route path="sniffer" element={<ChosenRoute><Suspense fallback={<div className="route-loader">CALIBRATING WET RADAR...</div>}><SnifferPage/></Suspense></ChosenRoute>}/><Route path="exchange" element={<ChosenRoute><Suspense fallback={<div className="route-loader">PREPARING EXCHANGE...</div>}><ExchangePage/></Suspense></ChosenRoute>}/><Route path="big-clue" element={<ChosenRoute><Suspense fallback={<div className="route-loader">COUNTING TO 45,000,000...</div>}><BigCluePage/></Suspense></ChosenRoute>}/><Route path="*" element={<NotFoundPage/>}/></Route></Routes>;
}

export default function App() { return <BrowserRouter><ProfileGate/></BrowserRouter>; }
