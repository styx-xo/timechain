import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ViewId } from './lib/types.ts';
import { BlockStreamProvider } from './context/BlockStreamContext.tsx';
import { Header } from './components/Header.tsx';
import { BackgroundFX } from './components/BackgroundFX.tsx';
import { PulseView } from './views/PulseView.tsx';
import { TickView } from './views/TickView.tsx';
import { ThermoView } from './views/ThermoView.tsx';
import { ScaleView } from './views/ScaleView.tsx';
import { UtxoView } from './views/UtxoView.tsx';

const VIEWS: Record<ViewId, React.ComponentType> = {
  pulse: PulseView,
  tick: TickView,
  thermo: ThermoView,
  scale: ScaleView,
  utxo: UtxoView,
};

function App() {
  const [activeView, setActiveView] = useState<ViewId>('pulse');
  const ViewComponent = VIEWS[activeView];

  return (
    <BlockStreamProvider>
      <div className="h-screen overflow-hidden bg-grid scanlines">
        <BackgroundFX />
        <Header activeView={activeView} onViewChange={setActiveView} />

        {/* View area below header */}
        <main className="relative z-10 pt-14 h-screen">
          <div className="responsive-container h-full" style={{ height: 'calc(100vh - 56px)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <ViewComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </BlockStreamProvider>
  );
}

export default App;
