import { motion } from "framer-motion";
import { PageTransition } from "@/components/ui/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useThemeContext } from "@/context/ThemeContext";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Palette, Accessibility, Bell, RotateCcw, Sun, Moon, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fontScaleOptions = [
  { value: 0.85, label: "Small" },
  { value: 1, label: "Default" },
  { value: 1.15, label: "Large" },
  { value: 1.3, label: "Extra Large" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useThemeContext();
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const { toast } = useToast();

  const handleReset = () => {
    resetSettings();
    setTheme("dark");
    toast({ title: "Settings Reset", description: "All preferences restored to defaults." });
  };

  return (
    <PageTransition>
      <div className="container py-8 md:py-12 max-w-3xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">Configure your platform preferences.</p>
        </motion.div>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-primary" aria-hidden="true" />
              Theme Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {([
                { value: "light" as const, icon: Sun, label: "Light" },
                { value: "dark" as const, icon: Moon, label: "Dark" },
                { value: "system" as const, icon: Monitor, label: "System" },
              ]).map((t) => (
                <Button
                  key={t.value}
                  variant={theme === t.value ? "default" : "outline"}
                  onClick={() => setTheme(t.value)}
                  className="gap-2"
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Accessibility className="h-5 w-5 text-violet-500" aria-hidden="true" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <Switch id="high-contrast" checked={settings.highContrast} onCheckedChange={(v) => updateSetting("highContrast", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <Switch id="reduced-motion" checked={settings.reducedMotion} onCheckedChange={(v) => updateSetting("reducedMotion", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="animations">Animations Enabled</Label>
              <Switch id="animations" checked={settings.animationsEnabled} onCheckedChange={(v) => updateSetting("animationsEnabled", v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="focus-outlines">Focus Outlines Visible</Label>
              <Switch id="focus-outlines" checked={settings.focusOutlines} onCheckedChange={(v) => updateSetting("focusOutlines", v)} />
            </div>
            <div className="space-y-2">
              <Label>Font Scaling</Label>
              <div className="flex gap-2 flex-wrap">
                {fontScaleOptions.map((opt) => (
                  <Button key={opt.value} variant={settings.fontScale === opt.value ? "default" : "outline"} size="sm" onClick={() => updateSetting("fontScale", opt.value)}>
                    {opt.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Current: {(settings.fontScale * 100).toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-amber-500" aria-hidden="true" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch id="notifications" checked={settings.notifications} onCheckedChange={(v) => updateSetting("notifications", v)} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Receive alerts when simulations complete or errors occur.</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <RotateCcw className="h-5 w-5 text-destructive" aria-hidden="true" />
              Reset Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">This will reset all settings, theme, and accessibility preferences to their default values.</p>
            <Button variant="destructive" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset All Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
