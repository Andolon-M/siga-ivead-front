import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Copy,
  Check,
  Link as LinkIcon,
  Play,
  Search,
} from 'lucide-react';
import { holyricsBridgeService, type BridgeLogEntry } from '../services/holyrics-bridge.service';
import { formatSongForHolyrics } from '../utils/holyrics-formatter';
import type { HolyricsConfig } from '../types/live-sync.types';

interface HolyricsBridgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId?: string | number;
  songTitle?: string;
  songContent?: string;
  artist?: string;
}

export function HolyricsBridgeModal({
  open,
  onOpenChange,
  songId,
  songTitle,
  songContent,
  artist,
}: HolyricsBridgeModalProps) {
  const [config, setConfig] = useState<HolyricsConfig>(holyricsBridgeService.getConfig());
  const [logs, setLogs] = useState<BridgeLogEntry[]>([]);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSong, setCopiedSong] = useState<boolean>(false);
  const [holyricsSongs, setHolyricsSongs] = useState<Array<{ id: string; title: string }>>([]);
  const [isOpeningSong, setIsOpeningSong] = useState<boolean>(false);
  const [songSearchFilter, setSongSearchFilter] = useState<string>('');

  useEffect(() => {
    if (open) {
      setConfig(holyricsBridgeService.getConfig());
      const unsubscribe = holyricsBridgeService.subscribeLogs(setLogs);
      // Cargar lista de canciones de Holyrics si está conectado
      holyricsBridgeService.getHolyricsSongs().then((songs) => {
        if (songs) setHolyricsSongs(songs);
      });
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
    if (result.success) {
      const songs = await holyricsBridgeService.getHolyricsSongs(true);
      setHolyricsSongs(songs);
    }
    setIsTesting(false);
  };

  const matchedSongInfo = useMemo(() => {
    if (!songId) return null;
    return holyricsBridgeService.getMatchedHolyricsSong(String(songId), songTitle, artist);
  }, [songId, songTitle, artist, holyricsSongs, config.songMappings]);

  const handleSelectHolyricsSong = (targetHolyricsId: string) => {
    if (!songId) return;
    holyricsBridgeService.linkSong(String(songId), targetHolyricsId);
    setConfig(holyricsBridgeService.getConfig());
  };

  const handleTestOpenSong = async () => {
    if (!songId) return;
    setIsOpeningSong(true);
    await holyricsBridgeService.openSong(String(songId), songTitle || '');
    setIsOpeningSong(false);
  };

  const filteredHolyricsSongs = useMemo(() => {
    if (!songSearchFilter) return holyricsSongs.slice(0, 50);
    const q = songSearchFilter.toLowerCase();
    return holyricsSongs.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 50);
  }, [holyricsSongs, songSearchFilter]);

  const currentLinkedId = songId ? config.songMappings?.[String(songId)] || '' : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Puente Local de Holyrics</DialogTitle>
              <DialogDescription className="text-xs">
                Sincroniza automáticamente las diapositivas de proyección con Ableton Live y SIGA.
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
                <span className="truncate max-w-[280px]">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Vinculación de Canción en Holyrics */}
          {songTitle && (
            <div className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold text-foreground">
                    Vinculación en Holyrics para: &quot;{songTitle}&quot;
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                  onClick={handleTestOpenSong}
                  disabled={isOpeningSong}
                  title="Abre la canción inmediatamente en la ventana de presentación de Holyrics"
                >
                  <Play className={`h-3 w-3 ${isOpeningSong ? 'animate-spin' : ''}`} />
                  <span>Probar Abrir en Holyrics</span>
                </Button>
              </div>

              {matchedSongInfo ? (
                <div className="flex items-center justify-between bg-background border p-2.5 rounded-lg text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-medium">Asociada con:</span>
                      <span className="font-bold text-foreground">{matchedSongInfo.title}</span>
                      {matchedSongInfo.isManual ? (
                        <Badge variant="default" className="text-[10px] bg-purple-600 py-0 px-1.5">
                          Manual
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-emerald-500/50 text-emerald-600 py-0 px-1.5">
                          Auto ({matchedSongInfo.score} pts)
                        </Badge>
                      )}
                    </div>
                  </div>

                  {currentLinkedId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] text-muted-foreground hover:text-rose-500"
                      onClick={() => handleSelectHolyricsSong('')}
                    >
                      Restablecer a Auto
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400 italic">
                  ⚠️ No se ha detectado coincidencia automática en el catálogo de Holyrics.
                </p>
              )}

              {/* Selector de anulación manual de catálogo */}
              {holyricsSongs.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Cambiar o forzar canción en Holyrics (Opcional):
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Buscar canción en Holyrics..."
                        value={songSearchFilter}
                        onChange={(e) => setSongSearchFilter(e.target.value)}
                        className="h-8 pl-8 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {songSearchFilter && (
                    <div className="max-h-36 overflow-y-auto border rounded-lg bg-background p-1 space-y-0.5">
                      {filteredHolyricsSongs.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-2 italic text-center">
                          No se encontraron canciones con ese nombre en Holyrics
                        </p>
                      ) : (
                        filteredHolyricsSongs.map((hs) => (
                          <button
                            key={hs.id}
                            type="button"
                            onClick={() => {
                              handleSelectHolyricsSong(hs.id);
                              setSongSearchFilter('');
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between hover:bg-purple-500/10 transition-colors ${
                              currentLinkedId === hs.id ? 'bg-purple-500/15 font-bold text-purple-700 dark:text-purple-300' : ''
                            }`}
                          >
                            <span className="truncate">{hs.title}</span>
                            <span className="text-[10px] font-mono opacity-60">ID: {hs.id}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Exportación rápida de la canción actual */}
          {songContent && (
            <div className="flex items-center justify-between p-3 rounded-xl border bg-purple-500/5 border-purple-500/20">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                  {songTitle ? `Letra de "${songTitle}"` : 'Letra de la canción actual'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Copia las diapositivas con etiquetas ##(verso 1.1), ##(coro 1.1) para pegar en Holyrics.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 text-xs px-3 gap-1.5 font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 shrink-0"
                onClick={() => {
                  const formatted = formatSongForHolyrics(songContent);
                  navigator.clipboard.writeText(formatted);
                  setCopiedSong(true);
                  setTimeout(() => setCopiedSong(false), 2500);
                }}
              >
                {copiedSong ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar para Holyrics</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Consola de Actividad y Logs en Vivo */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" />
                <span>Registro de Eventos en Tiempo Real</span>
              </div>
              <span className="text-[10px]">{logs.length} eventos</span>
            </div>

            <div className="h-44 max-h-56 rounded-xl bg-black/90 text-zinc-300 font-mono text-[11px] p-3 overflow-y-auto overflow-x-auto space-y-2 border border-zinc-800 scrollbar-thin">
              {logs.length === 0 ? (
                <p className="text-zinc-600 italic">Esperando eventos de sincronización...</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed whitespace-pre-wrap break-words min-w-full">
                    <span className="text-zinc-500 shrink-0 select-none">[{log.timestamp}]</span>
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
