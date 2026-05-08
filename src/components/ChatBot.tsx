"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "¿Cómo funciona el sistema de multas?",
  "¿Cómo agrego un libro al catálogo?",
  "¿Cómo realizo un préstamo?",
  "¿Cuáles son los sprints del proyecto?",
  "¿Qué roles existen en el sistema?",
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy **Ducky Asistente** 🦆 Tu guía del sistema de biblioteca. Puedo ayudarte con préstamos, multas, gestión de libros y más. ¿En qué te puedo ayudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data.message) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Lo siento, ocurrió un error al procesar tu mensaje. Por favor intenta de nuevo.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Lo siento, no puedo conectarme en este momento. Por favor intenta más tarde.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Simple markdown-like renderer for bold text
  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Abrir asistente"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #17222D 0%, #2a3f52 100%)",
          border: "2px solid #ccb581",
          boxShadow: isOpen
            ? "0 0 0 4px rgba(204,181,129,0.25), 0 8px 32px rgba(23,34,45,0.5)"
            : "0 4px 20px rgba(23,34,45,0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: isOpen ? "scale(1.1) rotate(10deg)" : "scale(1)",
        }}
      >
        {isOpen ? (
          // X icon
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="#ccb581"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          // Duck / chat icon
          <span style={{ fontSize: "26px", lineHeight: 1 }}>🦆</span>
        )}
      </button>

      {/* Chat panel */}
      <div
        style={{
          position: "fixed",
          bottom: "96px",
          right: "24px",
          zIndex: 9998,
          width: "380px",
          maxWidth: "calc(100vw - 48px)",
          height: "540px",
          maxHeight: "calc(100vh - 120px)",
          borderRadius: "20px",
          background: "#0C131B",
          border: "1px solid rgba(204,181,129,0.3)",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(204,181,129,0.1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
          transform: isOpen
            ? "translateY(0) scale(1)"
            : "translateY(20px) scale(0.95)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformOrigin: "bottom right",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #17222D 0%, #1e2f3d 100%)",
            borderBottom: "1px solid rgba(204,181,129,0.2)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ccb581, #a8924f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              boxShadow: "0 2px 8px rgba(204,181,129,0.3)",
              flexShrink: 0,
            }}
          >
            🦆
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "#f4eed8",
                fontWeight: 700,
                fontSize: "15px",
                fontFamily: "'League Spartan', sans-serif",
                letterSpacing: "0.02em",
              }}
            >
              Ducky Asistente
            </div>
            <div
              style={{
                color: "#ccb581",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#4ade80",
                  display: "inline-block",
                  boxShadow: "0 0 4px #4ade80",
                }}
              />
              En línea · Biblioteca Ducky University
            </div>
          </div>
          <button
            onClick={() => {
              setMessages([
                {
                  role: "assistant",
                  content:
                    "¡Hola! Soy **Ducky Asistente** 🦆 Tu guía del sistema de biblioteca. Puedo ayudarte con préstamos, multas, gestión de libros y más. ¿En qué te puedo ayudar?",
                },
              ]);
              setShowSuggestions(true);
            }}
            title="Nueva conversación"
            style={{
              background: "rgba(244,238,216,0.08)",
              border: "1px solid rgba(244,238,216,0.15)",
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
              color: "#7f7e76",
              display: "flex",
              alignItems: "center",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(244,238,216,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "#f4eed8";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(244,238,216,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#7f7e76";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 3v5h5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Messages area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(204,181,129,0.2) transparent",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                gap: "8px",
                alignItems: "flex-end",
              }}
            >
              {msg.role === "assistant" && (
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #ccb581, #a8924f)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  🦆
                </div>
              )}
              <div
                style={{
                  maxWidth: "78%",
                  padding: "10px 14px",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #ccb581, #b89a5a)"
                      : "rgba(244,238,216,0.07)",
                  border:
                    msg.role === "user"
                      ? "none"
                      : "1px solid rgba(244,238,216,0.1)",
                  color: msg.role === "user" ? "#17222D" : "#f4eed8",
                  fontSize: "13.5px",
                  lineHeight: "1.55",
                  fontFamily: "system-ui, sans-serif",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {renderContent(msg.content)}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ccb581, #a8924f)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                }}
              >
                🦆
              </div>
              <div
                style={{
                  background: "rgba(244,238,216,0.07)",
                  border: "1px solid rgba(244,238,216,0.1)",
                  borderRadius: "18px 18px 18px 4px",
                  padding: "12px 16px",
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                {[0, 1, 2].map((dot) => (
                  <div
                    key={dot}
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#ccb581",
                      animation: "bounce 1.2s infinite",
                      animationDelay: `${dot * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Suggested questions */}
          {showSuggestions && messages.length === 1 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "7px",
                marginTop: "4px",
              }}
            >
              <div
                style={{
                  color: "rgba(244,238,216,0.4)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  paddingLeft: "4px",
                  fontWeight: 600,
                }}
              >
                Preguntas frecuentes
              </div>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: "rgba(204,181,129,0.08)",
                    border: "1px solid rgba(204,181,129,0.2)",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    color: "#ccb581",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    fontFamily: "system-ui, sans-serif",
                  }}
                  onMouseOver={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(204,181,129,0.16)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(204,181,129,0.4)";
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(204,181,129,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(204,181,129,0.2)";
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(204,181,129,0.15)",
            background: "rgba(23,34,45,0.8)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              background: "rgba(244,238,216,0.06)",
              border: "1px solid rgba(204,181,129,0.2)",
              borderRadius: "12px",
              padding: "4px 4px 4px 14px",
              transition: "border-color 0.2s",
            }}
            onFocus={() => {}}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f4eed8",
                fontSize: "13.5px",
                fontFamily: "system-ui, sans-serif",
                padding: "8px 0",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "9px",
                background:
                  input.trim() && !isLoading
                    ? "linear-gradient(135deg, #ccb581, #b89a5a)"
                    : "rgba(204,181,129,0.15)",
                border: "none",
                cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: "rotate(90deg)",
                }}
              >
                <path
                  d="M12 19V5M5 12l7-7 7 7"
                  stroke={input.trim() && !isLoading ? "#17222D" : "#7f7e76"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div
            style={{
              color: "rgba(244,238,216,0.25)",
              fontSize: "10.5px",
              textAlign: "center",
              marginTop: "8px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Ducky University · Sistema de Biblioteca
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        
        div::-webkit-scrollbar {
          width: 4px;
        }
        div::-webkit-scrollbar-track {
          background: transparent;
        }
        div::-webkit-scrollbar-thumb {
          background: rgba(204,181,129,0.2);
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: rgba(204,181,129,0.35);
        }
      `}</style>
    </>
  );
}
