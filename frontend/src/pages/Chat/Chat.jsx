import React, { useState, useEffect } from 'react';
import { Mic, Phone, Send, Loader2, Volume2, CheckCircle2, FileText, Sparkles } from 'lucide-react';
import TopAppBar from '../../components/TopAppBar/TopAppBar';
import { sendTextQuery } from '../../services/api';
import styles from './Chat.module.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Namaste! Main Kisan Setu RAG AI Saathi hoon. Aap fasal, mausam, ya sarkari yojnaon ke bare mein kuch bhi pooch sakte hain.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  // Web Speech API - Voice Recognition (ASR / STT)
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    window._speechRecognition = recognition;
  }, []);

  const handleMicClick = () => {
    if (listening) {
      window._speechRecognition?.stop();
      setListening(false);
    } else {
      try {
        window._speechRecognition?.start();
        setListening(true);
      } catch (e) {
        setListening(false);
      }
    }
  };

  const handleSpeakText = (id, text) => {
    if (!('speechSynthesis' in window)) {
      alert('Aapke browser mein Text-to-Speech support nahi hai.');
      return;
    }
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    const userMsg = { id: Date.now(), type: 'user', text: userQuery };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendTextQuery(userQuery);
      const resData = res.data?.response || res.data;
      
      const answerText = resData?.answer || resData?.text || res.data?.message || 'Aapke sawaal ka uttar taiyar hai.';
      const cardTitle = resData?.cardTitle || 'KISAN SETU AI SAATHI';
      const cardDetail = resData?.detail || 'Kuch aur jaankari ke liye Helpline Button par click karein.';
      const sourceName = resData?.source || (resData?.sources && resData.sources.length > 0 ? resData.sources[0].name : 'Official RAG Knowledge Base');

      const aiMsg = {
        id: Date.now() + 1,
        type: 'ai',
        isCard: true,
        cardTitle,
        answer: answerText,
        detail: cardDetail,
        source: sourceName,
        actionText: 'Kisan Helpline'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          text: 'Kshama karein, abhi AI server se sampark nahi ho paa raha hai. Kripya punah prayas karein.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const OnlineStatus = () => (
    <div className={styles.onlineStatus}>
      <span className={styles.dot}></span>
      <span>RAG AI Online</span>
    </div>
  );

  return (
    <div className={styles.container}>
      <TopAppBar 
        title={<><span style={{fontSize: '20px'}}>🤖</span> RAG AI Saathi</>}
        showBack={true}
        rightAction={<OnlineStatus />}
      />

      <div className={styles.chatArea}>
        {messages.map((msg) => (
          msg.type === 'user' ? (
            <div key={msg.id} className={`${styles.messageWrapper} ${styles.userWrapper}`}>
              <div className={`${styles.bubble} ${styles.userBubble}`}>
                {msg.text}
              </div>
            </div>
          ) : (
            <div key={msg.id} className={`${styles.messageWrapper} ${styles.aiWrapper}`}>
              {msg.isCard ? (
                <div className={styles.sleekCard}>
                  {/* Header */}
                  <div className={styles.sleekCardHeader}>
                    <div className={styles.headerTitleBox}>
                      <Sparkles size={16} className={styles.sparkleIcon} />
                      <span className={styles.sleekTitleText}>{msg.cardTitle}</span>
                    </div>
                    <button 
                      className={`${styles.audioBtn} ${speakingId === msg.id ? styles.audioActive : ''}`}
                      onClick={() => handleSpeakText(msg.id, `${msg.answer}. ${msg.detail}`)}
                      title="Bolkar Suno"
                    >
                      <Volume2 size={15} />
                      <span>{speakingId === msg.id ? 'Ruko' : 'Suno'}</span>
                    </button>
                  </div>
                  
                  {/* Body */}
                  <div className={styles.sleekCardBody}>
                    <div className={styles.answerTextMain}>
                      {msg.answer}
                    </div>

                    {msg.detail && (
                      <div className={styles.advisoryBox}>
                        <div className={styles.advisoryHeader}>
                          <CheckCircle2 size={15} className={styles.checkIcon} />
                          <span>Advisory & Next Steps</span>
                        </div>
                        <p className={styles.advisoryText}>{msg.detail}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className={styles.sleekCardFooter}>
                    <div className={styles.sourceBadge}>
                      <FileText size={12} />
                      <span>{msg.source}</span>
                    </div>
                    <button className={styles.helplineBtn} onClick={() => window.open('tel:18001801551')}>
                      <Phone size={13} />
                      <span>{msg.actionText}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`${styles.bubble} ${styles.aiBubble}`}>
                  {msg.text}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className={`${styles.messageWrapper} ${styles.aiWrapper}`}>
            <div className={`${styles.bubble} ${styles.aiBubble}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={18} className="animate-spin" />
              <span>RAG AI Document Knowledge Base Se Utar Khoj Raha Hai...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area with Mic Voice Search */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <button 
            className={`${styles.voiceRecordBtn} ${listening ? styles.recordingActive : ''}`}
            onClick={handleMicClick}
            title={listening ? "Bolna Band Karein" : "Bolkar Type Karein"}
          >
            <Mic size={18} />
          </button>
          <input 
            type="text" 
            placeholder={listening ? "Aap boliye, hum sun rahe hain..." : "Type karein ya bolkar pucho..."} 
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button 
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{ opacity: !input.trim() ? 0.5 : 1 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
