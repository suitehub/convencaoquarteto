/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Info, 
  Sparkles,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Participant, WhatsAppTestMessage, WhatsAppSendTestResponse } from '../types';
import { 
  checkWhatsAppConfigStatus, 
  sendWhatsAppTest, 
  WhatsAppConfigStatus 
} from '../services/whatsappService';
import { subscribeWhatsAppTestMessages } from '../firebase';

interface WhatsAppTestModuleProps {
  participants: Participant[];
}

export default function WhatsAppTestModule({ participants }: WhatsAppTestModuleProps) {
  // Config status from backend
  const [configStatus, setConfigStatus] = useState<WhatsAppConfigStatus | null>(null);
  const [checkingConfig, setCheckingConfig] = useState(false);

  // Form State
  const [phone, setPhone] = useState('');
  const [templateName, setTemplateName] = useState('hello_world');
  const [languageCode, setLanguageCode] = useState('pt_BR');
  const [parameters, setParameters] = useState<string[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState('');

  // Processing & Confirmation States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<WhatsAppSendTestResponse | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Firestore Test History State
  const [testHistory, setTestHistory] = useState<WhatsAppTestMessage[]>([]);

  // Load config status on mount
  const refreshConfig = async () => {
    setCheckingConfig(true);
    try {
      const status = await checkWhatsAppConfigStatus();
      setConfigStatus(status);
    } finally {
      setCheckingConfig(false);
    }
  };

  useEffect(() => {
    refreshConfig();

    // Subscribe to Firestore test history in real-time
    const unsubscribe = subscribeWhatsAppTestMessages((messages) => {
      setTestHistory(messages);
    });

    return () => unsubscribe();
  }, []);

  // Quick select participant
  const handleSelectParticipant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedParticipantId(pId);
    if (!pId) return;

    const found = participants.find((p) => p.id === pId);
    if (found && found.phone) {
      // Clean and set phone
      let digits = found.phone.replace(/\D/g, '');
      if (digits.length === 10 || digits.length === 11) {
        digits = '55' + digits;
      }
      setPhone(digits);

      // If parameters exist, populate with participant name
      if (parameters.length > 0) {
        const updated = [...parameters];
        updated[0] = found.name;
        setParameters(updated);
      }
    }
  };

  // Add parameter
  const handleAddParam = () => {
    setParameters((prev) => [...prev, '']);
  };

  // Update parameter
  const handleUpdateParam = (index: number, val: string) => {
    setParameters((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  // Remove parameter
  const handleRemoveParam = (index: number) => {
    setParameters((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation prior to opening confirmation
  const handleValidateAndOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      setFormError('Por favor, informe o número de telefone do destinatário.');
      return;
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setFormError(`O número informado possui ${cleanPhone.length} dígitos. O padrão internacional E.164 exige entre 10 e 15 dígitos (ex: 5511999999999).`);
      return;
    }

    const cleanTemplate = templateName.trim().toLowerCase();
    if (!cleanTemplate || !/^[a-z0-9_]+$/.test(cleanTemplate)) {
      setFormError('O nome do template deve conter apenas letras minúsculas, números e sublinhados (ex: confirmacao_inscricao).');
      return;
    }

    if (!languageCode.trim()) {
      setFormError('Informe o código de idioma do template (ex: pt_BR).');
      return;
    }

    // Check parameters if template is not hello_world
    if (cleanTemplate !== 'hello_world') {
      const hasEmptyParams = parameters.some((p) => !p.trim());
      if (hasEmptyParams) {
        setFormError('Preencha todos os parâmetros adicionados ou remova os campos vazios.');
        return;
      }
    }

    setIsConfirmOpen(true);
  };

  // Send test message
  const handleConfirmSend = async () => {
    setIsSending(true);
    setFormError(null);
    setLastResult(null);

    try {
      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 10 || cleanPhone.length === 11) {
        cleanPhone = '55' + cleanPhone;
      }

      const result = await sendWhatsAppTest({
        destinationPhone: cleanPhone,
        templateName: templateName.trim().toLowerCase(),
        languageCode: languageCode.trim(),
        parameters: parameters.map((p) => p.trim())
      });

      setLastResult(result);
      setIsConfirmOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastResult({
        success: false,
        status: 'failed',
        errorCode: 'EXECUTION_ERROR',
        errorMessage: msg,
        message: 'Erro durante o envio.',
        timestamp: new Date().toISOString()
      });
      setIsConfirmOpen(false);
    } finally {
      setIsSending(false);
    }
  };

  // Helper formatting for phone
  const formatPhonePreview = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return 'Nenhum número preenchido';
    if (digits.startsWith('55') && digits.length >= 12) {
      const ddd = digits.slice(2, 4);
      const rest = digits.slice(4);
      if (rest.length === 9) {
        return `+55 (${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
      }
      return `+55 (${ddd}) ${rest}`;
    }
    return `+${digits}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Info & Configuration Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
                Ambiente de Testes Oficial da Meta
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white">
              Teste de Envio da WhatsApp Cloud API
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Módulo administrativo seguro para validação e disparo de mensagens individuais. Todas as requisições utilizam a API oficial da Meta protegidas por autenticação no servidor.
            </p>
          </div>

          {/* Backend Status Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400">Status do Backend</span>
              <button
                onClick={refreshConfig}
                disabled={checkingConfig}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                title="Verificar credenciais no servidor"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingConfig ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Meta Access Token:</span>
                </span>
                {configStatus?.hasToken ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Configurado
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30" title="Defina META_ACCESS_TOKEN nas variáveis de ambiente">
                    Pendente
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Phone Number ID:</span>
                </span>
                {configStatus?.hasPhoneId ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Configurado
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30" title="Defina META_PHONE_NUMBER_ID nas variáveis de ambiente">
                    Pendente
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 text-[9px] font-mono text-slate-500 font-bold flex items-center justify-center border border-slate-700 rounded">ID</span>
                  <span>WABA ID:</span>
                </span>
                {configStatus?.hasWabaId ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    Ativo (Opcional)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-slate-500 bg-slate-900 border border-slate-800">
                    Não configurado (Opcional)
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                <span>Versão da API:</span>
                <span className="text-emerald-400 font-bold">{configStatus?.apiVersion || 'v26.0'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning if credentials missing */}
        {configStatus && (!configStatus.hasToken || !configStatus.hasPhoneId) && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block text-amber-300 mb-1">Atenção às Credenciais da Meta</strong>
              Para que os disparos alcancem a Meta Cloud API com sucesso, configure as variáveis de ambiente <code className="px-1.5 py-0.5 bg-slate-900 rounded font-mono text-amber-200">META_ACCESS_TOKEN</code> e <code className="px-1.5 py-0.5 bg-slate-900 rounded font-mono text-amber-200">META_PHONE_NUMBER_ID</code> no servidor ou Firebase Secret Manager. A variável <code className="px-1.5 py-0.5 bg-slate-900 rounded font-mono text-slate-400">META_WABA_ID</code> é opcional e não impede o envio de mensagens.
            </div>
          </div>
        )}
      </div>

      {/* Main Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Parameters & Configuration (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-display">Dados do Disparo de Teste</h3>
            <p className="text-xs text-slate-500 mt-1">
              Preencha os dados do destinatário e do template aprovado na Meta para simular o envio.
            </p>
          </div>

          <form onSubmit={handleValidateAndOpenConfirm} className="space-y-6">
            
            {/* 1. Quick Select Participant (Optional Helper) */}
            <div>
              <label htmlFor="quick-participant" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                Vincular a Participante Cadastrado (Opcional)
              </label>
              <div className="relative">
                <select
                  id="quick-participant"
                  value={selectedParticipantId}
                  onChange={handleSelectParticipant}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-slate-800"
                >
                  <option value="">-- Preencher manualmente ou escolher participante --</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.phone} ({p.city || 'Geral'})
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Facilita o teste puxando automaticamente o telefone e o nome de um participante real da base.
              </p>
            </div>

            {/* 2. Destination Phone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="dest-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Número de Destino (Formato E.164) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Ex: 5511999999999</span>
              </div>
              <div className="relative">
                <input
                  id="dest-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="55 + DDD + Número (ex: 5511998765432)"
                  className="w-full px-4 py-3 text-sm font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                  required
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[11px]">
                <span className="text-slate-500">
                  Formatação detectada: <strong className="text-slate-800 font-mono">{formatPhonePreview(phone)}</strong>
                </span>
                <span className="text-slate-400">DDI Brasil: 55</span>
              </div>
            </div>

            {/* 3. Template Name & Language Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="tpl-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Nome do Template <span className="text-rose-500">*</span>
                  </label>
                </div>
                <input
                  id="tpl-name"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="ex: hello_world"
                  className="w-full px-4 py-3 text-sm font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900"
                  required
                />
                <div className="flex items-center space-x-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">Sugestões:</span>
                  <button
                    type="button"
                    onClick={() => { setTemplateName('hello_world'); setParameters([]); }}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    hello_world
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateName('confirmacao_inscricao');
                      if (parameters.length === 0) setParameters(['Participante Teste', '17/10/2026']);
                    }}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    confirmacao_inscricao
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="tpl-lang" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                  Idioma do Template <span className="text-rose-500">*</span>
                </label>
                <select
                  id="tpl-lang"
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-slate-900"
                >
                  <option value="pt_BR">Português (Brasil) - pt_BR</option>
                  <option value="en_US">Inglês (EUA) - en_US</option>
                  <option value="es_ES">Espanhol - es_ES</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Deve coincidir com a aprovação na Meta.
                </p>
              </div>
            </div>

            {/* 4. Dynamic Parameters Area */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Parâmetros Dinâmicos do Corpo (Body Parameters)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Substituem variáveis sequenciais como {'{{1}}'}, {'{{2}}'}, etc.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddParam}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              {parameters.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                  Nenhum parâmetro adicionado. Templates sem variáveis dinâmicas (como <code className="font-mono text-slate-600">hello_world</code>) não requerem parâmetros.
                </div>
              ) : (
                <div className="space-y-3">
                  {parameters.map((param, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-12 text-center text-xs font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 py-2.5 rounded-xl shrink-0">
                        {`{{${idx + 1}}}`}
                      </div>
                      <input
                        type="text"
                        value={param}
                        onChange={(e) => handleUpdateParam(idx, e.target.value)}
                        placeholder={`Valor para o parâmetro {{${idx + 1}}}`}
                        className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveParam(idx)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remover parâmetro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Error Banner */}
            {formError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Action Trigger Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Revisar e Enviar Mensagem de Teste</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Message Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* WhatsApp Chat Bubble Mockup */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Prévia Visual da Mensagem</h4>
                  <span className="text-[10px] text-slate-400">Representação no WhatsApp</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {languageCode}
              </span>
            </div>

            {/* Phone Screen Mockup Container */}
            <div className="bg-[#0b141a] rounded-2xl p-4 border border-slate-800/80 min-h-[220px] flex flex-col justify-between">
              
              {/* Message Bubble */}
              <div className="max-w-[90%] bg-[#005c4b] text-slate-100 rounded-2xl rounded-tl-xs p-3.5 shadow-md relative self-start">
                <div className="text-xs font-bold text-emerald-300 mb-1 flex items-center space-x-1">
                  <span>9ª Convenção de Quartetos</span>
                </div>

                <div className="text-xs text-slate-100 leading-relaxed font-sans whitespace-pre-wrap">
                  {templateName === 'hello_world' ? (
                    <span>Hello World! Welcome and congratulations!! This message was sent via official WhatsApp Cloud API.</span>
                  ) : templateName === 'confirmacao_inscricao' ? (
                    <span>
                      Olá, <strong>{parameters[0] || '{{1}}'}</strong>! Sua inscrição para a 9ª Convenção Municipal de Quartetos foi confirmada para <strong>{parameters[1] || '17 de outubro de 2026'}</strong> às 18h. Apresente seu QR Code na recepção.
                    </span>
                  ) : (
                    <span>
                      Template: <strong>{templateName}</strong>
                      {parameters.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-emerald-700/50 space-y-1">
                          {parameters.map((p, i) => (
                            <div key={i} className="text-[11px] text-emerald-200">
                              <span className="opacity-60">{`{{${i + 1}}}`}: </span>
                              <span>{p || `[Parâmetro ${i + 1}]`}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </span>
                  )}
                </div>

                <div className="text-[9px] text-emerald-300/60 text-right mt-1.5 font-mono">
                  18:00
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 text-[10px] text-slate-400 leading-tight flex items-start space-x-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  A prévia é uma representação aproximada para conferência de conteúdo. A formatação exata dependerá da homologação do template no WhatsApp Business Manager da Meta.
                </span>
              </div>
            </div>

            {/* Destination summary */}
            <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Destinatário:</span>
                <span className="font-mono text-slate-200 font-bold">{formatPhonePreview(phone)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Template Meta:</span>
                <span className="font-mono text-emerald-400">{templateName}</span>
              </div>
            </div>
          </div>

          {/* Last Result Box */}
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl p-6 border ${
                lastResult.status === 'sent'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : lastResult.status === 'uncertain'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              } shadow-xs`}
            >
              <div className="flex items-center space-x-3 mb-3">
                {lastResult.status === 'sent' && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />}
                {lastResult.status === 'uncertain' && <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />}
                {lastResult.status === 'failed' && <XCircle className="w-6 h-6 text-rose-600 shrink-0" />}

                <div>
                  <h4 className="text-sm font-bold font-display">
                    {lastResult.status === 'sent' && 'Requisição Aceita pela Meta!'}
                    {lastResult.status === 'uncertain' && 'Status de Envio Incerto'}
                    {lastResult.status === 'failed' && 'Falha no Envio pela Meta'}
                  </h4>
                  <span className="text-[11px] opacity-75 font-mono">
                    {new Date(lastResult.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed mb-3">
                {lastResult.errorMessage || lastResult.message}
              </p>

              {lastResult.wamid && (
                <div className="p-2.5 rounded-xl bg-white/70 border border-emerald-200/60 text-[11px] font-mono space-y-0.5">
                  <span className="text-slate-500 block text-[10px]">Identificador Meta (WAMID):</span>
                  <span className="text-emerald-800 font-bold select-all break-all">{lastResult.wamid}</span>
                </div>
              )}

              {lastResult.status === 'sent' && (
                <div className="mt-3 text-[11px] text-slate-500 bg-white/50 p-2.5 rounded-xl border border-slate-200/50">
                  <strong>Aviso:</strong> A aceitação da requisição pela API indica que a mensagem foi validada e enfileirada no gateway da Meta. Não é garantia imediata de entrega física ou leitura no dispositivo do usuário.
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-100 pb-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black font-display">Confirmar Envio Real de Teste</h3>
                  <span className="text-xs text-slate-400">Verifique os dados antes do disparo</span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Número de Destino:</span>
                  <span className="font-mono font-bold text-slate-900">{formatPhonePreview(phone)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Template Meta:</span>
                  <span className="font-mono font-bold text-emerald-700">{templateName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Idioma:</span>
                  <span className="font-mono text-slate-700">{languageCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Qtd. de Parâmetros:</span>
                  <span className="font-bold text-slate-800">{parameters.length}</span>
                </div>

                {parameters.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/80 space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Valores dos parâmetros:</span>
                    {parameters.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-500">{`{{${idx + 1}}}`}:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[240px]">{p}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
                <strong>Atenção:</strong> Esta ação enviará uma mensagem real via WhatsApp Cloud API para o número especificado. Certifique-se de que o número informado pertence a um membro autorizado para testes.
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isSending}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSend}
                  disabled={isSending}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processando Envio...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Confirmar e Disparar</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Test Logs History Table (Firestore Collection: whatsappTestMessages) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Histórico de Testes Realizados</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registros sincronizados em tempo real com a coleção <code className="font-mono text-slate-700 bg-slate-100 px-1 rounded">whatsappTestMessages</code> do Firestore.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl self-start sm:self-auto">
            {testHistory.length} Testes Registrados
          </span>
        </div>

        {testHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-medium">Nenhum teste de WhatsApp registrado até o momento.</p>
            <p className="text-[11px] text-slate-400">
              Ao realizar um envio, os detalhes da transação e o identificador WAMID serão exibidos aqui.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-400 uppercase font-mono tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Data / Hora</th>
                  <th className="pb-3 px-3">Destinatário</th>
                  <th className="pb-3 px-3">Template</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Identificador Meta (WAMID) / Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {testHistory.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-500">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-900">
                      {formatPhonePreview(msg.destinationPhone)}
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                        {msg.templateName}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {msg.status === 'sent' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          Aceito pela Meta
                        </span>
                      )}
                      {msg.status === 'failed' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          Falha
                        </span>
                      )}
                      {msg.status === 'uncertain' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Incerto
                        </span>
                      )}
                      {msg.status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate font-mono text-[11px] text-slate-500">
                      {msg.wamid ? (
                        <span className="text-emerald-700" title={msg.wamid}>
                          {msg.wamid}
                        </span>
                      ) : (
                        <span className="text-rose-600" title={msg.errorMessage || ''}>
                          {msg.errorMessage || 'Sem identificador'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
