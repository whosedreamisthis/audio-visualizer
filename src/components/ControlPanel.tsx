import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EqPanel } from '@/components/panels/EqPanel'
import { MixerPanel } from '@/components/panels/MixerPanel'
import { PresetsPanel } from '@/components/panels/PresetsPanel'
import { VisualPanel } from '@/components/panels/VisualPanel'
import { useUiStore, type ControlTab } from '@/store/uiStore'

const TABS: { id: ControlTab; label: string; panel: React.ReactNode }[] = [
  { id: 'mixer', label: 'Mixer', panel: <MixerPanel /> },
  { id: 'eq', label: 'EQ', panel: <EqPanel /> },
  { id: 'visual', label: 'Visual', panel: <VisualPanel /> },
  { id: 'presets', label: 'Presets', panel: <PresetsPanel /> },
]

const isControlTab = (value: unknown): value is ControlTab =>
  TABS.some((tab) => tab.id === value)

export function ControlPanel() {
  const activeTab = useUiStore((s) => s.activeTab)
  const setActiveTab = useUiStore((s) => s.setActiveTab)

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        if (isControlTab(value)) setActiveTab(value)
      }}
      className="h-full min-h-0 gap-4"
    >
      <TabsList className="h-11! w-full">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="min-h-9">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="min-h-0 overflow-y-auto px-0.5 pb-4"
        >
          {tab.panel}
        </TabsContent>
      ))}
    </Tabs>
  )
}
