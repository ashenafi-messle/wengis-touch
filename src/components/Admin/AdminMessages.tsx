import React, { useState } from 'react';
import { Message } from '../../types';
import { Mail, Trash2, CheckCircle2, MessageSquare, Phone, Clock, Search, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { BackButton } from '../BackButton';

interface AdminMessagesProps {
  messages: Message[];
  onToggleReadMessage: (id: string, currentRead: boolean) => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
  onBack: () => void;
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({
  messages,
  onToggleReadMessage,
  onDeleteMessage,
  onBack
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState<string>('All');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const filteredMessages = messages.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRead = filterRead === 'All' ? true :
      filterRead === 'Unread' ? !m.read : m.read;

    return matchSearch && matchRead;
  });

  return (
    <div className="space-y-4 sm:space-y-6 text-left animate-fadeIn">
      
      {/* Back Button */}
      <div className="mb-4">
        <BackButton onClick={onBack} />
      </div>

      {/* Header */}
      <div className="bg-[#142E52] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#C95A1A]/30 text-[#FAF7F1] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#FAF7F1]">
            {t('adminMsg.title')}
          </h2>
          <p className="text-[11px] sm:text-xs text-[#D8C3A5] line-clamp-2 sm:line-clamp-none">
            {t('adminMsg.desc')}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#D8C3A5]">{t('adminMsg.unreadMessages')}</span>
          <span className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#C95A1A] block">
            {messages.filter(m => !m.read).length}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-center bg-[#F3E7D3] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#D8C3A5]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0F2747] absolute left-2.5 sm:left-3 top-2.5 sm:top-3" />
          <input
            type="text"
            placeholder={t('adminMsg.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-lg sm:rounded-xl pl-8 sm:pl-9 pr-2 sm:pr-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
          />
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            onClick={() => setFilterRead('All')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              filterRead === 'All' ? 'bg-[#0F2747] text-[#FAF7F1]' : 'bg-[#FAF7F1] text-[#0F2747]'
            }`}
          >
            {t('adminMsg.all')}
          </button>
          <button
            onClick={() => setFilterRead('Unread')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              filterRead === 'Unread' ? 'bg-[#C95A1A] text-[#FAF7F1]' : 'bg-[#FAF7F1] text-[#0F2747]'
            }`}
          >
            {t('adminMsg.unreadOnly')}
          </button>
          <button
            onClick={() => setFilterRead('Read')}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
              filterRead === 'Read' ? 'bg-[#0F2747] text-[#FAF7F1]' : 'bg-[#FAF7F1] text-[#0F2747]'
            }`}
          >
            {t('adminMsg.read')}
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="bg-[#142E52] p-12 rounded-3xl text-center text-[#D8C3A5]">
            <MessageSquare className="w-12 h-12 text-[#C95A1A]/40 mx-auto mb-2" />
            <p className="font-serif-luxury text-lg font-bold">No Messages Found</p>
          </div>
        ) : (
          filteredMessages.map(msg => (
            <div
              key={msg.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                !msg.read
                  ? 'bg-[#142E52] border-[#C95A1A] text-[#FAF7F1] shadow-lg'
                  : 'bg-[#0F2747]/80 border-white/10 text-[#D8C3A5]'
              }`}
            >
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${!msg.read ? 'bg-[#C95A1A] animate-ping' : 'bg-gray-500'}`} />
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-bold text-sm text-[#FAF7F1]">{msg.name}</span>
                    <span className="text-[11px] text-[#C95A1A] font-mono">{msg.email}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-serif-luxury text-base font-bold text-[#FAF7F1] mb-1">{msg.subject}</h4>
                  <p className="text-xs font-light line-clamp-2 text-[#D8C3A5]">{msg.message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 shrink-0 justify-end">
                <button
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.read) onToggleReadMessage(msg.id, false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#0F2747] text-xs font-semibold text-[#FAF7F1] hover:bg-[#C95A1A] transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read Full</span>
                </button>

                <button
                  onClick={() => onToggleReadMessage(msg.id, msg.read)}
                  className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    msg.read ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                  title={msg.read ? 'Mark Unread' : 'Mark Read'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDeleteMessage(msg.id)}
                  className="p-2 rounded-xl bg-red-900/40 text-red-300 hover:text-red-100 transition-colors cursor-pointer"
                  title="Delete Message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Full Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0F2747] border border-[#C95A1A]/40 text-[#FAF7F1] p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl relative text-left">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#C95A1A]">Inquiry Details</span>
                <h3 className="font-serif-luxury text-xl font-bold">{selectedMessage.subject}</h3>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs text-[#D8C3A5]">
              <p><strong className="text-[#FAF7F1]">From:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
              {selectedMessage.phone && <p><strong className="text-[#FAF7F1]">Phone:</strong> {selectedMessage.phone}</p>}
              <p><strong className="text-[#FAF7F1]">Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
            </div>

            <div className="p-4 bg-[#142E52] rounded-2xl border border-white/10 text-xs leading-relaxed text-[#FAF7F1]">
              {selectedMessage.message}
            </div>

            <button
              onClick={() => setSelectedMessage(null)}
              className="w-full py-3 rounded-full bg-[#C95A1A] text-[#FAF7F1] text-xs font-bold uppercase tracking-wider"
            >
              Close Message
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
