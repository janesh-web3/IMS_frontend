import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotificationSound, type SoundType } from "@/contexts/NotificationSoundContext";
import { Volume2 } from "lucide-react";

const soundLabels: Record<SoundType, string> = {
  default: 'Default Notifications',
  message: 'New Messages',
  alert: 'Alerts',
  success: 'Success Notifications',
  error: 'Error Messages'
};

export const NotificationSoundSettings = () => {
  const { 
    isSoundEnabled, 
    soundSettings, 
    toggleSound, 
    updateSoundSetting, 
    playNotificationSound 
  } = useNotificationSound();

  const handleTestSound = (type: SoundType = 'default') => {
    playNotificationSound(type);
  };

  const handleVolumeChange = (type: SoundType, value: number[]) => {
    updateSoundSetting(type, { volume: value[0] / 100 });
  };

  const toggleSoundType = (type: SoundType) => {
    const currentSettings = soundSettings[type];
    if (currentSettings) {
      updateSoundSetting(type, { enabled: !currentSettings.enabled });
    }
  };

  const getSoundSetting = (type: SoundType) => {
    return soundSettings[type] || { enabled: true, volume: 0.7 };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Sounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notification-sound">Enable all notification sounds</Label>
                <p className="text-sm text-muted-foreground">
                  {isSoundEnabled ? "Sounds are enabled" : "All notification sounds are disabled"}
                </p>
              </div>
              <Switch
                id="notification-sound"
                checked={isSoundEnabled}
                onCheckedChange={toggleSound}
              />
            </div>

            {isSoundEnabled && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sound Preferences</h4>
                  <p className="text-sm text-muted-foreground">
                    Customize sounds for different notification types
                  </p>
                </div>

                <div className="space-y-6">
                  {(Object.keys(soundSettings) as SoundType[]).map((type) => (
                    <div key={type} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTestSound(type as SoundType)}
                            className="h-8 w-8"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                          <Label htmlFor={`${type}-sound`} className="text-sm font-medium">
                            {soundLabels[type as SoundType] || type}
                          </Label>
                        </div>
                        <Switch
                            id={`${type}-sound`}
                            checked={getSoundSetting(type as SoundType).enabled}
                            onCheckedChange={() => toggleSoundType(type as SoundType)}
                          />
                      </div>
                      
                      {getSoundSetting(type as SoundType).enabled && (
                        <div className="pl-12 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`${type}-volume`} className="text-xs text-muted-foreground">
                              Volume
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((soundSettings[type]?.volume ?? 0.7) * 100)}%
                            </span>
                          </div>
<Slider
                            id={`${type}-volume`}
                            value={[getSoundSetting(type as SoundType).volume * 100]}
                            onValueChange={(value) => handleVolumeChange(type as SoundType, value)}
                            min={0}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSoundSettings;
