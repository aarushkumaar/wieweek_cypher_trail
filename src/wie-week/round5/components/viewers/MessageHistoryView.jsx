import { useState } from 'react';
import { CREWMATES } from '../../data/mockData';
import AmongUsIcon from '../AmongUsIcon';
import GroupChatIcon from '../GroupChatIcon';

const COLORS_BY_ID   = {};
const COLORS_BY_NAME = {};
CREWMATES.forEach(c => { COLORS_BY_ID[c.id] = c.color; COLORS_BY_NAME[c.displayName.split(' ')[0]] = c.color; });

export default function MessageHistoryView({ data, crewmate }) {
  const { conversations = [], chatMessages = {} } = data || {};
  const [activeContactId, setActiveContactId] = useState(conversations[0]?.contactId ?? 0);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations based on search
  const filteredConversations = conversations.filter(c => 
    c.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeChatData = conversations.find(c => c.contactId === activeContactId) || conversations[0] || {};
  const currentMessages = chatMessages[activeContactId] || [];

  return (
    <div className="mhv-root">
      {/* ── Contact list ── */}
      <div className="mhv-contacts">
        <div className="mhv-search">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="mhv-contact-list">
          {filteredConversations.map((conv, i) => (
            <button
              key={conv.contactId}
              className={`mhv-contact ${conv.contactId === activeContactId ? 'active' : ''}`}
              onClick={() => setActiveContactId(conv.contactId)}
            >
              <div className="mhv-contact-avatar">
                {conv.contactId === 0 ? (
                  <GroupChatIcon />
                ) : (
                  <AmongUsIcon color={COLORS_BY_ID[conv.contactId] || '#1a2535'} />
                )}
              </div>
              <div className="mhv-contact-info">
                <div className="mhv-contact-name">{conv.contactName}</div>
                <div className="mhv-contact-preview">{conv.lastMsg}</div>
              </div>
              <span className="mhv-contact-time">{conv.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat area ── */}
      <div className="mhv-chat">
        <div className="mhv-chat-header">
          <div className="mhv-chat-header-avatar">
            {activeContactId === 0 ? <GroupChatIcon /> : <AmongUsIcon color={COLORS_BY_ID[activeContactId] || '#1a2535'} />}
          </div>
          <div>
            <div className="mhv-chat-header-name">{activeChatData.contactName}</div>
            <div className="mhv-chat-header-sub">
              {activeContactId === 0 ? `${CREWMATES.length} online members` : '1 online member'}
            </div>
          </div>
        </div>

        <div className="mhv-chat-date">3 July 2026</div>

        <div className="mhv-messages">
          {currentMessages.map((msg, i) => {
            const isSuspicious = msg.suspicious;
            // Resolve avatar color — prefer senderId lookup, fall back to first-name lookup
            const avatarColor = COLORS_BY_ID[msg.senderId] || COLORS_BY_NAME[msg.sender] || '#1a2535';
            return (
              <div key={i} className={`mhv-msg ${isSuspicious ? 'mhv-msg-suspicious' : 'mhv-msg-normal'}`}>
                <div className="mhv-msg-avatar">
                  <AmongUsIcon color={avatarColor} />
                </div>
                <div className="mhv-msg-bubble">
                  <div className="mhv-msg-sender" style={{ color: avatarColor }}>
                    {msg.sender}
                  </div>
                  <span className="mhv-msg-time">{msg.time}</span>
                  <div>{msg.text}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mhv-chat-input">
          <input type="text" placeholder="Type a message..." readOnly />
        </div>
      </div>
    </div>
  );
}
