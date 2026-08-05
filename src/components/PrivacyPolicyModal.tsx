import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldCheck, Lock, FileText, X, Check, Database, UserCheck, Clock, Camera, Mail } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose, onAccept }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-8 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-app-deep px-6 py-5 text-white flex items-center justify-between shrink-0 border-b border-app-dark/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-app-gold/15 border border-app-gold/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-app-gold" />
              </div>
              <div>
                <h3 className="text-lg font-black font-display tracking-tight text-white flex items-center gap-2">
                  Política de Privacidade & LGPD
                </h3>
                <p className="text-xs text-app-gold font-mono uppercase tracking-wider">
                  Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 text-slate-600 text-sm leading-relaxed font-light divide-y divide-slate-100">
            {/* Resumo executivo */}
            <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-950 text-sm">
                <Shield className="w-4 h-4 text-app-gold shrink-0" />
                <span>Compromisso com a Segurança e Transparência</span>
              </div>
              <p className="leading-relaxed text-slate-700">
                A comissão organizadora da <strong>9ª Convenção Municipal de Quartetos</strong> preza pela segurança, privacidade e transparência no tratamento dos dados pessoais de seus participantes. Coletamos apenas as informações necessárias para realizar sua inscrição, emitir seu ingresso, organizar o evento e manter a comunicação institucional relacionada às atividades da Convenção.
              </p>
            </div>

            {/* Seção 1: Dados Coletados */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-app-deep font-extrabold font-display text-base">
                <Database className="w-4 h-4 text-app-medium shrink-0" />
                <h4>1. Quais dados coletamos e para quê?</h4>
              </div>
              <p className="text-xs text-slate-600">
                Para realizar sua inscrição e garantir sua participação no evento, poderão ser coletados os seguintes dados:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                <li><strong>Nome Completo:</strong> identificação do participante na credencial digital e lista de presença.</li>
                <li><strong>E-mail:</strong> envio da confirmação da inscrição, ingresso digital, recuperação de acesso e comunicações oficiais sobre o evento.</li>
                <li><strong>Celular / WhatsApp:</strong> contato para informações importantes, validação da inscrição e comunicação operacional, incluindo sorteios quando aplicável.</li>
                <li><strong>Cidade e Estado:</strong> elaboração de estatísticas sobre a origem dos participantes e planejamento das futuras edições.</li>
                <li><strong>Grupo, Quarteto ou Igreja (quando informado):</strong> organização temática e logística dos participantes.</li>
                <li><strong>Senha:</strong> utilizada exclusivamente para acesso à Área do Participante, sendo armazenada por meio de algoritmos modernos de proteção (hash), não podendo ser visualizada pela equipe responsável pelo sistema.</li>
              </ul>
            </div>

            {/* Seção 2: Base Legal */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-app-deep font-extrabold font-display text-base">
                <FileText className="w-4 h-4 text-app-medium shrink-0" />
                <h4>2. Base Legal e Finalidade do Tratamento</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                O tratamento dos dados pessoais é realizado conforme as bases legais previstas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018), especialmente para a execução dos procedimentos necessários à inscrição, organização e realização da Convenção, bem como, quando aplicável, mediante o consentimento do titular.
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                Os dados pessoais não serão comercializados, alugados ou compartilhados com terceiros para fins comerciais sem autorização do titular ou outra base legal prevista na legislação.
              </p>
            </div>

            {/* Seção 3: Segurança */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-app-deep font-extrabold font-display text-base">
                <Lock className="w-4 h-4 text-app-medium shrink-0" />
                <h4>3. Segurança e Armazenamento dos Dados</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Adotamos medidas técnicas e administrativas adequadas para proteger os dados pessoais contra acessos não autorizados, perda, alteração, divulgação ou destruição.
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                As informações são transmitidas por conexão segura e armazenadas em ambiente protegido, utilizando mecanismos de segurança compatíveis com as boas práticas do mercado. As senhas são armazenadas utilizando algoritmos modernos de proteção (hash), impossibilitando sua visualização em texto original pela equipe organizadora.
              </p>
            </div>

            {/* Seção 4: Direitos do Titular */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-app-deep font-extrabold font-display text-base">
                <UserCheck className="w-4 h-4 text-app-medium shrink-0" />
                <h4>4. Direitos do Titular dos Dados</h4>
              </div>
              <p className="text-xs text-slate-600">
                Nos termos do Art. 18 da LGPD, o participante poderá, a qualquer momento e mediante solicitação à organização:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                <li>Confirmar a existência do tratamento de seus dados;</li>
                <li>Acessar seus dados pessoais;</li>
                <li>Solicitar a correção de informações incompletas, inexatas ou desatualizadas;</li>
                <li>Solicitar a exclusão, anonimização ou atualização de seus dados, quando aplicável e observadas as obrigações legais;</li>
                <li>Solicitar informações sobre o tratamento realizado com seus dados pessoais.</li>
              </ul>
            </div>

            {/* Seção 5: Armazenamento */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-app-deep font-extrabold font-display text-base">
                <Clock className="w-4 h-4 text-app-medium shrink-0" />
                <h4>5. Período de Armazenamento</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Os dados pessoais poderão ser mantidos após a realização do evento para registro histórico da participação, organização de futuras edições da Convenção e envio de comunicações institucionais relacionadas exclusivamente às atividades promovidas pela organização.
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                Os dados serão armazenados apenas pelo tempo necessário para essas finalidades e para o cumprimento de obrigações legais, podendo o titular solicitar sua exclusão ou interrupção do recebimento de comunicações, quando aplicável e observadas as disposições da Lei Geral de Proteção de Dados.
              </p>
            </div>

            {/* Seção 6: Comunicação e Uso de Imagem */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-app-deep font-extrabold font-display text-base">
                <Camera className="w-4 h-4 text-app-medium shrink-0" />
                <h4>6. Comunicação Institucional e Uso de Imagem</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Os dados de contato poderão ser utilizados exclusivamente para comunicações relacionadas à organização da Convenção, como confirmação da inscrição, alterações na programação, informações importantes e divulgação de futuras edições promovidas pela organização.
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                Durante a realização da Convenção poderão ser produzidos registros fotográficos e audiovisuais destinados à divulgação institucional do evento em meios físicos e digitais, incluindo redes sociais, materiais promocionais e canais oficiais da organização.
              </p>
              <p className="text-xs text-slate-700 leading-relaxed">
                Caso o participante deseje exercer direitos relacionados ao tratamento de sua imagem ou solicitar informações adicionais, poderá entrar em contato com a organização por meio dos canais oficiais.
              </p>
            </div>

            {/* Seção 7: Contato */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center space-x-2 text-app-deep font-extrabold font-display text-base">
                <Mail className="w-4 h-4 text-app-medium shrink-0" />
                <h4>7. Contato</h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Caso tenha dúvidas sobre esta Política de Privacidade ou deseje exercer qualquer direito previsto na Lei Geral de Proteção de Dados, entre em contato com a comissão organizadora pelos canais oficiais disponibilizados pela 9ª Convenção Municipal de Quartetos.
              </p>
            </div>

            {/* Declaração de Concordância */}
            <div className="pt-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Concordância</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ao concluir sua inscrição, o participante declara que leu e está ciente desta Política de Privacidade, compreendendo a finalidade do tratamento de seus dados pessoais para a realização da 9ª Convenção Municipal de Quartetos, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Sua privacidade é nossa prioridade absoluta.
            </span>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Fechar Leitura
              </button>
              {onAccept && (
                <button
                  type="button"
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-app-medium text-white font-bold text-xs hover:bg-app-dark shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Li e Concordo</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
