import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ChatWindow from '../components/ChatWindow';
import VideoCall from '../components/VideoCall';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LogOut, Video, MessageSquare, UserPlus, Users, Bell, Check, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;

const Dashboard = () => {
    const { user, logout } = useAuth();
    const socket = useSocket();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showVideo, setShowVideo] = useState(false);
    const [activeTab, setActiveTab] = useState('chats'); // chats, friends, requests
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [usersToRequest, setUsersToRequest] = useState([]);
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Initial data fetch
    useEffect(() => {
        fetchConversations();
        fetchFriends();
        fetchRequests();
    }, []);

    // Socket listeners
    useEffect(() => {
        if (socket) {
            // Join all conversation rooms
            conversations.forEach((conv) => socket.emit('join', conv._id));

            const handleNewMessage = (message) => {
                if (message.senderId._id !== user.id) {
                    socket.emit('message:delivered', {
                        messageId: message._id,
                        conversationId: message.conversationId,
                    });
                }
                // Update conversation preview
                setConversations((prev) =>
                    prev.map((c) => (c._id === message.conversationId ? { ...c, lastMessage: message } : c))
                );
            };

            const handleUserOnline = (userId) => updateUserStatus(userId, true);
            const handleUserOffline = (userId) => updateUserStatus(userId, false);

            // Real-time friend request notification
            const handleFriendRequest = (data) => {
                if (data.toUserId === user.id) {
                    // Add new friend request to the list
                    setRequests((prev) => [...prev, { _id: data.requestId, from: data.from, status: 'pending' }]);
                }
            };

            // Real-time friend acceptance notification
            const handleFriendAccepted = (data) => {
                if (data.userId === user.id) {
                    // Add new friend to friends list
                    setFriends((prev) => [...prev, data.newFriend]);
                    // Fetch conversations to get the new conversation
                    fetchConversations();
                }
            };

            socket.on('message:new', handleNewMessage);
            socket.on('user:online', handleUserOnline);
            socket.on('user:offline', handleUserOffline);
            socket.on('friend:request', handleFriendRequest);
            socket.on('friend:accepted', handleFriendAccepted);

            return () => {
                socket.off('message:new', handleNewMessage);
                socket.off('user:online', handleUserOnline);
                socket.off('user:offline', handleUserOffline);
                socket.off('friend:request', handleFriendRequest);
                socket.off('friend:accepted', handleFriendAccepted);
            };
        }
    }, [socket, conversations.length, user.id]);

    const updateUserStatus = (userId, isOnline) => {
        setFriends((prev) => prev.map((f) => (f._id === userId ? { ...f, isOnline } : f)));
        setConversations((prev) =>
            prev.map((c) => {
                const updatedMembers = c.members.map((m) => (m._id === userId ? { ...m, isOnline } : m));
                return { ...c, members: updatedMembers };
            })
        );
    };

    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/conversations`);
            setConversations(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load conversations');
        }
    };

    const fetchFriends = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/friends`);
            setFriends(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load friends');
        }
    };

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/friends/requests`);
            setRequests(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load friend requests');
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/users`);
            const friendIds = friends.map((f) => f._id);
            const available = res.data.filter(
                (u) => u._id !== user.id && !friendIds.includes(u._id)
            );
            setUsersToRequest(available);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load users');
        }
    };

    const sendFriendRequest = async (toUserId) => {
        try {
            await axios.post(`${API_URL}/api/friends/request`, { toUserId });
            toast.success('Friend request sent!');
            setShowAddFriendModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            await axios.post(`${API_URL}/api/friends/accept`, { requestId });
            toast.success('Friend request accepted!');
            fetchRequests();
            fetchFriends();
            fetchConversations();
        } catch (error) {
            console.error(error);
            toast.error('Failed to accept request');
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            await axios.post(`${API_URL}/api/friends/reject`, { requestId });
            toast.success('Friend request rejected');
            fetchRequests();
        } catch (error) {
            console.error(error);
            toast.error('Failed to reject request');
        }
    };

    const startChat = async (friendId) => {
        try {
            const res = await axios.post(`${API_URL}/api/conversations`, { receiverId: friendId });
            setConversations((prev) => {
                if (!prev.find((c) => c._id === res.data._id)) {
                    return [res.data, ...prev];
                }
                return prev;
            });
            setSelectedConversation(res.data);
            setActiveTab('chats');
        } catch (error) {
            console.error(error);
            toast.error('Failed to start conversation');
        }
    };

    const getOtherMember = (conversation) =>
        conversation.members.find((m) => m._id !== user.id) || {};

    return (
        <div className="flex h-screen bg-dark overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 bg-dark-light border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            {user?.displayName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">{user?.displayName}</h3>
                            <span className="text-xs text-green-500 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1" /> Online
                            </span>
                        </div>
                    </div>
                    <button onClick={logout} className="text-gray-400 hover:text-white transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab('chats')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'chats' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                    >
                        <MessageSquare size={18} className="mx-auto mb-1" />
                        Chats
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'friends' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Users size={18} className="mx-auto mb-1" />
                        Friends
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                    >
                        <div className="relative">
                            <Bell size={18} className="mx-auto mb-1" />
                            {requests.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                                    {requests.length}
                                </span>
                            )}
                        </div>
                        Requests
                    </button>
                </div>
                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {activeTab === 'chats' && (
                        <div className="space-y-1">
                            {conversations.map((conv) => {
                                const otherMember = getOtherMember(conv);
                                return (
                                    <div
                                        key={conv._id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-800 transition-colors ${selectedConversation?._id === conv._id ? 'bg-gray-800 border-l-4 border-primary' : ''}`}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                                                {otherMember.displayName?.[0]?.toUpperCase()}
                                            </div>
                                            {otherMember.isOnline && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-light rounded-full" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <h4 className="text-white font-medium truncate">{otherMember.displayName}</h4>
                                                <span className="text-xs text-gray-500">
                                                    {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 truncate">
                                                {conv.lastMessage ? conv.lastMessage.content : 'Click to chat'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {activeTab === 'friends' && (
                        <div className="p-4 space-y-4">
                            <button
                                onClick={() => {
                                    fetchUsers();
                                    setShowAddFriendModal(true);
                                }}
                                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-primary rounded-lg flex items-center justify-center space-x-2 transition-colors border border-dashed border-gray-600"
                            >
                                <UserPlus size={18} />
                                <span>Add New Friend</span>
                            </button>
                            {/* Friend list */}
                            {friends.map((friend) => (
                                <div key={friend._id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-white font-bold">
                                                {friend.displayName?.[0]?.toUpperCase()}
                                            </div>
                                            {friend.isOnline && (
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-gray-800 rounded-full" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{friend.displayName}</h4>
                                            <span className="text-xs text-gray-400">{friend.isOnline ? 'Online' : 'Offline'}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => startChat(friend._id)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                                        <MessageSquare size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'requests' && (
                        <div className="p-4 space-y-4">
                            {requests.length === 0 && <p className="text-center text-gray-500 text-sm">No pending requests</p>}
                            {requests.map((req) => (
                                <div key={req._id} className="bg-gray-800 p-4 rounded-lg space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center text-white font-bold">
                                            {req.from.displayName?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{req.from.displayName}</h4>
                                            <p className="text-xs text-gray-400">{req.from.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => acceptRequest(req._id)}
                                            className="flex-1 py-1.5 bg-primary hover:bg-indigo-600 text-white text-sm rounded flex items-center justify-center space-x-1 transition-colors"
                                        >
                                            <Check size={14} /> <span>Accept</span>
                                        </button>
                                        <button
                                            onClick={() => rejectRequest(req._id)}
                                            className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded flex items-center justify-center space-x-1 transition-colors"
                                        >
                                            <X size={14} /> <span>Reject</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-dark relative">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-dark-light/50 backdrop-blur-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                                    {getOtherMember(selectedConversation).displayName?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">{getOtherMember(selectedConversation).displayName}</h3>
                                    <span className="text-xs text-green-500 flex items-center">
                                        {getOtherMember(selectedConversation).isOnline ? (
                                            <>
                                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1" /> Online
                                            </>
                                        ) : (
                                            <span className="text-gray-500">Offline</span>
                                        )}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowVideo(!showVideo)}
                                className={`p-2 rounded-full transition-all ${showVideo ? 'bg-red-500/20 text-red-500' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`}
                            >
                                <Video size={20} />
                            </button>
                        </div>
                        {/* Chat or Video */}
                        <div className="flex-1 overflow-hidden relative">
                            {showVideo ? (
                                <VideoCall conversationId={selectedConversation._id} userId={user.id} userName={user.displayName} />
                            ) : (
                                <ChatWindow conversation={selectedConversation} currentUser={user} socket={socket} />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare size={40} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Select a conversation</h3>
                        <p>Choose a friend from the sidebar to start chatting</p>
                    </div>
                )}
            </div>
            {/* Add Friend Modal */}
            {showAddFriendModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-dark-light w-full max-w-md rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Add New Friend</h3>
                            <button onClick={() => setShowAddFriendModal(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                            {/* Search input */}
                            <div className="mb-3">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            {usersToRequest.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No new users found.</p>
                            ) : (
                                usersToRequest
                                    .filter((u) => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((u) => (
                                        <div key={u._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">
                                                    {u.displayName?.[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium">{u.displayName}</h4>
                                                    <p className="text-xs text-gray-400">{u.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => sendFriendRequest(u._id)}
                                                className="px-3 py-1.5 bg-primary hover:bg-indigo-600 text-white text-xs font-medium rounded transition-colors"
                                            >
                                                Add Friend
                                            </button>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
