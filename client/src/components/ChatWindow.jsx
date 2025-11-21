import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Send, Check, CheckCheck, Smile, Paperclip, Image, Video, Mic, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatWindow = ({ conversation, currentUser, socket }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        if (conversation?._id) {
            fetchMessages();
            socket?.emit('join', conversation._id);
        }
    }, [conversation?._id, socket]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            if (message.conversationId === conversation._id) {
                setMessages(prev => [...prev, message]);
                scrollToBottom();

                // Mark as seen if it's from the other user
                if (message.senderId._id !== currentUser.id) {
                    socket.emit('message:seen', {
                        messageId: message._id,
                        conversationId: conversation._id
                    });
                }
            }
        };

        const handleStatusUpdate = ({ messageId, status }) => {
            setMessages(prev => prev.map(msg => {
                if (msg._id === messageId) {
                    return { ...msg, status };
                }
                return msg;
            }));
        };

        socket.on('message:new', handleNewMessage);
        socket.on('message:status_update', handleStatusUpdate);

        return () => {
            socket.off('message:new', handleNewMessage);
            socket.off('message:status_update', handleStatusUpdate);
        };
    }, [socket, conversation?._id, currentUser.id]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/messages/${conversation._id}`);
            setMessages(res.data);
            scrollToBottom();

            // Mark unread messages as seen
            res.data.forEach(msg => {
                if (msg.senderId._id !== currentUser.id && msg.status !== 'seen') {
                    socket?.emit('message:seen', {
                        messageId: msg._id,
                        conversationId: conversation._id
                    });
                }
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to load messages');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);

        // Create preview for images and videos
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setFilePreview(null);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
                setSelectedFile(audioFile);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast.error('Could not access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedFile) return;

        try {
            let messageData = {
                conversationId: conversation._id,
                content: newMessage,
                type: 'text'
            };

            // Handle file upload
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);

                const uploadRes = await axios.post(`${API_URL}/api/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const fileUrl = uploadRes.data.url;
                let messageType = 'file';

                if (selectedFile.type.startsWith('image/')) messageType = 'image';
                else if (selectedFile.type.startsWith('video/')) messageType = 'video';
                else if (selectedFile.type.startsWith('audio/')) messageType = 'audio';

                messageData = {
                    conversationId: conversation._id,
                    content: newMessage || selectedFile.name,
                    type: messageType,
                    attachments: [{ url: fileUrl, type: selectedFile.type, name: selectedFile.name }]
                };
            }

            await axios.post(`${API_URL}/api/messages`, messageData);

            setNewMessage('');
            clearFile();
            setShowEmojiPicker(false);
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const onEmojiClick = (emojiObject) => {
        setNewMessage(prev => prev + emojiObject.emoji);
    };

    const renderStatus = (msg) => {
        if (msg.senderId._id !== currentUser.id) return null;

        if (msg.status === 'seen') return <CheckCheck size={14} className="text-blue-400" />;
        if (msg.status === 'delivered') return <CheckCheck size={14} className="text-gray-400" />;
        return <Check size={14} className="text-gray-400" />;
    };

    const renderMessageContent = (msg) => {
        const isMe = msg.senderId._id === currentUser.id;

        if (msg.type === 'image' && msg.attachments?.[0]) {
            return (
                <div>
                    <img src={msg.attachments[0].url} alt="attachment" className="max-w-full rounded-lg mb-2" />
                    {msg.content && <p className="text-sm">{msg.content}</p>}
                </div>
            );
        }

        if (msg.type === 'video' && msg.attachments?.[0]) {
            return (
                <div>
                    <video controls className="max-w-full rounded-lg mb-2">
                        <source src={msg.attachments[0].url} type={msg.attachments[0].type} />
                    </video>
                    {msg.content && <p className="text-sm">{msg.content}</p>}
                </div>
            );
        }

        if (msg.type === 'audio' && msg.attachments?.[0]) {
            return (
                <div>
                    <audio controls className="mb-2">
                        <source src={msg.attachments[0].url} type={msg.attachments[0].type} />
                    </audio>
                    {msg.content && <p className="text-sm">{msg.content}</p>}
                </div>
            );
        }

        if (msg.type === 'file' && msg.attachments?.[0]) {
            return (
                <div>
                    <a href={msg.attachments[0].url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-400 hover:underline">
                        <Paperclip size={16} />
                        <span className="text-sm">{msg.attachments[0].name || msg.content}</span>
                    </a>
                </div>
            );
        }

        return <p className="text-sm whitespace-pre-wrap">{msg.content}</p>;
    };

    return (
        <div className="flex flex-col h-full bg-dark">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => {
                    const isMe = msg.senderId._id === currentUser.id;
                    return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-gray-800 text-white rounded-bl-none'}`}>
                                {renderMessageContent(msg)}
                                <div className={`flex items-center justify-end space-x-1 mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    <span className="text-[10px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    {renderStatus(msg)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* File Preview */}
            {selectedFile && (
                <div className="px-4 py-2 bg-dark-light border-t border-gray-800">
                    <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                            {filePreview && selectedFile.type.startsWith('image/') && (
                                <img src={filePreview} alt="preview" className="w-12 h-12 rounded object-cover" />
                            )}
                            {filePreview && selectedFile.type.startsWith('video/') && (
                                <video src={filePreview} className="w-12 h-12 rounded object-cover" />
                            )}
                            <div>
                                <p className="text-white text-sm font-medium">{selectedFile.name}</p>
                                <p className="text-gray-400 text-xs">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                            </div>
                        </div>
                        <button onClick={clearFile} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 z-50">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-dark-light border-t border-gray-800">
                <div className="flex items-center space-x-2">
                    {/* Emoji Button */}
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Smile size={22} />
                    </button>

                    {/* File Upload Button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <Paperclip size={22} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    />

                    {/* Voice Recording Button */}
                    <button
                        type="button"
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Mic size={22} />
                    </button>

                    {/* Message Input */}
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary border border-transparent transition-all"
                        placeholder="Type a message..."
                    />

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!newMessage.trim() && !selectedFile}
                        className="p-3 bg-primary rounded-full text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary/30"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
