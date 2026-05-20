'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './ChatBot.module.css'
import { MessageCircle, X, Send, Loader2, Bot, User, RefreshCcw, Sparkles } from 'lucide-react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { getApp } from 'firebase/app'
import '../../lib/firebase' // ensure Firebase is initialized


interface Message {
    role: 'user' | 'model'
    text: string
}

interface ChatRAGRequest {
    message: string
    history: Array<{ role: 'user' | 'assistant'; content: string }>
    model: string
    debug?: boolean
}

interface ChatRAGResponse {
    reply: string
    context?: Array<{ collection: string; text: string; score?: number }>
}

export default function ChatBot() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Hi! 👋 I'm Jhon's AI assistant. Ask me anything about his skills, projects, or how to work with him!" }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [debugMode, setDebugMode] = useState(false)
    const [lastContext, setLastContext] = useState<ChatRAGResponse['context']>([])
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const DEFAULT_MODEL = 'openai/gpt-4o-mini'

    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, open])

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 300)
        }
    }, [open])

    const buildHistory = (): Array<{ role: 'user' | 'assistant'; content: string }> => {
        const history: Array<{ role: 'user' | 'assistant'; content: string }> = []
        for (let i = 1; i < messages.length; i++) {
            history.push({
                role: messages[i].role === 'model' ? 'assistant' : 'user',
                content: messages[i].text
            })
        }
        return history
    }

    const sendMessage = async () => {
        const text = input.trim()
        if (!text || loading) return

        const userMsg: Message = { role: 'user', text }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const functions = getFunctions(getApp(), 'us-central1')
            const chatFn = httpsCallable<ChatRAGRequest, ChatRAGResponse>(functions, 'chatWithRAG')

            const result = await chatFn({
                message: text,
                history: buildHistory(),
                model: DEFAULT_MODEL,
                debug: debugMode,
            })

            const reply = result.data?.reply ?? "I'm sorry, I couldn't generate a response. Please try again."
            setMessages(prev => [...prev, { role: 'model', text: reply }])
            if (result.data?.context) {
                setLastContext(result.data.context)
            }

        } catch (err: unknown) {
            let errorMsg = "Sorry, I ran into an issue connecting to the AI backend. Please try again shortly."

            if (err && typeof err === 'object' && 'code' in err) {
                const firebaseErr = err as { code: string; message: string }
                if (firebaseErr.code === 'functions/resource-exhausted' || firebaseErr.message === 'RATE_LIMIT') {
                    errorMsg = "I'm receiving too many requests right now. Please try again in a moment! 🙏"
                } else if (firebaseErr.code === 'functions/unauthenticated') {
                    errorMsg = "Authentication error. Please refresh the page and try again."
                } else if (firebaseErr.code === 'functions/unavailable' || firebaseErr.code === 'functions/internal') {
                    errorMsg = "The AI service is temporarily unavailable. Please try again shortly."
                }
            }

            setMessages(prev => [...prev, { role: 'model', text: errorMsg }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className={styles.root}>
            {/* Chat Window */}
            {open && (
                <div className={styles.window}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <div className={styles.avatarDot} />
                            <div>
                                <p className={styles.headerName}>Jhon&apos;s AI Assistant</p>
                                <p className={styles.headerStatus}>
                                    <span className={styles.onlineDot} /> Online
                                </p>
                            </div>
                        </div>
                        <div className={styles.headerActions}>
                            {/* Actions removed as per user request (Minimize/Close button) */}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className={styles.messages}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`${styles.msgRow} ${msg.role === 'user' ? styles.userRow : styles.botRow}`}>
                                <div className={styles.avatar}>
                                    {msg.role === 'model'
                                        ? <Bot size={14} />
                                        : <User size={14} />
                                    }
                                </div>
                                <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.botBubble}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className={`${styles.msgRow} ${styles.botRow}`}>
                                <div className={styles.avatar}><Bot size={14} /></div>
                                <div className={`${styles.bubble} ${styles.botBubble} ${styles.typingBubble}`}>
                                    <span className={styles.dot} />
                                    <span className={styles.dot} />
                                    <span className={styles.dot} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className={styles.inputArea}>
                        <textarea
                            ref={inputRef}
                            className={styles.textInput}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything about Jhon..."
                            rows={1}
                            disabled={loading}
                        />
                        <button
                            className={styles.sendBtn}
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                        >
                            {loading
                                ? <Loader2 size={16} className={styles.spin} />
                                : <Send size={16} />
                            }
                        </button>
                    </div>
                    
                    <div className={styles.footerRow}>
                        <p className={styles.footer}>Powered by RAG · GPT-4o Mini</p>
                        <button 
                            className={`${styles.debugToggleSmall} ${debugMode ? styles.debugToggleActive : ''}`}
                            onClick={() => setDebugMode(!debugMode)}
                            title="Diagnostic Mode"
                        >
                            <Sparkles size={12} />
                        </button>
                    </div>

                    {debugMode && lastContext && lastContext.length > 0 && (
                        <div className={styles.debugPanel}>
                            <p className={styles.debugTitle}>Retrieved Context ({lastContext.length})</p>
                            <div className={styles.debugScroll}>
                                {lastContext.map((c, i) => (
                                    <div key={i} className={styles.debugChunk}>
                                        <p className={styles.chunkMeta}>[{c.collection}] Score: {c.score?.toFixed(4) ?? 'N/A'}</p>
                                        <p className={styles.chunkText}>{c.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* FAB Toggle */}
            <button
                className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
                onClick={() => { setOpen(o => !o) }}
                title={open ? 'Close chat' : 'Chat with AI'}
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
                {!open && <span className={styles.fabBadge} />}
            </button>
        </div>
    )
}

