import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

interface ChatBoxProps {
  orderId: string;
  receiverId: string; // The ID of the other person in the chat
}

const ChatBox = ({ orderId, receiverId }: ChatBoxProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to real-time inserts for this order
    const subscription = supabase
      .channel(`chat:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Append the new message to the list if it doesn't already exist
          setMessages((current) => {
            if (current.some(m => m.id === newMsg.id)) return current;
            return [...current, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [orderId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input optimistically

    const { data, error } = await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: user.id,
      text: messageContent
    }).select().single();

    if (error) {
      console.error('Failed to send message EXACT ERROR:', JSON.stringify(error, null, 2));
      alert('Failed to send message: ' + (error.message || JSON.stringify(error)));
      setNewMessage(messageContent); // Restore on error
    } else if (data) {
      // Instantly update local state so the sender sees their message immediately
      setMessages((current) => {
        if (current.some(m => m.id === data.id)) return current;
        return [...current, data as Message];
      });
    }
  };

  if (loading) return <div style={{ padding: '16px', textAlign: 'center' }}>Loading chat...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '350px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>
        Live Chat
      </div>
      
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
            No messages yet. Send a message to start chatting!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div 
                key={msg.id} 
                style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  backgroundColor: isMe ? 'var(--primary)' : '#f3f4f6',
                  color: isMe ? 'white' : 'var(--text-color)',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: !isMe ? '4px' : '16px',
                  maxWidth: '80%'
                }}
              >
                <div style={{ wordBreak: 'break-word' }}>{msg.text}</div>
                <div style={{ fontSize: '0.65rem', textAlign: 'right', marginTop: '4px', opacity: 0.7 }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '12px', borderTop: '1px solid var(--border-color)', backgroundColor: 'white' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', outline: 'none' }}
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          style={{ 
            backgroundColor: newMessage.trim() ? 'var(--primary)' : 'var(--border-color)', 
            color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '8px', cursor: newMessage.trim() ? 'pointer' : 'not-allowed' 
          }}
        >
          <Send size={18} style={{ marginLeft: '-2px' }} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
