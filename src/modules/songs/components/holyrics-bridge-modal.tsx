import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import {
  Tv,
  Radio,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { holyricsBridgeService, BridgeLogEntry } from '../services/holyrics-bridge.service';
import type { HolyricsConfig } from '../types/live-sync.types';

interface HolyricsBridgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HolyricsBridgeModal({ open, onOpenChange }: HolyricsBridgeModalProps) {
  const [config, setConfig] = useState<HolyricsConfig>(holyricsBridgeService.getConfig());
  const [logs, setLogs] = useState<BridgeLogEntry[]>([]);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (open) {
      setConfig(holyricsBridgeService.getConfig());
      const unsubscribe = holyricsBridgeService.subscribeLogs(setLogs);
      return unsubscribe;
    }
  }, [open]);

  const handleSave = () => {
    holyricsBridgeService.saveConfig(config);
    onOpenChange(false);
  };

  const handleToggleEnabled = (checked: boolean) => {
    const updated = { ...config, enabled: checked };
    setConfig(updated);
    holyricsBridgeService.saveConfig(updated);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    holyricsBridgeService.saveConfig(config);
    const result = await holyricsBridgeService.testConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Puente Local de Holyrics</DialogTitle>
              <DialogDescription className="text-xs">
                Sincroniza automáticamente las diapositivas de proyección con Ableton Live.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Switch Principal de Activación */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/30">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="holyrics-enable" className="font-semibold text-sm cursor-pointer">
                  Activar puente en este equipo
                </Label>
                {config.enabled ? (
                  <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-[10px] h-5">
                    Activo
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    Inactivo
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Envía las señales de cambio de estrofa al Holyrics instalado en esta computadora.
              </p>
            </div>
            <Switch
              id="holyrics-enable"
              checked={config.enabled}
              onCheckedChange={handleToggleEnabled}
            />
          </div>

          {/* Configuración de Conexión Local */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="host" className="text-xs">Host / Dirección IP</Label>
              <Input
                id="host"
                placeholder="localhost o 127.0.0.1"
                value={config.host}
                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="port" className="text-xs">Puerto API Server</Label>
              <Input
                id="port"
                type="number"
                placeholder="8091"
                value={config.port}
                onChange={(e) => setConfig({ ...config, port: Number(e.target.value) || 8091 })}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="token" className="text-xs">Token de Autenticación Holyrics</Label>
              <span className="text-[10px] text-muted-foreground">
                (Holyrics &gt; File &gt; Settings &gt; API server &gt; Manage Permissions)
              </span>
            </div>
            <Input
              id="token"
              type="password"
              placeholder="Pega el token generado en Holyrics"
              value={config.token}
              onChange={(e) => setConfig({ ...config, token: e.target.value })}
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Botón de Prueba de Conexión y Estado */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Probar Conexión Local</span>
            </Button>

            {testResult && (
              <div
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  testResult.success ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span className="truncate max-w-[260px]">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Consola de Actividad y Logs en Vivo */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" />
                <span>Registro de Eventos en Tiempo Real</span>
              </div>
              <span className="text-[10px]">{logs.length} eventos</span>
            </div>

            <div className="h-32 rounded-xl bg-black/90 text-zinc-300 font-mono text-[11px] p-2.5 overflow-y-auto space-y-1 border border-zinc-800">
              {logs.length === 0 ? (
                <p className="text-zinc-600 italic">Esperando eventos de sincronización...</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-tight">
                    <span className="text-zinc-500 shrink-0">[{log.timestamp}]</span>
                    <span
                      className={
                        log.type === 'success'
                          ? 'text-emerald-400 font-medium'
                          : log.type === 'error'
                          ? 'text-rose-400 font-medium'
                          : 'text-sky-300'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button size="sm" onClick={handleSave}>
            Guardar Configuración
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
