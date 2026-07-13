import React, { useState } from "react";
import { ApplicationComment } from "../../types";
import { FileText, X } from "lucide-react";
import DefaultApplicationForm from "../../../../programs/other/components/DefaultApplicationForm";

interface Props {
  comments: ApplicationComment[];
}

export default function ApplicationComments({ comments }: Props) {
  const [localComments, setLocalComments] = useState<ApplicationComment[]>(comments);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const displayComments = localComments.filter(c => c.sender === "admin" || c.media_url || c.text);

  const handleOpenForm = () => {
    setShowFormModal(true);
  };

  const handleFormSubmit = () => {
    setShowFormModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmSend = () => {
    const newCommentObj: ApplicationComment = {
      id: `comment-${Date.now()}`,
      application_id: "app-123",
      sender: "student",
      text: "Application details updated by student.",
      created_at: new Date().toISOString(),
    };
    setLocalComments([...localComments, newCommentObj]);
    setShowConfirmModal(false);
  };

  return (
    <div style={{ marginTop: "16px" }}>
      {/* Correspondence Box */}
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        border: "1px solid rgba(181, 189, 160, 0.3)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.02)"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 24px 16px 24px",
          borderBottom: "1px solid rgba(181, 189, 160, 0.3)"
        }}>
          <h3 style={{
            fontFamily: "var(--font-instrument-serif)",
            fontSize: "24px",
            color: "#1a1a1a",
            margin: 0
          }}>
            Correspondence
          </h3>
          <button
            onClick={handleOpenForm}
            style={{
              backgroundColor: "#1a1a1a",
              color: "#FFFBF2",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.2s",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontFamily: "var(--font-outfit)"
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Reply / Edit Details
          </button>
        </div>

        {/* Correspondence List */}
        <div 
          data-lenis-prevent="true"
          style={{ 
            display: "flex", 
            flexDirection: "column", 
            maxHeight: "500px",
            overflowY: "auto"
          }}
        >
          {displayComments.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "#6b6b6b", fontFamily: "var(--font-outfit)", fontSize: "14px" }}>
              No comments yet.
            </div>
          ) : (
            displayComments.map((comment, idx) => {
              const isLast = idx === displayComments.length - 1;
              return (
              <div key={comment.id} style={{
                display: "flex",
                flexDirection: "row",
                borderBottom: isLast ? "none" : "1px solid rgba(181, 189, 160, 0.3)",
                minHeight: "120px"
              }}>
                {/* Left Side: Sender Info */}
                <div style={{
                  width: "25%",
                  padding: "20px 24px",
                  borderRight: "1px solid rgba(181, 189, 160, 0.3)",
                  backgroundColor: "rgba(255, 251, 242, 0.3)",
                  fontSize: "13px",
                  color: "#1a1a1a",
                  fontFamily: "var(--font-outfit)"
                }}>
                  <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                    {comment.sender === "admin" ? "OIA Admin" : "You (Student)"}
                  </div>
                  <div style={{ color: "#6b6b6b" }}>
                    {new Date(comment.created_at).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    <br />
                    {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
                  </div>
                </div>

                {/* Right Side: Message Content */}
                <div style={{
                  width: "75%",
                  padding: "20px 24px",
                  backgroundColor: "transparent",
                  fontSize: "14px",
                  color: "#393939",
                  lineHeight: 1.6,
                  fontFamily: "var(--font-outfit)"
                }}>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap", fontWeight: comment.sender === "student" ? 500 : 400 }}>
                    {comment.sender === "student" ? "Response Added" : comment.text}
                  </p>
                  
                  {comment.sender === "admin" && comment.media_url && (
                    <div style={{
                      marginTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      backgroundColor: "rgba(181, 189, 160, 0.15)",
                      border: "1px solid rgba(181, 189, 160, 0.5)",
                      borderRadius: "6px",
                      width: "fit-content",
                      fontSize: "13px",
                      color: "#1a1a1a"
                    }}>
                      <FileText size={16} color="#5C6B3F" />
                      <span>{comment.media_url}</span>
                    </div>
                  )}
                </div>
              </div>
            );
            })
          )}
        </div>
      </div>

      {/* MODAL for Application Form */}
      {showFormModal && (
        <div 
          data-lenis-prevent="true"
          style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 9999,
          display: "flex", justifyContent: "center", alignItems: "flex-start",
          padding: "40px 20px",
          overflowY: "auto"
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            width: "100%", maxWidth: "800px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            position: "relative"
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "20px 24px", borderBottom: "1px solid #eaeded"
            }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600, fontFamily: "var(--font-outfit)", color: "#16191f" }}>
                Edit Application Details
              </h2>
              <button 
                onClick={() => setShowFormModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#545b64" }}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <DefaultApplicationForm 
                onSubmit={handleFormSubmit}
                onCancel={() => setShowFormModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL for Confirmation */}
      {showConfirmModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 10000,
          display: "flex", justifyContent: "center", alignItems: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            width: "100%", maxWidth: "400px",
            padding: "24px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontFamily: "var(--font-outfit)", color: "#16191f" }}>
              Send Response?
            </h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: "#545b64", fontFamily: "var(--font-outfit)" }}>
              Are you sure you want to send this updated response to the admin? Your changes will be reflected in the application.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#fff",
                  color: "#16191f",
                  border: "1px solid #d5dbdb",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px"
                }}
              >
                No, Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#0073bb",
                  color: "#fff",
                  border: "1px solid #0073bb",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px"
                }}
              >
                Yes, Send Response
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
