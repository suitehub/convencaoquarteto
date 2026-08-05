import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle, ShieldCheck, Upload, Keyboard, ExternalLink, FileImage, Search } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [fileScanLoading, setFileScanLoading] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startScanner = async () => {
    setScannerError(null);
    setIsInitializing(true);

    try {
      // First try to request camera permission explicitly via getUserMedia
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Stop track immediately as html5Qrcode will manage stream
          stream.getTracks().forEach(track => track.stop());
        } catch (permErr: any) {
          console.warn('getUserMedia permission denied or error:', permErr);
        }
      }

      const devices = await Html5Qrcode.getCameras();

      if (devices && devices.length > 0) {
        setCameras(devices);
        const backCam = devices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('traseira') || 
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        const initialCamId = backCam ? backCam.id : devices[0].id;
        setSelectedCameraId(initialCamId);

        const html5Qrcode = new Html5Qrcode('qr-camera-stream');
        scannerRef.current = html5Qrcode;

        const config = {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.7);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
        };

        await html5Qrcode.start(
          initialCamId,
          config,
          (decodedText) => {
            if (html5Qrcode && html5Qrcode.isScanning) {
              html5Qrcode.stop().then(() => {
                onScanSuccess(decodedText);
              }).catch(() => {
                onScanSuccess(decodedText);
              });
            } else {
              onScanSuccess(decodedText);
            }
          },
          () => {}
        );
        setIsInitializing(false);
      } else {
        setScannerError('Nenhuma câmera foi identificada no dispositivo.');
        setIsInitializing(false);
      }
    } catch (err: any) {
      console.error('Failed to start camera scanner:', err);
      const errMessage = err?.message || '';
      if (errMessage.toLowerCase().includes('permission') || errMessage.toLowerCase().includes('denied') || errMessage.toLowerCase().includes('notallowed')) {
        setScannerError('Permissão para uso da câmera foi negada. Você pode permitir a câmera no seu navegador, carregar a imagem do QR Code ou digitar o código/ID abaixo.');
      } else {
        setScannerError('Não foi possível iniciar a câmera neste ambiente. Tente abrir em uma nova aba ou use as opções alternativas abaixo.');
      }
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      const timer = setTimeout(() => {
        if (isMounted) startScanner();
      }, 300);

      return () => {
        clearTimeout(timer);
        isMounted = false;
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(console.error);
        }
      };
    }
  }, [isOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileScanLoading(true);
    try {
      const html5Qrcode = scannerRef.current || new Html5Qrcode('qr-camera-stream');
      const decodedText = await html5Qrcode.scanFile(file, true);
      setFileScanLoading(false);
      onScanSuccess(decodedText);
    } catch (err) {
      setFileScanLoading(false);
      alert('Não foi possível reconhecer um QR Code válido nesta imagem. Verifique o arquivo e tente novamente.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
  };

  const handleSwitchCamera = async (newCamId: string) => {
    if (!scannerRef.current) return;
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      setSelectedCameraId(newCamId);
      setIsInitializing(true);

      const config = {
        fps: 10,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.7);
          return { width: qrboxSize, height: qrboxSize };
        },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        newCamId,
        config,
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        () => {}
      );
      setIsInitializing(false);
    } catch (err) {
      console.error('Error switching camera:', err);
      setIsInitializing(false);
    }
  };

  const handleClose = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800 z-10 my-8 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-app-gold/15 border border-app-gold/30 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-app-gold animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                  Scanner de QR Code
                </h3>
                <p className="text-[10px] text-app-gold font-mono uppercase tracking-wider">
                  Credenciamento por Câmera / Imagem
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Fechar Câmera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Camera Viewport Area */}
          <div className="p-6 flex flex-col items-center justify-center relative min-h-[300px] bg-slate-950/60">
            {scannerError ? (
              <div className="text-center p-5 space-y-4 bg-slate-900/90 border border-amber-500/30 rounded-2xl max-w-md w-full">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-200 text-sm">Acesso à Câmera Bloqueado ou Indisponível</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {scannerError}
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => startScanner()}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tentar Novamente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-app-gold" />
                    <span>Enviar Imagem do QR</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Camera Container */}
                <div className="w-full max-w-xs aspect-square bg-slate-900 rounded-2xl overflow-hidden relative border-2 border-app-gold/40 shadow-2xl flex items-center justify-center">
                  <div id="qr-camera-stream" className="w-full h-full object-cover" />

                  {/* Laser Scan Animation Overlay */}
                  {!isInitializing && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                      {/* Corner Targets */}
                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-t-4 border-l-4 border-app-gold rounded-tl" />
                        <div className="w-6 h-6 border-t-4 border-r-4 border-app-gold rounded-tr" />
                      </div>
                      
                      {/* Scanning Line */}
                      <motion.div
                        animate={{ y: [0, 180, 0] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                        className="w-full h-0.5 bg-gradient-to-r from-transparent via-app-gold to-transparent shadow-[0_0_12px_#D4AF37]"
                      />

                      <div className="flex justify-between">
                        <div className="w-6 h-6 border-b-4 border-l-4 border-app-gold rounded-bl" />
                        <div className="w-6 h-6 border-b-4 border-r-4 border-app-gold rounded-br" />
                      </div>
                    </div>
                  )}

                  {isInitializing && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-4 space-y-3">
                      <RefreshCw className="w-8 h-8 text-app-gold animate-spin" />
                      <span className="text-xs font-mono font-medium text-slate-300">
                        Iniciando câmera...
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 font-light mt-3 text-center max-w-xs">
                  Aproxime a câmera do QR Code do participante.
                </p>
              </>
            )}

            {/* Hidden File Input for Image Scan */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Manual ID Search Form Fallback */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-2">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Ou digite/cole o ID ou E-mail do Participante:
            </label>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Keyboard className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ex: PART-123456 ou email@exemplo.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 focus:border-app-gold rounded-xl text-xs text-white placeholder-slate-500 outline-hidden font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="px-4 py-2 bg-app-gold hover:bg-amber-400 text-app-deep font-bold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Validar</span>
              </button>
            </form>
          </div>

          {/* Footer controls */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileImage className="w-4 h-4 text-app-gold" />
              <span>{fileScanLoading ? 'Lendo imagem...' : 'Ler foto de QR'}</span>
            </button>

            {cameras.length > 1 && (
              <div className="flex items-center space-x-2">
                <select
                  value={selectedCameraId || ''}
                  onChange={(e) => handleSwitchCamera(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs py-2 px-3 rounded-xl border border-slate-700 focus:outline-hidden"
                >
                  {cameras.map((c, idx) => (
                    <option key={c.id} value={c.id}>
                      {c.label || `Câmera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleClose}
              className="ml-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

