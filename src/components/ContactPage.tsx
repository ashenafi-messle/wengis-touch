import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Instagram, MessageCircle, Clock, Sparkles } from 'lucide-react';
import { Message } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { BackButton } from './BackButton';

interface ContactPageProps {
  onBack: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const { language, t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setErrorMsg(language === 'am' ? 'እባክዎ የሚያስፈልጉትን መስኮች በሙሉ ይሙሉ' : 'Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject: 'General Inquiry', message })
      });
      if (res.ok) {
        setSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        setErrorMsg(language === 'am' ? 'መልእክት መላክ አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Could not dispatch message. Please try again.');
      }
    } catch (err) {
      setErrorMsg(language === 'am' ? 'የኔትወርክ ስህተት አጋጥሟል።' : 'Network error. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-6 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left animate-fadeIn">
      
      {/* Back Button */}
      <div className="mb-4 sm:mb-6">
        <BackButton onClick={onBack} />
      </div>
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-16">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#C95A1A] font-bold block mb-1 sm:mb-2">
          {t('contact.subtitle')}
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-5xl font-bold text-[#0F2747]">
          {t('contact.title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#1E1E1E]/70 mt-1.5 sm:mt-3 font-light">
          {language === 'am'
            ? 'ስለ ልዩ የሰርግ ስራዎች፣ የጅምላ ትእዛዝ ወይም የግል ስታይል ጥያቄዎች ቡድናችንን ማነጋገር ይችላሉ።'
            : 'Whether you seek a bespoke custom bridal commission, wholesale partnership, or personal styling guidance, our team is at your service.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-start">
        
        {/* Left Column: Contact Information & Atelier Details */}
        <div className="lg:col-span-5 bg-[#0F2747] text-[#FAF7F1] p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-[#C95A1A]/30 space-y-5 sm:space-y-8 shadow-xl">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#142E52] border border-[#C95A1A]/30 text-[#D8C3A5] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2 sm:mb-4">
              <Sparkles className="w-3 h-3 text-[#C95A1A]" />
              <span>{language === 'am' ? 'የደሲ ዋና አቴሊየር' : 'Dessie Flagship Atelier'}</span>
            </div>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#FAF7F1]">
              {language === 'am' ? 'ይጎብኙን ወይም ይደውሉልን' : 'Visit or Call Us'}
            </h3>
            <p className="text-xs text-[#D8C3A5] font-light mt-0.5">
              {language === 'am' ? 'ለልዩ ውይይቶች በቅድመ ቀጠሮ ይጎብኙን።' : 'Private appointments available upon request for custom consultations.'}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C95A1A]/20 border border-[#C95A1A]/40 flex items-center justify-center text-[#C95A1A] shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#C95A1A] block">
                  {language === 'am' ? 'አድራሻ' : 'Atelier Location'}
                </span>
                <p className="text-xs text-[#FAF7F1] mt-0.5">Dessie</p>
                <p className="text-[11px] text-[#D8C3A5]">Ethiopia</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C95A1A]/20 border border-[#C95A1A]/40 flex items-center justify-center text-[#C95A1A] shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#C95A1A] block">
                  {language === 'am' ? 'ኢሜይል' : 'Email Concierge'}
                </span>
                <a href="mailto:concierge@wengistouch.com" className="text-xs text-[#FAF7F1] hover:text-[#C95A1A] transition-colors block mt-0.5">
                  concierge@wengistouch.com
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C95A1A]/20 border border-[#C95A1A]/40 flex items-center justify-center text-[#C95A1A] shrink-0">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#C95A1A] block">
                  {language === 'am' ? 'ስልክ / ዋትስአፕ' : 'Direct Line / WhatsApp'}
                </span>
                <p className="text-xs text-[#FAF7F1] mt-0.5">+251951383865</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#C95A1A]/20 border border-[#C95A1A]/40 flex items-center justify-center text-[#C95A1A] shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#C95A1A] block">
                  {language === 'am' ? 'የስራ ሰዓት' : 'Atelier Hours'}
                </span>
                <p className="text-xs text-[#FAF7F1] mt-0.5">{language === 'am' ? 'ቀን ቀጥሮ' : 'All day'}</p>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="pt-4 sm:pt-6 border-t border-white/10 space-y-2 sm:space-y-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#D8C3A5] block">
              {language === 'am' ? 'በማህበራዊ ሚዲያ ይከተሉን' : 'Follow Our Atelier Journal'}
            </span>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#142E52] hover:bg-[#C95A1A] text-[#FAF7F1] transition-colors flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#142E52] hover:bg-[#C95A1A] text-[#FAF7F1] transition-colors flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-[#F3E7D3] p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-[#D8C3A5] shadow-lg">
          <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#0F2747] mb-1 sm:mb-2">
            {language === 'am' ? 'መልእክት ይላኩ' : 'Send an Atelier Message'}
          </h3>
          <p className="text-xs text-[#1E1E1E]/70 font-light mb-4 sm:mb-6">
            {language === 'am' ? 'ለልዩ ትእዛዝ ወይም ጥያቄዎች ከታች ያለውን ፎርም ይሙሉ' : 'Fill out the form below for bespoke orders, color customizations, or press inquiries.'}
          </p>

          {submitted ? (
            <div className="bg-emerald-100 border border-emerald-300 p-8 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-serif-luxury text-xl font-bold text-emerald-900">
                {language === 'am' ? 'መልእክትዎ ተልኳል!' : 'Message Dispatched!'}
              </h4>
              <p className="text-xs text-emerald-800 font-light max-w-sm mx-auto">
                {language === 'am' ? 'ወንጊስ ታችን ስላነጋገሩ እናመሰግናለን። በ 24 ሰዓት ውስጥ እንመልሳለን።' : 'Thank you for contacting Wengi’s Touch. Our team will review your inquiry and respond within 24 business hours.'}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-full bg-[#0F2747] text-[#FAF7F1] text-xs font-bold uppercase tracking-wider"
              >
                {language === 'am' ? 'ሌላ መልእክት ላክ' : 'Send Another Inquiry'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-100 text-red-800 text-xs font-medium rounded-xl">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#0F2747] tracking-wider block mb-1">
                    {t('contact.name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'am' ? 'ምሳሌ፡ አልማዝ ካሳ' : 'e.g. Eleanor Vance'}
                    className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-[#0F2747] tracking-wider block mb-1">
                    {t('contact.email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-[#0F2747] tracking-wider block mb-1">
                  {t('contact.phone')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 911 000000"
                  className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-xl px-3.5 py-3 text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-[#0F2747] tracking-wider block mb-1">
                  {t('contact.message')} *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'am' ? 'የሚፈልጉትን ምርት፣ ቀለም ወይም ጥያቄዎን በዝርዝር ይፃፉ...' : 'Describe your requested piece, colors, or timeline...'}
                  className="w-full bg-[#FAF7F1] border border-[#D8C3A5] rounded-xl px-3.5 py-2.5 text-xs text-[#0F2747] focus:outline-none focus:border-[#C95A1A]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>{language === 'am' ? 'እየተላከ ነው...' : 'Sending Message...'}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('contact.send')}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

