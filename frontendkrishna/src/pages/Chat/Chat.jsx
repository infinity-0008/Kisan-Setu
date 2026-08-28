import React, { useState } from 'react';
import { Mic, Phone, Send, Loader2 } from 'lucide-react';
import TopAppBar from '../../components/TopAppBar/TopAppBar';
import { sendTextQuery } from '../../services/api';
import styles from './Chat.module.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      text: 'Namaste! Main Kisan Setu AI Saathi hoon. Aap fasal, mausam, ya sarkari yojnaon ke bare mein kuch bhi pooch sakte hain.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    const userMsg = { id: Date.now(), type: 'user', text: userQuery };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendTextQuery(userQuery);
      const answerText = res.data?.response?.text || res.data?.response || res.data?.message || 'Aapke sawaal ka uttar taiyar hai.';
      const sourcesList = res.data?.response?.sources;
      const sourceName = sourcesList && sourcesList.length > 0 ? sourcesList[0].name : 'Kisan Setu AI Registry';

      const aiMsg = {
        id: Date.now() + 1,
        type: 'ai',
        isCard: true,
        cardTitle: 'KISAN SETU AI SAATHI',
        question: 'Aapke Sawaal Ka Uttor:',
        answer: answerText,
        detailLabel: 'Aapke Liye Sujhaav',
        detail: 'Kuch aur jaankari ke liye neeche diye gaye Helpline Button par click karein ya naye prashn puchne ke liye type karein.',
        source: sourceName,
        actionText: 'Kisan Helpline (1800-180-1551)'
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
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const OnlineStatus = () => (
    <div className={styles.onlineStatus}>
      <span className={styles.dot}></span>
      <span>AI Online</span>
    </div>
  );

  return (
    <div className={styles.container}>
      <TopAppBar 
        title={<><span style={{fontSize: '20px'}}>🤖</span> AI Saathi</>}
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
                <div className={styles.suggestionCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.robotIcon}>🤖</span>
                    <span className={styles.cardTitleText}>{msg.cardTitle}</span>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <p className={styles.infoLabel}>{msg.question}</p>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.5', color: '#1e293b' }}>
                      {msg.answer}
                    </div>
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <span className={styles.sourceText}>Source: {msg.source}</span>
                    <button className={styles.actionBtn} onClick={() => window.open('tel:18001801551')}>
                      <Phone size={14} />
                      {msg.actionText}
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
              <span>AI Saathi uttar soch raha hai...</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <input 
            type="text" 
            placeholder="Type karein ya bolkar pucho..." 
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button 
            className={styles.micBtn}
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{ opacity: !input.trim() ? 0.6 : 1 }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
